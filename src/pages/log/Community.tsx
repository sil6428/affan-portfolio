import { lazy, Suspense, useRef } from 'react';
import { useInView } from 'motion/react';
import SloshGauge from '@/components/reactbits/SloshGauge';
import RB from '@/components/ui/RB';
import { useReducedMotion } from '@/lib/motion';
import { useIsMobile } from '@/lib/media';
import { cn } from '@/lib/cn';
import { community } from '@/data/experience';
import { Reveal, SectionHead } from './shared';
import { SCROLL_OFFSET_CLASS, pad2 } from './model';

const CountUp = lazy(() => import('@/components/reactbits/CountUp'));

const TOTAL = community.totalHours;
/** "430 hours spent helping …" → the part after the number + unit, so the number can be animated. */
const HEADLINE_REST = community.headline.replace(/^\d+\s+hours\s+/, '');

const TANKS = community.entries.map((e, i) => ({
  ...e,
  share: Math.round((e.hours / TOTAL) * 100),
  liquid: i === 0 ? '#e8e8e8' : '#6b6b6b'
}));

function Tank({ tank, index, active }: { tank: (typeof TANKS)[number]; index: number; active: boolean }) {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  // Fill from empty once the tanks scroll into view; reduced motion starts filled.
  const level = reduced || active ? tank.share : 0;
  return (
    <li className="panel group/tank relative flex min-w-0 gap-5 overflow-hidden p-5 transition-[border-color] duration-300 hover:border-line-strong md:gap-7 md:p-7">
      <div className="relative shrink-0 text-fg-muted">
        <SloshGauge
          value={level}
          liquidColor={tank.liquid}
          glassColor="#0b0b0b"
          width={mobile ? 76 : 92}
          height={mobile ? 200 : 248}
          radius={4}
          ticks={4}
          viscosity={0.18}
          tilt={0.5}
          splash={0.45}
          unit="%"
          ariaLabel={`${tank.org}: share of ${TOTAL} community hours`}
          ariaValueText={`${tank.hours} of ${TOTAL} hours (${tank.share}%)`}
          reducedMotion={reduced}
          className="ring-1 ring-line-strong font-mono"
        />
      </div>
      <div className="relative flex min-w-0 flex-col justify-between">
        <div>
          <p className="font-mono text-[11px] text-fg-muted"><span className="text-fg-dim">[{pad2(index + 1)}]</span> {tank.share}% of {TOTAL} h</p>
          <h3 className="mt-3 text-[1.25rem] font-medium leading-snug tracking-[-0.015em] text-fg md:text-[1.375rem]">
            {tank.org}
          </h3>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-fg-muted">{tank.detail}</p>
        </div>
        <div className="mt-6">
          <p className="flex items-baseline gap-2">
            <span className="font-mono text-[clamp(2rem,3.4vw,2.75rem)] font-medium leading-none tracking-[-0.04em] text-fg tabular-nums">
              {tank.hours}
            </span>
            <span className="font-mono text-[12px] text-fg-muted">hours</span>
          </p>
          <p className="mt-3 flex items-center gap-2 border-t border-line pt-3 font-mono text-[11px] text-fg-muted">
            <span aria-hidden className="size-1.5 rounded-full" style={{ background: tank.liquid }} />
            {tank.share}% of {TOTAL} total
          </p>
        </div>
      </div>
    </li>
  );
}

export default function Community() {
  const reduced = useReducedMotion();
  const tanksRef = useRef<HTMLUListElement>(null);
  const tanksInView = useInView(tanksRef, { once: true, amount: 0.45 });
  const numberRef = useRef<HTMLParagraphElement>(null);
  const numberInView = useInView(numberRef, { once: true, amount: 0.5 });

  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className={cn('relative py-24 md:py-32', SCROLL_OFFSET_CLASS)}
    >
      <div className="container-signal">
        <SectionHead
          id="community"
          command="du -h community/"
          title="Community"
        />

        <div className="grid items-end gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-5">
            <p ref={numberRef} className="flex items-baseline gap-3">
              <span
                aria-hidden
                className="text-[clamp(5rem,16vw,11rem)] font-semibold leading-[0.85] tracking-[-0.05em] text-fg tabular-nums"
              >
                {reduced ? (
                  TOTAL
                ) : (
                  <span data-rb="CountUp">
                    <Suspense fallback="0">
                      <CountUp from={0} to={TOTAL} duration={0.8} startWhen={numberInView} />
                    </Suspense>
                  </span>
                )}
              </span>
              <span aria-hidden className="font-mono text-[clamp(1.5rem,3.4vw,2.5rem)] font-medium leading-none text-fg-dim">
                h
              </span>
            </p>
            <p className="mt-8 max-w-[30ch] text-[clamp(1.125rem,2vw,1.5rem)] font-medium leading-[1.3] tracking-[-0.02em] text-fg">
              <span className="sr-only">{TOTAL} hours </span>
              {HEADLINE_REST}
            </p>
            <p className="mt-6 font-mono text-[12px] text-fg-muted">
              <span className="text-fg-dim"># </span>tanks fill to each organization&rsquo;s share of {TOTAL} hours
            </p>
          </div>

          <div className="min-w-0 lg:col-span-7">
            <Reveal distance={40}>
              <RB name="SloshGauge">
                <ul ref={tanksRef} className="grid gap-4 md:grid-cols-2">
                  {TANKS.map((tank, i) => (
                    <Tank key={tank.org} tank={tank} index={i} active={tanksInView} />
                  ))}
                </ul>
              </RB>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
