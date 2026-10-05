import { useSyncExternalStore } from 'react';
import { shouldBoot } from '@/components/shell/bootGate';

/**
 * Whether the first-visit boot overlay is (still) covering the page. Pages with an entrance
 * animation read it so their intro plays when the overlay starts to fade, not behind it.
 * BootSequence calls `endBoot()` the moment it begins to exit.
 */

const MOTION_KEY = 'signal:motion';

/** Same rule as MotionProvider: the in-site override wins, otherwise the OS setting. */
function reducedNow(): boolean {
  try {
    const o = window.localStorage.getItem(MOTION_KEY);
    if (o === 'reduced') return true;
    if (o === 'full') return false;
  } catch {
    /* storage unavailable */
  }
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let booting: boolean | null = null;
const listeners = new Set<() => void>();

function get(): boolean {
  if (booting === null) booting = typeof window !== 'undefined' && shouldBoot(reducedNow());
  return booting;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** The boot overlay has started to fade (or never ran). */
export function endBoot() {
  if (booting === false) return;
  booting = false;
  listeners.forEach((fn) => fn());
}

export function useBooting(): boolean {
  return useSyncExternalStore(subscribe, get, () => false);
}
