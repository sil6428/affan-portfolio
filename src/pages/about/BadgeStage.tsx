import { lazy, Suspense, useRef, useState } from 'react';
import { Hand, RefreshCcw } from 'lucide-react';
import InView from '@/lib/InView';
import { isLowPowerDevice, useFinePointer, useIsDesktop } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { useInViewport } from './useInViewport';

const Lanyard = lazy(() => import('@/components/reactbits/Lanyard'));

const FRONT = '/art/badge-front.webp';
const BACK = '/art/badge-back.webp';
const STRAP = '/art/lanyard-strap.png';

/** Placeholder while the physics badge mounts: an empty hanging strap, same footprint. */
function StageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-start">
      <span aria-hidden="true" className="h-[38%] w-px bg-line-strong" />
      <span className="mt-4 font-mono text-[0.75rem] text-fg-dim">
        mounting badge<span className="animate-blink">_</span>
      </span>
    </div>
  );
}

/**
 * Static badge for touch, small screens, low-power devices and reduced motion: the same art on
 * a CSS strap, tilted slightly, and a real button that flips it to the back.
 */
function StaticBadge({ className }: { className?: string }) {
  const [flipped, setFlipped] = useState(false);
  // The back face only shows after a tap, so it is not fetched up front: it is warmed when the
  // button is focused or pressed and mounted on the first flip.
  const [hasFlipped, setHasFlipped] = useState(false);
  const warmed = useRef(false);
  const warmBack = () => {
    if (warmed.current) return;
    warmed.current = true;
    new Image().src = BACK;
  };
  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* strap */}
      <div aria-hidden="true" className="relative h-20 w-7 overflow-hidden md:h-28">
        <div
          className="absolute left-1/2 top-1/2 h-7 w-[400px] -translate-x-1/2 -translate-y-1/2 rotate-90"
          style={{ backgroundImage: `url(${STRAP})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x' }}
        />
      </div>
      {/* clip */}
      <div aria-hidden="true" className="relative -mt-1 h-5 w-12 rounded-[3px] border border-line-strong bg-ink-800" />
      <button
        type="button"
        onClick={() => {
          warmBack();
          setHasFlipped(true);
          setFlipped((f) => !f);
        }}
        onPointerDown={warmBack}
        onFocus={warmBack}
        aria-pressed={flipped}
        aria-label="Flip ID badge"
        className="group relative -mt-1 w-[min(76vw,300px)] rounded-[6px] [perspective:1400px] focus-visible:outline-offset-4 lg:w-[min(30vw,340px)]"
      >
        <span
          className={cn(
            'relative block aspect-[1000/1400] w-full transition-transform duration-700 ease-[var(--ease-out-expo)] [transform-style:preserve-3d]',
            flipped
              ? '[transform:rotateZ(2deg)_rotateY(180deg)]'
              : '[transform:rotateZ(-3deg)_rotateY(-8deg)] group-hover:[transform:rotateZ(-1deg)_rotateY(0deg)]'
          )}
        >
          <img
            src={FRONT}
            alt=""
            width={1000}
            height={1400}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full rounded-[6px] border border-line-strong object-cover shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] [backface-visibility:hidden]"
          />
          {hasFlipped && (
            <img
              src={BACK}
              alt=""
              width={1000}
              height={1400}
              decoding="async"
              className="absolute inset-0 h-full w-full rounded-[6px] border border-line-strong object-cover shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
            />
          )}
        </span>
      </button>
      <p className="mt-5 inline-flex items-center gap-2 font-mono text-[0.75rem] text-fg-muted">
        <RefreshCcw aria-hidden="true" size={12} strokeWidth={1.75} className="text-fg-dim" />
        tap the badge to flip it
      </p>
    </div>
  );
}

/**
 * The physics badge. It mounts the first time the stage comes into view and then stays mounted,
 * so scrolling away and back does not drop it again; while it is off-screen the render loop and
 * the physics world are paused (frameloop "never").
 */
function LiveBadge({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const onScreen = useInViewport(stageRef);

  return (
    <figure data-rb="Lanyard" className={cn('relative m-0 h-full w-full', className)}>
      <div
        ref={stageRef}
        role="img"
        aria-label="Interactive 3D ID badge for Affan Shaikh on a lanyard. Drag it to swing it around."
        className="absolute inset-0"
      >
        <InView className="h-full w-full" rootMargin="0px 0px" unmountOnExit={false} fallback={<StageSkeleton />}>
          <Suspense fallback={<StageSkeleton />}>
            <Lanyard
              active={onScreen}
              position={[0, 0, 15.5]}
              gravity={[0, -40, 0]}
              fov={20}
              frontImage={FRONT}
              backImage={BACK}
              lanyardImage={STRAP}
              imageFit="cover"
              lanyardWidth={1}
              className="h-full!"
            />
          </Suspense>
        </InView>
      </div>
      <figcaption className="pointer-events-none absolute bottom-[8%] left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-[3px] border border-line bg-ink-900 px-3 py-1.5 font-mono text-[0.75rem] text-fg-muted">
        <Hand aria-hidden="true" size={12} strokeWidth={1.75} className="text-fg-dim" />
        drag the badge
      </figcaption>
    </figure>
  );
}

/**
 * Hero badge. Desktop + fine pointer + full motion (and not a low-power device) gets the
 * ReactBits Lanyard — rapier physics in r3f, lazy-loaded when the stage first comes into view
 * and paused while off-screen. Everything else gets the static badge.
 */
export default function BadgeStage({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const fine = useFinePointer();
  const interactive = desktop && fine && !reduced && !isLowPowerDevice();

  if (!interactive) {
    return (
      <div data-rb="Lanyard" className={cn('relative flex justify-center', className)}>
        <StaticBadge />
      </div>
    );
  }

  return <LiveBadge className={className} />;
}
