import type { ExperienceEntry } from '@/data/experience';

/**
 * In-page sections of /log, in order. Ids double as hash targets for the section nav and as the
 * shell path printed in each section's prompt ("~/log/case-files").
 */
export const LOG_SECTIONS = [
  { id: 'case-files', label: 'Case files', short: 'case-files', code: '01' },
  { id: 'experience', label: 'Experience', short: 'experience', code: '02' },
  { id: 'education', label: 'Education', short: 'education', code: '03' },
  { id: 'community', label: 'Community', short: 'community', code: '04' }
] as const;

export type LogSectionId = (typeof LOG_SECTIONS)[number]['id'];

/** Header (64px) + sticky section nav (~50px) + breathing room. */
export const SCROLL_OFFSET_CLASS = 'scroll-mt-[136px]';

/** Smoothly scrolls to an in-page section, updates the hash, and moves focus to its heading. */
export function jumpToSection(id: string, reduced: boolean) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  try {
    window.history.replaceState(window.history.state, '', `#${id}`);
  } catch {
    /* history unavailable — scrolling alone is fine */
  }
  const heading = document.getElementById(`${id}-title`);
  heading?.focus({ preventScroll: true });
}

/** Record kinds → legend label + a grey tone (filled for paid / venture work, hollow for the rest). */
export const KIND_META: Record<ExperienceEntry['kind'], { label: string; dot: string; text: string }> = {
  venture: { label: 'Venture', dot: 'bg-chalk', text: 'text-chalk' },
  operations: { label: 'Operations', dot: 'bg-fg-muted', text: 'text-fg-muted' },
  work: { label: 'Work', dot: 'bg-fg-dim', text: 'text-fg-dim' },
  education: { label: 'Education', dot: 'ring-1 ring-inset ring-fg-muted', text: 'text-fg-muted' },
  community: { label: 'Community', dot: 'ring-1 ring-inset ring-fg-dim', text: 'text-fg-dim' }
};

export function startYear(entry: ExperienceEntry): string {
  return entry.start.slice(0, 4);
}

/** Short process-style role: text before "·" or "—", lower-cased. */
export function shortRole(entry: ExperienceEntry): string {
  return entry.role.split(/\s[·—]\s/)[0].trim().toLowerCase();
}

/** Log-record line, e.g. "[2026-05] SSIK :: co-founder". */
export function recordLine(entry: ExperienceEntry): string {
  return `[${entry.start}] ${entry.id.toUpperCase()} :: ${shortRole(entry)}`;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** 'YYYY-MM' → Date at the first of that month (local time). */
export function monthStart(ym: string): Date {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, (m || 1) - 1, 1);
}

/** Local calendar date as YYYY-MM-DD (client clock — a telemetry stamp, not a claim). */
export function isoDay(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
