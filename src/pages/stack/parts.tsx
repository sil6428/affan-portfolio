import type { ReactNode } from 'react';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LISTED_ONLY, projectsFor, type SkillNode } from './data';

/** In-page jump link styled like the shared LinkButton (router Links don't scroll to hashes). */
export function AnchorButton({
  href,
  children,
  variant = 'secondary'
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <a
      href={href}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2 rounded-[3px] px-6 py-3.5 font-mono text-[0.8125rem] normal-case tracking-normal transition-[background,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97]',
        variant === 'primary'
          ? 'border border-fg bg-fg text-ink-950 hover:bg-fg/10 hover:text-fg'
          : 'border border-line-strong bg-ink-950 text-fg hover:border-fg/60 hover:bg-ink-850'
      )}
    >
      <span>{children}</span>
      <ArrowDown
        aria-hidden
        size={15}
        strokeWidth={1.75}
        className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0.5"
      />
    </a>
  );
}

/** Tooltip body for a skill: where it was used, or that it is listed only. */
export function SkillTipContent({ skill }: { skill: SkillNode }) {
  const used = projectsFor(skill);
  if (used.length === 0) {
    return <span className="text-[12px]">{LISTED_ONLY}</span>;
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] opacity-60">used in</span>
      <span>{used.map((p) => p.title).join(', ')}</span>
    </span>
  );
}

/** "## 01  ~/stack/map ────" — the section index line. Decorative: screen readers skip it and land on the h2. */
export function StackLabel({ index, path }: { index: string; path: string }) {
  return (
    <p aria-hidden className="mb-12 flex items-center gap-3 font-mono text-[0.75rem] md:mb-16">
      <span className="text-fg-dim">## {index}</span>
      <span className="text-fg-muted">{path}</span>
      <span className="h-px flex-1 bg-line" />
    </p>
  );
}

/** Section heading block: h2 + optional lede, shared rhythm across the page. */
export function SectionHead({
  id,
  kicker,
  title,
  children,
  aside,
  stacked = false
}: {
  id: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  /** Single column (for heads that sit in a side column of a split layout). */
  stacked?: boolean;
}) {
  const kick = (
    <p className="mb-4 font-mono text-[0.8125rem] text-fg-muted">
      <span aria-hidden className="text-fg-dim"># </span>
      {kicker}
    </p>
  );
  if (stacked) {
    return (
      <div>
        {kick}
        <h2
          id={id}
          className="text-[clamp(2rem,3.6vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-fg"
        >
          {title}
        </h2>
        {children && <div className="mt-5 max-w-[46ch] text-base leading-relaxed text-fg-muted">{children}</div>}
      </div>
    );
  }
  return (
    <div className="mb-10 grid gap-6 md:mb-14 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        {kick}
        <h2
          id={id}
          className="text-[clamp(2rem,4.2vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-fg"
        >
          {title}
        </h2>
        {children && <div className="mt-5 max-w-[62ch] text-base leading-relaxed text-fg-muted">{children}</div>}
      </div>
      {aside && <div className="lg:col-span-5 lg:justify-self-end">{aside}</div>}
    </div>
  );
}
