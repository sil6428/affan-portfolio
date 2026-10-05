#!/usr/bin/env node
/**
 * ============================================================================================
 *  Affan portfolio  ·  static art generator
 *  (ReactBits proof-of-concept project — NOT the main affan-portfolio / Next.js repository)
 * ============================================================================================
 *
 * Renders every static art asset in public/art/ from the site's own data files, using the
 * terminal (business-card) design tokens and the real web font (Geist Mono).
 *
 *   npm run art                      # everything
 *   npm run art -- --only projects   # one group: projects | thumbs | badge | og | logos (comma-separated)
 *   npm run art -- --slug ssik       # limit projects to one slug
 *
 * How it works: HTML/SVG templates (scripts/art/*.mjs) are rendered in headless Microsoft Edge
 * through playwright-core at 2x device scale, the #art element is screenshotted, then sharp
 * downsamples to the exact output size and encodes WebP/PNG. Each 1024px project square also gets a
 * 320px thumbnail (<slug>-square-320.webp) for the small list/orbit thumbs; `--only thumbs` rebuilds
 * just those from the existing squares, without a browser. Logos come straight from the
 * installed simple-icons package; the AS monogram on the badge and OG card is pure vector geometry.
 *
 * Text rule: every word printed on an asset comes from src/data/*.ts (projects, profile,
 * skills, navigation). Figures are abstract illustrations, not real configurations.
 */
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as simpleIcons from 'simple-icons';

import { C, ACCENT } from './art/kit.mjs';
import { projectFigure } from './art/project-figures.mjs';
import { projectPoster, projectSquare, badgeFront, badgeBack, strap, ogCard } from './art/layouts.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public', 'art');
const SCALE = 2; // render at 2x, downsample for clean hairlines

/* ------------------------------------------------------------------------------------------ */
/* CLI                                                                                         */
/* ------------------------------------------------------------------------------------------ */
const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const ONLY = arg('only') ? new Set(arg('only').split(',').map((s) => s.trim())) : null;
const SLUG = arg('slug');
const want = (group) => !ONLY || ONLY.has(group);

console.log('\n  Affan portfolio · generate-art');
console.log(`  output → ${relative(process.cwd(), OUT) || OUT}\n`);

/* ------------------------------------------------------------------------------------------ */
/* Data (Node strips the TypeScript types natively)                                            */
/* ------------------------------------------------------------------------------------------ */
const load = (p) => import(pathToFileURL(resolve(ROOT, p)).href);
const { projects } = await load('src/data/projects.ts');
const { profile, contact } = await load('src/data/profile.ts');
const { skills } = await load('src/data/skills.ts');

/** Which stack items to print on each poster (2–4, always a subset of project.stack). */
const STACK_PICK = {
  'p2p-messaging': ['Python', 'Ed25519', 'X25519', 'ChaCha20-Poly1305'],
  'secure-file-transfer': ['Python', 'TLS', 'SHA-256', 'scrypt'],
  ssik: ['RBAC', 'SSRF defenses', 'Durable jobs', 'Audit logging'],
  'interactive-portfolio': ['Three.js', 'React', 'Next.js', 'Cloudflare Pages']
};
function stackFor(p) {
  const pick = STACK_PICK[p.slug] ?? p.stack.slice(0, 4);
  for (const s of pick) if (!p.stack.includes(s)) throw new Error(`STACK_PICK for ${p.slug}: "${s}" is not in projects.ts`);
  return pick;
}

/* ------------------------------------------------------------------------------------------ */
/* Renderer                                                                                    */
/* ------------------------------------------------------------------------------------------ */
const written = [];
const issues = [];

function ensureDir(file) {
  mkdirSync(dirname(file), { recursive: true });
}

async function shrinkToFit(page) {
  // Reduce font-size on [data-fit="maxLines,minPx"] until the text fits its box.
  return page.evaluate(() => {
    const report = [];
    for (const el of document.querySelectorAll('[data-fit]')) {
      const [maxLines, min] = el.dataset.fit.split(',').map(Number);
      let fs = parseFloat(getComputedStyle(el).fontSize);
      const overflowing = () => {
        const lh = parseFloat(getComputedStyle(el).lineHeight) || fs * 1.1;
        // Line boxes (not ink overflow) decide the line count; scrollWidth catches nowrap overflow.
        const lines = Math.round(el.getBoundingClientRect().height / lh);
        return lines > maxLines || el.scrollWidth > el.clientWidth + 1;
      };
      while (overflowing() && fs > min) {
        fs -= 1;
        el.style.fontSize = `${fs}px`;
      }
      if (overflowing()) report.push(`text overflow: "${el.textContent.trim().slice(0, 40)}"`);
    }
    return report;
  });
}

async function render(browserPage, { html, width, height, out, format = 'png', quality = 82, transparent = false }) {
  await browserPage.setViewportSize({ width, height });
  await browserPage.setContent(html, { waitUntil: 'load' });
  await browserPage.evaluate(async () => {
    await Promise.all([
      document.fonts.load("400 20px 'Geist Variable'"),
      document.fonts.load("600 20px 'Geist Variable'"),
      document.fonts.load("400 20px 'Geist Mono Variable'"),
      document.fonts.load("italic 400 20px 'Instrument Serif'")
    ]);
    await document.fonts.ready;
  });
  const fitIssues = await shrinkToFit(browserPage);
  for (const m of fitIssues) issues.push(`${relative(ROOT, out)}: ${m}`);
  const buf = await browserPage.locator('#art').screenshot({ omitBackground: transparent, type: 'png' });

  let img = sharp(buf).resize(width, height, { kernel: 'lanczos3', fit: 'fill' });
  if (!transparent) img = img.flatten({ background: C.ink });
  if (format === 'webp') img = img.webp({ quality, effort: 6, smartSubsample: true });
  else if (format === 'jpeg') img = img.jpeg({ quality, mozjpeg: true });
  else img = img.png({ compressionLevel: 9, adaptiveFiltering: true, palette: false });
  ensureDir(out);
  await img.toFile(out);
  written.push(out);
  process.stdout.write(`  ✓ ${relative(ROOT, out)}\n`);
}

/* ------------------------------------------------------------------------------------------ */
/* Static (non-browser) outputs                                                                */
/* ------------------------------------------------------------------------------------------ */
function writeLogos() {
  const all = Object.values(simpleIcons).filter((v) => v && typeof v === 'object' && 'slug' in v && 'path' in v);
  const bySlug = new Map(all.map((i) => [i.slug, i]));
  const scale = 56 / 24; // 24-unit simple-icons path → 56 px glyph centred in a 64 box
  for (const s of skills.filter((k) => k.icon)) {
    const icon = bySlug.get(s.icon);
    if (!icon) {
      issues.push(`simple-icons has no slug "${s.icon}" (skill "${s.name}")`);
      continue;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="${icon.title}"><title>${icon.title}</title><path transform="translate(4 4) scale(${scale.toFixed(5)})" fill="${C.text}" d="${icon.path}"/></svg>\n`;
    const out = resolve(OUT, 'logos', `${icon.slug}.svg`);
    ensureDir(out);
    writeFileSync(out, svg);
    written.push(out);
  }
  console.log(`  ✓ public/art/logos/*.svg (${skills.filter((k) => k.icon).length} icons)`);
}

/** 320px thumbnails of the 1024px squares (small boxes: lists, orbits, rails). */
const THUMB = 320;
async function writeThumbs(list) {
  for (const project of list) {
    const src = resolve(OUT, 'projects', `${project.slug}-square.webp`);
    const out = resolve(OUT, 'projects', `${project.slug}-square-${THUMB}.webp`);
    await sharp(src)
      .resize(THUMB, THUMB, { kernel: 'lanczos3', fit: 'fill' })
      .webp({ quality: 80, effort: 6, smartSubsample: true })
      .toFile(out);
    written.push(out);
    process.stdout.write(`  ✓ ${relative(ROOT, out)}\n`);
  }
}

/* ------------------------------------------------------------------------------------------ */
/* Run                                                                                         */
/* ------------------------------------------------------------------------------------------ */
const needsBrowser = want('projects') || want('badge') || want('og');
const browser = needsBrowser ? await chromium.launch({ channel: 'msedge', headless: true }) : null;
if (browser) try {
  const context = await browser.newContext({ deviceScaleFactor: SCALE, colorScheme: 'dark' });
  const page = await context.newPage();
  page.on('pageerror', (e) => issues.push(`page error: ${e.message}`));

  if (want('projects')) {
    const list = projects.filter((p) => !SLUG || p.slug === SLUG);
    for (const project of list) {
      const A = ACCENT[project.accent];
      // Figures are drawn in chalk; the accent is kept for small details only (label, index, chip).
      const figure = projectFigure(project.slug, C.chalk);
      await render(page, {
        html: projectPoster({ project, total: projects.length, figure, profile, stack: stackFor(project) }),
        width: 1200,
        height: 1500,
        out: resolve(OUT, 'projects', `${project.slug}.webp`),
        format: 'webp',
        quality: 82
      });
      await render(page, {
        html: projectSquare({ project, figure }),
        width: 1024,
        height: 1024,
        out: resolve(OUT, 'projects', `${project.slug}-square.webp`),
        format: 'webp',
        quality: 82
      });
      await writeThumbs([project]);
    }
  }

  if (want('badge')) {
    await render(page, { html: badgeFront({ profile }), width: 1000, height: 1400, out: resolve(OUT, 'badge-front.webp'), format: 'webp', quality: 90 });
    await render(page, { html: badgeBack({ profile, contact }), width: 1000, height: 1400, out: resolve(OUT, 'badge-back.webp'), format: 'webp', quality: 90 });
    await render(page, { html: strap({ profile }), width: 1024, height: 64, out: resolve(OUT, 'lanyard-strap.png') });
  }
  if (want('og')) {
    await render(page, { html: ogCard({ profile }), width: 1200, height: 630, out: resolve(OUT, 'og.jpg'), format: 'jpeg', quality: 86 });
  }
} finally {
  await browser.close();
}

if (ONLY?.has('thumbs') && !want('projects')) await writeThumbs(projects.filter((p) => !SLUG || p.slug === SLUG));
if (want('logos')) writeLogos();

/* ------------------------------------------------------------------------------------------ */
/* Report                                                                                      */
/* ------------------------------------------------------------------------------------------ */
console.log(`\n  ${written.length} files written.`);
if (issues.length) {
  console.log(`  ${issues.length} issue(s):`);
  for (const m of issues) console.log(`   - ${m}`);
  process.exitCode = 1;
} else console.log('  no issues.');
