import { lazy, Suspense, useMemo } from 'react';
import { motion } from 'motion/react';
import { CornerDownRight } from 'lucide-react';
import RB from '@/components/ui/RB';
import TermField, { type ClearZone } from '@/components/ui/TermField';
import InView from '@/lib/InView';
import { useReducedMotion } from '@/lib/motion';
import { isLowPowerDevice, useIsDesktop } from '@/lib/media';
import { experience, community } from '@/data/experience';
import { projects } from '@/data/projects';
import { LOG_SECTIONS, jumpToSection, pad2, type LogSectionId } from './model';
import { Prompt } from './shared';

const Topography = lazy(() => import('@/components/reactbits/Topography'));
const TextType = lazy(() => import('@/components/reactbits/TextType'));

const EASE = [0.16, 1, 0.3, 1] as const;
const COMMAND = 'cd ~/log && ls';

/** Word texture keeps clear of the headline column and the index panel. */
const CLEAR: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 13 },
  { x0: 0, y0: 14, x1: 62, y1: 92 },
  { x0: 64, y0: 22, x1: 100, y1: 88 }
];

const entries = (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`;

/** `wc -l ~/log/*` — every count is computed from the data files. */
const INDEX: { id: LogSectionId; count: string; spoken: string }[] = [
  { id: 'case-files', count: pad2(projects.length), spoken: entries(projects.length) },
  { id: 'experience', count: pad2(experience.length), spoken: entries(experience.length) },
  { id: 'education', count: '01', spoken: entries(1) },
  { id: 'community', count: pad2(community.entries.length), spoken: entries(community.entries.length) }
];

export default function LogHero() {
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const lowPower = useMemo(() => isLowPowerDevice(), []);
  // One continuously animating effect, desktop only; phones / low-power / reduced get the static texture.
  const showField = desktop && !reduced && !lowPower;

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE, delay }
        };
  // Headline copy is painted on the first frame (never held at opacity 0, so LCP is not delayed by an
  // entrance); it only settles a few pixels. Phones skip the stagger.
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { y: 12 },
          animate: { y: 0 },
          transition: { duration: 0.7, ease: EASE, delay: desktop ? delay : 0 }
        };

  return (
    <header aria-labelledby="log-title" className="relative isolate overflow-hidden pt-28 pb-14 md:pt-36 md:pb-20">
      {/* Backdrop: the card's scattered words, plus (desktop) a slow grey contour map on the right. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {showField && (
          <RB
            name="Topography"
            className="absolute inset-y-0 right-0 w-[62%] opacity-60 [mask-image:radial-gradient(70%_70%_at_70%_45%,black_20%,transparent_75%)]"
          >
            {/* Topography pauses its own loop off screen, so it stays mounted (no context rebuild on re-entry). */}
            <InView className="absolute inset-0" rootMargin="0px" unmountOnExit={false}>
              <Suspense fallback={null}>
                <Topography
                  lowColor="#121212"
                  midColor="#3a3a3a"
                  highColor="#8a8a8a"
                  speed={0.18}
                  morphAmount={2.2}
                  morphSpeed={0.04}
                  bands={2.6}
                  thickness={0.01}
                  glow={0.15}
                  contrast={2}
                  brightness={0.8}
                  opacity={0.45}
                  scale={1}
                  grain={false}
                  mouseInteraction={false}
                  dpr={1}
                />
              </Suspense>
            </InView>
          </RB>
        )}
        <TermField seed={404} clear={CLEAR} grid={[9, 6]} glyphRatio={0.22} className="opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-ink-950" />
      </div>

      <div className="container-signal">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            {reduced ? (
              <Prompt path="~" command={COMMAND} />
            ) : (
              <p aria-hidden className="font-mono text-[12px] leading-relaxed md:text-[13px]">
                <span className="text-fg-dim">affan@shaikh</span>
                <span className="text-fg-dim">:</span>
                <span className="text-fg-muted">~</span>
                <span className="text-fg-dim">$ </span>
                <RB name="TextType" as="span" className="text-fg-muted">
                  <Suspense fallback={<span>{COMMAND}</span>}>
                    <TextType as="span" text={COMMAND} typingSpeed={55} initialDelay={250} loop={false} showCursor={false} />
                  </Suspense>
                </RB>
                {/* CSS block caret (no JS loop), as on the home subtitle. */}
                <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] bg-phosphor motion-safe:animate-blink" />
              </p>
            )}

            <p className="mt-6 font-mono text-[0.8125rem] text-fg-muted">
              <span aria-hidden className="text-fg-dim"># </span>
              projects &amp; experience
            </p>
            <motion.h1
              id="log-title"
              className="mt-3 text-[clamp(3.5rem,11vw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-fg"
              {...rise(0.15)}
            >
              Log<span className="text-fg-dim">.</span>
            </motion.h1>

            <motion.p
              className="mt-7 max-w-[40ch] text-[clamp(1.0625rem,1.7vw,1.3rem)] font-medium leading-snug tracking-[-0.01em] text-fg"
              {...rise(0.3)}
            >
              Case files, experience, education, and community work.
            </motion.p>
            <motion.p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-fg-muted md:text-base" {...rise(0.4)}>
              Every build I&rsquo;ve documented, and the record around it. The case files are condensed from the full
              journals on my 3D portfolio.
            </motion.p>
          </div>

          {/* Section index, as `wc -l` output. Each line jumps to its section. */}
          <motion.nav id="log-index" aria-label="Log index" className="panel min-w-0 bg-ink-900/90" {...fade(0.5)}>
            <p aria-hidden className="border-b border-line px-4 py-2.5 font-mono text-[11.5px] text-fg-muted">
              <span className="text-fg-dim">$</span> wc -l ~/log/*
            </p>
            <ul className="p-1.5">
              {INDEX.map(({ id, count, spoken }) => {
                const meta = LOG_SECTIONS.find((s) => s.id === id)!;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        jumpToSection(id, reduced);
                      }}
                      className="group/ix grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-[3px] px-2.5 py-2 font-mono text-[13px] transition-colors duration-200 hover:bg-ink-700"
                    >
                      {/* Plain label first in the name ("Case files (case-files/), 8 entries"); the shell line is visual. */}
                      <span className="sr-only">{`${meta.label} (${meta.short}/), ${spoken}`}</span>
                      <span aria-hidden className="tabular-nums text-fg-muted">
                        {count}
                      </span>
                      <span aria-hidden className="truncate text-fg underline-offset-4 group-hover/ix:underline">
                        {meta.short}/
                      </span>
                      <CornerDownRight
                        aria-hidden
                        size={13}
                        strokeWidth={1.75}
                        className="text-fg-dim transition-transform duration-200 group-hover/ix:translate-y-0.5 group-hover/ix:text-fg"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        </div>
      </div>
    </header>
  );
}
