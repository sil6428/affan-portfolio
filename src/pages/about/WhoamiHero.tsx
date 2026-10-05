import DepthText from '@/components/reactbits/DepthText';
import TermField, { type ClearZone } from '@/components/ui/TermField';
import { useIsMobile } from '@/lib/media';
import { profile } from '@/data/profile';
import WhoamiTerminal from './WhoamiTerminal';
import BadgeStage from './BadgeStage';

// Keep the card texture off the text column; it shows around the badge and along the top.
// The header strip stays clear too, so no word sits behind the fixed site header.
const CLEAR_DESKTOP: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 9 },
  { x0: 0, y0: 0, x1: 59, y1: 100 }
];
const CLEAR_MOBILE: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 5 },
  { x0: 0, y0: 5, x1: 100, y1: 66 }
];

/** affan@shaikh:~$ cd ~/whoami — the shell line above the title. Decorative: screen readers start at the h1. */
function PromptLine() {
  return (
    <p aria-hidden="true" className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[0.8125rem] leading-none">
      <span className="text-fg-muted">affan@shaikh</span>
      <span className="-ml-2 text-fg-dim">:</span>
      <span className="-ml-2 text-chalk">~</span>
      <span className="-ml-1.5 text-fg-dim">$</span>
      <span className="text-fg">cd ~/whoami</span>
      <span className="ml-3 hidden text-fg-dim sm:inline"># {profile.location}</span>
    </p>
  );
}

export default function WhoamiHero() {
  const mobile = useIsMobile();

  return (
    <section aria-labelledby="whoami-title" className="relative isolate overflow-hidden">
      {/* Background: the business card's scattered terminal words (static DOM, words decrypt on hover). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <TermField
          seed={21}
          grid={[10, 6]}
          glyphRatio={0.22}
          clear={mobile ? CLEAR_MOBILE : CLEAR_DESKTOP}
          className="opacity-90"
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-950" />
      </div>

      <div className="container-signal relative grid gap-12 pb-16 pt-28 md:pt-36 lg:min-h-[min(100dvh,960px)] lg:grid-cols-12 lg:gap-8 lg:pb-20">
        {/* Left: prompt, title, terminal */}
        <div className="relative z-10 flex min-w-0 flex-col justify-center lg:col-span-7">
          <PromptLine />

          <h1 id="whoami-title" data-rb="DepthText" className="mt-7 leading-none text-fg">
            <span className="sr-only">Whoami — {profile.name}</span>
            <span aria-hidden="true" className="inline-flex items-end gap-[0.12em] py-[0.06em]">
              {/* Static extrusion (no animation loop): grey depth like the card's outlined ASCII words. */}
              <DepthText
                text="whoami"
                fontSize="clamp(4rem, 9vw, 8.75rem)"
                fontWeight={700}
                faceColor="#eeeeee"
                depthColor="#3a3a3a"
                layers={mobile ? 8 : 14}
                depth={1.9}
                tilt={8}
                still
                shadow={false}
                style={{
                  fontSize: 'clamp(4rem, 9vw, 8.75rem)',
                  padding: '0.12em 0.2em 0.2em',
                  margin: '-0.12em -0.2em -0.2em'
                }}
              />
              {/* A grey block caret, the same one /contact uses. It holds still; the terminal's small caret is the one that blinks. */}
              <span className="mb-[0.14em] inline-block h-[0.56em] w-[0.3em] bg-fg/25 [font-size:clamp(4rem,9vw,8.75rem)]" />
            </span>
          </h1>

          <p className="mt-2 max-w-[52ch] text-base leading-relaxed text-fg-muted md:text-[1.0625rem]">
            <span className="text-fg">{profile.name}</span> — {profile.title} in {profile.location}.{' '}
            <span aria-hidden="true" className="text-fg-dim">
              # the long answer prints below
            </span>
          </p>

          <WhoamiTerminal className="mt-8 max-w-[46rem]" />
        </div>

        {/* Right: badge on a lanyard */}
        <div className="relative min-w-0 lg:col-span-5">
          <BadgeStage className="lg:absolute lg:inset-x-0 lg:-top-36 lg:bottom-0" />
        </div>
      </div>
    </section>
  );
}
