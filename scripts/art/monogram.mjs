/**
 * Affan portfolio · "AS" monogram geometry
 * Hand-built chamfered letterforms (pure paths, no font outlines) inside viewfinder brackets.
 * viewBox 0 0 512 512. Drawn on the lanyard badge and the OG card.
 */
const SQ2 = Math.SQRT2;
const r = (n) => Math.round(n * 100) / 100;
const poly = (pts) => 'M' + pts.map(([x, y]) => `${r(x)} ${r(y)}`).join('L') + 'Z';

/** Letter metrics (in the 512 box). */
export const MONO = {
  h: 220, // cap height
  t: 38, // stem thickness
  w: 156, // letter width
  c: 58, // outer chamfer
  gap: 30, // space between A and S
  bracket: { inset: 24, arm: 92, t: 16 }
};

function letterA(x0, y0) {
  const { h, t, w, c } = MONO;
  const k = c + t * (SQ2 - 1); // inner chamfer offset keeps the diagonal stroke = t
  const cb1 = 124; // crossbar top
  const cb2 = cb1 + t; // crossbar bottom
  const P = (x, y) => [x0 + x, y0 + y];
  const outer = [P(0, h), P(0, c), P(c, 0), P(w - c, 0), P(w, c), P(w, h), P(w - t, h), P(w - t, cb2), P(t, cb2), P(t, h)];
  const counter = [P(t, cb1), P(t, k), P(k, t), P(w - k, t), P(w - t, k), P(w - t, cb1)];
  return poly(outer) + poly(counter);
}

function letterS(x0, y0) {
  const { h, t, w, c } = MONO;
  const k = c + t * (SQ2 - 1);
  const m1 = (h - t) / 2; // middle bar top
  const m2 = m1 + t; // middle bar bottom
  const cm = 20; // small chamfer on the middle bends (inner corners stay square)
  const P = (x, y) => [x0 + x, y0 + y];
  return poly([
    P(0, c), P(c, 0), P(w, 0), P(w, t), P(k, t), P(t, k), P(t, m1), P(w - cm, m1), P(w, m1 + cm),
    P(w, h - c), P(w - c, h), P(0, h), P(0, h - t), P(w - k, h - t), P(w - t, h - k), P(w - t, m2), P(cm, m2), P(0, m2 - cm)
  ]);
}

function bracketsPath(size = 512) {
  const { inset: i, arm: a, t } = MONO.bracket;
  const e = size - i;
  return [
    poly([[i, i], [i + a, i], [i + a, i + t], [i + t, i + t], [i + t, i + a], [i, i + a]]),
    poly([[e, i], [e, i + a], [e - t, i + a], [e - t, i + t], [e - a, i + t], [e - a, i]]),
    poly([[e, e], [e - a, e], [e - a, e - t], [e - t, e - t], [e - t, e - a], [e, e - a]]),
    poly([[i, e], [i, e - a], [i + t, e - a], [i + t, e - t], [i + a, e - t], [i + a, e]])
  ].join('');
}

/** Path data for the two letters only (512 box). */
export function lettersPath() {
  const { h, w, gap } = MONO;
  const total = w * 2 + gap;
  const x0 = (512 - total) / 2;
  const y0 = (512 - h) / 2;
  return letterA(x0, y0) + letterS(x0 + w + gap, y0);
}

export function bracketPathData() {
  return bracketsPath(512);
}

/**
 * Standalone monogram SVG. Single colour (default white) on transparent.
 * @param {{ color?: string, letters?: string, bracketColor?: string, withBrackets?: boolean }} o
 */
export function monogramSvg({ color = '#ffffff', bracketColor, withBrackets = true, size } = {}) {
  const dims = size ? ` width="${size}" height="${size}"` : '';
  const br = withBrackets ? `<path fill="${bracketColor || color}" d="${bracketPathData()}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"${dims}>${br}<path fill="${color}" fill-rule="evenodd" d="${lettersPath()}"/></svg>`;
}
