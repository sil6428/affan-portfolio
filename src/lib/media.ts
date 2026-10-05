import { useSyncExternalStore } from 'react';

type Subscribe = (onChange: () => void) => () => void;

/** One stable subscribe function per query, so useSyncExternalStore never resubscribes on render. */
const subscribers = new Map<string, Subscribe>();

function subscribeTo(query: string): Subscribe {
  let subscribe = subscribers.get(query);
  if (!subscribe) {
    subscribe = (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    };
    subscribers.set(query, subscribe);
  }
  return subscribe;
}

/** Subscribes to a CSS media query. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    subscribeTo(query),
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Mouse / trackpad present — gate cursor effects and hover-only interactions on this. */
export function useFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}

/** Breakpoints mirror Tailwind defaults: md = 768px, lg = 1024px. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/**
 * Rough device-capability check for expensive WebGL effects: low core count or
 * low memory devices get simplified fallbacks.
 */
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || memory <= 4;
}
