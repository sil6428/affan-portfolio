import { lazy, Suspense, useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react';
import { ChevronDown, CornerDownRight, MapPin } from 'lucide-react';
import AnimatedList from '@/components/reactbits/AnimatedList';
import RB from '@/components/ui/RB';
import { LinkButton } from '@/components/ui/Button';
import { useReducedMotion } from '@/lib/motion';
import { useIsDesktop } from '@/lib/media';
import { thumbSrc } from '@/lib/art';
import { cn } from '@/lib/cn';
import { experience, type ExperienceEntry } from '@/data/experience';
import { getProject } from '@/data/projects';
import { SectionHead } from './shared';
import { KIND_META, SCROLL_OFFSET_CLASS, jumpToSection, pad2, recordLine, shortRole, startYear } from './model';

const ScrollFloat = lazy(() => import('@/components/reactbits/ScrollFloat'));

const EASE = [0.16, 1, 0.3, 1] as const;

/** Option name read by screen readers: "SSIK IT Consulting & Solutions, Co-Founder and Platform Developer, May 2026 to present". */
const optionLabel = (e: ExperienceEntry) =>
  `${e.org}, ${e.role}, ${e.dateLabel.replace(/\s[—–-]\s/, ' to ').replace('Present', 'present').replace('Expected', 'expected')}`;

/** First record index for each start year, newest first (2026 / 2025). */
const YEAR_GROUPS: { year: string; first: number; count: number }[] = (() => {
  const groups: { year: string; first: number; count: number }[] = [];
  experience.forEach((e, i) => {
    const y = startYear(e);
    const last = groups[groups.length - 1];
    if (last && last.year === y) last.count += 1;
    else groups.push({ year: y, first: i, count: 1 });
  });
  return groups;
})();

/* ------------------------------------------------------------------------------------------------
 * Year marker — ReactBits ScrollFloat (scrubbed). Decorative: every record carries its own dates,
 * and ScrollFloat renders an <h2>, so the marker is hidden from assistive tech.
 * ---------------------------------------------------------------------------------------------- */
function YearMarker({ year, className }: { year: string; className?: string }) {
  const reduced = useReducedMotion();
  const text = 'font-mono text-[clamp(1.9rem,2.6vw,2.6rem)] font-medium leading-none tracking-[-0.03em] text-fg';
  if (reduced) {
    return (
      <div aria-hidden className={className}>
        <span className={text}>{year}</span>
      </div>
    );
  }
  return (
    <div aria-hidden data-rb="ScrollFloat" className={className}>
      <Suspense fallback={<span className={text}>{year}</span>}>
        <ScrollFloat
          containerClassName="my-0! leading-none"
          textClassName={`${text} leading-none!`}
          animationDuration={1}
          ease="power3.out"
          scrollStart="top bottom-=8%"
          scrollEnd="bottom center+=12%"
          stagger={0.03}
        >
          {year}
        </ScrollFloat>
      </Suspense>
    </div>
  );
}

/** Scroll-linked trace: a hairline that fills in as the log scrolls past. */
function useTrace(target: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({ target, offset: ['start 75%', 'end 55%'] });
  return useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
}

/* ------------------------------------------------------------------------------------------------
 * Record body — shared by the desktop detail panel and the mobile expanded record.
 * ---------------------------------------------------------------------------------------------- */
function RecordBody({ entry, compact = false }: { entry: ExperienceEntry; compact?: boolean }) {
  const reduced = useReducedMotion();
  const project = entry.caseStudy ? getProject(entry.caseStudy) : undefined;
  const highlightLabel = entry.kind === 'education' ? 'Coursework' : 'Highlights';
  return (
    <div className="min-w-0">
      <p className={cn('max-w-[62ch] leading-relaxed text-fg-muted', compact ? 'text-base' : 'text-[17px]')}>{entry.summary}</p>

      {entry.highlights.length > 0 && (
        <div className={compact ? 'mt-6' : 'mt-8'}>
          <p className="font-mono text-[11px] leading-[1.2] text-fg-muted mb-3">{highlightLabel}</p>
          <ul className="space-y-2.5">
            {entry.highlights.map((h, i) => (
              <li key={h} className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-2">
                <span className="font-mono text-[11px] text-fg-dim">{pad2(i + 1)}</span>
                <span className="text-[15px] leading-relaxed text-fg">{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {project && entry.caseStudy ? (
        <div
          className={cn(
            'group/case mt-8 flex flex-wrap items-center gap-5 rounded-[4px] border border-line bg-ink-950 p-3 pr-4 transition-colors duration-300 hover:border-fg/40',
            compact && 'mt-6'
          )}
        >
          <div className="relative size-[76px] shrink-0 overflow-hidden rounded-sm border border-line">
            <img
              src={thumbSrc(entry.caseStudy)}
              width={76}
              height={76}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                'size-full object-cover',
                !reduced && 'transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover/case:scale-110'
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] text-fg-dim">~/log/{entry.caseStudy}</p>
            <p className="mt-1 truncate text-[15px] font-medium text-fg">{project.title}</p>
          </div>
          <LinkButton to={`/log/${entry.caseStudy}`} variant="secondary" className="px-5 py-3">
            Open case file
          </LinkButton>
        </div>
      ) : entry.kind === 'education' ? (
        <a
          href="#education"
          onClick={(e) => {
            e.preventDefault();
            jumpToSection('education', reduced);
          }}
          className="mt-8 inline-flex items-center gap-2 font-mono text-[12px] text-fg underline decoration-fg-dim underline-offset-4 hover:decoration-fg"
        >
          <CornerDownRight aria-hidden size={14} strokeWidth={1.75} />
          cd ../education
        </a>
      ) : null}
    </div>
  );
}

function KindTag({ kind }: { kind: ExperienceEntry['kind'] }) {
  const meta = KIND_META[kind];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-fg-muted">
      <span aria-hidden className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Desktop (≥1024): year rail · AnimatedList of records · sticky detail panel
 * ---------------------------------------------------------------------------------------------- */
function DesktopLog() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const rowRef = useRef<HTMLDivElement>(null);
  const listWrapRef = useRef<HTMLDivElement>(null);
  const [tops, setTops] = useState<number[]>([]);
  const trace = useTrace(rowRef);
  const panelId = useId();
  const entry = experience[index];

  // Measure every record's offset inside the list so the year rail + playhead line up with it.
  useLayoutEffect(() => {
    const wrap = listWrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const listbox = wrap.querySelector<HTMLElement>('[role="listbox"]');
      if (!listbox) return;
      const items = Array.from(listbox.querySelectorAll<HTMLElement>('[data-index]'));
      setTops(items.map((el) => el.offsetTop + listbox.offsetTop));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const renderItem = useCallback(
    (item: ExperienceEntry, i: number, selected: boolean) => (
      <div
        className={cn(
          'group/rec relative overflow-hidden rounded-[4px] border px-5 py-4 transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)]',
          selected
            ? 'border-fg/30 bg-ink-800'
            : 'border-line bg-ink-900 hover:border-line-strong hover:bg-ink-850'
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute inset-y-3 left-0 w-[2px] rounded-full bg-fg transition-transform duration-300 ease-[var(--ease-out-expo)]',
            selected ? 'scale-y-100' : 'scale-y-0'
          )}
        />
        <div className="flex items-start justify-between gap-4">
          <p className="min-w-0 font-mono text-[12px] leading-snug tracking-[0.02em]">
            <span aria-hidden className={selected ? 'text-fg' : 'text-fg-muted'}>
              [{item.start}]
            </span>{' '}
            <span className="text-fg">{item.id.toUpperCase()}</span>{' '}
            <span aria-hidden className="text-fg-dim">
              ::
            </span>{' '}
            <span className="text-fg-muted">{shortRole(item)}</span>
          </p>
          <span aria-hidden className="font-mono text-[10.5px] tabular-nums text-fg-dim">
            {pad2(i + 1)}
          </span>
        </div>
        <p className="mt-2.5 text-[1.125rem] font-medium leading-snug tracking-[-0.015em] text-fg">{item.org}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <span className="font-mono text-[11px] text-fg-muted">{item.dateLabel}</span>
          <KindTag kind={item.kind} />
        </div>
      </div>
    ),
    []
  );

  const yearOf = (i: number) => tops[i] ?? 0;
  const groupHeight = (g: (typeof YEAR_GROUPS)[number]) =>
    (tops[g.first + g.count] ?? (tops[tops.length - 1] ?? 0) + 140) - yearOf(g.first);

  return (
    <div ref={rowRef} className="grid grid-cols-[8.5rem_minmax(0,5fr)_minmax(0,6fr)] gap-x-8 xl:gap-x-12">
      {/* Year rail with the scroll-linked trace and a playhead that follows the selection. */}
      <div aria-hidden className="relative">
        <div className="absolute top-2 bottom-8 right-3 w-px bg-line">
          <motion.div className="absolute inset-0 origin-top bg-fg-dim" style={{ scaleY: trace }} />
        </div>
        {YEAR_GROUPS.map((g) => (
          <div key={g.year} className="absolute right-0 left-0" style={{ top: yearOf(g.first), height: groupHeight(g) }}>
            <YearMarker year={g.year} className="pt-3 pr-8 text-right" />
            <span className="absolute top-[1.15rem] right-[9px] size-[13px] rounded-full border border-line-strong bg-ink-950" />
            <p className="mt-2 pr-8 text-right font-mono text-[10px] text-fg-dim">
              {pad2(g.count)} {g.count === 1 ? 'record' : 'records'}
            </p>
          </div>
        ))}
        <motion.span
          className="absolute right-[10px] size-[11px] rounded-full bg-phosphor shadow-[0_0_0_4px_var(--color-ink-950)]"
          initial={false}
          animate={{ y: yearOf(index) + 36 }}
          transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
        />
      </div>

      {/* Records */}
      <div ref={listWrapRef} className="relative min-w-0">
        <RB name="AnimatedList">
          <AnimatedList<ExperienceEntry>
            items={experience}
            getItemKey={(e) => e.id}
            getItemLabel={optionLabel}
            renderItem={renderItem}
            selectedIndex={index}
            onHighlightChange={setIndex}
            onItemSelect={(_, i) => setIndex(i)}
            selectOnHover={false}
            showGradients={false}
            displayScrollbar={false}
            widthClassName="w-full"
            listClassName="relative rounded-lg p-1 -m-1"
            ariaLabel="Experience records. Use the arrow keys to move between records."
            reducedMotion={reduced}
          />
        </RB>
        <p className="font-mono text-[11px] leading-[1.2] mt-2 flex items-center gap-2 text-fg-muted">
          <kbd className="rounded-sm border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-fg">↑</kbd>
          <kbd className="rounded-sm border border-line-strong px-1.5 py-0.5 font-mono text-[10px] text-fg">↓</kbd>
          or click a record to inspect it
        </p>
      </div>

      {/* Detail panel */}
      <div className="min-w-0">
        <section
          id={panelId}
          aria-label={`Selected record: ${entry.org}`}
          className="panel brackets sticky top-[136px] overflow-hidden p-8 xl:p-10"
        >
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
            <p className="font-mono text-[11.5px] text-fg-muted">
              <span className="text-fg">record {pad2(index + 1)}</span>
              <span className="text-fg-dim"> / {pad2(experience.length)}</span>
            </p>
            <KindTag kind={entry.kind} />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={entry.id}
              className="relative pt-7"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
              transition={{ duration: reduced ? 0 : 0.3, ease: EASE }}
            >
              <p aria-hidden className="font-mono text-[12.5px] tracking-[0.02em] text-fg-muted">
                {recordLine(entry)}
              </p>
              <h3 className="mt-4 text-[clamp(2rem,3.2vw,3rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-fg">
                {entry.org}
              </h3>
              <p className="mt-3 text-lg leading-snug text-fg-muted">{entry.role}</p>
              <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px]">
                <div>
                  <dt className="text-fg-dim">When</dt>
                  <dd className="mt-1 text-fg">{entry.dateLabel}</dd>
                </div>
                {entry.location && (
                  <div>
                    <dt className="text-fg-dim">Where</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-fg">
                      <MapPin aria-hidden size={12} strokeWidth={1.75} className="text-fg-muted" />
                      {entry.location}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-fg-dim">Status</dt>
                  <dd className="mt-1 text-fg">{entry.end === 'Present' ? 'Ongoing' : 'Closed'}</dd>
                </div>
              </dl>
              <div className="mt-7 border-t border-line pt-7">
                <RecordBody entry={entry} />
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Mobile + tablet (<1024): stacked, expandable records along a trace line.
 * ---------------------------------------------------------------------------------------------- */
function StackedLog() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState<string | null>(experience[0].id);
  const ref = useRef<HTMLDivElement>(null);
  const trace = useTrace(ref);
  const baseId = useId();

  return (
    <div ref={ref} className="relative pl-7 md:pl-10">
      <div aria-hidden className="absolute top-3 bottom-3 left-[5px] w-px bg-line md:left-[9px]">
        <motion.div className="absolute inset-0 origin-top bg-fg-dim" style={{ scaleY: trace }} />
      </div>
      <ol className="space-y-10">
        {YEAR_GROUPS.map((g) => (
          <li key={g.year}>
            <div className="relative">
              <span
                aria-hidden
                className="absolute top-[0.6rem] -left-7 size-[11px] rounded-full border border-line-strong bg-ink-950 md:-left-10 md:size-[19px] md:top-[0.4rem]"
              />
              <YearMarker year={g.year} />
            </div>
            <ol className="mt-4 space-y-3">
              {experience.slice(g.first, g.first + g.count).map((entry) => {
                const isOpen = open === entry.id;
                const panelId = `${baseId}-${entry.id}`;
                return (
                  <li
                    key={entry.id}
                    className={cn(
                      'overflow-hidden rounded-[4px] border transition-colors duration-300',
                      isOpen ? 'border-line-strong bg-ink-850' : 'border-line bg-ink-900'
                    )}
                  >
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpen(isOpen ? null : entry.id)}
                        className="flex w-full items-start gap-4 px-4 py-4 text-left active:scale-[0.99] md:px-6 md:py-5"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-mono text-[11.5px] leading-snug tracking-[0.02em] text-fg-muted">
                            <span aria-hidden className={isOpen ? 'text-fg' : undefined}>
                              [{entry.start}]
                            </span>{' '}
                            <span className="text-fg">{entry.id.toUpperCase()}</span>{' '}
                            <span aria-hidden className="text-fg-dim">
                              ::
                            </span>{' '}
                            {shortRole(entry)}
                          </span>
                          <span className="mt-2 block text-[1.0625rem] font-medium leading-snug tracking-[-0.015em] text-fg md:text-xl">
                            {entry.org}
                          </span>
                          <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="font-mono text-[10.5px] text-fg-muted">
                              {entry.dateLabel}
                            </span>
                            <KindTag kind={entry.kind} />
                          </span>
                        </span>
                        <ChevronDown
                          aria-hidden
                          size={18}
                          strokeWidth={1.75}
                          className={cn(
                            'mt-1 shrink-0 text-fg-muted transition-transform duration-300 ease-[var(--ease-out-expo)]',
                            isOpen && 'rotate-180 text-fg'
                          )}
                        />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-label={entry.org}
                          initial={reduced ? false : { height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }}
                          transition={{ duration: reduced ? 0 : 0.5, ease: EASE }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-line px-4 pt-5 pb-6 md:px-6">
                            <p className="text-base leading-snug text-fg">{entry.role}</p>
                            {entry.location && (
                              <p className="mt-2 flex items-center gap-1.5 font-mono text-[11px] text-fg-muted">
                                <MapPin aria-hidden size={12} strokeWidth={1.75} className="text-fg-muted" />
                                {entry.location}
                              </p>
                            )}
                            <div className="mt-5">
                              <RecordBody entry={entry} compact />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ExperienceLog() {
  const desktop = useIsDesktop();
  const kicker = useMemo(
    () =>
      desktop
        ? 'Three roles, newest first, across an early-stage venture, nonprofit operations, and retail work. Pick one to read the full entry.'
        : 'Three roles, newest first, across an early-stage venture, nonprofit operations, and retail work. Tap a record to expand it.',
    [desktop]
  );
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className={cn('relative py-24 md:py-32', SCROLL_OFFSET_CLASS)}
    >
      <div className="container-signal">
        <SectionHead
          id="experience"
          command="tail -n 3 experience.log"
          title="Experience"
          kicker={kicker}
        />
        {desktop ? <DesktopLog /> : <StackedLog />}
      </div>
    </section>
  );
}
