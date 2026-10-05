import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useMediaQuery } from './media';

/**
 * Motion preference = OS `prefers-reduced-motion` unless the visitor overrides it
 * with the in-site toggle. Every animated component should read `useReducedMotion()`
 * and render a polished static state when it returns true.
 */
type MotionOverride = 'system' | 'full' | 'reduced';

interface MotionContextValue {
  reduced: boolean;
  override: MotionOverride;
  setOverride: (value: MotionOverride) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'signal:motion';

const MotionContext = createContext<MotionContextValue | null>(null);

function readStoredOverride(): MotionOverride {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'full' || value === 'reduced' ? value : 'system';
  } catch {
    return 'system';
  }
}

export function MotionProvider({ children }: { children: ReactNode }) {
  const systemReduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [override, setOverrideState] = useState<MotionOverride>(readStoredOverride);

  const reduced = override === 'system' ? systemReduced : override === 'reduced';

  useEffect(() => {
    const root = document.documentElement;
    if (override === 'system') root.removeAttribute('data-motion');
    else root.setAttribute('data-motion', override);
  }, [override]);

  const setOverride = useCallback((value: MotionOverride) => {
    setOverrideState(value);
    try {
      if (value === 'system') window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage unavailable — preference lasts for this visit only */
    }
  }, []);

  const toggle = useCallback(() => setOverride(reduced ? 'full' : 'reduced'), [reduced, setOverride]);

  const value = useMemo(() => ({ reduced, override, setOverride, toggle }), [reduced, override, setOverride, toggle]);

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotionPreference(): MotionContextValue {
  const ctx = useContext(MotionContext);
  if (!ctx) throw new Error('useMotionPreference must be used inside <MotionProvider>');
  return ctx;
}

/** True when animations should be disabled or replaced with static states. */
export function useReducedMotion(): boolean {
  return useMotionPreference().reduced;
}
