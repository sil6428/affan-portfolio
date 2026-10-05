import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionProps {
  id?: string;
  /** Mono index printed in the section rail, e.g. '§02'. */
  index?: string;
  /** Mono label beside the index, e.g. 'EVIDENCE BOARD'. */
  label?: string;
  className?: string;
  /** Wrap children in the standard max-width container (default true). */
  contained?: boolean;
  children: ReactNode;
  'aria-labelledby'?: string;
}

/**
 * Standard section: generous vertical rhythm, a hairline rule with a coordinate label,
 * and the shared max-width container.
 */
export default function Section({
  id,
  index,
  label,
  className,
  contained = true,
  children,
  ...rest
}: SectionProps) {
  return (
    <section id={id} aria-labelledby={rest['aria-labelledby']} className={cn('relative py-20 md:py-32', className)}>
      {(index || label) && (
        <div className="container-signal mb-10 md:mb-14">
          <div className="flex items-center gap-4">
            {index && <span className="label text-fg-dim">{index}</span>}
            {label && <span className="label">{label}</span>}
            <span aria-hidden className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}
      {contained ? <div className="container-signal">{children}</div> : children}
    </section>
  );
}
