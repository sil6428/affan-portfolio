import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import StatusMark from '@/components/reactbits/StatusMark';
import LatticeLoader from '@/components/reactbits/LatticeLoader';
import TextType from '@/components/reactbits/TextType';
import RB from '@/components/ui/RB';
import TermField from '@/components/ui/TermField';
import { CARD_SUBTITLE } from '@/data/card';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import { useReducedMotion } from '@/lib/motion';
import { useIsMobile } from '@/lib/media';
import { endBoot } from '@/lib/boot';
import AsciiName from './AsciiName';
import { BOOT_KEY, shouldBoot } from './bootGate';


/** Boot output, all from real data. */
const STEPS = [
  { cmd: 'ls ~/log', value: `${String(projects.length).padStart(2, '0')} case files` },
  { cmd: 'locate affan', value: profile.location },
  { cmd: 'cat status', value: profile.status }
];

// Timeline (ms). The whole boot is ~1.9s and any key, click or tap skips it.
const T_NAME = 430;
const T_SUBTITLE = 860;
const T_STEP0 = 980;
const T_STEP_GAP = 190;
const T_DONE = T_STEP0 + STEPS.length * T_STEP_GAP + 80;
const T_EXIT = T_DONE + 360;

const CLEAR = [{ x0: 4, y0: 18, x1: 96, y1: 84 }];

/**
 * First visit per session: a terminal boot over the already-mounted page. A prompt types `whoami`,
 * the card's ASCII name prints in phosphor, then a few status lines resolve from real data.
 * No WebGL — just DOM, so it is cheap on phones. Skipped under reduced motion. Hidden from assistive
 * tech (no live region), so its typing is never announced; the page underneath stays reachable.
 */
export default function BootSequence() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(() => shouldBoot(reduced));
  const [t, setT] = useState(0);

  const finish = useCallback(() => {
    try {
      window.sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      /* storage unavailable */
    }
    setVisible(false);
    // The exit fade starts now: let the page's own intro (the home hero) play into it.
    endBoot();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const marks = [T_NAME, T_SUBTITLE, ...STEPS.flatMap((_, i) => [T_STEP0 + i * T_STEP_GAP, T_STEP0 + i * T_STEP_GAP + 120]), T_DONE];
    const timers = marks.map((m) => window.setTimeout(() => setT(m), m));
    timers.push(window.setTimeout(finish, T_EXIT));

    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [visible, finish]);

  const done = t >= T_DONE;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink-950"
          aria-hidden
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <TermField seed={3} clear={CLEAR} grid={[9, 6]} glyphRatio={0.22} interactive={false} className="opacity-60" />

          <div className="relative w-full max-w-[64rem] px-5 font-mono sm:px-10">
            <p className="flex items-center text-[0.8125rem] text-fg-muted">
              <span className="text-fg-dim">affan@shaikh</span>
              <span>:~$&nbsp;</span>
              <RB name="TextType" as="span" className="text-fg">
                <TextType
                  as="span"
                  text="whoami"
                  typingSpeed={55}
                  initialDelay={90}
                  loop={false}
                  showCursor
                  cursorCharacter="█"
                  cursorClassName="text-phosphor"
                />
              </RB>
            </p>

            <div className="mt-6 min-h-[16.4em] text-[calc((100vw-5rem)/37)] md:min-h-[8.4em] md:text-[min(1.12vw,13px)]">
              {t >= T_NAME && <AsciiName stacked={isMobile} animate className="leading-[1.05]" />}
            </div>

            <p
              className="mt-5 text-[0.9375rem] text-fg transition-opacity duration-300 sm:text-base"
              style={{ opacity: t >= T_SUBTITLE ? 1 : 0 }}
            >
              {CARD_SUBTITLE}
            </p>

            <RB name="StatusMark" as="section" className="mt-8 max-w-xl">
              <ol className="space-y-2 text-[0.75rem]" aria-label="Boot steps">
                {STEPS.map((s, i) => {
                  const start = T_STEP0 + i * T_STEP_GAP;
                  const status = t >= start + 120 ? 'done' : t >= start ? 'running' : 'pending';
                  return (
                    <li key={s.cmd} className="flex items-center gap-3" style={{ opacity: status === 'pending' ? 0.35 : 1 }}>
                      <StatusMark status={status} size={14} color="#a8a8a8" doneColor="#e8e8e8" />
                      <span className="text-fg-muted">{s.cmd}</span>
                      <span aria-hidden className="h-px min-w-6 flex-1 border-t border-dashed border-line-strong" />
                      <span className={status === 'done' ? 'text-fg' : 'text-fg-muted'}>{status === 'done' ? s.value : '…'}</span>
                    </li>
                  );
                })}
              </ol>
            </RB>

            <div className="mt-8 flex max-w-xl items-center justify-between gap-4 border-t border-line pt-4">
              <RB name="LatticeLoader" as="span">
                <LatticeLoader
                  status={done ? 'done' : 'working'}
                  label="booting"
                  doneLabel="ready"
                  color="#a8a8a8"
                  doneColor="#e8e8e8"
                  grid={3}
                  cellSize={4}
                  gap={2}
                  fontSize={12}
                  showTimer
                />
              </RB>
              {/* The overlay is aria-hidden (decorative, never announced); any key or tap dismisses it,
                  so this key is for the mouse only and stays out of the Tab order. */}
              <button
                type="button"
                tabIndex={-1}
                onClick={finish}
                className="rounded-[3px] border border-line-strong px-3 py-1.5 text-[0.75rem] text-fg-muted transition-colors hover:border-fg/40 hover:text-fg"
              >
                skip ↵
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
