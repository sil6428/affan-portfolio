import { Fragment, useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import TextType from '@/components/reactbits/TextType';
import { ASCII_MONOGRAM } from '@/data/card';
import { profile } from '@/data/profile';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';

/** "Expected Apr. 2028", taken from the education date label; lower-cased only at the start ("expected Apr. 2028"). */
const EXPECTED = profile.education.dateLabel.split('— ').pop() ?? profile.education.dateLabel;
const EXPECTED_INLINE = EXPECTED.charAt(0).toLowerCase() + EXPECTED.slice(1);

/** Output of `whoami`, built only from profile data. */
const OUTPUT: Array<{ key: string; value: string; tone?: 'status' }> = [
  { key: 'name', value: profile.name },
  { key: 'title', value: profile.title },
  { key: 'location', value: profile.location },
  { key: 'school', value: `${profile.education.school}, ${EXPECTED_INLINE}` },
  { key: 'degree', value: `${profile.education.degree}, ${profile.education.major}` },
  { key: 'focus', value: profile.focus },
  { key: 'status', value: profile.status, tone: 'status' },
  { key: 'seeking', value: profile.seeking.join(' · ') }
];

/** The site palette as neofetch colour blocks: mostly ink and greys, one phosphor, one rust — like the card. */
const SWATCHES = ['bg-ink-950', 'bg-ink-700', 'bg-fg-dim', 'bg-fg-muted', 'bg-chalk', 'bg-phosphor', 'bg-rust'];

type Phase = 'command' | 'output' | 'done';

function Prompt() {
  return (
    <span className="shrink-0 select-none">
      <span className="text-fg-muted">affan@shaikh</span>
      <span className="text-fg-dim">:</span>
      <span className="text-chalk">~/whoami</span>
      <span className="text-fg-dim">$</span>
    </span>
  );
}

const lineIn = (i: number, reduced: boolean) => ({
  initial: reduced ? false : { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay: i * 0.07, duration: 0.25, ease: 'linear' as const }
});

/**
 * A terminal that answers `whoami`, laid out like neofetch: the card's ASCII monogram on the
 * left, the profile on the right. TextType types the command, then the output prints line by
 * line. Screen readers get a static definition list; the animation is aria-hidden.
 */
export default function WhoamiTerminal({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const [rawPhase, setPhase] = useState<Phase>(reduced ? 'done' : 'command');
  // Reduced motion always shows the finished transcript.
  const phase: Phase = reduced ? 'done' : rawPhase;

  const handleTyped = useCallback(() => {
    window.setTimeout(() => setPhase('output'), 220);
  }, []);

  useEffect(() => {
    if (phase !== 'output') return;
    const t = window.setTimeout(() => setPhase('done'), (OUTPUT.length + 3) * 70 + 300);
    return () => window.clearTimeout(t);
  }, [phase]);

  const rerun = () => {
    if (reduced) return;
    setPhase('command');
    setRun((r) => r + 1);
  };

  const showOutput = phase !== 'command';

  return (
    <div data-rb="TextType" className={cn('panel brackets overflow-hidden', className)}>
      {/* Title bar */}
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[0.75rem] text-fg-muted">
          <span className="text-fg-dim">[tty1]</span> <span className="hidden sm:inline">affan@shaikh: </span>~/whoami
        </span>
        {/* Reduced motion shows the finished transcript only, so there is nothing to replay. */}
        {!reduced && (
          <button
            type="button"
            onClick={rerun}
            disabled={phase !== 'done'}
            className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[3px] border border-line-strong px-2.5 py-1.5 font-mono text-[0.6875rem] text-fg-muted transition-[color,border-color] duration-200 hover:border-fg/40 hover:text-fg active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw
              aria-hidden="true"
              size={12}
              strokeWidth={1.75}
              className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-180"
            />
            run again
          </button>
        )}
      </div>

      {/* Accessible static transcript */}
      <div className="sr-only">
        <p>Terminal: whoami</p>
        <dl>
          {OUTPUT.map((line) => (
            <div key={line.key}>
              <dt>{line.key}</dt>
              <dd>{line.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Animated transcript (decorative duplicate of the list above) */}
      <div
        aria-hidden="true"
        className="min-h-[24rem] px-4 py-4 font-mono text-[0.78rem] leading-[1.65] text-fg sm:min-h-[20.5rem] sm:px-5 sm:py-5 sm:text-[0.8125rem]"
      >
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Prompt />
          {reduced ? (
            <span>whoami</span>
          ) : (
            <TextType
              key={run}
              as="span"
              text="whoami"
              loop={false}
              typingSpeed={90}
              initialDelay={600}
              startOnVisible
              showCursor={phase === 'command'}
              cursorCharacter="█"
              cursorClassName="text-fg-muted"
              cursorBlinkDuration={0.5}
              className="tracking-normal"
              onTypingComplete={handleTyped}
            />
          )}
        </div>

        {showOutput && (
          <div key={run} className="mt-3 flex gap-6">
            <motion.pre
              {...lineIn(0, reduced)}
              className="ascii m-0 hidden shrink-0 pt-1 text-[10px] text-fg-muted sm:block"
            >
              {ASCII_MONOGRAM}
            </motion.pre>

            <div className="min-w-0 flex-1">
              <motion.p {...lineIn(0, reduced)}>
                <span className="font-semibold text-fg">affan</span>
                <span className="text-fg-dim">@</span>
                <span className="font-semibold text-fg">shaikh</span>
              </motion.p>
              <motion.p {...lineIn(1, reduced)} className="text-fg-dim">
                ───────────────────
              </motion.p>
              <dl className="grid grid-cols-[minmax(0,4.75rem)_minmax(0,1fr)] gap-x-3 sm:grid-cols-[5.25rem_minmax(0,1fr)]">
                {OUTPUT.map((line, i) => (
                  <Fragment key={line.key}>
                    <motion.dt {...lineIn(i + 2, reduced)} className="text-fg-dim">
                      {line.key}
                    </motion.dt>
                    <motion.dd
                      {...lineIn(i + 2, reduced)}
                      className="min-w-0 break-words text-fg"
                    >
                      {line.tone === 'status' && (
                        <span className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-phosphor animate-pulse-dot" />
                      )}
                      {line.value}
                    </motion.dd>
                  </Fragment>
                ))}
              </dl>
              <motion.div {...lineIn(OUTPUT.length + 2, reduced)} className="mt-3 flex">
                {SWATCHES.map((c) => (
                  <span key={c} className={cn('h-3 w-5 border-y border-line first:border-l', c)} />
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="mt-3 flex items-baseline">
            <Prompt />
            <span className="ml-2 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] bg-phosphor animate-blink" />
          </div>
        )}
      </div>
    </div>
  );
}
