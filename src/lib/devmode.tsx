import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * Developer Mode: an optional overlay that outlines every `[data-rb]` region and
 * labels the ReactBits component(s) inside it. Deliberately hidden: toggled only from the
 * command palette (type `devmode`) or the `Alt + Shift + D` shortcut (wired by the shell).
 */
interface DevModeContextValue {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'signal:devmode';

const DevModeContext = createContext<DevModeContextValue | null>(null);

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState<boolean>(() => {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, value ? '1' : '0');
    } catch {
      /* session storage unavailable */
    }
  }, []);

  const toggle = useCallback(() => setEnabled(!enabled), [enabled, setEnabled]);

  useEffect(() => {
    document.documentElement.toggleAttribute('data-devmode', enabled);
  }, [enabled]);

  const value = useMemo(() => ({ enabled, setEnabled, toggle }), [enabled, setEnabled, toggle]);
  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
}

const fallback: DevModeContextValue = { enabled: false, setEnabled: () => {}, toggle: () => {} };

export function useDevMode(): DevModeContextValue {
  return useContext(DevModeContext) ?? fallback;
}
