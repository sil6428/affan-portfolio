import RB from '@/components/ui/RB';
import type { Project } from '@/data/projects';
import { CoordLabel, Decrypt } from './shared';

/**
 * Spec sheet: project.facts as instrument cells. Values are plain text from the first frame (they are
 * facts); only the field labels decrypt once as the sheet scrolls into view.
 */
export default function SpecSheet({ project }: { project: Project }) {
  const n = project.facts.length;
  const c = n % 4 === 0 || n > 6 ? 4 : 3;
  const cols = c === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
  // The last cell stretches to close the final row (2 columns on tablet, 3–4 on desktop).
  const rem = n % c;
  const LG_SPAN = ['lg:col-span-1', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-4'];
  const lastSpan = `${n % 2 ? 'sm:col-span-2' : ''} ${LG_SPAN[rem ? c - rem : 0]}`;

  return (
    <section aria-labelledby="spec-title" className="relative pt-16 pb-10 md:pt-24 md:pb-14">
      <div className="container-signal">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
          <div>
            <CoordLabel code="01">cat spec.txt</CoordLabel>
            <h2 id="spec-title" className="mt-4 text-[clamp(1.75rem,3.4vw,2.75rem)] font-semibold leading-[1] tracking-[-0.03em]">
              Spec sheet
            </h2>
          </div>
          <span aria-hidden className="font-mono text-[11px] text-fg-dim">
            {String(n).padStart(2, '0')} fields
          </span>
        </div>

        <RB name="DecryptedText" className="panel overflow-hidden">
          <dl className={`grid grid-cols-1 sm:grid-cols-2 ${cols}`}>
            {project.facts.map((f, i) => (
              <div
                key={f.label}
                className={`group relative -mt-px -ml-px border-t border-l border-line p-5 transition-colors duration-200 hover:bg-ink-850 md:p-6 ${i === n - 1 ? lastSpan : ''}`}
              >
                <dt className="relative flex items-center justify-between gap-3">
                  <Decrypt text={f.label.toLowerCase()} speed={28} className="font-mono text-[11.5px] text-fg-muted" encryptedClassName="text-fg-dim" />
                  <span aria-hidden className="font-mono text-[10.5px] text-fg-dim">
                    [{String(i + 1).padStart(2, '0')}]
                  </span>
                </dt>
                <dd className="relative mt-3 text-[15px] leading-snug font-medium text-fg md:text-[16px]">{f.value}</dd>
                <span
                  aria-hidden
                  className="absolute bottom-0 left-5 h-px w-6 bg-line-strong transition-[width,background-color] duration-300 ease-[var(--ease-out-expo)] group-hover:w-12 group-hover:bg-fg/40 md:left-6"
                />
              </div>
            ))}
          </dl>
        </RB>
      </div>
    </section>
  );
}
