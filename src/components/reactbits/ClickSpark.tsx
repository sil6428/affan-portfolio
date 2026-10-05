// Vendored from ReactBits (reactbits.dev) — Animations/ClickSpark, TS + Tailwind variant.
// Local changes: optional `fixed` mode (viewport-sized fixed canvas instead of one as tall as
// the wrapped page), the draw loop only runs while sparks are alive, `disabled` turns the
// effect off (reduced motion, touch) with no canvas, listeners or backing store at all, and the
// canvas honours devicePixelRatio (capped at 2).
import React, { useRef, useEffect, useCallback } from 'react';

interface ClickSparkProps {
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  extraScale?: number;
  /** Draw on a fixed, viewport-sized canvas (for wrapping a whole page). */
  fixed?: boolean;
  /** Disable sparks entirely (e.g. reduced motion, touch): no canvas is rendered. */
  disabled?: boolean;
  /** Class for the fixed canvas (z-index etc.). */
  canvasClassName?: string;
  children?: React.ReactNode;
}

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1.0,
  fixed = false,
  disabled = false,
  canvasClassName = '',
  children
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const rafRef = useRef<number>(0);
  const drawRef = useRef<((t: number) => void) | null>(null);
  const dprRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    let resizeTimeout: ReturnType<typeof setTimeout>;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      const { width, height } = fixed
        ? { width: window.innerWidth, height: window.innerHeight }
        : parent.getBoundingClientRect();
      const w = Math.round(width * dpr);
      const h = Math.round(height * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    };

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 100);
    };

    let ro: ResizeObserver | null = null;
    if (fixed) window.addEventListener('resize', handleResize);
    else {
      ro = new ResizeObserver(handleResize);
      ro.observe(parent);
    }

    resizeCanvas();

    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [fixed, disabled]);

  const easeFunc = useCallback(
    (t: number) => {
      switch (easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        default:
          return t * (2 - t);
      }
    },
    [easing]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp: number) => {
      const dpr = dprRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      sparksRef.current = sparksRef.current.filter((spark: Spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) {
          return false;
        }

        const progress = Math.max(0, elapsed / duration);
        const eased = easeFunc(progress);

        const distance = eased * sparkRadius * extraScale;
        const lineLength = sparkSize * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      // Only keep the loop alive while sparks remain.
      rafRef.current = sparksRef.current.length ? requestAnimationFrame(draw) : 0;
    };

    drawRef.current = draw;

    return () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      drawRef.current = null;
    };
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale, disabled]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const now = performance.now();
    const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
      x,
      y,
      angle: (2 * Math.PI * i) / sparkCount,
      startTime: now
    }));

    sparksRef.current.push(...newSparks);
    if (!rafRef.current && drawRef.current) rafRef.current = requestAnimationFrame(drawRef.current);
  };

  // The wrapper stays when disabled so toggling never remounts the wrapped tree; only the canvas goes.
  return (
    <div className="relative w-full h-full" onClick={disabled ? undefined : handleClick}>
      {!disabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`${fixed ? 'fixed top-0 left-0' : 'absolute inset-0'} pointer-events-none ${canvasClassName}`.trim()}
        />
      )}
      {children}
    </div>
  );
};

export default ClickSpark;
