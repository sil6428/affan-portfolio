#!/usr/bin/env node
/**
 * Headless visual check: screenshots a route and reports console errors / page errors.
 * Uses the system Microsoft Edge through playwright-core (no browser download needed).
 *
 * Usage:
 *   node scripts/shot.mjs <path-or-url> <out.png> [--w 1440] [--h 900] [--full] [--wait 2500]
 *        [--scroll 1200] [--reduced] [--mobile] [--click "css selector"] [--hover "css selector"]
 *        [--base http://localhost:5199] [--skip-boot]
 *
 * Examples:
 *   node scripts/shot.mjs /work .shots/work.png --full
 *   node scripts/shot.mjs /about .shots/about-mobile.png --mobile --full
 */
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const args = process.argv.slice(2);
const positional = [];
const opts = {};
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a.startsWith('--')) {
    const key = a.slice(2);
    const next = args[i + 1];
    if (next === undefined || next.startsWith('--')) opts[key] = true;
    else {
      opts[key] = next;
      i++;
    }
  } else positional.push(a);
}

const [rawTarget = '/', out = '.shots/shot.png'] = positional;
// Git Bash on Windows rewrites "/work" into "C:/Program Files/Git/work" — undo that, and
// accept routes written without the leading slash ("work", "home").
const target = rawTarget.replace(/^[A-Za-z]:\/Program Files\/Git/, '').replace(/^(?!https?:|\/)/, '/') || '/';
const base = opts.base || 'http://localhost:5199';
const url = target.startsWith('http') ? target : `${base}${target}`;
const mobile = Boolean(opts.mobile);
const width = Number(opts.w || (mobile ? 390 : 1440));
const height = Number(opts.h || (mobile ? 844 : 900));
const wait = Number(opts.wait || 2500);

mkdirSync(dirname(out), { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'] });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  isMobile: mobile,
  hasTouch: mobile,
  reducedMotion: opts.reduced ? 'reduce' : 'no-preference'
});

// Skip the boot sequence unless explicitly testing it.
if (!opts.boot) {
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('signal:booted', '1');
    } catch {}
  });
}

const page = await context.newPage();
const problems = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') problems.push(`[console.${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', (err) => problems.push(`[pageerror] ${err.message}`));
page.on('requestfailed', (req) => problems.push(`[requestfailed] ${req.url()} ${req.failure()?.errorText ?? ''}`));

await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => problems.push(`[goto] ${e.message}`));
await page.waitForTimeout(wait);

if (opts.scroll) {
  await page.mouse.wheel(0, Number(opts.scroll));
  await page.waitForTimeout(1200);
}
if (opts.hover) {
  await page.hover(String(opts.hover)).catch((e) => problems.push(`[hover] ${e.message}`));
  await page.waitForTimeout(800);
}
if (opts.click) {
  await page.click(String(opts.click)).catch((e) => problems.push(`[click] ${e.message}`));
  await page.waitForTimeout(1200);
}
if (opts.full) {
  // Trigger lazy/in-view content by stepping through the page before the full capture.
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.floor(height * 0.8)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}

await page.screenshot({ path: out, fullPage: Boolean(opts.full) });
const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
await browser.close();

console.log(`shot: ${out} (${width}x${height}${opts.full ? `, full ${docHeight}px` : ''})`);
if (overflowX) console.log('WARNING: horizontal overflow detected (page wider than viewport)');
if (problems.length) {
  console.log(`${problems.length} console/page problem(s):`);
  for (const p of problems.slice(0, 40)) console.log('  ' + p);
} else console.log('no console errors');
