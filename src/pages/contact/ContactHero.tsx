import { motion } from 'motion/react';
import DecryptedText from '@/components/reactbits/DecryptedText';
import RB from '@/components/ui/RB';
import TermField, { type ClearZone } from '@/components/ui/TermField';
import { useReducedMotion } from '@/lib/motion';
import { useIsMobile } from '@/lib/media';
import { profile } from '@/data/profile';
import PrimaryCard from './PrimaryCard';
import { EASE, Prompt } from './shared';

/** Keep the card's word texture to the edges: clear the copy column and the card. */
const CLEAR_DESKTOP: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 11 },
  { x0: 0, y0: 11, x1: 49, y1: 100 },
  { x0: 51, y0: 25, x1: 100, y1: 91 }
];
/** Phones: only the strip beside the headline keeps a few words. */
const CLEAR_MOBILE: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 9 },
  { x0: 0, y0: 9, x1: 60, y1: 20 },
  { x0: 0, y0: 20, x1: 100, y1: 100 }
];

/** "Open to co-op opportunities in network operations, security operations, …" — built from profile data. */
function seekingSentence() {
  const items = profile.seeking.map((s) => s.charAt(0).toLowerCase() + s.slice(1));
  const list = `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  return `${profile.status} in ${list}.`;
}

export default function ContactHero() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const sentence = seekingSentence();

  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE, delay }
        };

  return (
    <header aria-labelledby="contact-title" className="relative isolate overflow-hidden pb-16 pt-24 md:pb-24 md:pt-32">
      <TermField seed={77} clear={mobile ? CLEAR_MOBILE : CLEAR_DESKTOP} grid={[12, 9]} glyphRatio={0.2} className="-z-10" />

      <div className="container-signal">
        <motion.div {...rise(0)} aria-hidden>
          <Prompt>cat channels.txt</Prompt>
        </motion.div>

        <div className="mt-10 grid gap-14 md:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16">
          <div className="min-w-0">
            <h1
              id="contact-title"
              className="text-[clamp(2.75rem,7.4vw,6.5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-fg"
            >
              <span className="block">Open a</span>{' '}
              <span className="flex items-baseline">
                {reduced ? (
                  <span>channel</span>
                ) : (
                  <RB name="DecryptedText" as="span">
                    {/* Screen readers get the word itself; the scramble is visual only. */}
                    <span className="sr-only">channel</span>
                    <span aria-hidden>
                      <DecryptedText
                        text="channel"
                        animateOn="view"
                        sequential
                        speed={55}
                        revealDirection="start"
                        characters="01<>/_-$#"
                        className="text-fg"
                        encryptedClassName="text-fg-dim"
                      />
                    </span>
                  </RB>
                )}
                <span aria-hidden className="ml-[0.08em] inline-block h-[0.78em] w-[0.42em] bg-fg/25" />
              </span>
            </h1>

            <motion.p
              {...rise(0.2)}
              className="mt-8 max-w-[54ch] text-[0.9375rem] leading-[1.75] text-fg-muted md:text-[1.0625rem]"
            >
              {sentence}
            </motion.p>

            <motion.dl {...rise(0.3)} className="mt-9 grid max-w-[34rem] grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-2 font-mono text-[0.8125rem]">
              <dt className="text-fg-muted">status</dt>
              <dd className="flex items-center gap-2 text-fg">
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-phosphor" />
                {profile.status.toLowerCase()}
              </dd>
              <dt className="text-fg-muted">role</dt>
              <dd className="text-fg">{profile.title}</dd>
              <dt className="text-fg-muted">based</dt>
              <dd className="text-fg">{profile.location}</dd>
            </motion.dl>
          </div>

          <motion.div {...rise(0.15)} className="relative min-w-0">
            <PrimaryCard />
          </motion.div>
        </div>
      </div>
    </header>
  );
}
