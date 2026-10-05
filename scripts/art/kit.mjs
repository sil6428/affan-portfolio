/**
 * Affan portfolio · art kit
 * Design tokens, inlined web fonts, the HTML page shell and small SVG primitives shared by
 * every artboard rendered by scripts/generate-art.mjs. (This is the ReactBits proof-of-concept
 * project, not the main affan-portfolio repository.)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

/* ------------------------------------------------------------------------------------------ */
/* Tokens — must match src/index.css (SIGNAL / OXIDE)                                          */
/* ------------------------------------------------------------------------------------------ */
export const C = {
  ink: '#060606',
  s1: '#0b0b0b',
  s2: '#101010',
  s3: '#161616',
  s4: '#1f1f1f',
  line: 'rgba(238,238,238,0.08)',
  lineStrong: 'rgba(238,238,238,0.16)',
  text: '#eeeeee',
  muted: '#a8a8a8',
  dim: '#7a7a7a',
  phosphor: '#3fe07a',
  phosphorSoft: '#9cf3b8',
  chalk: '#e8e8e8',
  ash: '#8a8a8a',
  rust: '#d9622f'
};

export const ACCENT = { phosphor: C.phosphor, chalk: C.chalk, rust: C.rust };
/** A softer partner for each accent, used for secondary strokes inside a figure. */
export const ACCENT_SOFT = { phosphor: C.phosphorSoft, chalk: C.ash, rust: '#f0a07c' };

/** "#3fe07a" + 0.2 -> "rgba(63,224,122,0.2)" */
export function rgba(hex, a) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

export const FONT = {
  sans: "'Geist Mono Variable', ui-monospace, monospace",
  mono: "'Geist Mono Variable', ui-monospace, monospace",
  serif: "'Geist Mono Variable', ui-monospace, monospace"
};

/* ------------------------------------------------------------------------------------------ */
/* Fonts — inlined as base64 so setContent() pages never depend on file:// access              */
/* ------------------------------------------------------------------------------------------ */
function b64(rel) {
  return readFileSync(resolve(ROOT, 'node_modules', rel)).toString('base64');
}

let fontCss = null;
export function fontFaceCss() {
  if (fontCss) return fontCss;
  const face = (family, file, weight, style, range) =>
    `@font-face{font-family:'${family}';src:url(data:font/woff2;base64,${b64(file)}) format('woff2');` +
    `font-weight:${weight};font-style:${style};font-display:block;${range ? `unicode-range:${range};` : ''}}`;
  const LATIN =
    'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD';
  const LATIN_EXT =
    'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
  fontCss = [
    face('Geist Mono Variable', '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2', '100 900', 'normal', LATIN),
    face('Geist Mono Variable', '@fontsource-variable/geist-mono/files/geist-mono-latin-ext-wght-normal.woff2', '100 900', 'normal', LATIN_EXT)
  ].join('\n');
  return fontCss;
}

const BASE_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:transparent}
#art{position:relative;overflow:hidden;font-family:${FONT.sans};color:${C.text};
  -webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;font-kerning:normal}
.abs{position:absolute}
.fill{position:absolute;inset:0}
.mono{font-family:${FONT.mono};text-transform:uppercase;letter-spacing:.14em;font-weight:450}
.serif{font-family:${FONT.serif};font-style:italic;font-weight:400}
.dim{color:${C.dim}}
.muted{color:${C.muted}}
svg{display:block;overflow:visible}
svg text:not([font-family]){font-family:${FONT.mono}}
`;

/**
 * Full HTML document for one artboard. Everything is drawn inside #art (width x height);
 * the renderer screenshots that element.
 */
export function page({ width, height, body, css = '', background = C.ink }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fontFaceCss()}${BASE_CSS}
#art{width:${width}px;height:${height}px;background:${background}}
${css}</style></head><body><div id="art">${body}</div></body></html>`;
}

/* ------------------------------------------------------------------------------------------ */
/* Helpers                                                                                     */
/* ------------------------------------------------------------------------------------------ */
export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const f = (n) => (Math.round(n * 100) / 100).toString();

/** Deterministic PRNG so every run produces identical art. */
export function rng(seed) {
  let h = 1779033703 ^ String(seed).length;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------------------------------ */
/* Primitives                                                                                  */
/* ------------------------------------------------------------------------------------------ */

/** Viewfinder corner brackets around a box (absolute-positioned SVG). */
export function brackets({ x, y, w, h, arm = 34, stroke = 2, color = 'rgba(236,238,243,0.55)', cls = '' }) {
  const s = stroke / 2;
  const p = [
    `M${s} ${arm}V${s}H${arm}`,
    `M${w - arm} ${s}H${w - s}V${arm}`,
    `M${w - s} ${h - arm}V${h - s}H${w - arm}`,
    `M${arm} ${h - s}H${s}V${h - arm}`
  ].join('');
  return `<svg class="abs ${cls}" style="left:${x}px;top:${y}px" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<path d="${p}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="square"/></svg>`;
}

/** Same brackets as raw SVG markup (for use inside a figure). */
export function bracketPath(x, y, w, h, arm) {
  return [
    `M${f(x)} ${f(y + arm)}V${f(y)}H${f(x + arm)}`,
    `M${f(x + w - arm)} ${f(y)}H${f(x + w)}V${f(y + arm)}`,
    `M${f(x + w)} ${f(y + h - arm)}V${f(y + h)}H${f(x + w - arm)}`,
    `M${f(x + arm)} ${f(y + h)}H${f(x)}V${f(y + h - arm)}`
  ].join('');
}

/** Hairline background grid that fades out toward the edges. */
export function grid({ size = 48, alpha = 0.045, fade = '75% 70% at 50% 42%', x = 0, y = 0 } = {}) {
  const c = `rgba(238,238,238,${alpha})`;
  return `<div class="fill" style="background-image:linear-gradient(${c} 1px,transparent 1px),linear-gradient(90deg,${c} 1px,transparent 1px);
background-size:${size}px ${size}px;background-position:${x}px ${y}px;
-webkit-mask-image:radial-gradient(ellipse ${fade},#000 0%,rgba(0,0,0,.55) 55%,transparent 100%);
mask-image:radial-gradient(ellipse ${fade},#000 0%,rgba(0,0,0,.55) 55%,transparent 100%)"></div>`;
}

/** Soft accent bloom. */
export function glow({ x, y, r, color, alpha = 0.16 }) {
  return `<div class="abs" style="left:${x - r}px;top:${y - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;
background:radial-gradient(circle at 50% 50%,${rgba(color, alpha)} 0%,${rgba(color, alpha * 0.45)} 35%,transparent 70%)"></div>`;
}

/** Film-grain overlay (very low opacity, keeps flat ink from banding). */
export function grain({ opacity = 0.07, seed = 3 } = {}) {
  return `<svg class="fill" width="100%" height="100%" style="opacity:${opacity};mix-blend-mode:screen;pointer-events:none">
<filter id="grain${seed}"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}" stitchTiles="stitch"/>
<feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#grain${seed})"/></svg>`;
}

/** Horizontal ruler: minor ticks every `step`, major every `major` ticks. */
export function ruler({ x, y, w, step = 12, major = 5, color = 'rgba(238,238,238,0.22)', h = 10 }) {
  let d = `M0 ${h}H${w}`;
  for (let i = 0, t = 0; t <= w + 0.1; i++, t += step) {
    const len = i % major === 0 ? h : h * 0.45;
    d += `M${f(t)} ${h}V${f(h - len)}`;
  }
  return `<svg class="abs" style="left:${x}px;top:${y}px" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<path d="${d}" stroke="${color}" stroke-width="1" fill="none" shape-rendering="crispEdges"/></svg>`;
}

/** Decorative barcode strip (deterministic). */
export function barcode({ w, h, seed = 'AS', color = C.text }) {
  const r = rng(seed);
  let x = 0;
  let rects = '';
  while (x < w) {
    const bw = [2, 2, 3, 4, 6][Math.floor(r() * 5)];
    const gap = [2, 3, 4, 6][Math.floor(r() * 4)];
    if (x + bw > w) break;
    rects += `<rect x="${x}" y="0" width="${bw}" height="${h}"/>`;
    x += bw + gap;
  }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="${color}" shape-rendering="crispEdges">${rects}</svg>`;
}

/** Shared SVG <defs> used by the figures. */
export function figDefs(accent) {
  return `<defs>
<filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5" result="b"/>
<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="bloom" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="haze" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="40"/></filter>
<linearGradient id="fadeX" x1="0" x2="1"><stop offset="0" stop-color="${accent}" stop-opacity="0"/>
<stop offset=".5" stop-color="${accent}" stop-opacity="1"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
<linearGradient id="fadeY" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${accent}" stop-opacity=".9"/>
<stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="rgba(238,238,238,0.12)"/></pattern>
<pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
<line x1="0" y1="0" x2="0" y2="8" stroke="${rgba(accent, 0.35)}" stroke-width="1.5"/></pattern>
</defs>`;
}

/** Mono micro-label inside a figure. */
export function label(x, y, text, { size = 13, color = C.dim, anchor = 'start', weight = 500, ls = 0.14, extra = '' } = {}) {
  return `<text x="${f(x)}" y="${f(y)}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-weight="${weight}"
letter-spacing="${ls}em" ${extra}>${esc(text)}</text>`;
}
