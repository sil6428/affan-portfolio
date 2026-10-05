import type { ReactNode } from 'react';
import DecryptedText from '@/components/reactbits/DecryptedText';
import FadeContent from '@/components/reactbits/FadeContent';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { DECRYPT_CHARS } from './util';

interface DecryptProps {
  text: string;
  className?: string;
  /** Classes for characters that are still scrambled. */
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover' | 'inViewHover';
  speed?: number;
  sequential?: boolean;
}

/**
 * Accessible DecryptedText: screen readers get the real text exactly once (the vendored
 * component's sr-only copy is hidden), and reduced motion renders the final text.
 */
export function Decrypt({ text, className, encryptedClassName, animateOn = 'view', speed = 40, sequential = true }: DecryptProps) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <span className="relative inline">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        <DecryptedText
          text={text}
          animateOn={animateOn}
          sequential={sequential}
          revealDirection="start"
          speed={speed}
          maxIterations={10}
          characters={DECRYPT_CHARS}
          encryptedClassName={encryptedClassName ?? 'text-fg-dim'}
          parentClassName={className}
        />
      </span>
    </span>
  );
}

/** "## 02  spec sheet ──────" — the section index used down a case file. */
export function CoordLabel({ code, children, className }: { code: string; children: ReactNode; className?: string }) {
  return (
    <div aria-hidden className={cn('flex items-center gap-3 font-mono text-[12px]', className)}>
      <span className="text-fg-dim">## {code}</span>
      <span className="text-fg-muted">{children}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

/** Quiet entrance for a block (ReactBits FadeContent, opacity only — no blur on long text). */
export function Resolve({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <FadeContent blur={false} duration={600} delay={delay} ease="power2.out" threshold={0.1} className={className}>
      {children}
    </FadeContent>
  );
}
