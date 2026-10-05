import CountUp from '@/components/reactbits/CountUp';
import RB from '@/components/ui/RB';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import type { Project, ProjectMetric } from '@/data/projects';
import { CoordLabel } from './shared';

const fmt = (m: ProjectMetric) =>
  `${m.prefix ?? ''}${m.separator ? m.value.toLocaleString('en-US') : m.value}${m.suffix ?? ''}`;

/**
 * Per-project figures from project.metrics (only rendered when there are metrics). Each label sits
 * directly under its numeral; CountUp settles on the real figure in 0.6s once the cell is on screen.
 */
export default function Metrics({ project, code }: { project: Project; code: string }) {
  const reduced = useReducedMotion();
  const list = project.metrics;
  if (!list.length) return null;
  const odd = list.length % 2 === 1;

  return (
    <section aria-labelledby="metrics-title" className="relative py-10 md:py-14">
      <div className="container-signal relative">
        <CoordLabel code={code}>by the numbers</CoordLabel>
        <h2 id="metrics-title" className="sr-only">
          By the numbers
        </h2>

        <RB name="CountUp" as="div" className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-line bg-line md:grid-cols-2">
          {list.map((m, i) => {
            const big = m.value >= 100000;
            const wide = odd && i === 0;
            return (
              <div key={m.label} className={cn('group relative bg-ink-950 p-6 md:p-8', wide && 'md:col-span-2')}>
                <p className="sr-only">
                  {fmt(m)} {m.label}
                  {m.detail ? ` (${m.detail})` : ''}
                </p>
                <div aria-hidden className="flex flex-col items-start gap-3">
                  <span
                    className={cn(
                      'font-mono font-semibold leading-[0.9] tracking-[-0.05em] tabular-nums text-fg',
                      big ? 'text-[clamp(2.25rem,6vw,4.5rem)]' : 'text-[clamp(3rem,7vw,6rem)]'
                    )}
                  >
                    {m.prefix}
                    {reduced ? (
                      m.separator ? m.value.toLocaleString('en-US') : m.value
                    ) : (
                      <CountUp to={m.value} duration={0.6} separator={m.separator ? ',' : ''} />
                    )}
                    {m.suffix && <span className="text-fg-dim">{m.suffix}</span>}
                  </span>
                  <span className="block max-w-[36ch]">
                    <span className="block text-[15px] leading-snug text-fg">{m.label}</span>
                    {m.detail && <span className="mt-2 block font-mono text-[11.5px] text-fg-muted">{m.detail}</span>}
                  </span>
                </div>
                {m.chips?.length ? (
                  <ul aria-label="Supporting details" className="mt-5 flex max-w-[72ch] flex-wrap gap-1.5">
                    {m.chips.map((c) => (
                      <li
                        key={c}
                        className="rounded-[3px] border border-line-strong px-2 py-1 font-mono text-[11.5px] leading-none text-fg-muted"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <span
                  aria-hidden
                  className="absolute top-0 left-6 h-px w-10 bg-fg-dim transition-[width] duration-500 ease-[var(--ease-out-expo)] group-hover:w-24 md:left-8"
                />
              </div>
            );
          })}
        </RB>
      </div>
    </section>
  );
}
