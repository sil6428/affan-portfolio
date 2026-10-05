import type { ReactNode } from 'react';
import { Link } from 'react-router';
import {
  ArrowUpRight,
  Award,
  BriefcaseBusiness,
  GraduationCap,
  Handshake,
  MapPin,
  Radar,
  Send,
  type LucideIcon
} from 'lucide-react';
import MagicBento, { type MagicBentoItem } from '@/components/reactbits/MagicBento';
import Section from '@/components/ui/Section';
import { StatusChip } from '@/components/ui/Chip';
import { contact, profile } from '@/data/profile';
import { getProject } from '@/data/projects';
import { isLowPowerDevice, useFinePointer } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { SectionLabel, SplitHeading } from './fx';

const ssik = getProject('ssik');
const EXPECTED = profile.education.dateLabel.split('— ').pop() ?? profile.education.dateLabel;
const STARTED = profile.education.dateLabel.split(' —')[0];
const BAR_CELLS = 24;

/** Calendar position and current academic year, without presenting either as credits or a grade. */
function programmePosition() {
  const start = new Date(`${profile.education.start}-01T00:00:00`);
  const end = new Date(`${profile.education.expectedEnd}-01T00:00:00`);
  const now = new Date();
  const progress = Math.min(1, Math.max(0, (now.getTime() - start.getTime()) / (end.getTime() - start.getTime())));
  const totalYears = 4;
  const academicYearsElapsed =
    now.getFullYear() - start.getFullYear() - (now.getMonth() < start.getMonth() ? 1 : 0);
  const yearOfStudy = Math.min(totalYears, Math.max(1, academicYearsElapsed + 1));
  return { progress, yearOfStudy, totalYears };
}

interface TileHeadProps {
  index: string;
  label: string;
  icon: LucideIcon;
  /** Linked tiles show an arrow that lifts on hover instead of the icon. */
  linked?: boolean;
}

function TileHead({ index, label, icon: Icon, linked }: TileHeadProps) {
  return (
    <div className="relative z-[1] flex items-start justify-between gap-4">
      <h3 className="flex items-center gap-2 font-mono text-[0.75rem] text-fg-muted">
        {/* The [01] index is decoration; assistive tech reads only the label. */}
        <span aria-hidden="true" className="text-fg-dim">
          [<span className="text-fg-muted">{index}</span>]
        </span>
        <span>{label}</span>
      </h3>
      {linked ? (
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-[3px] border border-line-strong text-fg-muted transition-[color,border-color,background-color,transform] duration-200 group-hover:-translate-y-0.5 group-hover:border-fg group-hover:bg-fg group-hover:text-ink-950"
        >
          <ArrowUpRight size={15} strokeWidth={1.75} />
        </span>
      ) : (
        <Icon aria-hidden="true" size={15} strokeWidth={1.5} className="shrink-0 text-fg-dim" />
      )}
    </div>
  );
}

/** Whole-tile router link: the tile itself is the hit area. */
function TileLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      className={cn('relative flex h-full flex-col rounded-[6px] p-6 focus-visible:outline-offset-[-3px] md:p-7', className)}
    >
      {children}
    </Link>
  );
}

const tilePad = 'relative flex h-full flex-col p-6 md:p-7';

/** Decorative range rings for the location tile. */
function RangeRings() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 240"
      className="pointer-events-none absolute -bottom-20 -right-20 size-60 text-fg-dim"
      fill="none"
    >
      {[110, 80, 50, 22].map((r, i) => (
        <circle key={r} cx="120" cy="120" r={r} stroke="currentColor" strokeOpacity={0.18 + i * 0.1} strokeWidth="1" />
      ))}
      <path d="M120 0v240M0 120h240" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 5" />
      <circle cx="120" cy="120" r="3.5" className="fill-fg" />
    </svg>
  );
}

/**
 * [██████░░░░░░] — the programme timeline as a terminal progress bar. It measures calendar time
 * between the start and the expected end (same arithmetic as /log Education), not credits earned.
 */
function ProgressBar({ progress, yearOfStudy, totalYears }: ReturnType<typeof programmePosition>) {
  const filled = Math.round(progress * BAR_CELLS);
  const pct = Math.round(progress * 100);
  return (
    <div>
      <p className="sr-only">
        Year {yearOfStudy} of {totalYears}. {pct}% of the calendar time from {STARTED} to{' '}
        {EXPECTED.replace(/^Expected /, '')} has passed.
      </p>
      <p aria-hidden="true" className="whitespace-nowrap font-mono text-[0.8125rem] leading-none tracking-[-0.02em]">
        <span className="text-fg-dim">[</span>
        <span className="text-fg">{'█'.repeat(filled)}</span>
        <span className="text-fg/15">{'█'.repeat(BAR_CELLS - filled)}</span>
        <span className="text-fg-dim">]</span>
        <span className="ml-2 text-fg-muted">
          yr <span className="text-phosphor">{yearOfStudy}</span>/{totalYears}
        </span>
      </p>
      <p className="mt-2 font-mono text-[0.6875rem] text-fg-muted">
        <span aria-hidden="true" className="text-fg-dim">
          #{' '}
        </span>
        current year; bar shows calendar position, not credits or grade
      </p>
    </div>
  );
}

export default function IdentityBento() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const programme = programmePosition();

  const items: MagicBentoItem[] = [
    {
      id: 'location',
      className: 'lg:col-start-1 lg:row-start-1',
      children: (
        <div className={cn(tilePad, 'min-h-[13rem]')}>
          <RangeRings />
          <TileHead index="01" label="location" icon={MapPin} />
          <div className="relative mt-auto pt-10">
            <p className="text-[clamp(1.5rem,2vw,1.875rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-fg">
              {profile.location.split(', ')[0]},
              <span className="block text-fg-muted">{profile.location.split(', ')[1]}</span>
            </p>
            <p className="mt-4 font-mono text-[0.75rem] text-fg-muted">Ontario, Canada</p>
          </div>
        </div>
      )
    },
    {
      id: 'education',
      className: 'md:col-span-2 lg:col-start-2 lg:row-start-1 lg:row-span-2',
      children: (
        <div className={cn(tilePad, 'gap-8')}>
          <TileHead index="02" label="education" icon={GraduationCap} />
          <div className="relative">
            <p className="font-mono text-[0.8125rem] text-fg-muted">{profile.education.school}</p>
            <p className="mt-3 max-w-[22ch] text-[clamp(1.5rem,2.3vw,2.25rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">
              {profile.education.degree}
            </p>
            <p className="mt-3 text-[clamp(1.05rem,1.4vw,1.25rem)] font-medium leading-snug text-fg-muted">
              {profile.education.major}
            </p>
          </div>

          {/* Programme timeline: start → expected end, with today's position as a progress bar */}
          <div className="relative mt-auto">
            <div className="mb-3 flex items-center justify-between font-mono text-[0.75rem] text-fg-muted">
              <span>{STARTED}</span>
              <span className="text-fg">{EXPECTED}</span>
            </div>
            <div className="overflow-hidden">
              <ProgressBar {...programme} />
            </div>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Coursework">
              {profile.education.coursework.map((course) => (
                <li
                  key={course}
                  className="rounded-[3px] border border-line-strong bg-ink-950 px-2.5 py-1 font-mono text-[0.6875rem] text-fg-muted"
                >
                  {course}
                </li>
              ))}
            </ul>
            <Link
              to="/log"
              className="mt-6 inline-flex items-center gap-1.5 font-mono text-[0.75rem] text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
            >
              full record in ~/log
              <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.75} />
            </Link>
          </div>
        </div>
      )
    },
    {
      id: 'focus',
      className: 'lg:col-start-4 lg:row-start-1',
      children: (
        <div className={cn(tilePad, 'min-h-[13rem]')}>
          <TileHead index="03" label="focus" icon={Radar} />
          <p className="mt-auto pt-10 text-[clamp(1.35rem,1.8vw,1.7rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">
            {profile.focus}
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-y-1 font-mono text-[0.75rem] text-fg-muted sm:grid-cols-2 lg:grid-cols-1">
            {profile.roles.map((role) => (
              <li key={role}>
                <span aria-hidden="true" className="text-fg-dim">
                  --
                </span>
                {role.toLowerCase().replace(/ /g, '-')}
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'seeking',
      className: 'md:row-span-2 lg:col-start-1 lg:row-start-2',
      children: (
        <div className={cn(tilePad, 'gap-6')}>
          <TileHead index="04" label="seeking" icon={BriefcaseBusiness} />
          <div className="relative mt-4">
            <p aria-hidden="true" className="mb-3 flex items-center gap-2 font-mono text-[0.75rem] text-fg-muted">
              <span className="size-1.5 rounded-full bg-phosphor" />
              status
            </p>
            <p className="text-[clamp(1.35rem,1.9vw,1.75rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fg">
              {profile.status}
            </p>
          </div>
          <p className="relative mt-auto font-mono text-[0.75rem] text-fg-muted"># roles that fit</p>
          <ol className="relative -mt-3 divide-y divide-line border-y border-line">
            {profile.seeking.map((role, i) => (
              <li key={role} className="flex items-baseline gap-3 py-2.5">
                <span aria-hidden="true" className="font-mono text-[0.6875rem] text-fg-dim">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[0.875rem] leading-snug text-fg">{role}</span>
              </li>
            ))}
          </ol>
        </div>
      )
    },
    {
      id: 'certification',
      className: 'lg:col-start-4 lg:row-start-2',
      children: (
        <div className={cn(tilePad, 'min-h-[13rem]')}>
          <TileHead index="05" label="certification" icon={Award} />
          <div className="mt-auto pt-8">
            <StatusChip tone="wip">{profile.certification.status}</StatusChip>
            <p className="mt-4 text-[clamp(1.35rem,1.8vw,1.7rem)] font-semibold leading-none tracking-[-0.03em] text-fg">
              {profile.certification.name}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-fg-muted">{profile.certification.note}</p>
          </div>
        </div>
      )
    },
    {
      id: 'cofounder',
      className: 'group md:col-span-2 lg:col-start-2 lg:row-start-3',
      children: (
        <TileLink to="/log/ssik" className="min-h-[15rem] overflow-hidden">
          <img
            src="/art/projects/ssik-square.webp"
            alt=""
            width={1024}
            height={1024}
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-y-0 right-0 h-full w-[60%] object-cover opacity-30 grayscale transition-[opacity,filter] duration-500 [mask-image:linear-gradient(to_right,transparent,black_45%)] group-hover:opacity-55 group-hover:grayscale-0"
          />
          <TileHead index="06" label="co-founder" icon={Handshake} linked />
          <div className="relative mt-auto pt-10">
            <p className="text-[clamp(2.5rem,4.4vw,4rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-fg">
              {ssik?.shortTitle ?? 'SSIK'}
            </p>
            <p className="mt-3 max-w-[32ch] text-[0.9375rem] leading-snug text-fg-muted">
              {ssik?.title}
              <span className="block text-fg">
                with {ssik?.collaborators?.[0] ?? 'Ghayas Sher'}
              </span>
            </p>
            <span aria-hidden="true" className="mt-5 inline-block font-mono text-[0.75rem] text-fg-muted transition-colors group-hover:text-fg">cd ~/log/ssik</span>
          </div>
        </TileLink>
      )
    },
    {
      id: 'contact',
      className: 'group lg:col-start-4 lg:row-start-3',
      children: (
        <TileLink to="/contact" className="min-h-[15rem] transition-colors duration-200 hover:bg-ink-850">
          <TileHead index="07" label="contact" icon={Send} linked />
          <div className="relative mt-auto pt-10">
            <p className="text-[clamp(1.5rem,2vw,1.875rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-fg">
              Open a <span className="text-fg-muted">channel</span>
            </p>
            <p className="mt-3 break-all font-mono text-[0.75rem] text-fg-muted">{contact.email}</p>
          </div>
        </TileLink>
      )
    }
  ];

  // Border glow tracks the pointer on desktop only; no particles, tilt, magnetism or click ripple.
  const live = fine && !reduced && !isLowPowerDevice();

  return (
    <Section aria-labelledby="dashboard-title">
      <SectionLabel index="02" path="ls ~/whoami/identity" className="mb-12 md:mb-16" />
      <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
        <SplitHeading id="dashboard-title" text="Identity," accent="on record" />
        <p className="max-w-[38ch] text-[0.9375rem] leading-relaxed text-fg-muted">
          The short version, in seven fields. Linked tiles lead to the details.
        </p>
      </div>
      <div data-rb="MagicBento">
        <MagicBento
          items={items}
          className="grid grid-flow-row-dense grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
          glowColor="232, 232, 232"
          enableStars={false}
          enableSpotlight
          spotlightBlob={false}
          spotlightRadius={280}
          enableBorderGlow
          enableTilt={false}
          enableMagnetism={false}
          clickEffect={false}
          disableAnimations={!live}
        />
      </div>
    </Section>
  );
}
