import { lazy, Suspense, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/motion';
import { LOG_SECTIONS, pad2, type LogSectionId } from './model';

const AnimatedContent = lazy(() => import('@/components/reactbits/AnimatedContent'));
const DecryptedText = lazy(() => import('@/components/reactbits/DecryptedText'));

/**
 * Shell prompt, as printed on the card's terminal: "affan@shaikh:~/log$ ls -la case-files".
 * Decorative by default (the heading that follows carries the meaning).
 */
export function Prompt({
  path,
  command,
  caret = false,
  className,
  decorative = true
}: {
  path: string;
  command?: ReactNode;
  caret?: boolean;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <p
      aria-hidden={decorative || undefined}
      className={cn('min-w-0 font-mono text-[12px] leading-relaxed tracking-[0.01em] md:text-[13px]', className)}
    >
      <span className="text-fg-dim">affan@shaikh</span>
      <span className="text-fg-dim">:</span>
      <span className="text-fg-muted">{path}</span>
      <span className="text-fg-dim">$ </span>
      {command ? <span className="text-fg-muted">{command}</span> : null}
      {caret ? (
        <span aria-hidden className="ml-1 inline-block h-[1.05em] w-[0.6em] translate-y-[0.2em] bg-phosphor motion-safe:animate-blink" />
      ) : null}
    </p>
  );
}

interface SectionHeadProps {
  id: LogSectionId;
  /** The command echoed in the prompt above the heading, e.g. "ls -la". */
  command: string;
  title: ReactNode;
  kicker?: ReactNode;
  className?: string;
  aside?: ReactNode;
}

/** Prompt line + "## 02 / 06" index + the h2 for an in-page log section. */
export function SectionHead({ id, command, title, kicker, className, aside }: SectionHeadProps) {
  const i = LOG_SECTIONS.findIndex((s) => s.id === id);
  return (
    <header className={cn('mb-10 md:mb-14', className)}>
      <div aria-hidden className="mb-6 flex items-center gap-4 border-b border-line pb-3">
        <Prompt path={`~/log/${id}`} command={command} className="truncate" />
        <span aria-hidden className="ml-auto shrink-0 font-mono text-[11px] tracking-[0.08em] text-fg-dim">
          ## {pad2(i + 1)}/{pad2(LOG_SECTIONS.length)}
        </span>
      </div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 max-w-3xl">
          <h2
            id={`${id}-title`}
            tabIndex={-1}
            className="text-[clamp(2rem,4.6vw,3.75rem)] font-semibold leading-[1] tracking-[-0.03em] text-fg outline-none"
          >
            {title}
          </h2>
          {kicker ? <p className="mt-5 max-w-[62ch] text-[15px] leading-relaxed text-fg-muted md:text-base">{kicker}</p> : null}
        </div>
        {aside}
      </div>
    </header>
  );
}

/**
 * Scroll-triggered entrance (ReactBits AnimatedContent): a short rise + fade, transform/opacity only.
 * Reduced motion renders the content statically — AnimatedContent starts `invisible`, so it is never
 * mounted in that mode.
 */
export function Reveal({
  children,
  className,
  distance = 28,
  delay = 0
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <div data-rb="AnimatedContent" className={className}>
      <Suspense fallback={<div className="invisible">{children}</div>}>
        <AnimatedContent
          distance={distance}
          direction="vertical"
          delay={delay}
          duration={0.7}
          ease="power3.out"
          initialOpacity={0}
          threshold={0.12}
          className="h-full"
        >
          {children}
        </AnimatedContent>
      </Suspense>
    </div>
  );
}

/**
 * Decrypting mono label (ReactBits DecryptedText) — for decorative labels only (e.g. the activity
 * terminal's stdout line), never for factual values, which must read correctly in any screenshot. The scrambled glyphs are aria-hidden and
 * an sr-only copy carries the real text (the vendored component hides its own sr copy with
 * `visibility: hidden`). Reduced motion prints the final text.
 */
export function Decrypt({
  text,
  className,
  animateOn = 'view',
  speed = 40,
  sequential = true,
  encryptedClassName = 'text-fg-dim'
}: {
  text: string;
  className?: string;
  animateOn?: 'view' | 'hover' | 'inViewHover';
  speed?: number;
  sequential?: boolean;
  encryptedClassName?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <span className={className}>{text}</span>;
  return (
    <span data-rb="DecryptedText" className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        <Suspense fallback={text}>
          <DecryptedText
            text={text}
            animateOn={animateOn}
            speed={speed}
            maxIterations={12}
            sequential={sequential}
            revealDirection="start"
            characters="abcdef0123456789:/[]#-_."
            className="text-current"
            encryptedClassName={encryptedClassName}
          />
        </Suspense>
      </span>
    </span>
  );
}
