/**
 * Affan portfolio · project figures
 * One abstract technical illustration per case file. Every figure draws into a 1040 x 780
 * viewBox. Labels only use words that appear in src/data/*.ts; the drawings are illustrative
 * (they do not depict real configurations, counts or interfaces).
 */
import { C, rgba, f, rng, figDefs, label, bracketPath } from './kit.mjs';

export const FIG_W = 1040;
export const FIG_H = 780;

const COS = Math.cos(Math.PI / 6);
const SIN = 0.5;

/* ------------------------------------------------------------------------------------------ */
/* small drawing helpers                                                                       */
/* ------------------------------------------------------------------------------------------ */
const pts = (arr) => arr.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const polygon = (arr, attrs) => `<polygon points="${pts(arr)}" ${attrs}/>`;
const line = (x1, y1, x2, y2, attrs) => `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" ${attrs}/>`;
const circle = (cx, cy, r, attrs) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" ${attrs}/>`;
const polar = (cx, cy, r, deg) => [cx + r * Math.cos((deg * Math.PI) / 180), cy + r * Math.sin((deg * Math.PI) / 180)];
function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${f(x0)} ${f(y0)}A${f(r)} ${f(r)} 0 ${large} ${sweep} ${f(x1)} ${f(y1)}`;
}
function arrowHead(x, y, angleDeg, size, fill) {
  const a = (angleDeg * Math.PI) / 180;
  const p1 = [x, y];
  const p2 = [x - size * Math.cos(a - 0.45), y - size * Math.sin(a - 0.45)];
  const p3 = [x - size * Math.cos(a + 0.45), y - size * Math.sin(a + 0.45)];
  return polygon([p1, p2, p3], `fill="${fill}"`);
}
/** Small mono tag: dark chip with hairline border. */
function tag(x, y, text, color, { anchor = 'middle', size = 13, pad = 9, solid = false } = {}) {
  const w = text.length * size * 0.62 + text.length * size * 0.14 + pad * 2 - size * 0.14;
  const h = size + pad * 1.3;
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const bg = solid ? color : C.s1;
  const fg = solid ? C.ink : color;
  return `<g><rect x="${f(x0)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="3" fill="${bg}" stroke="${solid ? color : rgba(color, 0.55)}" stroke-width="1"/>
${label(x0 + w / 2, y + size * 0.36, text, { size, color: fg, anchor: 'middle', weight: solid ? 600 : 500 })}</g>`;
}
function svgWrap(accent, inner, { w = FIG_W, h = FIG_H } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${figDefs(accent)}${inner}</svg>`;
}

/** Large numeric readout with a mono caption (values always come from projects.ts metrics). */
function bigStat(x, y, value, accentPart, cap, anchor, A) {
  return `<g transform="translate(${x} ${y})">
<text x="0" y="0" text-anchor="${anchor}" font-family="'Geist Variable'" font-size="58" font-weight="300" letter-spacing="-0.03em" fill="${C.text}">${value}<tspan fill="${A}">${accentPart}</tspan></text>
${label(0, 30, cap, { size: 12, color: C.dim, anchor })}</g>`;
}

/* ------------------------------------------------------------------------------------------ */
/* 01 · File Integrity Monitor — isometric matrix of file blocks, a few flagged as changed     */
/* ------------------------------------------------------------------------------------------ */
function fileIntegrity(A) {
  const N = 12;
  const s = 40;
  const ox = 520;
  const oy = 72;
  const P = (i, j, z = 0) => [ox + (i - j) * s * COS, oy + (i + j) * s * SIN - z];
  const r = rng('fim');
  const g = 0.09;
  const modified = [[2, 3], [5, 8], [7, 2], [9, 6], [4, 10], [10, 9], [6, 5]];
  const deleted = [[3, 7], [8, 10], [11, 3]];
  const added = [[2, 10], [9, 1]];
  const moveFrom = [1, 8];
  const moveTo = [6, 0];
  const key = (i, j) => `${i},${j}`;
  const special = new Set([...modified, ...deleted, ...added, moveFrom, moveTo].map(([i, j]) => key(i, j)));
  const scanI = 8.35;

  let tiles = '';
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const corners = [P(i + g, j + g), P(i + 1 - g, j + g), P(i + 1 - g, j + 1 - g), P(i + g, j + 1 - g)];
      if (special.has(key(i, j))) continue;
      const lit = i + 1 > scanI - 2.2 && i < scanI; // tiles just behind the scan beam
      const shade = 0.5 + r() * 0.5;
      tiles += polygon(
        corners,
        `fill="${lit ? rgba(A, 0.05 + shade * 0.05) : rgba('#161616', 0.55 + shade * 0.45)}" stroke="${lit ? rgba(A, 0.38) : 'rgba(238,238,238,0.13)'}" stroke-width="1"`
      );
      // a tiny "hash row" mark inside each tile
      const [a, b] = [P(i + 0.3, j + 0.5), P(i + 0.3 + 0.2 + r() * 0.35, j + 0.5)];
      tiles += line(a[0], a[1], b[0], b[1], `stroke="${lit ? rgba(A, 0.55) : 'rgba(238,238,238,0.18)'}" stroke-width="1.4" stroke-linecap="round"`);
    }
  }

  // Deleted: dashed ghost outlines.
  let ghosts = '';
  for (const [i, j] of [...deleted, moveFrom]) {
    const corners = [P(i + g, j + g), P(i + 1 - g, j + g), P(i + 1 - g, j + 1 - g), P(i + g, j + 1 - g)];
    ghosts += polygon(corners, `fill="none" stroke="${rgba(A, 0.75)}" stroke-width="1.4" stroke-dasharray="4 4"`);
  }
  // Added: bright outline with a plus.
  let plus = '';
  for (const [i, j] of added) {
    const corners = [P(i + g, j + g), P(i + 1 - g, j + g), P(i + 1 - g, j + 1 - g), P(i + g, j + 1 - g)];
    plus += polygon(corners, `fill="${rgba(A, 0.12)}" stroke="${A}" stroke-width="1.6"`);
    const [cx, cy] = P(i + 0.5, j + 0.5);
    plus += `<path d="M${f(cx - 7)} ${f(cy)}H${f(cx + 7)}M${f(cx)} ${f(cy - 7)}V${f(cy + 7)}" stroke="${A}" stroke-width="2" stroke-linecap="round"/>`;
  }

  // Modified (+ moved destination): raised blocks.
  const raised = [...modified, moveTo].sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  let blocks = '';
  const heights = new Map();
  for (const [i, j] of raised) {
    const z = 30 + r() * 26;
    heights.set(key(i, j), z);
    const a0 = [i + g, j + g];
    const a1 = [i + 1 - g, j + g];
    const a2 = [i + 1 - g, j + 1 - g];
    const a3 = [i + g, j + 1 - g];
    const top = [P(...a0, z), P(...a1, z), P(...a2, z), P(...a3, z)];
    const right = [P(...a1, 0), P(...a2, 0), P(...a2, z), P(...a1, z)];
    const left = [P(...a3, 0), P(...a2, 0), P(...a2, z), P(...a3, z)];
    const [cx, cy] = P(i + 0.5, j + 0.5, z);
    blocks += `<ellipse cx="${f(cx)}" cy="${f(cy + z * 0.6)}" rx="40" ry="20" fill="${rgba(A, 0.35)}" filter="url(#bloom)"/>`;
    blocks += polygon(right, `fill="${rgba(A, 0.22)}" stroke="${rgba(A, 0.7)}" stroke-width="1"`);
    blocks += polygon(left, `fill="${rgba(A, 0.1)}" stroke="${rgba(A, 0.7)}" stroke-width="1"`);
    blocks += polygon(top, `fill="${rgba(A, 0.85)}" stroke="${A}" stroke-width="1" filter="url(#glow)"`);
    blocks += line(...P(i + 0.3, j + 0.5, z), ...P(i + 0.75, j + 0.5, z), `stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round" opacity=".55"`);
  }

  // Moved: arc from ghost to new block.
  const [mx0, my0] = P(moveFrom[0] + 0.5, moveFrom[1] + 0.5);
  const [mx1, my1] = P(moveTo[0] + 0.5, moveTo[1] + 0.5, heights.get(key(...moveTo)));
  const ctrl = [(mx0 + mx1) / 2 - 40, Math.min(my0, my1) - 130];
  const moveArc = `<path d="M${f(mx0)} ${f(my0)}Q${f(ctrl[0])} ${f(ctrl[1])} ${f(mx1)} ${f(my1 - 6)}" fill="none" stroke="${A}" stroke-width="1.6" stroke-dasharray="2 6" stroke-linecap="round"/>`;

  // Scan beam across the grid (constant i).
  const beam0 = P(scanI, -0.6, 0);
  const beam1 = P(scanI, N + 0.6, 0);
  const trail = [P(scanI - 2.2, 0), P(scanI, 0), P(scanI, N), P(scanI - 2.2, N)];
  const beam = `
<defs><linearGradient id="trail" gradientUnits="userSpaceOnUse" x1="${f(P(scanI - 2.2, 6)[0])}" y1="${f(P(scanI - 2.2, 6)[1])}" x2="${f(P(scanI, 6)[0])}" y2="${f(P(scanI, 6)[1])}">
<stop offset="0" stop-color="${A}" stop-opacity="0"/><stop offset="1" stop-color="${A}" stop-opacity=".16"/></linearGradient></defs>
${polygon(trail, 'fill="url(#trail)"')}
${line(...beam0, ...beam1, `stroke="${A}" stroke-width="7" opacity=".35" filter="url(#bloom)"`)}
${line(...beam0, ...beam1, `stroke="${A}" stroke-width="1.6"`)}
${circle(...beam0, 4, `fill="${A}"`)}${circle(...beam1, 4, `fill="${A}"`)}`;

  // Callouts: dot on the feature, angled leader, horizontal shelf, label above the shelf.
  const callout = (from, to, text, anchor = 'start', shelf = 92) => {
    const [x0, y0] = from;
    const [x1, y1] = to;
    const hx = anchor === 'start' ? x1 + shelf : x1 - shelf;
    return `<path d="M${f(x0)} ${f(y0)}L${f(x1)} ${f(y1)}H${f(hx)}" fill="none" stroke="rgba(238,238,238,0.4)" stroke-width="1"/>
${circle(x0, y0, 3.2, `fill="${C.text}"`)}
${label(anchor === 'start' ? x1 + 4 : x1 - 4, y1 - 10, text, { size: 13, color: C.text, anchor, weight: 550, ls: 0.18 })}`;
  };
  const top = (i, j) => P(i + 0.5, j + 0.5, heights.get(key(i, j)));
  const quadAt = (t) => [
    (1 - t) * (1 - t) * mx0 + 2 * (1 - t) * t * ctrl[0] + t * t * mx1,
    (1 - t) * (1 - t) * my0 + 2 * (1 - t) * t * ctrl[1] + t * t * (my1 - 6)
  ];
  const modPt = top(6, 5);
  const delPt = P(11.5, 3.5);
  const addPt = P(2.5, 10.5);
  const movePt = quadAt(0.22);

  // Outer frame of the matrix.
  const frame = polygon([P(-0.25, -0.25), P(N + 0.25, -0.25), P(N + 0.25, N + 0.25), P(-0.25, N + 0.25)], `fill="none" stroke="rgba(238,238,238,0.10)" stroke-width="1"`);
  const cornerTicks = [P(-0.25, -0.25), P(N + 0.25, -0.25), P(N + 0.25, N + 0.25), P(-0.25, N + 0.25)]
    .map(([x, y]) => `<path d="M${f(x - 8)} ${f(y)}H${f(x + 8)}M${f(x)} ${f(y - 8)}V${f(y + 8)}" stroke="rgba(238,238,238,0.45)" stroke-width="1"/>`)
    .join('');

  const stat = (x, value, accentPart, cap, anchor) => `
<g transform="translate(${x} 660)">
<text x="0" y="0" text-anchor="${anchor}" font-family="'Geist Variable'" font-size="62" font-weight="300" letter-spacing="-0.03em" fill="${C.text}">${value}<tspan fill="${A}">${accentPart}</tspan></text>
${label(0, 32, cap, { size: 12, color: C.dim, anchor })}
</g>`;
  const readout = `
${label(36, 586, 'SHA-256 · BASELINE', { size: 13, color: C.muted })}
${line(36, 600, 250, 600, 'stroke="rgba(238,238,238,0.16)"')}
${stat(36, '45', '/45', 'CONTROLLED CHANGES DETECTED', 'start')}
${label(1004, 586, 'DETERMINISTIC JSON', { size: 13, color: C.muted, anchor: 'end' })}
${line(790, 600, 1004, 600, 'stroke="rgba(238,238,238,0.16)"')}
${stat(1004, '500', '', 'FIXTURE FILES SCANNED', 'end')}`;

  return svgWrap(
    A,
    `${frame}${cornerTicks}${tiles}${ghosts}${plus}${beam}${moveArc}${blocks}
${callout(modPt, [modPt[0] + 56, modPt[1] - 150], 'MODIFIED', 'start', 100)}
${callout(delPt, [delPt[0] + 70, delPt[1] + 60], 'DELETED', 'start', 70)}
${callout(addPt, [addPt[0] - 70, addPt[1] + 70], 'ADDED', 'end', 70)}
${callout(movePt, [movePt[0] - 70, movePt[1] - 40], 'MOVED', 'end', 80)}
${readout}`
  );
}

/* ------------------------------------------------------------------------------------------ */
/* 02 · P2P Messaging — two peers, interlocking key arcs, a direct line                        */
/* ------------------------------------------------------------------------------------------ */
function p2p(A) {
  const L = [220, 370];
  const R = [820, 370];
  const B = C.ash;
  const SPAN = 30; // half-angle of each wavefront
  let g = '';

  // haze where the two wavefront sets interlock
  g += `<ellipse cx="520" cy="${L[1]}" rx="190" ry="210" fill="${rgba(A, 0.07)}" filter="url(#haze)"/>`;

  // wavefront arcs from each peer, opening toward the other peer
  const radii = [];
  for (let r = 120; r <= 520; r += 40) radii.push(r);
  const waves = (c, dir, color, seed) => {
    const rr = rng(seed);
    let out = '';
    radii.forEach((rad, i) => {
      const a0 = dir > 0 ? -SPAN : 180 - SPAN;
      const a1 = dir > 0 ? SPAN : 180 + SPAN;
      const t = i / (radii.length - 1);
      const alpha = 0.95 - t * 0.6;
      out += `<path d="${arcPath(c[0], c[1], rad, a0, a1)}" fill="none" stroke="${rgba(color, alpha)}" stroke-width="${i % 3 === 0 ? 1.8 : 1.1}"/>`;
      // signature ticks: short radial marks along every other arc
      if (i % 2 === 0) {
        const n = 5 + Math.floor(rr() * 4);
        for (let k = 0; k < n; k++) {
          const a = a0 + ((a1 - a0) * (k + 0.5)) / n;
          const [x1, y1] = polar(c[0], c[1], rad - 5, a);
          const [x2, y2] = polar(c[0], c[1], rad + 5, a);
          out += line(x1, y1, x2, y2, `stroke="${rgba(color, alpha)}" stroke-width="1.2"`);
        }
      }
      // end caps
      for (const a of [a0, a1]) out += circle(...polar(c[0], c[1], rad, a), 2.2, `fill="${rgba(color, alpha)}"`);
    });
    return out;
  };
  g += waves(L, 1, A, 'wa');
  g += waves(R, -1, B, 'wb');

  // crossing points of equal-radius wavefronts (shared key material)
  const half = (R[0] - L[0]) / 2;
  radii.forEach((rad) => {
    if (rad <= half) return;
    const dy = Math.sqrt(rad * rad - half * half);
    const ang = (Math.asin(dy / rad) * 180) / Math.PI;
    if (ang > SPAN) return;
    for (const sy of [-1, 1]) {
      g += circle(520, L[1] + sy * dy, 6, `fill="${C.ink}" stroke="${C.text}" stroke-width="1.4"`);
      g += circle(520, L[1] + sy * dy, 2.2, `fill="${C.text}"`);
    }
  });

  // the direct line with sealed packets
  let packets = '';
  [350, 425, 520, 615, 690].forEach((x, i) => {
    const mid = i === 2;
    const w = mid ? 50 : 28;
    const h = mid ? 28 : 14;
    packets += `<rect x="${f(x - w / 2)}" y="${f(L[1] - h / 2)}" width="${w}" height="${h}" rx="${mid ? 6 : 3}" fill="${mid ? A : C.ink}" stroke="${mid ? A : rgba(A, 0.7)}" stroke-width="1.2" ${mid ? 'filter="url(#glow)"' : ''}/>`;
    if (mid) packets += `<path d="M${x - 15} ${L[1] - 7}L${x} ${L[1] + 3}L${x + 15} ${L[1] - 7}" fill="none" stroke="${C.ink}" stroke-width="1.8"/>`;
    else packets += line(x - 7, L[1], x + 7, L[1], `stroke="${rgba(A, 0.7)}" stroke-width="1.4"`);
  });
  const wire = `${line(L[0] + 74, L[1], R[0] - 74, R[1], `stroke="${A}" stroke-width="8" opacity=".14" filter="url(#bloom)"`)}
${line(L[0] + 74, L[1], R[0] - 74, R[1], `stroke="rgba(238,238,238,0.5)" stroke-width="1.2"`)}
${arrowHead(R[0] - 76, R[1], 0, 9, 'rgba(238,238,238,0.7)')}`;

  // fingerprint-like peer glyphs
  const peer = (cx, cy, color, seed, name) => {
    const rr = rng(seed);
    let out = circle(cx, cy, 70, `fill="${C.s1}" stroke="${color}" stroke-width="1.6"`);
    out += circle(cx, cy, 90, `fill="none" stroke="${rgba(color, 0.4)}" stroke-width="1" stroke-dasharray="2 5"`);
    for (let k = 1; k <= 6; k++) {
      const rad = 8 + k * 8.5;
      const a0 = -90 + rr() * 120;
      const span = 200 + rr() * 110;
      out += `<path d="${arcPath(cx, cy + 4, rad, a0, a0 + span)}" fill="none" stroke="${rgba(color, 0.35 + k * 0.08)}" stroke-width="2.2" stroke-linecap="round"/>`;
    }
    out += `<path d="${bracketPath(cx - 104, cy - 104, 208, 208, 18)}" fill="none" stroke="rgba(238,238,238,0.4)" stroke-width="1.4"/>`;
    out += label(cx, cy + 136, name, { size: 13, color: C.muted, anchor: 'middle' });
    return out;
  };

  const tagRow = `
${tag(L[0], 60, 'ED25519 · SIGNATURES', A, { size: 12 })}
${tag(R[0], 60, 'X25519 · ENCRYPTION MATERIAL', B, { size: 12 })}
${line(L[0], 76, L[0], L[1] - 112, `stroke="${rgba(A, 0.35)}" stroke-dasharray="2 4"`)}
${line(R[0], 76, R[0], R[1] - 112, `stroke="${rgba(B, 0.45)}" stroke-dasharray="2 4"`)}
${tag(520, L[1] + 50, 'TCP', C.muted)}
${line(370, 668, 670, 668, 'stroke="rgba(238,238,238,0.16)"')}
${label(520, 700, 'CHACHA20-POLY1305', { size: 14, color: C.text, anchor: 'middle', ls: 0.24, weight: 550 })}
${label(520, 726, 'AUTHENTICATED ENCRYPTION', { size: 12, color: C.dim, anchor: 'middle' })}`;

  return svgWrap(A, `${g}${wire}${packets}${peer(L[0], L[1], A, 'pa', 'PEER · 01')}${peer(R[0], R[1], B, 'pb', 'PEER · 02')}${tagRow}`);
}

/* ------------------------------------------------------------------------------------------ */
/* 03 · Secure File Transfer — perspective tunnel, a packet in transit, a checksum seal        */
/* ------------------------------------------------------------------------------------------ */
function secureTransfer(A) {
  const V = [500, 360];
  const front = { cx: 500, cy: 400, w: 980, h: 740 };
  const frames = [];
  const N = 11;
  for (let k = 0; k < N; k++) {
    const sc = 1 / (1 + k * 0.62);
    const t = 1 - sc;
    frames.push({
      cx: front.cx + (V[0] - front.cx) * t,
      cy: front.cy + (V[1] - front.cy) * t,
      w: front.w * sc,
      h: front.h * sc,
      sc,
      k
    });
  }
  const last = frames[N - 1];
  const corner = (fr, sx, sy) => [fr.cx + (sx * fr.w) / 2, fr.cy + (sy * fr.h) / 2];

  let g = '';
  // light at the end of the tunnel
  g += `<rect x="${f(last.cx - last.w / 2)}" y="${f(last.cy - last.h / 2)}" width="${f(last.w)}" height="${f(last.h)}" fill="${A}" opacity=".9" filter="url(#bloom)"/>`;
  g += `<rect x="${f(last.cx - last.w / 2 + 6)}" y="${f(last.cy - last.h / 2 + 6)}" width="${f(last.w - 12)}" height="${f(last.h - 12)}" rx="4" fill="#ffd2b8" opacity=".85" filter="url(#glow)"/>`;
  g += `<rect x="${f(last.cx - last.w * 1.5)}" y="${f(last.cy - last.h * 1.5)}" width="${f(last.w * 3)}" height="${f(last.h * 3)}" fill="${A}" opacity=".18" filter="url(#haze)"/>`;

  // rails (corner lines) and floor/ceiling grid lines
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    g += line(...corner(frames[0], sx, sy), ...corner(last, sx, sy), `stroke="rgba(238,238,238,0.22)" stroke-width="1"`);
  }
  for (let u = -4; u <= 4; u++) {
    if (Math.abs(u) === 5) continue;
    const t = u / 5;
    const a = [frames[0].cx + (t * frames[0].w) / 2, frames[0].cy + frames[0].h / 2];
    const b = [last.cx + (t * last.w) / 2, last.cy + last.h / 2];
    g += line(...a, ...b, `stroke="${rgba(A, 0.16)}" stroke-width="1"`);
    const a2 = [frames[0].cx + (t * frames[0].w) / 2, frames[0].cy - frames[0].h / 2];
    const b2 = [last.cx + (t * last.w) / 2, last.cy - last.h / 2];
    g += line(...a2, ...b2, `stroke="rgba(238,238,238,0.06)" stroke-width="1"`);
  }
  // frames (rings of the corridor)
  frames.forEach((fr, i) => {
    const tint = i / (N - 1);
    const stroke = i === 0 ? 'rgba(238,238,238,0.10)' : rgba(i > 6 ? A : '#eeeeee', i > 6 ? 0.25 + tint * 0.5 : 0.1 + tint * 0.12);
    g += `<rect x="${f(fr.cx - fr.w / 2)}" y="${f(fr.cy - fr.h / 2)}" width="${f(fr.w)}" height="${f(fr.h)}" rx="${f(26 * fr.sc)}" fill="none" stroke="${stroke}" stroke-width="${f(Math.max(1, 2 * fr.sc))}"/>`;
  });
  // TLS label on the second ring
  const fr1 = frames[2];
  g += tag(fr1.cx - fr1.w / 2 + 70, fr1.cy - fr1.h / 2, 'TLS', A);

  // packet in transit (moves toward the viewer) with a fading trail
  const at = (k) => {
    const sc = 1 / (1 + k * 0.62);
    const t = 1 - sc;
    return { x: front.cx + (V[0] - front.cx) * t, y: front.cy + (V[1] - front.cy) * t + 120 * sc, sc };
  };
  const fileGlyph = (x, y, s, fill, stroke, extra = '') => {
    const w = 120 * s;
    const h = 150 * s;
    const fold = 34 * s;
    const x0 = x - w / 2;
    const y0 = y - h / 2;
    return `<path d="M${f(x0)} ${f(y0)}H${f(x0 + w - fold)}L${f(x0 + w)} ${f(y0 + fold)}V${f(y0 + h)}H${f(x0)}Z" fill="${fill}" stroke="${stroke}" stroke-width="${f(Math.max(1, 2 * s))}" ${extra}/>
<path d="M${f(x0 + w - fold)} ${f(y0)}V${f(y0 + fold)}H${f(x0 + w)}" fill="none" stroke="${stroke}" stroke-width="${f(Math.max(1, 1.5 * s))}" ${extra}/>`;
  };
  for (const [k, op] of [[4.2, 0.14], [3.2, 0.22], [2.4, 0.32], [1.7, 0.5]]) {
    const p = at(k);
    g += fileGlyph(p.x, p.y, p.sc, 'none', rgba(A, op));
  }
  const pk = at(0.95);
  g += `<ellipse cx="${f(pk.x)}" cy="${f(pk.y)}" rx="${f(110 * pk.sc)}" ry="${f(130 * pk.sc)}" fill="${A}" opacity=".35" filter="url(#bloom)"/>`;
  g += fileGlyph(pk.x, pk.y, pk.sc, rgba(A, 0.95), A);
  // byte rows on the packet
  for (let rI = 0; rI < 4; rI++) {
    const y = pk.y - 30 * pk.sc + rI * 20 * pk.sc;
    g += line(pk.x - 40 * pk.sc, y, pk.x + (rI === 3 ? 0 : 30) * pk.sc, y, `stroke="${C.ink}" stroke-width="${f(5 * pk.sc)}" stroke-linecap="round" opacity=".55"`);
  }

  // checksum seal
  const S = [860, 600];
  const sr = 92;
  let seal = circle(S[0], S[1], sr + 26, `fill="${C.ink}" stroke="rgba(238,238,238,0.1)"`);
  seal += circle(S[0], S[1], sr, `fill="${C.s1}" stroke="${A}" stroke-width="1.6"`);
  for (let i = 0; i < 72; i++) {
    const a = i * 5;
    const [x1, y1] = polar(S[0], S[1], sr + 6, a);
    const [x2, y2] = polar(S[0], S[1], sr + (i % 6 === 0 ? 18 : 11), a);
    seal += line(x1, y1, x2, y2, `stroke="${rgba(A, i % 6 === 0 ? 0.9 : 0.4)}" stroke-width="1.2"`);
  }
  seal += `<path id="sealRing" d="M${S[0] - 66} ${S[1]}A66 66 0 1 1 ${S[0] + 66} ${S[1]}A66 66 0 1 1 ${S[0] - 66} ${S[1]}" fill="none"/>`;
  seal += `<text font-size="12.5" font-weight="550" fill="${C.muted}"><textPath href="#sealRing" startOffset="0" textLength="${(2 * Math.PI * 66 - 6).toFixed(1)}" lengthAdjust="spacing">SHA-256 · VERIFIED · SHA-256 · VERIFIED · </textPath></text>`;
  seal += circle(S[0], S[1], 44, `fill="${rgba(A, 0.12)}" stroke="${rgba(A, 0.6)}"`);
  seal += `<path d="M${S[0] - 18} ${S[1] + 1}L${S[0] - 5} ${S[1] + 14}L${S[0] + 20} ${S[1] - 13}" fill="none" stroke="${A}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>`;
  // dotted path from packet to seal
  const link = `<path d="M${f(pk.x + 60 * pk.sc)} ${f(pk.y + 40 * pk.sc)}C${f(pk.x + 200)} ${f(pk.y + 120)} ${S[0] - 200} ${S[1] + 10} ${S[0] - sr - 30} ${S[1]}" fill="none" stroke="${rgba(A, 0.6)}" stroke-width="1.4" stroke-dasharray="2 6" stroke-linecap="round"/>`;

  const vignette = `<defs>
<radialGradient id="vg" cx="${V[0] / FIG_W}" cy="${V[1] / FIG_H}" r=".62" gradientTransform="translate(${V[0] / FIG_W} ${V[1] / FIG_H}) scale(1 1.25) translate(-${V[0] / FIG_W} -${V[1] / FIG_H})">
<stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="vign" maskUnits="userSpaceOnUse" x="0" y="0" width="${FIG_W}" height="${FIG_H}"><rect width="${FIG_W}" height="${FIG_H}" fill="url(#vg)"/></mask></defs>`;
  return svgWrap(A, `${vignette}<g mask="url(#vign)">${g}</g>${link}${seal}`);
}

/* ------------------------------------------------------------------------------------------ */
/* 04 · SSIK — twelve-stage ring with a radar sweep                                            */
/* ------------------------------------------------------------------------------------------ */
function ssik(A) {
  const cx = 520;
  const cy = 380;
  const R = 280;
  let g = '';
  g += circle(cx, cy, R + 70, `fill="${rgba(A, 0.05)}" filter="url(#haze)"`);
  // radar rings + crosshair
  for (const rr of [70, 140, 210]) g += circle(cx, cy, rr, `fill="none" stroke="rgba(238,238,238,${rr === 210 ? 0.12 : 0.08})" stroke-width="1"`);
  g += line(cx - R - 40, cy, cx + R + 40, cy, `stroke="rgba(238,238,238,0.08)" stroke-dasharray="3 6"`);
  g += line(cx, cy - R - 40, cx, cy + R + 40, `stroke="rgba(238,238,238,0.08)" stroke-dasharray="3 6"`);

  // sweep wedge (leading edge at stage 08)
  const lead = -90 + 7 * 30;
  const spanDeg = 110;
  const slices = 44;
  for (let i = 0; i < slices; i++) {
    const a1 = lead - (i * spanDeg) / slices;
    const a0 = lead - ((i + 1) * spanDeg) / slices;
    const [x0, y0] = polar(cx, cy, R - 4, a0);
    const [x1, y1] = polar(cx, cy, R - 4, a1);
    const op = 0.42 * Math.pow(1 - i / slices, 1.8);
    g += `<path d="M${cx} ${cy}L${f(x0)} ${f(y0)}A${R - 4} ${R - 4} 0 0 1 ${f(x1)} ${f(y1)}Z" fill="${A}" fill-opacity="${op.toFixed(4)}"/>`;
  }
  const [lx, ly] = polar(cx, cy, R - 4, lead);
  g += line(cx, cy, lx, ly, `stroke="${A}" stroke-width="6" opacity=".35" filter="url(#bloom)"`);
  g += line(cx, cy, lx, ly, `stroke="${A}" stroke-width="1.6"`);

  // blips
  const rb = rng('ssik-blips');
  for (let i = 0; i < 9; i++) {
    const a = lead - 8 - rb() * 100;
    const rr = 60 + rb() * 190;
    const [bx, by] = polar(cx, cy, rr, a);
    const near = 1 - (lead - a) / 110;
    g += circle(bx, by, 2.5 + near * 2, `fill="${A}" opacity="${(0.25 + near * 0.7).toFixed(2)}"`);
  }

  // tick ring
  for (let i = 0; i < 120; i++) {
    const a = i * 3;
    const major = i % 10 === 0;
    const [x1, y1] = polar(cx, cy, R + 14, a);
    const [x2, y2] = polar(cx, cy, R + (major ? 30 : 21), a);
    g += line(x1, y1, x2, y2, `stroke="rgba(238,238,238,${major ? 0.4 : 0.16})" stroke-width="1"`);
  }
  // main ring with direction chevrons
  g += circle(cx, cy, R, `fill="none" stroke="rgba(238,238,238,0.22)" stroke-width="1.4"`);
  g += `<path d="${arcPath(cx, cy, R, -90, lead)}" fill="none" stroke="${rgba(A, 0.65)}" stroke-width="2"/>`;
  for (let i = 0; i < 12; i++) {
    const a = -90 + i * 30 + 15;
    const [x, y] = polar(cx, cy, R, a);
    g += arrowHead(x, y, a + 90, 9, i < 7 ? A : 'rgba(238,238,238,0.45)');
  }
  // stage nodes
  for (let i = 0; i < 12; i++) {
    const a = -90 + i * 30;
    const [x, y] = polar(cx, cy, R, a);
    const [tx, ty] = polar(cx, cy, R + 56, a);
    const active = i === 7;
    const done = i < 7;
    if (active) g += circle(x, y, 26, `fill="${A}" opacity=".5" filter="url(#bloom)"`);
    g += circle(x, y, active ? 17 : 13, `fill="${active ? A : C.s1}" stroke="${done || active ? A : 'rgba(238,238,238,0.45)'}" stroke-width="1.6"`);
    if (done) g += circle(x, y, 4, `fill="${A}"`);
    g += label(tx, ty + 5, String(i + 1).padStart(2, '0'), { size: 15, color: active ? A : C.muted, anchor: 'middle', weight: active ? 600 : 500, ls: 0.06 });
  }
  // core
  g += circle(cx, cy, 96, `fill="${C.ink}" stroke="rgba(238,238,238,0.14)"`);
  g += `<text x="${cx}" y="${cy + 30}" text-anchor="middle" font-family="'Geist Variable'" font-size="96" font-weight="300" letter-spacing="-0.04em" fill="${C.text}">12</text>`;
  g += label(cx, cy - 46, 'STAGE', { size: 12, color: A, anchor: 'middle', ls: 0.3 });
  g += label(cx, cy + 62, 'REVIEW WORKFLOW', { size: 11, color: C.dim, anchor: 'middle', ls: 0.2 });

  // side readouts
  g += label(24, 34, 'SSIK INTELLIGENCE V1', { size: 13, color: C.muted });
  g += label(24, 56, 'LOCAL-FIRST', { size: 12, color: C.dim });
  g += label(1016, 34, 'OUTBOUND DELIVERY', { size: 13, color: C.muted, anchor: 'end' });
  g += label(1016, 56, 'DISABLED AND MOCK-ONLY', { size: 12, color: C.dim, anchor: 'end' });
  g += bigStat(24, 712, '12', '', 'REVIEW WORKFLOW STAGES', 'start', A);
  g += bigStat(1016, 712, '9', '', 'PUBLIC WEBSITE PAGES', 'end', A);
  return svgWrap(A, g);
}

/* ------------------------------------------------------------------------------------------ */
/* 05 · OTNow — calendar grid, timeline strip, one moved-date marker                           */
/* ------------------------------------------------------------------------------------------ */
function otnow(A) {
  const cols = 7;
  const rows = 5;
  const cw = 112;
  const ch = 74;
  const gap = 8;
  const W = cols * cw + (cols - 1) * gap;
  const x0 = (FIG_W - W) / 2;
  const y0 = 142;
  const r = rng('otnow');
  const cell = (c, rr) => [x0 + c * (cw + gap), y0 + rr * (ch + gap)];
  const from = [1, 1];
  const to = [4, 3];
  let g = '';
  g += `<rect x="${x0 - 30}" y="${y0 - 70}" width="${W + 60}" height="${rows * (ch + gap) + 92}" rx="18" fill="${rgba(C.s1, 0.6)}" stroke="rgba(238,238,238,0.08)"/>`;
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, c) => {
    g += label(cell(c, 0)[0] + 14, y0 - 22, d, { size: 13, color: c > 4 ? C.dim : C.muted });
  });
  g += line(x0, y0 - 12, x0 + W, y0 - 12, `stroke="rgba(238,238,238,0.1)"`);
  for (let rr = 0; rr < rows; rr++) {
    for (let c = 0; c < cols; c++) {
      const [x, y] = cell(c, rr);
      const isTo = c === to[0] && rr === to[1];
      const isFrom = c === from[0] && rr === from[1];
      const weekend = c > 4;
      g += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="7" fill="${isTo ? rgba(A, 0.1) : weekend ? rgba(C.s1, 0.5) : C.s2}" stroke="${isTo ? A : 'rgba(238,238,238,0.09)'}" stroke-width="${isTo ? 1.5 : 1}"/>`;
      g += line(x + 12, y + 14, x + 26, y + 14, `stroke="rgba(238,238,238,0.25)" stroke-width="2" stroke-linecap="round"`);
      const n = weekend ? (r() < 0.3 ? 1 : 0) : Math.floor(r() * 3);
      for (let k = 0; k < n; k++) {
        const bw = 34 + r() * 50;
        const deep = r() < 0.35;
        g += `<rect x="${x + 12}" y="${y + 30 + k * 15}" width="${f(bw)}" height="8" rx="4" fill="${rgba(deep ? C.ash : A, 0.35 + r() * 0.35)}"/>`;
      }
      if (isFrom) {
        g += `<rect x="${x + 12}" y="${y + ch - 24}" width="84" height="12" rx="6" fill="none" stroke="${rgba(A, 0.9)}" stroke-width="1.3" stroke-dasharray="4 4"/>`;
      }
      if (isTo) {
        g += `<circle cx="${x + cw / 2}" cy="${y + ch / 2}" r="120" fill="${A}" opacity=".12" filter="url(#haze)"/>`;
        g += `<rect x="${x + 4}" y="${y + ch - 32}" width="${cw - 8}" height="28" rx="8" fill="${A}" opacity=".45" filter="url(#bloom)"/>`;
        g += `<rect x="${x + 12}" y="${y + ch - 24}" width="84" height="12" rx="6" fill="${A}"/>`;
      }
    }
  }
  // moved-date arc
  const [fx, fy] = cell(...from);
  const [tx, ty] = cell(...to);
  const p0 = [fx + 54, fy + ch - 12];
  const p1 = [tx + 54, ty + ch - 28];
  const ctrl = [(p0[0] + p1[0]) / 2 + 40, p0[1] - 30];
  g += `<path d="M${p0[0]} ${p0[1]}Q${ctrl[0]} ${ctrl[1]} ${p1[0]} ${p1[1] - 4}" fill="none" stroke="${A}" stroke-width="1.8" stroke-dasharray="3 6" stroke-linecap="round"/>`;
  const ang = (Math.atan2(p1[1] - 4 - ctrl[1], p1[0] - ctrl[0]) * 180) / Math.PI;
  g += arrowHead(p1[0], p1[1] - 2, ang, 11, A);
  g += tag(tx + cw / 2, ty - 18, 'MOVED', A, { solid: true, size: 12 });

  // timeline strip
  const ty0 = 604;
  g += line(x0 - 30, ty0, x0 + W + 30, ty0, `stroke="rgba(238,238,238,0.2)"`);
  const days = 35;
  for (let i = 0; i <= days; i++) {
    const x = x0 + (i * W) / days;
    const major = i % 7 === 0;
    g += line(x, ty0 - (major ? 14 : 7), x, ty0, `stroke="rgba(238,238,238,${major ? 0.45 : 0.2})"`);
  }
  const fromDay = from[1] * 7 + from[0];
  const toDay = to[1] * 7 + to[0];
  const dx = (d) => x0 + ((d + 0.5) * W) / days;
  g += `<rect x="${f(dx(fromDay) - 6)}" y="${ty0 + 16}" width="12" height="12" rx="2" fill="none" stroke="${A}" stroke-dasharray="3 3"/>`;
  g += `<rect x="${f(dx(toDay) - 6)}" y="${ty0 + 16}" width="12" height="12" rx="2" fill="${A}"/>`;
  g += `<path d="M${f(dx(fromDay) + 10)} ${ty0 + 22}H${f(dx(toDay) - 14)}" stroke="${rgba(A, 0.7)}" stroke-width="1.4" stroke-dasharray="2 5"/>`;
  g += arrowHead(dx(toDay) - 10, ty0 + 22, 0, 8, A);
  // "now" playhead
  const nowX = dx(9);
  g += `<path d="M${f(nowX)} ${ty0 - 22}V${ty0 + 40}" stroke="${C.text}" stroke-width="1.2"/>`;
  g += polygon([[nowX - 6, ty0 - 30], [nowX + 6, ty0 - 30], [nowX, ty0 - 22]], `fill="${C.text}"`);

  g += label(x0 - 30, 26, 'MOVED-DATE DETECTION', { size: 13, color: C.text, weight: 550, ls: 0.18 });
  g += label(x0 - 30, 48, 'LOCAL CHROME STORAGE', { size: 12, color: C.dim });
  g += label(x0 + W + 30, 26, 'TWO READ-ONLY CANVAS ENDPOINTS', { size: 13, color: C.muted, anchor: 'end' });
  g += label(x0 + W + 30, 48, 'LOCAL REMINDERS', { size: 12, color: C.dim, anchor: 'end' });
  g += bigStat(x0 - 30, 726, '286', '', 'ITEMS ORGANIZED · 6 OPT-IN INSTALLATIONS', 'start', A);
  g += bigStat(x0 + W + 30, 726, '2', '', 'READ-ONLY CANVAS ENDPOINTS', 'end', A);
  return svgWrap(A, g);
}

/* ------------------------------------------------------------------------------------------ */
/* 06 · Cisco Networking Labs — routed/switched topology with VLAN-coloured access links       */
/* ------------------------------------------------------------------------------------------ */
function cisco(A) {
  const V = [A, C.phosphor, C.rust]; // three VLANs
  const R1 = [300, 118];
  const R2 = [740, 118];
  const S = [[170, 366], [520, 366], [870, 366]];
  const hostsX = [[90, 170, 250], [440, 520, 600], [790, 870, 950]];
  const hy = 588;
  let g = `<rect x="0" y="0" width="${FIG_W}" height="${FIG_H}" fill="url(#dots)" opacity=".8"/>`;

  // trunk: two parallel lines
  const trunk = (a, b, color) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    const nx = (-dy / len) * 3;
    const ny = (dx / len) * 3;
    return line(a[0] + nx, a[1] + ny, b[0] + nx, b[1] + ny, `stroke="${color}" stroke-width="1.4"`) +
      line(a[0] - nx, a[1] - ny, b[0] - nx, b[1] - ny, `stroke="${color}" stroke-width="1.4"`);
  };
  // R1-R2 routed link
  g += line(R1[0], R1[1], R2[0], R2[1], `stroke="${A}" stroke-width="7" opacity=".25" filter="url(#bloom)"`);
  g += line(R1[0], R1[1], R2[0], R2[1], `stroke="${A}" stroke-width="2"`);
  g += tag(520, R1[1], 'OSPF', A, { solid: true, size: 12 });
  // trunks
  g += trunk(R1, S[0], 'rgba(238,238,238,0.4)');
  g += trunk(R1, S[1], 'rgba(238,238,238,0.4)');
  g += trunk(R2, S[1], 'rgba(238,238,238,0.4)');
  g += trunk(R2, S[2], 'rgba(238,238,238,0.4)');
  g += tag((R1[0] + S[0][0]) / 2 - 18, (R1[1] + S[0][1]) / 2, '802.1Q', C.muted, { size: 12 });
  g += tag((R2[0] + S[2][0]) / 2 + 18, (R2[1] + S[2][1]) / 2, '802.1Q', C.muted, { size: 12 });
  // STP redundant link (blocked)
  g += `<path d="M${S[0][0] + 60} ${S[0][1] + 6}H${S[1][0] - 60}" stroke="rgba(238,238,238,0.3)" stroke-width="1.2" stroke-dasharray="5 6"/>`;
  g += `<path d="M${S[1][0] + 60} ${S[1][1] + 6}H${S[2][0] - 60}" stroke="rgba(238,238,238,0.3)" stroke-width="1.2" stroke-dasharray="5 6"/>`;
  const bx = (S[0][0] + S[1][0]) / 2;
  g += circle(bx, S[0][1] + 6, 9, `fill="${C.ink}" stroke="${C.phosphor}" stroke-width="1.4"`);
  g += `<path d="M${bx - 4} ${S[0][1] + 2}l8 8m0 -8l-8 8" stroke="${C.phosphor}" stroke-width="1.6"/>`;
  g += label(bx, S[0][1] - 12, 'STP', { size: 12, color: C.phosphor, anchor: 'middle' });

  // access links + hosts
  S.forEach((sw, si) => {
    const busY = (sw[1] + hy) / 2;
    g += line(sw[0], sw[1] + 24, sw[0], busY, `stroke="rgba(238,238,238,0.45)" stroke-width="1.6"`);
    hostsX[si].forEach((hx, hi) => {
      const col = V[hi];
      g += `<path d="M${sw[0]} ${busY}H${hx}V${hy - 22}" fill="none" stroke="${col}" stroke-width="1.6" opacity=".9"/>`;
      g += circle(hx, busY, 3, `fill="${col}"`);
    });
    g += circle(sw[0], busY, 4, `fill="${C.ink}" stroke="rgba(238,238,238,0.6)" stroke-width="1.4"`);
  });
  S.forEach((sw, si) => {
    hostsX[si].forEach((hx, hi) => {
      const col = V[hi];
      g += `<rect x="${hx - 22}" y="${hy - 22}" width="44" height="30" rx="4" fill="${C.s2}" stroke="${col}" stroke-width="1.4"/>`;
      g += `<rect x="${hx - 16}" y="${hy - 16}" width="32" height="18" rx="2" fill="${rgba(col, 0.22)}"/>`;
      g += `<path d="M${hx - 10} ${hy + 16}H${hx + 10}M${hx} ${hy + 8}V${hy + 16}" stroke="${rgba(col, 0.8)}" stroke-width="1.4"/>`;
    });
  });

  // router glyph
  const router = ([x, y]) => {
    let s = circle(x, y, 60, `fill="${rgba(A, 0.1)}" filter="url(#haze)"`);
    s += `<ellipse cx="${x}" cy="${y + 10}" rx="44" ry="16" fill="${C.s2}" stroke="${A}" stroke-width="1.4"/>`;
    s += `<rect x="${x - 44}" y="${y - 6}" width="88" height="16" fill="${C.s2}"/>`;
    s += line(x - 44, y - 6, x - 44, y + 10, `stroke="${A}" stroke-width="1.4"`) + line(x + 44, y - 6, x + 44, y + 10, `stroke="${A}" stroke-width="1.4"`);
    s += `<ellipse cx="${x}" cy="${y - 6}" rx="44" ry="16" fill="${C.s3}" stroke="${A}" stroke-width="1.4"/>`;
    // four arrows on the lid
    const ar = (x1, y1, x2, y2) => {
      const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
      return line(x1, y1, x2, y2, `stroke="${C.text}" stroke-width="1.6"`) + arrowHead(x2, y2, ang, 6, C.text);
    };
    s += ar(x - 34, y - 6, x - 10, y - 6) + ar(x + 34, y - 6, x + 10, y - 6);
    s += ar(x - 4, y - 10, x - 4, y - 19) + ar(x + 4, y - 2, x + 4, y + 7);
    return s;
  };
  const sw = ([x, y]) => {
    let s = `<rect x="${x - 58}" y="${y - 24}" width="116" height="48" rx="6" fill="${C.s2}" stroke="rgba(238,238,238,0.55)" stroke-width="1.4"/>`;
    const ar = (x1, y1, x2, y2) => line(x1, y1, x2, y2, `stroke="${C.text}" stroke-width="1.4"`) + arrowHead(x2, y2, x2 > x1 ? 0 : 180, 6, C.text);
    s += ar(x - 30, y - 8, x + 30, y - 8) + ar(x + 30, y + 8, x - 30, y + 8);
    for (let p = 0; p < 6; p++) s += `<rect x="${x - 46 + p * 16}" y="${y + 16}" width="8" height="3" fill="${p % 2 ? 'rgba(238,238,238,0.25)' : rgba(A, 0.8)}"/>`;
    return s;
  };
  g += router(R1) + router(R2);
  S.forEach((s) => (g += sw(s)));

  // legend
  g += label(36, 712, 'VLANS', { size: 12, color: C.muted });
  V.forEach((col, i) => {
    g += line(36 + i * 60, 732, 76 + i * 60, 732, `stroke="${col}" stroke-width="2.4"`);
  });
  g += label(1004, 712, 'STATIC, INTER-VLAN, OSPF, EIGRP', { size: 12, color: C.muted, anchor: 'end' });
  g += label(1004, 736, 'SHOW COMMANDS, PINGS, TRACES, PACKET CAPTURES', { size: 12, color: C.dim, anchor: 'end' });
  return svgWrap(A, g);
}

/* ------------------------------------------------------------------------------------------ */
/* 07 · Archtech — contribute → review → publish → rust, with ownership keys                 */
/* ------------------------------------------------------------------------------------------ */
function archtech(A) {
  const xs = [140, 380, 620, 860];
  const y = 410;
  const box = 150;
  const names = ['CONTRIBUTE', 'REVIEW', 'PUBLISH', 'VERIFY'];
  let g = '';
  // access bus
  const busY = 150;
  g += label(60, busY - 22, 'ACCESS MANAGEMENT', { size: 13, color: C.muted });
  g += line(60, busY, 980, busY, `stroke="rgba(238,238,238,0.3)" stroke-width="1.2"`);
  g += circle(60, busY, 4, `fill="${C.text}"`);
  g += label(980, busY - 22, 'GOOGLE WORKSPACE', { size: 12, color: C.dim, anchor: 'end' });

  const key = (x, ky, color, teeth) => {
    let s = circle(x, ky, 19, `fill="${C.ink}" stroke="${color}" stroke-width="2.4"`);
    s += circle(x, ky, 7, `fill="none" stroke="${color}" stroke-width="2"`);
    s += line(x, ky + 19, x, ky + 78, `stroke="${color}" stroke-width="3"`);
    teeth.forEach((t, i) => (s += line(x, ky + 54 + i * 10, x + t, ky + 54 + i * 10, `stroke="${color}" stroke-width="3"`)));
    return s;
  };
  const teeth = [[12, 7], [7, 14, 7], [14, 7], [9, 14, 11]];

  xs.forEach((x, i) => {
    const last = i === 3;
    const col = last ? A : 'rgba(236,238,243,0.85)';
    // drop from the bus
    g += `<path d="M${x} ${busY}V${y - box / 2}" stroke="rgba(238,238,238,0.18)" stroke-width="1.2" stroke-dasharray="3 5"/>`;
    g += circle(x, busY, 4, `fill="${last ? A : C.text}"`);
    g += key(x, busY + 52, last ? A : 'rgba(236,238,243,0.75)', teeth[i]);
    // stage box
    if (last) g += `<rect x="${x - box / 2 - 10}" y="${y - box / 2 - 10}" width="${box + 20}" height="${box + 20}" rx="26" fill="${A}" opacity=".22" filter="url(#bloom)"/>`;
    g += `<rect x="${x - box / 2}" y="${y - box / 2}" width="${box}" height="${box}" rx="20" fill="${last ? rgba(A, 0.08) : C.s1}" stroke="${last ? A : 'rgba(238,238,238,0.2)'}" stroke-width="${last ? 1.8 : 1.2}"/>`;
    g += `<path d="${bracketPath(x - box / 2 - 12, y - box / 2 - 12, box + 24, box + 24, 14)}" fill="none" stroke="${last ? rgba(A, 0.7) : 'rgba(238,238,238,0.25)'}" stroke-width="1.2"/>`;
    g += label(x, y + box / 2 + 44, names[i], { size: 14, color: last ? A : C.text, anchor: 'middle', ls: 0.2, weight: 550 });
    g += label(x, y + box / 2 + 68, String(i + 1).padStart(2, '0'), { size: 12, color: C.dim, anchor: 'middle' });
    // icons
    const st = `fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"`;
    if (i === 0) {
      g += circle(x - 22, y - 32, 9, st) + circle(x - 22, y + 34, 9, st) + circle(x + 26, y - 6, 9, st);
      g += `<path d="M${x - 22} ${y - 23}V${y + 25}M${x - 22} ${y + 10}C${x - 22} ${y - 8} ${x + 26} ${y + 14} ${x + 26} ${y + 3}" ${st}/>`;
    } else if (i === 1) {
      g += `<path d="M${x - 30} ${y - 40}H${x + 14}L${x + 30} ${y - 24}V${y + 40}H${x - 30}Z" ${st}/>`;
      g += `<path d="M${x - 18} ${y - 16}H${x + 16}M${x - 18} ${y}H${x + 16}M${x - 18} ${y + 16}H${x + 2}" ${st}/>`;
    } else if (i === 2) {
      g += `<path d="M${x - 34} ${y + 14}V${y + 34}H${x + 34}V${y + 14}" ${st}/>`;
      g += `<path d="M${x} ${y + 18}V${y - 36}M${x - 18} ${y - 18}L${x} ${y - 36}L${x + 18} ${y - 18}" ${st}/>`;
    } else {
      g += `<path d="M${x} ${y - 42}L${x + 32} ${y - 30}V${y + 2}C${x + 32} ${y + 24} ${x + 16} ${y + 36} ${x} ${y + 44}C${x - 16} ${y + 36} ${x - 32} ${y + 24} ${x - 32} ${y + 2}V${y - 30}Z" ${st}/>`;
      g += `<path d="M${x - 13} ${y}L${x - 3} ${y + 11}L${x + 15} ${y - 10}" fill="none" stroke="${A}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)"/>`;
    }
    // connector to next stage
    if (i < 3) {
      const x1 = x + box / 2 + 16;
      const x2 = xs[i + 1] - box / 2 - 16;
      g += line(x1, y, x2 - 4, y, `stroke="${i === 2 ? A : 'rgba(238,238,238,0.45)'}" stroke-width="1.6"`);
      g += arrowHead(x2, y, 0, 10, i === 2 ? A : 'rgba(238,238,238,0.7)');
      g += circle((x1 + x2) / 2, y, 4, `fill="${i === 2 ? A : C.text}"`);
    }
  });
  // rollback
  const rb0 = [xs[3], y + box / 2 + 92];
  const rb1 = [xs[2], y + box / 2 + 92];
  g += `<path d="M${rb0[0]} ${rb0[1]}C${rb0[0]} ${rb0[1] + 70} ${rb1[0]} ${rb1[1] + 70} ${rb1[0]} ${rb1[1] + 6}" fill="none" stroke="${rgba(A, 0.7)}" stroke-width="1.5" stroke-dasharray="3 6" stroke-linecap="round"/>`;
  g += arrowHead(rb1[0], rb1[1] + 2, -90, 9, A);
  g += label((rb0[0] + rb1[0]) / 2, rb0[1] + 76, 'ROLLBACK', { size: 12, color: A, anchor: 'middle', ls: 0.24 });
  // release readiness: the four things that must agree (projects.ts, archtech "release" section)
  g += label(60, 664, 'HOSTING · DEPLOYMENT', { size: 13, color: C.muted });
  g += line(60, 678, 520, 678, 'stroke="rgba(238,238,238,0.14)"');
  ['OWNERSHIP', 'SOURCE STATE', 'HOSTING CONFIGURATION', 'PUBLIC RESULT'].forEach((t, k) => {
    const cx = 60 + (k % 2) * 250;
    const cy = 704 + Math.floor(k / 2) * 30;
    g += `<rect x="${cx}" y="${cy - 11}" width="13" height="13" rx="2" fill="${rgba(A, 0.18)}" stroke="${A}" stroke-width="1.2"/>`;
    g += `<path d="M${cx + 3} ${cy - 4.5}l3 3l5 -6" fill="none" stroke="${A}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
    g += label(cx + 24, cy, t, { size: 12, color: C.text, ls: 0.12 });
  });
  return svgWrap(A, g);
}

/* ------------------------------------------------------------------------------------------ */
/* 08 · Interactive Portfolio — isometric wireframe room                                       */
/* ------------------------------------------------------------------------------------------ */
function portfolio(A) {
  const s = 60;
  const ox = 486;
  const oy = 312;
  const RW = 8;
  const RD = 6.4;
  const RH = 4.6;
  const P = (x, y, z = 0) => [ox + (x - y) * s * COS, oy + (x + y) * s * SIN - z * s];
  const edge = 'rgba(236,238,243,0.42)';
  let g = '';

  // walls & floor
  const wallL = [P(0, 0, 0), P(0, RD, 0), P(0, RD, RH), P(0, 0, RH)];
  const wallR = [P(0, 0, 0), P(RW, 0, 0), P(RW, 0, RH), P(0, 0, RH)];
  const floor = [P(0, 0), P(RW, 0), P(RW, RD), P(0, RD)];
  g += `<defs>
<linearGradient id="wl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101010"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient>
<linearGradient id="wr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#161616"/><stop offset="1" stop-color="#0d1015"/></linearGradient>
<linearGradient id="scr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${A}" stop-opacity=".95"/><stop offset="1" stop-color="${A}" stop-opacity=".55"/></linearGradient>
</defs>`;
  g += polygon(wallL, `fill="url(#wl)"`) + polygon(wallR, `fill="url(#wr)"`) + polygon(floor, `fill="#0b0d12"`);
  // grids
  let grid = '';
  for (let i = 1; i < RW; i++) grid += line(...P(i, 0), ...P(i, RD), '');
  for (let j = 1; j < RD; j++) grid += line(...P(0, j), ...P(RW, j), '');
  for (let i = 1; i < RW; i++) grid += line(...P(i, 0, 0), ...P(i, 0, RH), '');
  for (let j = 1; j < RD; j++) grid += line(...P(0, j, 0), ...P(0, j, RH), '');
  for (let z = 1; z < RH; z++) grid += line(...P(0, 0, z), ...P(RW, 0, z), '') + line(...P(0, 0, z), ...P(0, RD, z), '');
  g += `<g stroke="rgba(238,238,238,0.06)" stroke-width="1">${grid}</g>`;
  // light spill on the floor under the desk
  const [gx, gy] = P(4, 1.8);
  g += `<ellipse cx="${f(gx)}" cy="${f(gy)}" rx="210" ry="90" fill="${A}" opacity=".14" filter="url(#haze)"/>`;
  // room edges
  g += `<path d="M${pts([P(0, RD, 0), P(0, 0, 0), P(RW, 0, 0)]).replace(/ /g, 'L')}" fill="none" stroke="${edge}" stroke-width="1.4"/>`;
  g += `<path d="M${pts([P(0, RD, RH), P(0, 0, RH), P(RW, 0, RH)]).replace(/ /g, 'L')}" fill="none" stroke="rgba(236,238,243,0.25)" stroke-width="1"/>`;
  g += line(...P(0, 0, 0), ...P(0, 0, RH), `stroke="${edge}" stroke-width="1.4"`);
  g += `<path d="M${pts([P(RW, 0, 0), P(RW, RD, 0), P(0, RD, 0)]).replace(/ /g, 'L')}" fill="none" stroke="rgba(236,238,243,0.16)" stroke-width="1" stroke-dasharray="4 6"/>`;

  // box helper (draws the 3 visible faces)
  const box = (x, y, z, w, d, h, o = {}) => {
    const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    const fx = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
    const fy = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    const st = `stroke="${o.stroke || edge}" stroke-width="${o.sw || 1.2}" stroke-linejoin="round"`;
    return polygon(fx, `fill="${o.fx || '#10141b'}" ${st}`) + polygon(fy, `fill="${o.fy || '#0c0f14'}" ${st}`) + polygon(top, `fill="${o.top || '#181d27'}" ${st}`);
  };
  // matrix that maps (u: along +x, v: down along -z) onto the face y = y0
  const faceY = (x0, y0, z0) => {
    const [ex, ey] = P(x0, y0, z0);
    return `matrix(${f(COS)} ${f(SIN)} 0 1 ${f(ex)} ${f(ey)})`;
  };
  // matrix for the face x = x0 (u: along +y, v: down)
  const faceX = (x0, y0, z0) => {
    const [ex, ey] = P(x0, y0, z0);
    return `matrix(${f(-COS)} ${f(SIN)} 0 1 ${f(ex)} ${f(ey)})`;
  };

  // bookshelf on the left wall
  g += box(0, 1.0, 0, 0.9, 2.4, 3.3, {});
  for (const z of [0.15, 1.15, 2.15]) {
    // shelf openings on the +x face
    const u0 = 0.12 * s;
    g += `<g transform="${faceX(0.9, 1.0, z + 0.95)}"><rect x="${f(0.12 * s)}" y="0" width="${f(2.16 * s)}" height="${f(0.85 * s)}" fill="#07090c" stroke="rgba(236,238,243,0.25)" stroke-width=".8"/></g>`;
    const rb = rng('books' + z);
    let u = 0.2;
    while (u < 2.1) {
      const bw = 0.1 + rb() * 0.12;
      const bh = 0.5 + rb() * 0.3;
      const lit = rb() < 0.15;
      g += `<g transform="${faceX(0.9, 1.0 + u, z + bh)}"><rect x="0" y="0" width="${f(bw * s - 2)}" height="${f(bh * s)}" fill="${lit ? rgba(A, 0.7) : 'rgba(236,238,243,' + (0.12 + rb() * 0.18).toFixed(2) + ')'}"/></g>`;
      u += bw + 0.02;
    }
    void u0;
  }
  // rack on the left wall, nearer the viewer
  g += box(0, 4.4, 0, 1.3, 1.4, 3.8, { fx: '#121620' });
  for (let k = 0; k < 9; k++) {
    const z = 3.55 - k * 0.38;
    const on = k % 3 !== 2;
    g += `<g transform="${faceX(1.3, 4.4, z)}">
<rect x="${f(0.1 * s)}" y="0" width="${f(1.2 * s)}" height="${f(0.3 * s)}" fill="#0b0e13" stroke="rgba(236,238,243,0.28)" stroke-width=".8"/>
<rect x="${f(0.18 * s)}" y="${f(0.11 * s)}" width="5" height="5" fill="${on ? (k === 4 ? C.rust : A) : 'rgba(236,238,243,0.3)'}"/>
<rect x="${f(0.32 * s)}" y="${f(0.12 * s)}" width="${f(0.5 * s)}" height="2" fill="rgba(236,238,243,0.25)"/></g>`;
  }
  // desk against the right wall
  const dz = 2.1;
  for (const [lx, ly] of [[2.1, 0.15], [5.4, 0.15], [2.1, 1.6], [5.4, 1.6]]) g += box(lx, ly, 0, 0.12, 0.12, dz, { top: '#20263a' });
  g += box(2.0, 0.05, dz, 3.6, 1.8, 0.16, { top: '#1b2130', fx: '#151a24', fy: '#11151d' });
  // monitor + stand
  g += box(3.7, 0.3, dz + 0.16, 0.25, 0.18, 0.3, {});
  g += box(2.7, 0.25, dz + 0.42, 2.2, 0.14, 1.32, { fy: '#0c0f14' });
  // screen on the +y face of the monitor
  const scr = faceY(2.78, 0.39, dz + 0.42 + 1.24);
  g += `<g transform="${scr}">
<rect x="0" y="0" width="${f(2.04 * s)}" height="${f(1.16 * s)}" fill="${A}" opacity=".55" filter="url(#bloom)"/>
<rect x="0" y="0" width="${f(2.04 * s)}" height="${f(1.16 * s)}" fill="url(#scr)"/>
<rect x="0" y="0" width="${f(2.04 * s)}" height="10" fill="${rgba(C.ink, 0.4)}"/>
<text x="9" y="30" font-size="12" font-weight="700" letter-spacing="0.1em" fill="${C.ink}">AFFAN_OS</text>
<rect x="9" y="40" width="22" height="16" rx="2" fill="${rgba(C.ink, 0.35)}"/><rect x="36" y="40" width="22" height="16" rx="2" fill="${rgba(C.ink, 0.35)}"/><rect x="63" y="40" width="22" height="16" rx="2" fill="${rgba(C.ink, 0.35)}"/>
<rect x="${f(2.04 * s - 26)}" y="${f(1.16 * s - 16)}" width="18" height="8" rx="1" fill="${rgba(C.ink, 0.45)}"/></g>`;
  // keyboard
  g += box(3.0, 0.95, dz + 0.16, 1.6, 0.45, 0.05, { top: '#2a3142' });
  // printer on the desk
  g += box(4.95, 0.2, dz + 0.16, 0.6, 0.6, 0.7, { top: '#1b2130' });
  g += line(...P(5.25, 0.5, dz + 0.86), ...P(5.25, 0.5, dz + 0.4), `stroke="${A}" stroke-width="1.6"`);
  // chair
  g += box(3.45, 2.5, 0, 0.9, 0.9, 0.12, {});
  g += box(3.85, 2.9, 0.12, 0.1, 0.1, 1.05, {});
  g += box(3.3, 2.35, 1.17, 1.2, 1.15, 0.14, { top: '#1f1f1f' });
  g += box(3.3, 3.42, 1.31, 1.2, 0.12, 1.25, { fy: '#0e1118' });

  // callouts
  const callout = (from, to, text, color = C.muted, anchor = 'start') => {
    const hx = anchor === 'start' ? to[0] + 96 : to[0] - 96;
    return `<path d="M${f(from[0])} ${f(from[1])}L${f(to[0])} ${f(to[1])}H${f(hx)}" fill="none" stroke="rgba(238,238,238,0.35)" stroke-width="1"/>${circle(from[0], from[1], 3, `fill="${C.text}"`)}
${label(anchor === 'start' ? to[0] + 6 : to[0] - 6, to[1] - 9, text, { size: 13, color, anchor })}`;
  };
  const scrPt = P(4.4, 0.39, dz + 1.4);
  g += callout(scrPt, [scrPt[0] + 120, scrPt[1] - 120], 'AFFAN_OS', A);
  const rackPt = P(1.3, 5.1, 3.0);
  g += callout(rackPt, [rackPt[0] - 110, rackPt[1] - 80], 'RACK', C.muted, 'end');
  const shelfPt = P(0.9, 2.2, 2.9);
  g += callout(shelfPt, [shelfPt[0] - 90, shelfPt[1] - 130], 'BOOKSHELF', C.muted, 'end');
  g += label(1004, 740, '3D ROOM · PROCEDURAL THREE.JS MODELS', { size: 12, color: C.dim, anchor: 'end' });
  return svgWrap(A, g);
}

const FIGURES = {
  'file-integrity-monitor': fileIntegrity,
  'p2p-messaging': p2p,
  'secure-file-transfer': secureTransfer,
  ssik,
  otnow,
  'cisco-networking-labs': cisco,
  archtech,
  'interactive-portfolio': portfolio
};

export function projectFigure(slug, accentHex) {
  const fn = FIGURES[slug];
  if (!fn) throw new Error(`No figure for project "${slug}"`);
  return fn(accentHex);
}
