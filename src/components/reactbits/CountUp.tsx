// Vendored from ReactBits (reactbits.dev) — TextAnimations/CountUp, TS + Tailwind variant.
// Local change: the value is tweened (motion `animate`, ease-out) instead of driven by an overdamped
// spring, so `duration` is the real settle time — the spring took several seconds to land on the
// final figure, which showed wrong totals while it crept in.
import { animate, useInView } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  direction?: 'up' | 'down';
  delay?: number;
  duration?: number;
  className?: string;
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export default function CountUp({
  to,
  from = 0,
  direction = 'up',
  delay = 0,
  duration = 2,
  className = '',
  startWhen = true,
  separator = '',
  onStart,
  onEnd
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px' });

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString();
    if (str.includes('.')) {
      const decimals = str.split('.')[1];
      if (parseInt(decimals) !== 0) {
        return decimals.length;
      }
    }
    return 0;
  };

  const maxDecimals = Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0;

      const options: Intl.NumberFormatOptions = {
        useGrouping: !!separator,
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0
      };

      const formattedNumber = Intl.NumberFormat('en-US', options).format(latest);

      return separator ? formattedNumber.replace(/,/g, separator) : formattedNumber;
    },
    [maxDecimals, separator]
  );

  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = formatValue(direction === 'down' ? to : from);
    }
  }, [from, to, direction, formatValue]);

  useEffect(() => {
    if (!isInView || !startWhen) return;
    onStart?.();
    const start = direction === 'down' ? to : from;
    const end = direction === 'down' ? from : to;
    const write = (v: number) => {
      if (ref.current) ref.current.textContent = formatValue(v);
    };
    const controls = animate(start, end, {
      duration,
      delay,
      ease: EASE_OUT,
      onUpdate: write,
      onComplete: () => {
        write(end);
        onEnd?.();
      }
    });
    return () => controls.stop();
  }, [isInView, startWhen, direction, from, to, delay, duration, formatValue, onStart, onEnd]);

  return <span className={className} ref={ref} />;
}
