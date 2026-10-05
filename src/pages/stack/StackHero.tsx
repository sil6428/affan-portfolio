import { useRef } from 'react';
import VariableProximity from '@/components/reactbits/VariableProximity';
import OrbitImages from '@/components/reactbits/OrbitImages';
import RB from '@/components/ui/RB';
import TermField, { type ClearZone } from '@/components/ui/TermField';
import { ASCII_MONOGRAM } from '@/data/card';
import { useReducedMotion } from '@/lib/motion';
import { useFinePointer, useIsMobile } from '@/lib/media';
import { skillNodes, stats } from './data';
import { AnchorButton } from './parts';
import { useOnScreen } from './useOnScreen';

// Logos come from the skills that carry a simple-icons slug: development tools orbit
// on the outer ring, systems & tooling logos on the inner ring (both chalk; the inner ring is dimmed).
const outerLogos = skillNodes
  .filter((s) => s.icon && s.category === 'development')
  .map((s) => `/art/logos/${s.icon}.svg`);
// GitHub Pages' simple-icons mark is a wordmark that turns illegible at orbit size, so it is skipped.
const innerLogos = skillNodes
  .filter((s) => s.icon && s.icon !== 'githubpages' && s.category === 'systems')
  .map((s) => `/art/logos/${s.icon}.svg`);

const BASE = 600;

// Desktop only: card texture stays off the header strip, the text column and the dial's core.
// Phones skip the field; the only space left there is the dial, where words would read as skill labels.
const CLEAR_DESKTOP: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 10 },
  { x0: 0, y0: 10, x1: 57, y1: 100 },
  { x0: 60, y0: 18, x1: 97, y1: 88 }
];

function OrbitInstrument() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(ref, '80px 0px');
  // Phones and reduced motion get the same dial standing still; desktop pauses it off-screen.
  const paused = reduced || mobile || !onScreen;

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[min(500px,100%)] [container-type:inline-size]">
      <RB name="OrbitImages" className="absolute inset-0">
        {/* Instrument dial behind the orbits: hairline rings and a tick bezel, no glow. */}
        <svg aria-hidden viewBox={`0 0 ${BASE} ${BASE}`} className="absolute inset-0 h-full w-full">
          <circle cx={300} cy={300} r={270} fill="none" stroke="rgb(238 238 238 / 0.10)" />
          <circle cx={300} cy={300} r={232} fill="none" stroke="rgb(238 238 238 / 0.06)" strokeDasharray="1 7" />
          <circle cx={300} cy={300} r={150} fill="none" stroke="rgb(238 238 238 / 0.12)" strokeDasharray="2 6" />
          <circle cx={300} cy={300} r={96} fill="rgb(11 11 11)" stroke="rgb(238 238 238 / 0.14)" />
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * Math.PI * 2;
            const long = i % 6 === 0;
            const r1 = 286;
            const r2 = long ? 298 : 292;
            return (
              <line
                key={i}
                x1={300 + Math.cos(a) * r1}
                y1={300 + Math.sin(a) * r1}
                x2={300 + Math.cos(a) * r2}
                y2={300 + Math.sin(a) * r2}
                stroke={long ? 'rgb(238 238 238 / 0.42)' : 'rgb(238 238 238 / 0.16)'}
                strokeWidth={long ? 1.5 : 1}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0">
          <OrbitImages
            images={outerLogos}
            altPrefix="Development tool logo"
            shape="circle"
            radius={232}
            baseWidth={BASE}
            itemSize={38}
            rotation={0}
            duration={110}
            responsive
            paused={paused}
            className="opacity-90"
          />
        </div>
        <div className="absolute inset-0">
          <OrbitImages
            images={innerLogos}
            altPrefix="Systems tool logo"
            shape="circle"
            radius={150}
            baseWidth={BASE}
            itemSize={32}
            rotation={0}
            duration={84}
            direction="reverse"
            responsive
            paused={paused}
            className="opacity-60"
          />
        </div>

        {/* The card's ASCII monogram at the hub (sized in container units so it scales with the dial). */}
        <pre
          aria-hidden
          className="ascii pointer-events-none absolute left-1/2 top-1/2 m-0 -translate-x-1/2 -translate-y-1/2 text-phosphor"
          style={{ fontSize: '1.75cqw' }}
        >
          {ASCII_MONOGRAM}
        </pre>
      </RB>

      <span aria-hidden className="absolute left-0 top-1 hidden font-mono text-[0.6875rem] text-fg-dim sm:block">
        NETWORKING
      </span>
      <span aria-hidden className="absolute bottom-1 right-0 hidden font-mono text-[0.6875rem] text-fg-dim sm:block">
        IT SECURITY
      </span>
    </div>
  );
}

export default function StackHero() {
  const headRef = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const mobile = useIsMobile();
  const interactive = !reduced && fine && !mobile;

  // Leads with what is backed by a case file; every value is computed from src/data/skills.ts.
  const statItems = [
    { value: stats.traced, label: 'traced' },
    { value: stats.listed, label: 'listed only' },
    { value: stats.links, label: 'links' }
  ];

  return (
    <section ref={headRef} aria-labelledby="stack-title" className="relative isolate overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36">
      {/* The business card's scattered terminal words (static DOM; words decrypt on hover). Desktop only. */}
      {!mobile && (
        <TermField seed={47} grid={[10, 6]} glyphRatio={0.24} clear={CLEAR_DESKTOP} className="-z-10" />
      )}

      <div className="container-signal relative">
        <p aria-hidden className="mb-10 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[0.8125rem] md:mb-12">
          <span className="text-fg-muted">affan@shaikh</span>
          <span className="-ml-2 text-fg-dim">:</span>
          <span className="-ml-2 text-chalk">~</span>
          <span className="-ml-1.5 text-fg-dim">$</span>
          <span className="text-fg">ls ~/stack --map</span>
        </p>

        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-7">
            <h1
              id="stack-title"
              className="w-min text-[clamp(3.5rem,9.5vw,8.75rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-fg"
            >
              <RB name="VariableProximity" as="span">
                {interactive ? (
                  <VariableProximity
                    label="Signal map"
                    fromFontVariationSettings="'wght' 560"
                    toFontVariationSettings="'wght' 900"
                    containerRef={headRef}
                    radius={130}
                    falloff="gaussian"
                    style={{ fontFamily: 'inherit' }}
                  />
                ) : (
                  <>
                    Signal <span className="whitespace-nowrap">map</span>
                  </>
                )}
              </RB>
              <span aria-hidden className="text-fg-dim">
                .
              </span>
            </h1>

            <p className="mt-8 max-w-[58ch] text-base leading-relaxed text-fg-muted md:text-[1.0625rem]">
              {stats.skills} skills across four categories: networks, security, development, and systems &amp; tools.
              Each traced skill is wired to the case files whose journal or resume entry names it; the ones not yet
              tied to a case file say so plainly.
            </p>

            <dl className="mt-10 grid max-w-[520px] grid-cols-3 gap-px overflow-hidden rounded-[4px] border border-line bg-line">
              {statItems.map((s) => (
                <div key={s.label} className="flex flex-col justify-between gap-3 bg-ink-950 px-4 py-4">
                  <dt className="font-mono text-[0.75rem] text-fg-muted">
                    <span aria-hidden className="text-fg-dim">
                      --
                    </span>
                    {s.label}
                  </dt>
                  <dd className="font-mono text-[28px] leading-none tracking-[-0.02em] text-fg">
                    {String(s.value).padStart(2, '0')}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <AnchorButton href="#constellation" variant="primary">
                Open the map
              </AnchorButton>
              {!mobile && <AnchorButton href="#terminal">Grep the stack</AnchorButton>}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-5">
            <OrbitInstrument />
            <p className="mt-4 text-center font-mono text-[0.75rem] text-fg-muted">
              <span aria-hidden className="text-fg-dim"># </span>outer ring: development · inner ring: systems &amp; tools
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
