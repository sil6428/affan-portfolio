import { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { GraduationCap, MapPin } from 'lucide-react';
import { Chip } from '@/components/ui/Chip';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { profile } from '@/data/profile';
import { Reveal, SectionHead } from './shared';
import { SCROLL_OFFSET_CLASS, isoDay, monthStart, pad2 } from './model';

const EASE = [0.16, 1, 0.3, 1] as const;
const edu = profile.education;
const [START_LABEL, END_LABEL] = edu.dateLabel.split(' — ');

/** Honest arithmetic: share of the calendar span from program start to expected end that has passed. */
function useProgramTimeline() {
  const [timeline] = useState(() => {
    const start = monthStart(edu.start);
    const end = monthStart(edu.expectedEnd);
    const now = new Date();
    const span = end.getTime() - start.getTime();
    const raw = ((now.getTime() - start.getTime()) / span) * 100;
    const pct = Math.min(100, Math.max(0, raw));
    // Calendar-year boundaries that fall inside the program span (Jan 1 of each year).
    const years: { label: string; at: number }[] = [];
    for (let y = start.getFullYear() + 1; y <= end.getFullYear(); y++) {
      const at = ((new Date(y, 0, 1).getTime() - start.getTime()) / span) * 100;
      if (at > 0 && at < 100) years.push({ label: String(y), at });
    }
    // Calendar grid: one row per calendar year, one cell per month; cells inside the program span
    // are 'past', 'current' or 'future' relative to today.
    const nowKey = now.getFullYear() * 12 + now.getMonth();
    const startKey = start.getFullYear() * 12 + start.getMonth();
    const endKey = end.getFullYear() * 12 + end.getMonth();
    const rows = [] as { year: number; cells: ('out' | 'past' | 'current' | 'future')[] }[];
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      rows.push({
        year: y,
        cells: Array.from({ length: 12 }, (_, m) => {
          const k = y * 12 + m;
          if (k < startKey || k > endKey) return 'out';
          return k < nowKey ? 'past' : k === nowKey ? 'current' : 'future';
        })
      });
    }
    const totalMonths = endKey - startKey + 1;
    const begun = Math.min(totalMonths, Math.max(0, nowKey - startKey + 1));
    const totalYears = 4;
    const academicYearsElapsed =
      now.getFullYear() - start.getFullYear() - (now.getMonth() < start.getMonth() ? 1 : 0);
    const yearOfStudy = Math.min(totalYears, Math.max(1, academicYearsElapsed + 1));
    return {
      pct,
      rounded: Math.round(pct * 10) / 10,
      years,
      today: isoDay(now),
      rows,
      totalMonths,
      begun,
      totalYears,
      yearOfStudy
    };
  });
  return timeline;
}

const MONTH_INITIALS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

/** Month-by-month calendar of the program span (decorative twin of the meter, with an sr summary). */
function MonthGrid({ t }: { t: ReturnType<typeof useProgramTimeline> }) {
  return (
    <div className="mt-8 border-t border-line pt-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] leading-[1.2] text-fg-muted">Calendar months</p>
        <p className="font-mono text-[11px] leading-[1.2] tabular-nums text-fg">
          {pad2(t.begun)} <span className="text-fg-muted">/ {pad2(t.totalMonths)} begun</span>
        </p>
      </div>
      <p className="sr-only">
        {t.begun} of the {t.totalMonths} calendar months in the program span have begun.
      </p>
      <div aria-hidden className="mt-4 grid grid-cols-[2.5rem_repeat(12,minmax(0,1fr))] gap-1">
        <span />
        {MONTH_INITIALS.map((m, i) => (
          <span key={i} className="text-center font-mono text-[9px] text-fg-dim">
            {m}
          </span>
        ))}
        {t.rows.map((row) => (
          <div key={row.year} className="contents">
            <span className="self-center font-mono text-[10px] tabular-nums text-fg-muted">{row.year}</span>
            {row.cells.map((c, i) => (
              <span
                key={i}
                className={cn(
                  'aspect-square rounded-[2px]',
                  c === 'out' && 'border border-dashed border-line',
                  c === 'past' && 'bg-fg/25',
                  // The current month is this section's one accent.
                  c === 'current' && 'bg-phosphor',
                  c === 'future' && 'border border-line-strong bg-ink-850'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineMeter() {
  const reduced = useReducedMotion();
  const t = useProgramTimeline();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const show = reduced || inView;

  return (
    <div ref={ref} className="min-w-0">
      <div className="flex items-end justify-between gap-4">
        <p className="font-mono text-[11px] leading-[1.2] text-fg">
          Current year of study
        </p>
        <p className="font-mono text-[clamp(2.25rem,4vw,3.25rem)] font-medium leading-none tracking-[-0.04em] text-fg tabular-nums">
          <span className="text-phosphor">{t.yearOfStudy}</span>
          <span className="text-fg-dim"> / {t.totalYears}</span>
        </p>
      </div>

      <div
        role="meter"
        aria-label="Calendar progress through the program timeline"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={t.rounded}
        aria-valuetext={`${t.rounded}% of the time from ${START_LABEL} to ${END_LABEL} has passed`}
        className="relative mt-5 h-3 rounded-[2px] border border-line-strong bg-ink-950"
      >
        <motion.div
          className="absolute inset-y-[2px] left-[2px] origin-left rounded-[1px] bg-chalk"
          style={{ width: `calc(${t.pct}% - 4px)` }}
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: show ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 1.6, ease: EASE }}
        />
        {t.years.map((y) => (
          <span key={y.label} aria-hidden className="absolute -top-1 -bottom-1 w-px bg-line-strong" style={{ left: `${y.at}%` }} />
        ))}
        {/* Today marker */}
        <motion.span
          aria-hidden
          className="absolute -top-2.5 -bottom-2.5 w-[2px] -translate-x-1/2 bg-fg"
          style={{ left: `${t.pct}%` }}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.4, delay: reduced ? 0 : 1.3 }}
        />
      </div>

      <div aria-hidden className="relative mt-3 h-4 font-mono text-[10px] text-fg-dim">
        {t.years.map((y) => (
          <span key={y.label} className="absolute -translate-x-1/2" style={{ left: `${y.at}%` }}>
            {y.label}
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-fg-muted">
        <span>{START_LABEL}</span>
        <span className="text-fg">Today · {t.today}</span>
        <span className="text-right">{END_LABEL}</span>
      </div>
      <p className="mt-4 text-[13px] leading-relaxed text-fg-muted">
        Year {t.yearOfStudy} of a {t.totalYears}-year program. The bar and month grid show calendar time from the program
        start to expected graduation, not completed credits or a grade.
      </p>
      <MonthGrid t={t} />
    </div>
  );
}

export default function Education() {
  return (
    <section
      id="education"
      aria-labelledby="education-title"
      className={cn('relative py-24 md:py-32', SCROLL_OFFSET_CLASS)}
    >
            <div className="container-signal">
        <SectionHead
          id="education"
          command="cat enrolment.txt"
          title="Education"
        />

        <Reveal distance={56}>
          <article aria-labelledby="edu-school" className="panel brackets overflow-hidden">

            <div className="relative grid gap-12 p-6 md:p-10 lg:grid-cols-12 lg:gap-10 xl:p-14">
              {/* Identity of the program */}
              <div className="min-w-0 lg:col-span-7">
                <p className="font-mono text-[11px] leading-[1.2] text-fg-muted flex items-center gap-2">
                  <GraduationCap aria-hidden size={14} strokeWidth={1.75} />
                  Institution
                </p>
                <h3
                  id="edu-school"
                  className="mt-5 text-[clamp(1.875rem,4vw,3.5rem)] font-semibold leading-[1] tracking-[-0.03em] text-fg"
                >
                  {edu.school}
                </h3>
                <p className="mt-6 text-lg leading-snug text-fg md:text-xl">{edu.degree}</p>
                <p className="mt-1 font-mono text-[clamp(1.25rem,2.2vw,1.75rem)] font-medium leading-tight tracking-[-0.02em] text-fg">
                  {edu.major}
                </p>
                <dl className="mt-7 flex flex-wrap gap-x-10 gap-y-4 font-mono text-[11px]">
                  <div>
                    <dt className="text-fg-dim">Dates</dt>
                    <dd className="mt-1 text-fg">{edu.dateLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-fg-dim">Campus</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-fg">
                      <MapPin aria-hidden size={12} strokeWidth={1.75} className="text-fg-muted" />
                      {edu.location}
                    </dd>
                  </div>
                </dl>
                <p className="mt-8 max-w-[60ch] text-[17px] leading-relaxed text-fg-muted">{edu.summary}</p>
              </div>

              {/* Timeline meter */}
              <div className="min-w-0 lg:col-span-5 lg:border-l lg:border-line lg:pl-10">
                <TimelineMeter />
              </div>
            </div>

            {/* Coursework */}
            <div className="relative border-t border-line p-6 md:p-10 xl:px-14">
              <div className="mb-6 flex items-center gap-4">
                <h4 className="font-mono text-[11px] leading-[1.2] text-fg">Coursework</h4>
                <span aria-hidden className="h-px flex-1 bg-line" />
                <span className="font-mono text-[11px] leading-[1.2] text-fg-muted">{pad2(edu.coursework.length)} courses</span>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {edu.coursework.map((course, i) => (
                  <li
                    key={course}
                    className="group/course relative overflow-hidden rounded-[4px] border border-line bg-ink-950 p-5 transition-[border-color,background-color] duration-300 hover:border-fg/40 hover:bg-ink-850"
                  >
                    <p className="font-mono text-[11px] text-fg-dim">[{pad2(i + 1)}]</p>
                    <p className="mt-6 text-[1.0625rem] font-medium leading-snug tracking-[-0.01em] text-fg">
                      {course}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="mt-10 mb-5 flex items-center gap-4">
                <h4 className="font-mono text-[11px] leading-[1.2] text-fg">Topics the coursework connects</h4>
                <span aria-hidden className="h-px flex-1 bg-line" />
              </div>
              <ul className="flex flex-wrap gap-2">
                {edu.topics.map((topic) => (
                  <li key={topic}>
                    <Chip className="normal-case tracking-normal transition-[border-color,color] duration-300 hover:border-fg/40 hover:text-fg">
                      {topic}
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
