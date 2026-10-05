import { useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react';
import { ChevronDown, RotateCcw } from 'lucide-react';
import LineSidebar from '@/components/reactbits/LineSidebar';
import SpringCheck from '@/components/reactbits/SpringCheck';
import RB from '@/components/ui/RB';
import { useIsDesktop } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import type { Project, ProjectSection } from '@/data/projects';
import { CoordLabel } from './shared';

const sectionId = (s: ProjectSection) => `journal-${s.id}`;
const pad = (n: number) => String(n).padStart(2, '0');

/** Smooth in-page jump that respects reduced motion and leaves focus on the target heading. */
function jumpTo(id: string, reduced: boolean) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  const heading = el.querySelector<HTMLElement>('h2');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
  history.replaceState(history.state, '', `#${id}`);
}

/** Scroll-spy: index of the section whose top crossed the upper third of the viewport. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        const first = ids.findIndex((id) => visible.get(id));
        if (first >= 0) setActive(first);
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

/** A 'steps' list becomes a procedure the reader can tick through (ReactBits SpringCheck). */
function Checklist({ items }: { items: string[] }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const count = done.filter(Boolean).length;
  const complete = count === items.length;

  return (
    <RB name="SpringCheck" className="panel brackets mt-8 max-w-[68ch] p-5 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <h3 className="font-mono text-[12px] text-fg">
          <span className="text-fg-dim">$</span> ./run-procedure.sh
        </h3>
        <div className="flex items-center gap-3">
          <span className={complete ? 'font-mono text-[11.5px] text-phosphor' : 'font-mono text-[11.5px] text-fg-muted'} aria-live="polite">
            {pad(count)} / {pad(items.length)} {complete ? 'verified' : 'checked'}
          </span>
          <button
            type="button"
            onClick={() => setDone(items.map(() => false))}
            disabled={!count}
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-line-strong px-2.5 py-1 font-mono text-[11px] text-fg-muted transition-colors hover:border-fg/40 hover:text-fg disabled:opacity-40"
          >
            <RotateCcw aria-hidden size={11} strokeWidth={1.75} /> reset
          </button>
        </div>
      </div>
      <div className="mt-2 h-px w-full bg-line" aria-hidden>
        <div
          className="h-px bg-fg-muted transition-[width] duration-500 ease-[var(--ease-out-expo)]"
          style={{ width: `${(count / items.length) * 100}%` }}
        />
      </div>
      <ol className="mt-4 grid gap-1">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-4">
            <span aria-hidden className="mt-[0.95rem] w-6 shrink-0 font-mono text-[0.6875rem] text-fg-dim">
              {pad(i + 1)}
            </span>
            <SpringCheck
              label={item}
              checked={done[i]}
              onChange={(v) => setDone((d) => d.map((x, j) => (j === i ? v : x)))}
              color="#eeeeee"
              fillColor="#e8e8e8"
              checkColor="#060606"
              boxSize={18}
              boxRadius={3}
              fontSize={15}
              doneOpacity={0.5}
              strike="left"
              className="w-full py-1.5 text-left font-normal leading-relaxed"
            />
          </li>
        ))}
      </ol>
    </RB>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid max-w-[68ch] gap-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[16px] leading-[1.7] text-fg-muted">
          <span aria-hidden className="shrink-0 font-mono text-fg-dim">
            -
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Journal: sticky LineSidebar contents (desktop) or a disclosure (mobile), then plain long-form sections. */
export default function Journal({ project, code }: { project: Project; code: string }) {
  const reduced = useReducedMotion();
  const isDesktop = useIsDesktop();
  const ids = useMemo(() => project.sections.map(sectionId), [project]);
  const active = useActiveSection(ids);
  const labels = project.sections.map((s) => s.heading);

  // LineSidebar items are real <a href="#…"> links; take over the click for a smooth, focus-aware jump.
  const onTocClick = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      const link = (e.target as HTMLElement).closest('a');
      const hash = link?.getAttribute('href');
      if (!hash?.startsWith('#')) return;
      e.preventDefault();
      jumpTo(hash.slice(1), reduced);
      if (link?.closest('details')) link.closest('details')?.removeAttribute('open');
    },
    [reduced]
  );

  return (
    <section aria-label="Journal" className="relative py-14 md:py-20">
      <div className="container-signal">
        <CoordLabel code={code}>journal · {pad(labels.length)} entries</CoordLabel>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[17rem_minmax(0,1fr)]">
          {isDesktop ? (
            <div onClickCapture={onTocClick}>
              <RB name="LineSidebar" className="sticky top-28">
                <p className="mb-3 pl-[52px] font-mono text-[11.5px] text-fg-muted">contents</p>
                <LineSidebar
                  items={labels}
                  hrefs={ids.map((id) => `#${id}`)}
                  active={active}
                  ariaLabel="Journal contents"
                  accentColor="#3fe07a"
                  textColor="#a8a8a8"
                  markerColor="#3a3a3a"
                  markerLength={40}
                  markerGap={12}
                  itemGap={14}
                  fontSize={0.875}
                  maxShift={0}
                  proximityRadius={60}
                  smoothing={reduced ? 1 : 90}
                />
              </RB>
            </div>
          ) : (
            <details className="panel group min-w-0 open:pb-2" onClickCapture={onTocClick}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-[12px] text-fg">contents</span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono text-[11.5px] text-fg-muted">{labels[active]}</span>
                  <ChevronDown aria-hidden size={16} strokeWidth={1.75} className="shrink-0 text-fg-muted transition-transform group-open:rotate-180" />
                </span>
              </summary>
              <nav aria-label="Journal contents">
                <ol className="grid border-t border-line px-2 pt-2">
                  {project.sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${sectionId(s)}`}
                        aria-current={i === active ? 'location' : undefined}
                        className="flex items-baseline gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-[0.95rem] text-fg-muted aria-[current=location]:text-fg"
                      >
                        <span className={i === active ? 'font-mono text-[0.6875rem] text-phosphor' : 'font-mono text-[0.6875rem] text-fg-dim'}>
                          {pad(i + 1)}
                        </span>
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </details>
          )}

          <div className="min-w-0">
            {project.sections.map((s, i) => (
              <article
                key={s.id}
                id={sectionId(s)}
                aria-labelledby={`${sectionId(s)}-h`}
                className="scroll-mt-28 border-t border-line pt-8 pb-12 first:border-t-0 first:pt-0 md:pb-16"
              >
                <h2
                  id={`${sectionId(s)}-h`}
                  className="mb-5 text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-fg"
                >
                  <span aria-hidden className="mr-3 font-mono text-[0.55em] font-normal tracking-normal text-fg-dim">
                    {pad(i + 1)}
                  </span>
                  {s.heading}
                </h2>
                <div className="grid max-w-[68ch] gap-5">
                  {s.paragraphs.map((para) => (
                    <p key={para.slice(0, 40)} className="text-[16px] leading-[1.8] text-fg-muted md:text-[17px]">
                      {para}
                    </p>
                  ))}
                </div>
                {s.list && s.listStyle === 'steps' && <Checklist items={s.list} />}
                {s.list && s.listStyle !== 'steps' && <Bullets items={s.list} />}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
