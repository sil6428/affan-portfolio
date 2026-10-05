import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { StatusTone } from '@/data/projects';

/**
 * Status dot per tone, in the same brightness order as the /log list: done work is brightest
 * (chalk), in-progress work is ash, private work is an outline. Green marks only "active",
 * the single accent a status chip may carry. Shared so every surface draws a status alike.
 */
export const toneDot: Record<StatusTone, string> = {
  verified: 'bg-chalk',
  active: 'bg-phosphor',
  wip: 'bg-ash',
  ongoing: 'bg-ash',
  private: 'ring-1 ring-inset ring-fg-dim'
};

/**
 * Small mono tag used for stacks, categories, and statuses. Text renders exactly as written (no
 * case transform, no tracking), like the business card: "IPv4/IPv6 design" stays "IPv4/IPv6 design".
 */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-[3px] border border-line-strong bg-ink-950 px-2.5 py-1 font-mono text-[0.6875rem] text-fg-muted',
        className
      )}
    >
      {children}
    </span>
  );
}

/** Status chip with a pulsing tone dot (pulse is disabled by the reduced-motion CSS). */
export function StatusChip({ tone, children, className }: { tone: StatusTone; children: ReactNode; className?: string }) {
  return (
    <Chip className={className}>
      <span aria-hidden className={cn('size-1.5 rounded-full animate-pulse-dot', toneDot[tone])} />
      {children}
    </Chip>
  );
}
