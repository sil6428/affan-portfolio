import type { ReactNode } from 'react';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import FadeContent from '@/components/reactbits/FadeContent';
import SplitText from '@/components/reactbits/SplitText';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';

/**
 * Reduced-motion aware wrappers around the shared ReactBits reveal components.
 * The shared components animate with GSAP regardless of preference, so each wrapper
 * renders a plain, final-state element when motion is reduced.
 */

type RevealKind = 'rise' | 'slide' | 'resolve';

interface RevealProps {
  children: ReactNode;
  /** rise = AnimatedContent (vertical) · slide = AnimatedContent (horizontal) · resolve = FadeContent (opacity only) */
  kind?: RevealKind;
  delay?: number;
  distance?: number;
  className?: string;
}

export function Reveal({ children, kind = 'rise', delay = 0, distance, className }: RevealProps) {
  const reduced = useReducedMotion();
  const rbName = kind === 'resolve' ? 'FadeContent' : 'AnimatedContent';

  if (reduced) {
    return (
      <div data-rb={rbName} className={className}>
        {children}
      </div>
    );
  }

  if (kind === 'resolve') {
    // Opacity only: a blur filter on long prose is expensive to paint on phones.
    return (
      <FadeContent data-rb={rbName} duration={700} delay={delay} ease="power2.out" threshold={0.15} className={className}>
        {children}
      </FadeContent>
    );
  }

  return (
    <AnimatedContent
      data-rb={rbName}
      direction={kind === 'slide' ? 'horizontal' : 'vertical'}
      distance={distance ?? (kind === 'slide' ? -32 : 40)}
      duration={0.75}
      ease="expo.out"
      delay={delay}
      threshold={0.12}
      className={className}
    >
      {children}
    </AnimatedContent>
  );
}

interface SplitHeadingProps {
  id: string;
  text: string;
  className?: string;
  /** Optional second half of the heading, using the business card's restrained phosphor accent. */
  accent?: string;
}

/** Section h2: the real text for assistive tech, SplitText char rise for everyone else. */
export function SplitHeading({ id, text, className, accent }: SplitHeadingProps) {
  const reduced = useReducedMotion();
  return (
    <h2
      id={id}
      data-rb="SplitText"
      className={cn('text-[clamp(2rem,4.4vw,4rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-fg', className)}
    >
      <span className="sr-only">
        {text}
        {accent ? ` ${accent}` : ''}
      </span>
      {/* Flex + baseline so the accent word lines up with SplitText's inline-block output. */}
      <span aria-hidden="true" className="flex flex-wrap items-baseline gap-x-[0.6em]">
        {reduced ? (
          <span>{text}</span>
        ) : (
          <SplitText
            text={text}
            tag="span"
            splitType="chars"
            delay={22}
            duration={0.6}
            ease="power3.out"
            from={{ opacity: 0, y: '0.35em' }}
            to={{ opacity: 1, y: 0 }}
            textAlign="left"
            rootMargin="-60px"
          />
        )}
        {accent && <span className="text-phosphor">{accent}</span>}
      </span>
    </h2>
  );
}

/** "## 01  cat ~/whoami/context.md" — the section index line. Decorative: screen readers go straight to the h2. */
export function SectionLabel({ index, path, className }: { index: string; path: string; className?: string }) {
  return (
    <p aria-hidden="true" className={cn('label flex items-center gap-3 normal-case tracking-[0.06em]', className)}>
      <span className="text-fg-dim">## {index}</span>
      <span className="text-fg-muted">{path}</span>
      <span className="h-px flex-1 bg-line" />
    </p>
  );
}
