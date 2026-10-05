import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  tone?: 'success' | 'info' | 'error';
}

interface ToastContextValue {
  current: ToastMessage | null;
  notify: (toast: Omit<ToastMessage, 'id'>) => void;
  dismiss: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Holds the single active toast. The shell renders it (ToastViewport). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastMessage | null>(null);

  const notify = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    setCurrent({ ...toast, id: Date.now() });
  }, []);
  const dismiss = useCallback(() => setCurrent(null), []);

  const value = useMemo(() => ({ current, notify, dismiss }), [current, notify, dismiss]);
  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

const noop: ToastContextValue = { current: null, notify: () => {}, dismiss: () => {} };

/** `const { notify } = useToast(); notify({ title: 'Email copied' })` */
export function useToast(): ToastContextValue {
  return useContext(ToastContext) ?? noop;
}

/** Copies text to the clipboard; resolves false when the browser refuses. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
