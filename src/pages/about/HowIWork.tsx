import { useCallback, useRef, useState } from 'react';
import CardSwap, { Card } from '@/components/reactbits/CardSwap';
import Section from '@/components/ui/Section';
import { principles, profile } from '@/data/profile';
import { useIsDesktop, useIsMobile } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { Reveal, SectionLabel, SplitHeading } from './fx';
import { useInViewport } from './useInViewport';

const TOTAL = String(principles.length).padStart(2, '0');

/** One principle as a document card in the CardSwap stack. */
function PrincipleCard({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[inherit]">
      <div className="relative flex items-center justify-between border-b border-line px-6 py-3 font-mono text-[0.75rem]">
        <span>
          <span className="text-fg-muted">principle {id}</span>
          <span className="text-fg-dim"> / {TOTAL}</span>
        </span>
        <span className="text-fg-dim">
          <span aria-hidden="true"># </span>documentation approach
        </span>
      </div>
      <div className="relative flex flex-1 flex-col justify-between p-6 md:p-8">
        {/* Outlined numeral, like the big outlined words on the business card. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 right-4 select-none font-mono text-[9rem] font-semibold leading-none tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(238_238_238/0.16)] md:text-[10rem]"
        >
          {id}
        </span>
        <p className="text-[clamp(1.75rem,2.6vw,2.4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-fg">
          {title}
          <span className="text-fg-dim">.</span>
        </p>
        <p className="relative max-w-[40ch] text-[0.9375rem] leading-relaxed text-fg-muted">{body}</p>
      </div>
    </div>
  );
}

/** Static, fully visible list of principles (phones, tablets and reduced motion). */
function PrincipleGrid({ className }: { className?: string }) {
  return (
    <ol className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {principles.map((p) => (
        <li key={p.id} className="panel brackets flex flex-col gap-4 p-6 [--bracket-opacity:0.6]">
          <span className="font-mono text-[0.75rem] text-fg-muted">
            principle {p.id} <span className="text-fg-dim">/ {TOTAL}</span>
          </span>
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-fg">{p.title}</h3>
          <p className="text-[0.9375rem] leading-relaxed text-fg-muted">{p.body}</p>
        </li>
      ))}
    </ol>
  );
}

export default function HowIWork() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const desktop = useIsDesktop();
  const stageRef = useRef<HTMLDivElement>(null);
  const onScreen = useInViewport(stageRef, '-10% 0px');
  const [front, setFront] = useState(0);
  const handleFront = useCallback((idx: number) => setFront(idx), []);

  const animated = !reduced && !mobile;
  const cardW = desktop ? 500 : 440;
  const cardH = desktop ? 330 : 310;

  return (
    <Section id="how-i-work" aria-labelledby="how-title">
      <SectionLabel index="03" path="cat ~/whoami/how-i-work.md" className="mb-12 md:mb-16" />
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <SplitHeading id="how-title" text="How I" accent="work" />
          <Reveal kind="resolve" className="mt-8 max-w-[46ch]">
            <p className="mb-3 font-mono text-[0.75rem] text-fg-dim">
              <span aria-hidden="true"># </span>documentation approach
            </p>
            <p className="text-[1.0625rem] leading-relaxed text-fg-muted md:text-lg">{profile.thesis}</p>
          </Reveal>

          {animated && (
            // Legend for the card stack. Titles are visible; bodies are read from here by screen readers
            // because the animated stack itself is aria-hidden.
            <ol className="mt-12 border-t border-line">
              {principles.map((p, i) => {
                const active = i === front;
                return (
                  <li
                    key={p.id}
                    aria-current={active ? 'step' : undefined}
                    className="relative flex items-baseline gap-4 border-b border-line py-3.5"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'w-4 font-mono text-[0.8125rem] text-phosphor transition-opacity duration-200',
                        active ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      &gt;
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[0.75rem] transition-colors duration-200',
                        active ? 'text-fg' : 'text-fg-dim'
                      )}
                    >
                      {p.id}
                    </span>
                    <h3
                      className={cn(
                        'text-lg font-medium tracking-[-0.02em] transition-colors duration-200 md:text-xl',
                        active ? 'text-fg' : 'text-fg-muted'
                      )}
                    >
                      {p.title}
                    </h3>
                    <p className="sr-only">{p.body}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="lg:col-span-7">
          {animated ? (
            <div
              ref={stageRef}
              data-rb="CardSwap"
              aria-hidden="true"
              className="relative h-[520px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_80%,transparent)] md:h-[540px]"
            >
              <div className="pointer-events-none absolute left-0 top-0 font-mono text-[0.75rem] text-fg-dim">
                stack[{front}] <span className="text-fg-muted">· {String(front + 1).padStart(2, '0')} / {TOTAL}</span>
              </div>
              <div className="absolute left-1/2 top-[56%] -translate-x-[58%] -translate-y-1/2">
                <CardSwap
                  width={cardW}
                  height={cardH}
                  cardDistance={40}
                  verticalDistance={44}
                  delay={6000}
                  skewAmount={3}
                  easing="linear"
                  pauseOnHover
                  paused={!onScreen}
                  onFrontChange={handleFront}
                  className="relative [perspective:1000px] overflow-visible"
                >
                  {principles.map((p) => (
                    <Card
                      key={p.id}
                      customClass="rounded-[6px] border-line-strong bg-ink-900 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.95)]"
                    >
                      <PrincipleCard id={p.id} title={p.title} body={p.body} />
                    </Card>
                  ))}
                </CardSwap>
              </div>
            </div>
          ) : (
            <PrincipleGrid />
          )}
        </div>
      </div>
    </Section>
  );
}
