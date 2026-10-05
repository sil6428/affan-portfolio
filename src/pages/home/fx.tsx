import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import RB from '@/components/ui/RB';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';

/**
 * Gentle rise-in for a few panels. AnimatedContent starts hidden and plays on scroll, so in
 * reduced motion it is replaced by a plain element that is visible immediately.
 */
export function Rise({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <RB name="AnimatedContent" className={className}>
      <AnimatedContent distance={24} duration={0.7} ease="power3.out" delay={delay} threshold={0.12}>
        {children}
      </AnimatedContent>
    </RB>
  );
}

/** One shell prompt line: `affan@shaikh:~/log$ ls case-files`. Grey like the card; only the command is bright. */
export function Prompt({ path = '~', cmd, className, decorative = false }: { path?: string; cmd: string; className?: string; decorative?: boolean }) {
  return (
    <p aria-hidden={decorative || undefined} className={cn('font-mono text-[0.8125rem] leading-relaxed break-words', className)}>
      <span className="text-fg-dim">affan@shaikh:</span>
      <span className="text-fg-muted">{path}</span>
      <span className="text-fg-dim">$ </span>
      <span className="text-chalk">{cmd}</span>
    </p>
  );
}

/** Section opener: a prompt line, then the white headline (the command's "output"). */
export function SectionHead({
  id,
  path,
  cmd,
  title,
  aside,
  className
}: {
  id: string;
  path?: string;
  cmd: string;
  title: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-10 gap-y-6', className)}>
      <div className="min-w-0">
        {/* Decoration: the h2 below is the heading screen readers need. */}
        <Prompt path={path} cmd={cmd} decorative />
        <h2 id={id} className="mt-4 text-[clamp(1.875rem,4.6vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-fg">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}

/**
 * Terminal-style link button. With a label, the shell path is a dim, decorative prefix and the
 * bold label is the link's name; without one, the path itself is the bold name.
 */
export function CmdLink({
  to,
  path,
  label,
  primary = false,
  className
}: {
  to: string;
  path: string;
  label?: string;
  primary?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex items-center gap-2.5 rounded-[3px] px-6 py-3.5 font-mono text-[0.8125rem] transition-[background-color,color,border-color] duration-200 ease-[var(--ease-out-expo)]',
        // Same as the shared Button: white primary that turns to an outline on hover, grey-outlined secondary.
        primary
          ? 'border border-fg bg-fg text-ink-950 hover:bg-fg/10 hover:text-fg'
          : 'border border-line-strong bg-ink-950 text-fg hover:border-fg/60 hover:bg-ink-850',
        className
      )}
    >
      {label ? (
        <>
          <span aria-hidden className={cn('font-normal', primary ? 'text-ink-950/60 group-hover:text-fg-muted' : 'text-fg-dim group-hover:text-fg-muted')}>
            {path}
          </span>
          <span className="font-semibold">{label}</span>
        </>
      ) : (
        <span className="font-semibold">{path}</span>
      )}
      <ArrowRight aria-hidden size={15} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}

/** Small text link with an arrow, for "all case files →" style asides. */
export function MoreLink({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex items-center gap-2 font-mono text-[0.875rem] text-fg-muted transition-colors duration-200 hover:text-fg',
        className
      )}
    >
      <span className="link-underline">{children}</span>
      <ArrowRight aria-hidden size={15} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}
