import type { Project } from '@/data/projects';
import { cn } from '@/lib/cn';
import { CoordLabel, Resolve } from './shared';

/**
 * "Not claimed" boundaries (as stderr-style lines) + the "next" list. A plain list is a to-do queue
 * ([ ] boxes, `cat TODO`); a file with `nextLabel` (gaps to study, integration prerequisites) gets its
 * own heading and plain bullets, so study notes never read as a promised roadmap.
 */
export default function Boundaries({ project, code }: { project: Project; code: string }) {
  const queue = !project.nextLabel;
  // "Gaps to study: references for learning, …" → heading "Gaps to study" + a qualifying line under it.
  const [heading, sub] = ((): [string, string | undefined] => {
    const label = project.nextLabel ?? 'Next';
    const i = label.indexOf(': ');
    return i > 0 ? [label.slice(0, i), label.slice(i + 2)] : [label, undefined];
  })();
  return (
    <section aria-labelledby="limits-title" className="relative py-14 md:py-20">
      <div className="container-signal">
        <CoordLabel code={code}>limits</CoordLabel>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
          <div className="panel brackets overflow-hidden">
            <p aria-hidden className="border-b border-line px-5 py-2.5 font-mono text-[11.5px] text-fg-muted md:px-8">
              <span className="text-fg-dim">$</span> cat NOT_CLAIMED <span className="text-rust">2&gt;&amp;1</span>
            </p>
            <div className="p-5 md:p-8">
              <h2 id="limits-title" className="text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
                Not claimed
              </h2>
              <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-fg-muted">
                The limits this file draws around its own evidence.
              </p>
              <Resolve>
                <ol className="mt-6 grid">
                  {project.boundaries.map((b, i) => (
                    <li key={b} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 border-t border-line py-4 first:border-t-0">
                      <span className="pt-0.5 font-mono text-[11.5px] text-fg-dim">
                        <span aria-hidden>!</span> {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="max-w-[64ch] text-[16px] leading-relaxed text-fg">{b}</span>
                    </li>
                  ))}
                </ol>
              </Resolve>
            </div>
          </div>

          <div className="panel overflow-hidden">
            <p aria-hidden className="border-b border-line px-5 py-2.5 font-mono text-[11.5px] text-fg-muted md:px-8">
              <span className="text-fg-dim">$</span> {queue ? 'cat TODO' : 'cat NOTES'}
            </p>
            <div className="p-5 md:p-8">
              <h2
                id="next-title"
                className={cn(
                  'font-semibold leading-[1.1] tracking-[-0.03em]',
                  heading.length > 24 ? 'text-[clamp(1.25rem,2.2vw,1.75rem)]' : 'text-[clamp(1.5rem,2.8vw,2.25rem)]'
                )}
              >
                {heading}
              </h2>
              {sub || project.nextNote ? (
                <p className="mt-3 max-w-[48ch] text-[15px] leading-relaxed text-fg-muted">
                  {sub ? `${sub[0].toUpperCase()}${sub.slice(1)}.` : project.nextNote}
                  {sub && project.nextNote ? ` ${project.nextNote}` : null}
                </p>
              ) : null}
              <ul className="mt-6 grid gap-1">
                {project.next.map((n) => (
                  <li key={n} className="-mx-3 flex items-start gap-3 rounded-[3px] px-3 py-2.5 transition-colors duration-200 hover:bg-ink-850">
                    <span aria-hidden className={cn('shrink-0 pt-0.5 font-mono text-[13px] text-fg-dim', !queue && 'w-[3ch] text-center')}>
                      {queue ? '[ ]' : '–'}
                    </span>
                    <span className="text-[15px] leading-relaxed text-fg-muted">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
