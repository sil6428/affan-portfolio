#!/usr/bin/env node
/**
 * Site-wide audit: for every route (or the ones passed with --routes) it records console
 * errors, failed requests, landmark/heading structure, axe-core accessibility violations,
 * canvas count, horizontal overflow, links (internal links are validated against the
 * router), and dumps the visible text to .shots/text/<route>.txt for content review.
 *
 * Usage:
 *   node scripts/audit.mjs [--mobile | --tablet] [--reduced] [--routes "/,/log,/log/ssik"]
 *                          [--check-external] [--base http://localhost:5199]
 * Output: .shots/audit/<viewport>.json plus a printed summary.
 */
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const base = arg('base') || 'http://localhost:5199';
const slugs = [...readFileSync('src/data/projects.ts', 'utf8').matchAll(/slug: '([^']+)'/g)].map((m) => m[1]);
const staticRoutes = ['/', '/about', '/stack', '/log', '/contact'];
const knownRoutes = new Set([...staticRoutes, ...slugs.map((s) => `/log/${s}`)]);
const routes = arg('routes')
  ? arg('routes')
      .split(',')
      .map((r) => r.trim().replace(/^[A-Za-z]:\/Program Files\/Git/, '') || '/')
  : [...staticRoutes, ...slugs.map((s) => `/log/${s}`), '/this-route-does-not-exist'];

const viewport = flag('mobile') ? { name: 'mobile', width: 390, height: 844 } : flag('tablet') ? { name: 'tablet', width: 820, height: 1180 } : { name: 'desktop', width: 1440, height: 900 };
const label = `${viewport.name}${flag('reduced') ? '-reduced' : ''}`;

mkdirSync('.shots/audit', { recursive: true });
mkdirSync('.shots/text', { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader'] });
const context = await browser.newContext({
  viewport: { width: viewport.width, height: viewport.height },
  isMobile: viewport.name === 'mobile',
  hasTouch: viewport.name !== 'desktop',
  reducedMotion: flag('reduced') ? 'reduce' : 'no-preference'
});
await context.addInitScript(() => {
  try {
    sessionStorage.setItem('signal:booted', '1');
  } catch {}
});

const report = [];
const externalLinks = new Set();

for (const route of routes) {
  const page = await context.newPage();
  const problems = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') problems.push(`[console.${msg.type()}] ${msg.text().slice(0, 300)}`);
  });
  page.on('pageerror', (err) => problems.push(`[pageerror] ${err.message.slice(0, 300)}`));
  page.on('requestfailed', (req) => {
    const url = req.url();
    if (!url.includes('/@vite') && !url.includes('__vite')) problems.push(`[requestfailed] ${url} ${req.failure()?.errorText ?? ''}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400 && res.url().startsWith(base)) problems.push(`[http ${res.status()}] ${res.url()}`);
  });

  await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => problems.push(`[goto] ${e.message}`));
  await page.waitForTimeout(1500);
  // Step through the page so in-view content mounts.
  const total = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 0);
  let maxCanvases = 0;
  for (let y = 0; y < total; y += Math.floor(viewport.height * 0.9)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    const c = await page.evaluate(() => document.querySelectorAll('canvas').length).catch(() => 0);
    maxCanvases = Math.max(maxCanvases, c);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);

  const structure = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .filter((h) => !h.closest('[aria-hidden="true"]'))
      .map((h) => ({ level: Number(h.tagName[1]), text: (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) }));
    const skips = [];
    for (let i = 1; i < headings.length; i++) {
      if (headings[i].level > headings[i - 1].level + 1) skips.push(`h${headings[i - 1].level} → h${headings[i].level} ("${headings[i].text}")`);
    }
    const links = [...document.querySelectorAll('a[href]')].map((a) => ({
      href: a.getAttribute('href'),
      text: (a.getAttribute('aria-label') || a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60)
    }));
    const unnamedButtons = [...document.querySelectorAll('button, [role="button"]')].filter(
      (b) => !(b.getAttribute('aria-label') || b.getAttribute('aria-labelledby') || b.textContent?.trim() || b.getAttribute('title'))
    ).length;
    return {
      mains: document.querySelectorAll('main').length,
      h1s: [...document.querySelectorAll('h1')].map((h) => (h.textContent || h.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80)),
      headingSkips: skips,
      links,
      unnamedButtons,
      rbRegions: [...new Set([...document.querySelectorAll('[data-rb]')].flatMap((el) => el.getAttribute('data-rb').split(',').map((s) => s.trim())))],
      overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
      title: document.title,
      text: document.body.innerText
    };
  });

  await page.addScriptTag({ content: axeSource });
  const axe = await page
    .evaluate(async () => {
      // @ts-ignore axe is injected
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      return r.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        count: v.nodes.length,
        targets: v.nodes.slice(0, 3).map((n) => n.target.join(' '))
      }));
    })
    .catch((e) => [{ id: 'axe-error', impact: 'n/a', help: e.message, count: 0, targets: [] }]);

  const badInternal = [];
  for (const l of structure.links) {
    if (!l.href) continue;
    if (/^https?:/.test(l.href)) externalLinks.add(l.href);
    else if (l.href.startsWith('/') && !l.href.startsWith('//')) {
      const path = l.href.split(/[?#]/)[0].replace(/\/$/, '') || '/';
      const isAsset = /\.(pdf|png|jpg|webp|svg)$/.test(path);
      if (!isAsset && !knownRoutes.has(path)) badInternal.push(l.href);
    }
  }

  const fileName = route === '/' ? 'home' : route.slice(1).replace(/\//g, '_');
  writeFileSync(`.shots/text/${fileName}${viewport.name === 'desktop' ? '' : '.' + viewport.name}.txt`, structure.text);

  report.push({
    route,
    title: structure.title,
    mains: structure.mains,
    h1s: structure.h1s,
    headingSkips: structure.headingSkips,
    unnamedButtons: structure.unnamedButtons,
    overflowX: structure.overflowX,
    maxCanvases,
    reactbitsOnPage: structure.rbRegions,
    badInternalLinks: [...new Set(badInternal)],
    axe,
    problems: [...new Set(problems)].slice(0, 40)
  });
  await page.close();
  process.stdout.write('.');
}
await browser.close();

let externalReport = [];
if (flag('check-external')) {
  for (const url of externalLinks) {
    if (url.startsWith('mailto:')) continue;
    try {
      const res = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 link-check' } });
      externalReport.push({ url, status: res.status });
    } catch (e) {
      externalReport.push({ url, status: 0, error: e.message });
    }
  }
}

writeFileSync(`.shots/audit/${label}.json`, JSON.stringify({ viewport, routes: report, external: externalReport }, null, 2));

console.log(`\nAudit (${label}) → .shots/audit/${label}.json`);
for (const r of report) {
  const issues = [];
  if (r.mains !== 1) issues.push(`${r.mains} <main>`);
  if (r.h1s.length !== 1) issues.push(`${r.h1s.length} <h1>`);
  if (r.headingSkips.length) issues.push(`${r.headingSkips.length} heading skips`);
  if (r.unnamedButtons) issues.push(`${r.unnamedButtons} unnamed buttons`);
  if (r.overflowX) issues.push('HORIZONTAL OVERFLOW');
  if (r.badInternalLinks.length) issues.push(`bad links: ${r.badInternalLinks.join(' ')}`);
  const serious = r.axe.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  if (serious.length) issues.push(`axe: ${serious.map((v) => `${v.id}×${v.count}`).join(', ')}`);
  if (r.problems.length) issues.push(`${r.problems.length} console/network problems`);
  console.log(`${r.route.padEnd(36)} rb:${String(r.reactbitsOnPage.length).padStart(2)} canvas:${r.maxCanvases} ${issues.length ? '⚠ ' + issues.join(' | ') : 'ok'}`);
}
const badExternal = externalReport.filter((e) => e.status >= 400 || e.status === 0);
if (flag('check-external')) console.log(`external links: ${externalReport.length} checked, ${badExternal.length} failing ${badExternal.map((e) => `${e.url}(${e.status})`).join(' ')}`);
