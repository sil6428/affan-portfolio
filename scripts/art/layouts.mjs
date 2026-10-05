/**
 * Affan portfolio · artboard layouts
 * Turns data + a figure into full HTML artboards: project posters (4:5 + square), the lanyard
 * badge (front/back), strap texture and OG card.
 */
import { C, FONT, ACCENT, rgba, esc, page, brackets, grid, glow, grain, ruler, barcode } from './kit.mjs';
import { monogramSvg } from './monogram.mjs';

const UPPER = (s) => esc(String(s).toUpperCase());

/** Status chip: dot + label. */
function chip(text, color, { size = 16, pad = '9px 16px 9px 14px', solid = false } = {}) {
  return `<span class="mono" style="display:inline-flex;align-items:center;gap:10px;font-size:${size}px;line-height:1;
padding:${pad};border-radius:999px;white-space:nowrap;
color:${solid ? C.ink : color};background:${solid ? color : rgba(color, 0.08)};border:1px solid ${solid ? color : rgba(color, 0.42)}">
<i style="width:${Math.round(size * 0.5)}px;height:${Math.round(size * 0.5)}px;border-radius:50%;background:${solid ? C.ink : color};
box-shadow:0 0 0 4px ${rgba(solid ? C.ink : color, 0.18)};display:block"></i>${UPPER(text)}</span>`;
}

/** Hairline chips for stack items / tags. */
function pills(items, { size = 16, color = C.muted } = {}) {
  return items
    .map(
      (s) => `<span class="mono" style="font-size:${size}px;line-height:1;padding:10px 14px;border:1px solid ${C.lineStrong};
border-radius:4px;color:${color};background:rgba(15,18,23,.72);white-space:nowrap;letter-spacing:.1em">${UPPER(s)}</span>`
    )
    .join('');
}

const COORDS = (profile) => profile.coordinates
  ? `${esc(profile.coordinates.lat)} · ${esc(profile.coordinates.lng)}`
  : esc(profile.locationShort ?? profile.location ?? 'Ontario, Canada');

/* ------------------------------------------------------------------------------------------ */
/* Tall poster shell (projects 1200x1500)                                                       */
/* Flex column: header · ruler · figure (centred in the leftover space) · text block · footer.  */
/* ------------------------------------------------------------------------------------------ */
function tallPoster({ A, W, H, figH, code, section, index, total, chipText, kicker, title, items, footerLeft, profile, figure, seed }) {
  const body = `
${glow({ x: W / 2, y: 140 + figH / 2, r: 780, color: C.ash, alpha: 0.07 })}
${grid({ size: 48, alpha: 0.05, fade: '72% 58% at 50% 36%', x: 24, y: 16 })}
<div class="abs" style="left:40px;top:40px;width:${W - 80}px;height:${H - 80}px;border:1px solid ${C.line}"></div>
${brackets({ x: 40, y: 40, w: W - 80, h: H - 80, arm: 44, stroke: 2, color: 'rgba(236,238,243,0.6)' })}
<div class="abs" style="left:88px;right:88px;top:72px;bottom:72px;display:flex;flex-direction:column">
  <header class="mono" style="display:flex;align-items:center;justify-content:space-between;font-size:17px;color:${C.muted};height:40px">
    <span><b style="color:${A};font-weight:600">${code}</b> <span class="dim">·</span> ${section} <span class="dim">&nbsp;${esc(index)} / ${String(total).padStart(2, '0')}</span></span>
    ${chip(chipText, A, { size: 15 })}
  </header>
  <div style="position:relative;height:10px;margin-top:16px">${ruler({ x: 0, y: 0, w: W - 176, step: 12.8, major: 10 })}</div>
  <div style="flex:1;min-height:${figH}px;display:flex;align-items:center;justify-content:center;margin:0 -8px">
    <div style="width:1040px;height:${figH}px;flex:none">${figure}</div>
  </div>
  <section style="display:flex;flex-direction:column;gap:22px;padding-bottom:44px">
    <div style="display:flex;align-items:center;gap:22px">
      <span class="serif" style="font-size:96px;line-height:.8;color:${A};letter-spacing:-0.02em;margin-top:-6px">${esc(index)}</span>
      <span style="flex:none;width:1px;height:46px;background:${C.lineStrong}"></span>
      <span class="mono" style="font-size:17px;line-height:1.45;color:${C.muted};letter-spacing:.12em">${UPPER(kicker)}</span>
    </div>
    <h1 data-fit="2,60" style="font-family:${FONT.sans};font-weight:600;font-size:96px;line-height:.98;letter-spacing:-0.04em;color:${C.text};text-wrap:balance">${esc(title)}</h1>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">${pills(items)}</div>
  </section>
  <footer class="mono" style="border-top:1px solid ${C.line};padding-top:30px;display:flex;justify-content:space-between;font-size:14px;color:${C.dim}">
    <span>${UPPER(profile.name)} <span style="color:${A}">/</span> ${UPPER(footerLeft)}</span>
    <span>${COORDS(profile)}</span>
  </footer>
</div>
${grain({ opacity: 0.06, seed })}`;
  return page({ width: W, height: H, body });
}

/** Project poster · 1200 x 1500 */
export function projectPoster({ project, total, figure, profile, stack }) {
  return tallPoster({
    A: ACCENT[project.accent], W: 1200, H: 1500, figH: 780, code: '~/log', section: 'CASE FILE',
    index: project.index, total, chipText: project.status, kicker: project.kicker, title: project.title,
    items: stack, footerLeft: profile.headline, profile, figure, seed: 7
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Project square · 1024 x 1024 (text kept inside the central 768 px safe area)               */
/* ------------------------------------------------------------------------------------------ */
export function projectSquare({ project, figure }) {
  const A = ACCENT[project.accent];
  const S = 1024;
  const body = `
${glow({ x: 512, y: 470, r: 640, color: C.ash, alpha: 0.07 })}
${grid({ size: 40, alpha: 0.05, fade: '65% 60% at 50% 45%', x: 12, y: 12 })}
${brackets({ x: 28, y: 28, w: 968, h: 968, arm: 36, stroke: 2, color: 'rgba(236,238,243,0.5)' })}
<header class="abs mono" style="left:128px;right:128px;top:112px;display:flex;align-items:center;justify-content:space-between;font-size:15px;color:${C.muted}">
  <span><b style="color:${A};font-weight:600">~/log</b> <span class="dim">·</span> CASE FILE</span>
  ${chip(project.status, A, { size: 13, pad: '7px 12px 7px 11px' })}
</header>
${ruler({ x: 128, y: 156, w: 768, step: 12.8, major: 10 })}
<div class="abs" style="left:112px;top:176px;width:800px;height:600px">${figure}</div>
<section class="abs" style="left:128px;right:128px;top:792px;display:flex;flex-direction:column;gap:14px">
  <div style="display:flex;align-items:baseline;gap:18px">
    <span class="serif" style="font-size:60px;line-height:.9;color:${A}">${esc(project.index)}</span>
    <h1 data-fit="1,34" style="flex:1;min-width:0;white-space:nowrap;font-family:${FONT.sans};font-weight:600;font-size:56px;line-height:1;letter-spacing:-0.04em">${esc(project.shortTitle)}</h1>
  </div>
  <div class="mono" data-fit="1,11" style="font-size:14px;white-space:nowrap;color:${C.dim};letter-spacing:.12em">${UPPER(project.kicker)}</div>
</section>
${grain({ opacity: 0.06, seed: 8 })}`;
  return page({ width: S, height: S, body });
}



/* ------------------------------------------------------------------------------------------ */
/* Lanyard badge · 1000 x 1400 (front + back)                                                  */
/* ------------------------------------------------------------------------------------------ */
function badgeChrome(A) {
  return `
<div class="fill" style="background:linear-gradient(180deg,#101010 0%,#0b0b0b 46%,#08090c 100%)"></div>
${glow({ x: 820, y: 180, r: 620, color: C.ash, alpha: 0.07 })}
${grid({ size: 40, alpha: 0.045, fade: '90% 80% at 60% 30%', x: 20, y: 20 })}
<div class="abs" style="left:24px;top:24px;right:24px;bottom:24px;border:1px solid ${C.line};border-radius:22px"></div>
<div class="abs" style="left:50%;top:58px;width:180px;height:30px;margin-left:-90px;border-radius:15px;background:#030405;
box-shadow:inset 0 2px 6px rgba(0,0,0,.9),0 0 0 1px rgba(238,238,238,.14)"></div>`;
}

export function badgeFront({ profile }) {
  const A = C.phosphor;
  const body = `
${badgeChrome(A)}
${brackets({ x: 56, y: 56, w: 888, h: 1288, arm: 44, stroke: 2, color: 'rgba(236,238,243,0.55)' })}
<header class="abs mono" style="left:96px;right:96px;top:132px;display:flex;justify-content:space-between;font-size:17px;color:${C.muted}">
  <span><b style="color:${A};font-weight:600">~/whoami</b> <span class="dim">·</span> WHOAMI</span>
  <span class="dim">${UPPER(profile.locationShort)}</span>
</header>
${ruler({ x: 96, y: 176, w: 808, step: 13.47, major: 10 })}

<div class="abs" style="left:84px;top:226px;width:320px;height:320px">
  ${monogramSvg({ color: C.text, bracketColor: A, size: 320 })}
</div>
<div class="abs" style="left:450px;right:96px;top:262px;display:flex;flex-direction:column;gap:30px">
  <div><div class="mono dim" style="font-size:14px;margin-bottom:12px">STATUS</div>${chip('Open to co-op', A, { size: 17, pad: '11px 18px 11px 16px' })}</div>
  <div><div class="mono dim" style="font-size:14px;margin-bottom:10px">EDUCATION</div>
    <div style="font-size:30px;line-height:1.15;font-weight:500;letter-spacing:-0.015em">${esc(profile.education.school)}</div></div>
  <div><div class="mono dim" style="font-size:14px;margin-bottom:10px">LOCATION</div>
    <div style="font-size:30px;line-height:1.15;font-weight:500;letter-spacing:-0.015em">${esc(profile.location)}</div></div>
</div>

<section class="abs" style="left:96px;right:96px;top:640px">
  <h1 style="font-weight:650;font-size:168px;line-height:.86;letter-spacing:-0.055em">${esc(profile.firstName)}<br>${esc(profile.lastName)}</h1>
  <div style="margin-top:34px;display:flex;align-items:center;gap:18px">
    <span style="width:44px;height:2px;background:${A}"></span>
    <span style="font-size:40px;font-weight:450;letter-spacing:-0.02em;color:${C.muted}">${esc(profile.education.major)}</span>
  </div>
</section>

<div class="abs" style="left:96px;right:96px;top:1124px;height:1px;background:${C.lineStrong}"></div>
<div class="abs" style="left:96px;top:1156px">${barcode({ w: 520, h: 88, seed: 'affan-shaikh', color: C.text })}</div>
<div class="abs mono" style="left:96px;top:1262px;font-size:14px;color:${C.dim}">${UPPER(profile.initials)} · ${COORDS(profile)}</div>
<div class="abs" style="right:96px;top:1156px;text-align:right">
  <div class="serif" style="font-size:84px;line-height:.8;color:${A}">${esc(profile.initials)}</div>
  <div class="mono dim" style="font-size:14px;margin-top:22px">${UPPER(profile.locationShort)}</div>
</div>
${grain({ opacity: 0.05, seed: 11 })}`;
  return page({ width: 1000, height: 1400, body, background: C.s1 });
}

export function badgeBack({ profile, contact }) {
  const A = C.phosphor;
  const row = (k, v) => `<div style="display:flex;flex-direction:column;gap:12px;padding:30px 0;border-top:1px solid ${C.lineStrong}">
<span class="mono dim" style="font-size:15px">${k}</span><span style="font-size:44px;font-weight:500;letter-spacing:-0.025em;color:${C.text}">${esc(v)}</span></div>`;
  const body = `
${badgeChrome(A)}
${brackets({ x: 56, y: 56, w: 888, h: 1288, arm: 44, stroke: 2, color: 'rgba(236,238,243,0.55)' })}
<div class="abs" style="right:-120px;bottom:-60px;width:720px;height:720px;opacity:.05">${monogramSvg({ color: '#ffffff', size: 720 })}</div>
<header class="abs mono" style="left:96px;right:96px;top:132px;display:flex;justify-content:space-between;font-size:17px;color:${C.muted}">
  <span><b style="color:${A};font-weight:600">~/contact</b> <span class="dim">·</span> CONTACT</span>
  <span class="dim">${UPPER(profile.headline)}</span>
</header>
${ruler({ x: 96, y: 176, w: 808, step: 13.47, major: 10 })}
<div class="abs serif" style="left:96px;top:226px;font-size:120px;line-height:.9;color:${C.text};letter-spacing:-0.01em">Open a<br><span style="color:${A}">channel</span></div>
<section class="abs" style="left:96px;right:96px;top:520px">
  ${row('EMAIL', contact.email)}
  ${row('GITHUB', contact.github.label)}
  ${row('LINKEDIN', contact.linkedin.label)}
  <div style="border-top:1px solid ${C.lineStrong}"></div>
</section>
<section class="abs" style="left:96px;right:96px;top:1046px;display:flex;justify-content:space-between;align-items:flex-end">
  <div>
    <div class="mono dim" style="font-size:15px;margin-bottom:14px">${UPPER(profile.education.school)}</div>
    <div style="font-size:30px;font-weight:500;letter-spacing:-0.02em;color:${C.muted};max-width:520px;line-height:1.2">${esc(profile.education.degree)}</div>
  </div>
  ${chip('Expected Apr. 2028', A, { size: 17, pad: '12px 18px 12px 16px' })}
</section>
<div class="abs" style="left:96px;right:96px;top:1216px;height:1px;background:${C.line}"></div>
<div class="abs" style="left:96px;top:1240px">${barcode({ w: 808, h: 40, seed: 'contact', color: 'rgba(236,238,243,0.55)' })}</div>
${grain({ opacity: 0.05, seed: 12 })}`;
  return page({ width: 1000, height: 1400, body, background: C.s1 });
}

/* ------------------------------------------------------------------------------------------ */
/* Lanyard strap · 1024 x 64 (tiles horizontally)                                              */
/* ------------------------------------------------------------------------------------------ */
export function strap({ profile }) {
  const N = 2;
  const cell = 1024 / N;
  const text = `${profile.name.toUpperCase()} · ~/WHOAMI ·`;
  const cells = Array.from({ length: N }, () => `<div style="width:${cell}px;flex:none;display:flex;align-items:center;justify-content:center;gap:18px">
<span class="mono" style="font-size:21px;font-weight:600;letter-spacing:.26em;color:${C.text};white-space:nowrap">${esc(text)}</span></div>`).join('');
  const body = `
<div class="fill" style="background:linear-gradient(180deg,#0b0b0b 0%,#060606 50%,#0b0b0b 100%)"></div>
<div class="abs" style="left:0;right:0;top:7px;height:0;border-top:1.5px dashed ${rgba(C.phosphor, 0.4)}"></div>
<div class="abs" style="left:0;right:0;bottom:7px;height:0;border-top:1.5px dashed ${rgba(C.phosphor, 0.4)}"></div>
<div class="fill" style="display:flex">${cells}</div>`;
  return page({ width: 1024, height: 64, body });
}


/* ------------------------------------------------------------------------------------------ */
/* OG card · 1200 x 630                                                                        */
/* ------------------------------------------------------------------------------------------ */
export function ogCard({ profile }) {
  const A = C.phosphor;
  const body = `
${glow({ x: 980, y: 520, r: 620, color: C.ash, alpha: 0.08 })}
${glow({ x: 200, y: 80, r: 420, color: C.ash, alpha: 0.06 })}
${grid({ size: 42, alpha: 0.05, fade: '80% 90% at 60% 50%', x: 10, y: 10 })}
${brackets({ x: 32, y: 32, w: 1136, h: 566, arm: 38, stroke: 2, color: 'rgba(236,238,243,0.55)' })}
<header class="abs mono" style="left:80px;right:80px;top:70px;display:flex;justify-content:space-between;font-size:16px;color:${C.muted}">
  <span><b style="color:${A};font-weight:600">affan@shaikh:~$</b></span>
  <span class="dim">${COORDS(profile)}</span>
</header>
${ruler({ x: 80, y: 110, w: 1040, step: 13, major: 10 })}
<div class="abs" style="left:66px;top:168px;width:240px;height:240px">${monogramSvg({ color: C.text, bracketColor: A, size: 240 })}</div>
<section class="abs" style="left:348px;right:80px;top:172px">
  <h1 style="font-weight:650;font-size:118px;line-height:.9;letter-spacing:-0.05em">${esc(profile.name)}</h1>
  <div style="margin-top:22px;font-size:46px;font-weight:450;letter-spacing:-0.025em;color:${C.muted}">Networking <span class="serif" style="color:${A};font-size:52px">&amp;</span> IT Security</div>
</section>
<footer class="abs" style="left:80px;right:80px;bottom:70px;display:flex;justify-content:space-between;align-items:center">
  <span class="mono" style="font-size:16px;color:${C.dim}">${UPPER(profile.education.school)} <span style="color:${A}">/</span> ${UPPER(profile.location)}</span>
  ${chip(profile.status, A, { size: 14, pad: '9px 14px 9px 12px' })}
</footer>
${grain({ opacity: 0.05, seed: 13 })}`;
  return page({ width: 1200, height: 630, body });
}
