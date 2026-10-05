import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, CornerDownLeft } from 'lucide-react';
import RB from '@/components/ui/RB';
import { useReducedMotion } from '@/lib/motion';
import { useIsDesktop } from '@/lib/media';
import { cn } from '@/lib/cn';
import { JOURNAL_UPDATED, SOURCE_SITE, projects, type Project, type StatusTone } from '@/data/projects';
import { SectionHead } from './shared';
import { SCROLL_OFFSET_CLASS, pad2 } from './model';
import { thumbSrc } from '@/lib/art';
import { caseHref, squareSrc } from './case/util';

const RubberSegment = lazy(() => import('@/components/reactbits/RubberSegment'));

type Category = Project['category'];

/** Filter flags, in display order. `value` is what the segmented control reports. */
const FLAGS: { value: 'all' | Category; label: string }[] = [
  { value: 'all', label: 'all' },
  { value: 'Security tooling', label: 'security' },
  { value: 'Secure communications', label: 'comms' },
  { value: 'Infrastructure', label: 'infra' },
  { value: 'Platform & early-stage venture', label: 'venture' },
  { value: 'Web & extensions', label: 'web' }
];

const TONE_DOT: Record<StatusTone, string> = {
  verified: 'bg-chalk',
  active: 'bg-chalk',
  wip: 'bg-ash',
  ongoing: 'bg-ash',
  private: 'ring-1 ring-inset ring-fg-dim'
};

const total = pad2(projects.length);

function Status({ p }: { p: Project }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] text-fg-muted">
      <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', TONE_DOT[p.statusTone])} />
      {p.status}
    </span>
  );
}

/* ------------------------------------------------------------------------------------------------
 * One listing row. Every row is a real link to /log/<slug>; hover or focus moves the preview.
 * ---------------------------------------------------------------------------------------------- */
function Row({ p, active, onActivate }: { p: Project; active: boolean; onActivate: (slug: string) => void }) {
  return (
    <li>
      <Link
        to={caseHref(p.slug)}
        onPointerEnter={() => onActivate(p.slug)}
        onFocus={() => onActivate(p.slug)}
        className={cn(
          'group/row relative grid items-center gap-x-4 gap-y-1 rounded-[3px] px-3 py-4 outline-offset-[-2px] transition-colors duration-200',
          'grid-cols-[3.5rem_minmax(0,1fr)_auto] md:grid-cols-[3.5rem_2rem_minmax(0,1fr)_auto]',
          'lg:grid-cols-[1.25rem_2rem_minmax(0,1fr)_13.5rem] lg:gap-x-3 lg:py-3.5',
          active ? 'lg:bg-ink-800' : 'hover:bg-ink-850'
        )}
      >
        {/* TUI cursor (desktop listing) */}
        <span aria-hidden className={cn('hidden font-mono text-[13px] text-phosphor lg:block', !active && 'invisible')}>
          &gt;
        </span>
        {/* Thumbnail (phones / tablets — the desktop listing has the preview pane instead) */}
        <span className="size-14 overflow-hidden rounded-[3px] border border-line lg:hidden">
          <img src={thumbSrc(p.slug)} alt="" width={56} height={56} loading="lazy" decoding="async" className="size-full object-cover" />
        </span>
        <span className="hidden font-mono text-[12px] text-fg-dim md:block">{p.index}</span>
        <span className="min-w-0">
          <span
            className={cn(
              'block text-[15px] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200 md:text-[16px]',
              'text-fg decoration-fg-dim underline-offset-4 group-hover/row:underline'
            )}
          >
            {p.title}
          </span>
          <span className="mt-1 block truncate font-mono text-[11.5px] text-fg-muted">
            <span className="md:hidden">{p.index} · </span>
            {p.category.toLowerCase()}
          </span>
          <span className="mt-1.5 block lg:hidden">
            <Status p={p} />
          </span>
        </span>
        <span className="hidden justify-self-end lg:block lg:justify-self-start">
          <Status p={p} />
        </span>
        <ArrowUpRight
          aria-hidden
          size={16}
          strokeWidth={1.75}
          className="rotate-45 justify-self-end text-fg-dim transition-[transform,color] duration-200 group-hover/row:translate-x-0.5 group-hover/row:text-fg lg:hidden"
        />
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Desktop preview pane: one poster swap (no WebGL) and the summary. Opens on the first file in the
 * listing; hover or focus moves it.
 * ---------------------------------------------------------------------------------------------- */

function Preview({ p }: { p: Project }) {
  const reduced = useReducedMotion();
  return (
    <aside aria-label="Case file preview" className="panel brackets sticky top-[136px] overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 font-mono text-[11px] text-fg-muted">
        <span className="truncate">
          <span className="text-fg-dim">preview </span>~/log/{p.slug}
        </span>
        <span className="shrink-0 text-fg-dim">
          {p.index}/{total}
        </span>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line bg-ink-950">
        <AnimatePresence initial={false}>
          <motion.img
            key={p.slug}
            src={squareSrc(p.slug)}
            alt=""
            decoding="async"
            className="absolute inset-0 size-full object-cover"
            initial={reduced ? false : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: reduced ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
        </AnimatePresence>
      </div>
      <div className="p-5">
        <p className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-fg">{p.title}</p>
        <p className="mt-1 font-mono text-[11px] text-fg-muted">{p.kicker}</p>
        <p className="mt-4 text-[14px] leading-relaxed text-fg-muted">{p.summary}</p>
        <p className="mt-4 font-mono text-[11.5px] leading-relaxed text-fg-muted">
          <span className="text-fg-dim">--stack</span> {p.stack.join(' · ')}
        </p>
        <p aria-hidden className="mt-5 flex items-center gap-2 border-t border-line pt-3 font-mono text-[11px] text-fg-dim">
          <CornerDownLeft size={12} strokeWidth={1.75} />
          click or press enter to open the file
        </p>
      </div>
    </aside>
  );
}

export default function CaseFiles() {
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const [filter, setFilter] = useState<'all' | Category>('all');
  const items = useMemo(() => (filter === 'all' ? projects : projects.filter((p) => p.category === filter)), [filter]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  // The preview never opens empty: it falls back to the first file in the current listing.
  const active = items.find((p) => p.slug === activeSlug) ?? items[0];

  // Warm the other posters once a hovering pointer reaches the list, so swaps never flash empty.
  // Touch screens have no preview pane, so scrolling the list never pulls the 1024px squares.
  const warmed = useRef(false);
  const warm = useCallback(() => {
    if (warmed.current || !window.matchMedia('(hover: hover)').matches) return;
    warmed.current = true;
    projects.forEach((p) => {
      const img = new Image();
      img.src = squareSrc(p.slug);
    });
  }, []);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    projects.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return m;
  }, []);
  const n = (v: 'all' | Category) => (v === 'all' ? projects.length : (counts.get(v) ?? 0));

  return (
    <section id="case-files" aria-labelledby="case-files-title" className={cn('relative py-20 md:py-28', SCROLL_OFFSET_CLASS)}>
      <div className="container-signal">
        <SectionHead
          id="case-files"
          command="ls -la"
          title="Case files"
          kicker={`${projects.length} documented builds: security tooling, secure communications, infrastructure, an early-stage venture platform, and web work. Each file covers the problem, the decisions, the evidence, and what it does not claim.`}
        />

        {/* Filter: ReactBits RubberSegment as `--category` flags */}
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3">
          <span aria-hidden className="font-mono text-[12px] text-fg-muted">
            <span className="text-fg-dim">--category</span>
          </span>
          <RB name="RubberSegment" className="-mx-1 max-w-full overflow-x-auto px-1 py-1 [scrollbar-width:none] max-sm:text-[12px] max-[380px]:text-[11px]">
            <Suspense fallback={<div className="h-8" />}>
              <RubberSegment
                items={FLAGS.map((f) => ({
                  value: f.value,
                  label: (
                    <span className="font-mono">
                      <span className="sr-only">{`${f.label}, ${n(f.value)} ${n(f.value) === 1 ? 'file' : 'files'}`}</span>
                      <span aria-hidden>
                        {f.label}
                        <span className="ml-1.5 hidden opacity-60 sm:inline">{n(f.value)}</span>
                      </span>
                    </span>
                  )
                }))}
                value={filter}
                onChange={(v) => setFilter(v as 'all' | Category)}
                size="sm"
                radius={4}
                inset={3}
                equalSlots={false}
                trackColor="#101010"
                thumbColor="#e8e8e8"
                textColor="#eeeeee"
                activeTextColor="#060606"
                stretch={reduced ? 0 : 60}
                squash={reduced ? 0 : 2}
                draggable={!reduced}
                className="w-max ring-1 ring-line-strong max-sm:[--rs-pad:6px]!"
                aria-label="Filter case files by category"
              />
            </Suspense>
          </RB>
          <p className="sr-only" aria-live="polite">
            Showing {items.length} case {items.length === 1 ? 'file' : 'files'}
            {filter === 'all' ? '' : ` in ${filter}`}.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_23rem] xl:gap-10">
          <div className="min-w-0" onPointerEnter={warm}>
            {/* Column header, as `ls -la` would print it */}
            <div
              aria-hidden
              className="hidden grid-cols-[1.25rem_2rem_minmax(0,1fr)_13.5rem] gap-x-3 border-b border-line px-3 pb-2 font-mono text-[11px] text-fg-dim lg:grid"
            >
              <span />
              <span>#</span>
              <span>name</span>
              <span>status</span>
            </div>
            <p aria-hidden className="px-3 pt-3 pb-1 font-mono text-[11px] text-fg-dim">
              total {pad2(items.length)}
            </p>
            <ul aria-label="Case files" className="divide-y divide-line/60">
              {items.map((p) => (
                <Row key={p.slug} p={p} active={p.slug === active?.slug} onActivate={setActiveSlug} />
              ))}
            </ul>
            <p className="mt-6 border-t border-line px-3 pt-4 font-mono text-[11.5px] leading-relaxed text-fg-muted">
              <span className="text-fg-dim"># </span>
              Condensed from the full journals at{' '}
              <a href={SOURCE_SITE} target="_blank" rel="noreferrer" className="text-fg underline decoration-fg-dim underline-offset-4 transition-colors hover:decoration-fg">
                {SOURCE_SITE.replace('https://', '')}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              , last updated {JOURNAL_UPDATED}.
            </p>
          </div>

          {/* Mounted on desktop only: a hidden <img> still downloads, and phones never see the pane. */}
          {desktop && <div className="min-w-0">{active && <Preview p={active} />}</div>}
        </div>
      </div>
    </section>
  );
}
