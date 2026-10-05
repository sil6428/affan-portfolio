import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

interface InViewProps {
  children: ReactNode;
  /** Rendered while the real content is not mounted (keeps layout stable). */
  fallback?: ReactNode;
  /** How far outside the viewport to start mounting. */
  rootMargin?: string;
  /** Unmount again when scrolled far away — frees WebGL contexts and stops rAF loops. */
  unmountOnExit?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Mounts expensive children (WebGL backgrounds, canvases, physics) only while the
 * wrapper is near the viewport. This is how the site pauses off-screen effects.
 */
export default function InView({
  children,
  fallback = null,
  rootMargin = '200px 0px',
  unmountOnExit = true,
  className,
  style
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
        else if (unmountOnExit) setVisible(false);
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, unmountOnExit]);

  return (
    <div ref={ref} className={className} style={style}>
      {visible ? children : fallback}
    </div>
  );
}
