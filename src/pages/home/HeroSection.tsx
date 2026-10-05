import { Fragment, lazy, Suspense, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ArrowDown } from 'lucide-react';
import { profile } from '@/data/profile';
import { ASCII_NAME, ASCII_NAME_STACKED, CARD_SUBTITLE } from '@/data/card';
import { useReducedMotion } from '@/lib/motion';
import { useBooting } from '@/lib/boot';
import { isLowPowerDevice, useIsDesktop, useIsMobile } from '@/lib/media';
import InView from '@/lib/InView';
import RB from '@/components/ui/RB';
import TermField, { type ClearZone } from '@/components/ui/TermField';
import DecryptedText from '@/components/reactbits/DecryptedText';
import TextType from '@/components/reactbits/TextType';
import { CmdLink } from './fx';

// ogl stays out of the initial chunk; the radar only ever mounts on capable desktops.
const Radar = lazy(() => import('@/components/reactbits/Radar'));

/** Where the scattered card words must not land (percent of the hero). */
const CLEAR_DESKTOP: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 8 }, // header
  { x0: 28, y0: 11, x1: 62, y1: 22 }, // status chip
  { x0: 5, y0: 21, x1: 96, y1: 44 }, // the name
  { x0: 20, y0: 43, x1: 70, y1: 79 }, // subtitle, intro, facts, actions
  { x0: 80, y0: 80, x1: 100, y1: 88 }, // scroll cue
  { x0: 37, y0: 89, x1: 63, y1: 100 } // dock
];
/** Tablets show the stacked name, which is taller and narrower. */
const CLEAR_TABLET: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 8 },
  { x0: 22, y0: 19, x1: 78, y1: 27 }, // status chip
  { x0: 8, y0: 26, x1: 87, y1: 52 }, // the stacked name
  { x0: 6, y0: 51, x1: 90, y1: 77 }, // subtitle, intro, facts, actions
  { x0: 82, y0: 85, x1: 100, y1: 93 },
  { x0: 28, y0: 90, x1: 72, y1: 100 }
];
const CLEAR_MOBILE: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 9 },
  { x0: 0, y0: 15, x1: 100, y1: 88 }
];

/**
 * The figlet name from the card. Each line decrypts from stray stroke characters into the art,
 * top to bottom (ReactBits DecryptedText, one instance per line, staggered by iteration count).
 */
const DECRYPT_SPEED = 40;
const decryptIterations = (row: number) => 5 + row * 2;

function AsciiName({ animate, stacked }: { animate: boolean; stacked: boolean }) {
  const blocks = (stacked ? ASCII_NAME_STACKED : [ASCII_NAME]).map((b) => b.split('\n'));
  const cols = Math.max(...blocks.flat().map((l) => l.length));
  const rows = blocks.flat().length;
  // Rows whose decrypt has finished go back to one plain span each (DecryptedText keeps one span
  // per character, ~800 for the whole figlet). Rows finish top to bottom, so a count is enough.
  const [settled, setSettled] = useState(0);
  useEffect(() => {
    if (!animate) return;
    const timers = Array.from({ length: rows }, (_, i) =>
      window.setTimeout(() => setSettled((n) => Math.max(n, i + 1)), decryptIterations(i) * DECRYPT_SPEED + 250)
    );
    return () => timers.forEach(clearTimeout);
  }, [animate, rows]);
  let row = 0;

  return (
    <div aria-hidden className="home-ascii w-full" style={{ '--ascii-cols': cols, '--ascii-max': stacked ? '15px' : '17px' } as CSSProperties}>
      <div className="home-ascii-art ascii mx-auto w-max text-phosphor">
        {blocks.map((lines, b) => (
          <div key={b} className={b ? 'mt-[0.5em]' : undefined}>
            {lines.map((line) => {
              const i = row++;
              if (!animate || i < settled) {
                return (
                  <span key={i} className="block">
                    {line}
                  </span>
                );
              }
              return (
                <DecryptedText
                  key={i}
                  text={line}
                  animateOn="view"
                  speed={DECRYPT_SPEED}
                  maxIterations={decryptIterations(i)}
                  characters={'/\\|_-:.'}
                  className="text-phosphor"
                  encryptedClassName="text-phosphor-deep"
                  style={{ display: 'block', whiteSpace: 'pre' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.01, delay: 0.08 + i * 0.05 }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/** The card's one white line, typed out after the name resolves, ending on a block caret. */
function Subtitle({ animate, delay }: { animate: boolean; delay: number }) {
  const caretBox = 'ml-[0.15em] inline-block h-[1.05em] w-[0.55em] translate-y-[0.16em] bg-phosphor';
  const caret = <span aria-hidden className={`${caretBox} animate-blink`} />;
  // Width placeholder only: invisible, so it must not run its own blink animation.
  const caretSpace = <span aria-hidden className={caretBox} />;
  const type = 'text-[clamp(0.875rem,1.45vw,1.3125rem)] font-medium tracking-normal text-fg';
  if (!animate) {
    return (
      <p className={type}>
        {CARD_SUBTITLE}
        {caret}
      </p>
    );
  }
  return (
    <p className={`${type} relative`}>
      <span className="sr-only">{CARD_SUBTITLE}</span>
      {/* Reserve the final width so the centred line does not drift while it types. */}
      <span aria-hidden className="invisible">
        {CARD_SUBTITLE}
        {caretSpace}
      </span>
      <RB name="TextType" as="span" className="absolute inset-0 text-left">
        <span aria-hidden>
          <TextType
            as="span"
            text={CARD_SUBTITLE}
            loop={false}
            showCursor={false}
            typingSpeed={34}
            initialDelay={delay}
            className="tracking-normal!"
          />
          {caret}
        </span>
      </RB>
    </p>
  );
}

/** 'Sept. 2024 — Expected Apr. 2028' → 'Apr. 2028' (falls back to the raw 'YYYY-MM' end date). */
const GRAD = /expected\s+(.+)$/i.exec(profile.education.dateLabel)?.[1] ?? profile.education.expectedEnd;

/**
 * Pieces wrap as whole units at phone width, never mid-phrase. Each dot sits inside the piece before
 * it, so a wrapped line can end on a dot but never start with one.
 */
function Pieces({ items }: { items: readonly string[] }) {
  return (
    <>
      {items.map((s, i) => (
        <Fragment key={s}>
          <span className="inline-block">
            {s}
            {i < items.length - 1 && <span className="text-fg-dim">{' ·'}</span>}
          </span>
          {i < items.length - 1 && ' '}
        </Fragment>
      ))}
    </>
  );
}

/** What a recruiter screens for first: the degree and when it ends, where, and which roles. Static text. */
function ScreeningFacts() {
  return (
    <div className="mt-5 max-w-[84ch] space-y-1 font-mono text-[0.875rem] leading-relaxed sm:text-[0.9375rem]">
      <p className="text-fg">
        {/* The degree is wider than a phone line, so there it takes a line of its own (no line opens on a dot). */}
        <span className="block sm:inline">
          {profile.education.degree}
          <span className="hidden text-fg-dim sm:inline">{' · '}</span>
        </span>
        <Pieces items={[`expected ${GRAD}`, profile.locationShort]} />
      </p>
      {/* A hair of negative tracking on phones keeps "Security operations · Systems administration ·" on one line. */}
      <p className="text-[0.8125rem] tracking-[-0.02em] text-fg-muted sm:text-[0.875rem] sm:tracking-normal">
        <span className="text-fg-dim">seeking co-op: </span>
        <Pieces items={profile.seeking} />
      </p>
    </div>
  );
}

export default function HeroSection() {
  const reduced = useReducedMotion();
  const booting = useBooting();
  const mobile = useIsMobile();
  const desktop = useIsDesktop();
  const lowPower = useMemo(() => isLowPowerDevice(), []);
  const radar = desktop && !reduced && !lowPower;
  // On a first visit the boot overlay covers the page: hold the name and subtitle static under it,
  // then let them decrypt / type as the overlay starts to fade.
  const intro = !reduced && !booting;

  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-svh flex-col overflow-hidden bg-ink-950">
      <h1 id="hero-title" className="sr-only">
        {profile.name}
      </h1>

      {/* Card texture + one quiet animated layer (desktop only). */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {radar && (
          <RB name="Radar" className="home-radar absolute inset-0 opacity-80">
            <InView className="absolute inset-0" rootMargin="0px">
              <Suspense fallback={null}>
                {/* Grey like the card texture: green on this screen belongs to the name. */}
                <Radar
                  color="#707070"
                  backgroundColor="#000000"
                  scale={0.62}
                  ringCount={5}
                  ringThickness={0.012}
                  spokeCount={12}
                  spokeThickness={0.0016}
                  speed={0.05}
                  sweepSpeed={0.55}
                  sweepWidth={9}
                  falloff={0.9}
                  brightness={0.7}
                  enableMouseInteraction={false}
                />
              </Suspense>
            </InView>
          </RB>
        )}
        <TermField
          seed={1337}
          clear={mobile ? CLEAR_MOBILE : desktop ? CLEAR_DESKTOP : CLEAR_TABLET}
          grid={desktop ? [11, 8] : [6, 10]}
          glyphRatio={0.22}
          drift
        />
      </div>

      <div className="container-signal flex flex-1 flex-col items-center justify-center pt-[96px] pb-[88px] text-center md:pb-[140px]">
        <p className="inline-flex items-center gap-2.5 rounded-[3px] border border-line-strong bg-ink-950 px-3 py-1.5 font-mono text-[0.75rem] text-fg-muted">
          <span aria-hidden className="size-1.5 rounded-full bg-phosphor animate-pulse-dot" />
          {profile.status}
        </p>

        <RB name="DecryptedText" className="mt-10 w-full md:mt-12">
          <AsciiName key={String(intro)} animate={intro} stacked={!desktop} />
        </RB>

        <div className="mt-8 md:mt-10">
          <Subtitle key={String(intro)} animate={intro} delay={desktop ? 650 : 900} />
        </div>
        <p className="mt-4 max-w-[70ch] font-mono text-[0.875rem] leading-relaxed text-fg-muted">
          <span aria-hidden className="text-fg-dim"># </span>
          {profile.intro}
        </p>
        <ScreeningFacts />

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <CmdLink to="/log#case-files" path="~/log" label="projects" primary />
          <CmdLink to="/contact" path="~/contact" label="contact" />
        </div>
      </div>

      <a
        href="#work"
        aria-label="scroll to the case files"
        className="group absolute right-[clamp(1rem,4vw,2.5rem)] bottom-[124px] hidden items-center gap-2 font-mono text-[0.75rem] text-fg-muted transition-colors duration-200 hover:text-fg md:inline-flex"
      >
        <span aria-hidden className="text-fg-dim">[</span>
        scroll
        <ArrowDown aria-hidden size={13} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-y-0.5" />
        <span aria-hidden className="text-fg-dim">]</span>
      </a>
    </section>
  );
}
