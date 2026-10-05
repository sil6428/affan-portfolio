import { useEffect, useState, type RefObject } from 'react';

/** True while the element is on screen (with a margin) — used to pause loops off-screen. */
export function useOnScreen(ref: RefObject<Element | null>, rootMargin = '0px'): boolean {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return visible;
}
