import { lazy, Suspense, useMemo, type ReactNode } from 'react';
import { motion } from 'motion/react';
import InView from '@/lib/InView';
import RB from '@/components/ui/RB';
import { isLowPowerDevice, useIsDesktop } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import type { Project } from '@/data/projects';
import { rampFor, type Ramp } from './util';

// Each background is its own module, so a case file only downloads the one it uses.
const Scanner = lazy(() => import('@/components/reactbits/Scanner'));
const WebThreads = lazy(() => import('@/components/reactbits/WebThreads'));
const LightTunnel = lazy(() => import('@/components/reactbits/LightTunnel'));
const Radar = lazy(() => import('@/components/reactbits/Radar'));
const SlicedWaves = lazy(() => import('@/components/reactbits/SlicedWaves'));
const Threads = lazy(() => import('@/components/reactbits/Threads'));
const Grainient = lazy(() => import('@/components/reactbits/Grainient'));
const Prism = lazy(() => import('@/components/reactbits/Prism'));

/**
 * Themes that stop their own render loop off screen (IntersectionObserver / suspendWhenOffscreen). They
 * stay mounted once created, so scrolling back up never rebuilds a WebGL context. Radar (shared with
 * home) has no off-screen pause, so it is still unmounted on exit — it releases its context on unmount.
 */
const SELF_PAUSING = new Set<Project['theme']>(['Scanner', 'WebThreads', 'LightTunnel', 'SlicedWaves', 'Threads', 'Grainient', 'Prism']);

const INK = '#060606';
const GREY = '#1f1f1f';

const toFloat = (hex: string) => hex.match(/[0-9a-f]{2}/gi)!.map((h) => parseInt(h, 16) / 255) as [number, number, number];

/** Every theme retinted to the card: a grey ramp over near-black, low brightness, no pointer tracking. */
function renderTheme(theme: Project['theme'], r: Ramp): ReactNode {
  switch (theme) {
    case 'Scanner':
      return (
        <Scanner
          color1={r.base}
          color2={r.deep}
          color3={GREY}
          speed={0.25}
          sweepSpeed={0.12}
          scale={1.4}
          bandDensity={10}
          glow={0.1}
          brightness={0.6}
          vignette={0.7}
          grainIntensity={0}
          opacity={0.8}
          mouseStrength={0}
        />
      );
    case 'WebThreads':
      return (
        <WebThreads
          color1={r.base}
          color2={r.deep}
          color3={r.soft}
          backgroundColor={INK}
          threadCount={6}
          speed={0.12}
          brightness={0.6}
          glow={0.02}
          spread={0.22}
          grainIntensity={0}
          mouseStrength={0}
        />
      );
    case 'LightTunnel':
      return (
        <LightTunnel
          cableColor={r.deep}
          pulseColor={r.base}
          tunnelColor="#101010"
          tunnelOpacity={0.3}
          cableCount={14}
          speed={0.06}
          pulseSpeed={1.1}
          brightness={0.7}
          glow={0.6}
          grainIntensity={0}
          mouseStrength={0}
        />
      );
    case 'Radar':
      return (
        <Radar
          color={r.base}
          backgroundColor={INK}
          speed={0.5}
          sweepSpeed={0.45}
          scale={0.55}
          ringCount={8}
          spokeCount={12}
          brightness={0.6}
          falloff={2.6}
          mouseInfluence={0}
        />
      );
    case 'SlicedWaves':
      return (
        <SlicedWaves
          color1={r.base}
          color2={r.deep}
          color3={GREY}
          columns={12}
          rows={8}
          speed={0.2}
          opacity={0.45}
          brightness={0.8}
          grainIntensity={0}
          mouseStrength={0}
        />
      );
    case 'Threads':
      return <Threads color={toFloat(r.base)} amplitude={1} distance={0.15} enableMouseInteraction={false} />;
    case 'Grainient':
      return (
        <Grainient
          color1={r.deep}
          color2="#0b0b0b"
          color3={GREY}
          timeSpeed={0.1}
          contrast={1.2}
          saturation={0.8}
          grainAmount={0.05}
          warpStrength={0.7}
          zoom={0.85}
        />
      );
    case 'Prism':
      return (
        <Prism
          colors={[r.base, r.deep]}
          animationType="rotate"
          timeScale={0.25}
          glow={0.7}
          bloom={0.7}
          noise={0.08}
          scale={3.2}
          height={3.4}
          baseWidth={5.4}
          suspendWhenOffscreen
        />
      );
  }
}

/** Designed static state: faint grid and a single hairline. Phones, low-power devices, reduced motion. */
export function StaticBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="grid-lines absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="absolute top-[22%] right-0 left-[55%] h-px bg-line" />
    </div>
  );
}

/**
 * Case-file header background: the project's ReactBits theme in the card palette. Desktop only (the
 * single continuously animating effect on the page), mounted near the viewport via InView and masked
 * to the poster side; everything else gets the static backdrop.
 */
export default function ThemeBackground({ project }: { project: Project }) {
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const lowPower = useMemo(() => isLowPowerDevice(), []);
  const live = desktop && !reduced && !lowPower;
  const r = rampFor(project.accent);

  return (
    <RB name={live ? project.theme : `${project.theme} (static fallback)`} className="absolute inset-0">
      <StaticBackdrop />
      {live && (
        <div aria-hidden className="absolute inset-y-0 right-0 w-[64%] [mask-image:radial-gradient(75%_80%_at_70%_45%,black_25%,transparent_78%)]">
          <InView className="absolute inset-0" rootMargin="0px" unmountOnExit={!SELF_PAUSING.has(project.theme)}>
            <Suspense fallback={null}>
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderTheme(project.theme, r)}
              </motion.div>
            </Suspense>
          </InView>
        </div>
      )}
    </RB>
  );
}
