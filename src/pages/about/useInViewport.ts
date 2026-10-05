import { useEffect, useState, type RefObject } from 'react';

/**
 * True while the element is on screen (with a margin). Used to pause looping effects
 * off-screen without unmounting them, so their internal state survives.
 */
export function useInViewport(ref: RefObject<Element | null>, rootMargin = '0px 0px'): boolean {
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
