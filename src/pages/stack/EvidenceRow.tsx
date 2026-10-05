import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import RB from '@/components/ui/RB';
import Section from '@/components/ui/Section';
import { cn } from '@/lib/cn';
import { thumbSrc, THUMB_SIZE } from '@/lib/art';
import { evidence, formatMetric } from './data';
import { SectionHead, StackLabel } from './parts';

/** One quiet chalk spotlight for every card — the posters already carry each case file's identity. */
const SPOT = 'rgba(232, 232, 232, 0.08)';

/** One desktop column per card (static class names so Tailwind can see them). */
const LG_COLS: Record<number, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
  5: 'lg:grid-cols-5'
};
/** An odd card count leaves the last card alone on the two-column row, so it spans both there. */
const lastOdd = evidence.length % 2 === 1;

export default function EvidenceRow() {
  return (
    <Section id="evidence" aria-labelledby="evidence-title" className="pb-dock">
      <StackLabel index="04" path="~/stack/evidence" />
      <SectionHead
        id="evidence-title"
        kicker="skills in use"
        title={
          <>
            Where the skills <span className="text-fg-muted">show{' '}up</span>
          </>
        }
        aside={
          <p className="max-w-[40ch] text-[15px] leading-relaxed text-fg-muted lg:text-right">
            Each number is reported by its case file. The chips underneath are the skills that case file actually used
            to get there.
          </p>
        }
      />

      <RB name="SpotlightCard" className={cn('grid gap-4 sm:grid-cols-2', LG_COLS[evidence.length] ?? 'lg:grid-cols-4')}>
        {evidence.map(({ project, metric, skills }, i) => {
          const value = formatMetric(metric.value, metric.separator, metric.prefix, metric.suffix);
          const long = value.length > 6;
          return (
            <SpotlightCard
              key={project.slug}
              spotlightColor={SPOT}
              className={cn(
                'group h-full transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong',
                lastOdd && i === evidence.length - 1 && 'sm:col-span-2 lg:col-span-1'
              )}
            >
              <Link
                to={`/log/${project.slug}`}
                className="relative flex h-full flex-col p-5 md:p-6"
                aria-label={`${project.title}: ${value} ${metric.label}. Skills: ${skills.map((s) => s.name).join(', ')}. Open case file.`}
              >
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden">
                  <img
                    src={thumbSrc(project.slug)}
                    alt=""
                    width={THUMB_SIZE}
                    height={THUMB_SIZE}
                    loading="lazy"
                    className="size-full object-cover object-[50%_40%] opacity-20 grayscale transition-[opacity,filter] duration-300 group-hover:opacity-40 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/80 to-ink-900" />
                </div>

                <div className="relative flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-mono text-[0.6875rem] text-fg-muted">~/log/{project.slug}</span>
                  <ArrowUpRight
                    aria-hidden
                    size={16}
                    strokeWidth={1.75}
                    className="shrink-0 text-fg-muted transition-[transform,color] duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                  />
                </div>
                <p className="relative mt-1 text-[15px] font-medium tracking-[-0.01em] text-fg">{project.shortTitle}</p>

                <p
                  aria-hidden
                  className={cn(
                    'relative mt-10 font-mono leading-none tracking-[-0.03em] text-fg',
                    long ? 'text-[clamp(1.5rem,2vw,1.85rem)]' : 'text-[clamp(2.5rem,4vw,3.25rem)]'
                  )}
                >
                  {value}
                </p>
                <p aria-hidden className="relative mt-3 text-[14px] leading-snug text-fg-muted">
                  {metric.label}
                </p>

                <ul aria-hidden className="relative mt-auto flex flex-wrap gap-1.5 pt-6">
                  {skills.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-[3px] border border-line-strong bg-ink-950 px-2 py-1 font-mono text-[10.5px] text-fg-muted transition-colors group-hover:border-fg/30 group-hover:text-fg"
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              </Link>
            </SpotlightCard>
          );
        })}
      </RB>
    </Section>
  );
}
