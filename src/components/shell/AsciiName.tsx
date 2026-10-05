import { motion } from 'motion/react';
import { ASCII_NAME, ASCII_NAME_STACKED } from '@/data/card';
import { cn } from '@/lib/cn';

interface AsciiNameProps {
  /** Two stacked blocks (AFFAN / SHAIKH) for narrow screens. */
  stacked?: boolean;
  /** Print the art line by line, like command output (skip under reduced motion). */
  animate?: boolean;
  /** Seconds before the first line prints. */
  delay?: number;
  className?: string;
}

const LINE_STAGGER = 0.035;

/** The card's figlet "AFFAN SHAIKH" in phosphor. Decorative: always pair it with real text (sr-only or visible). */
export default function AsciiName({ stacked = false, animate = false, delay = 0, className }: AsciiNameProps) {
  const blocks = stacked ? ASCII_NAME_STACKED : [ASCII_NAME];
  let n = 0;
  return (
    <div aria-hidden className={cn('ascii select-none text-phosphor', className)}>
      {blocks.map((block, b) => (
        <div key={b} className={b > 0 ? 'mt-[0.4em]' : undefined}>
          {block.split('\n').map((line, i) => {
            const index = n++;
            return animate ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 0.22, ease: 'linear', delay: delay + index * LINE_STAGGER }}
              >
                {line || ' '}
              </motion.div>
            ) : (
              <div key={i}>{line || ' '}</div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
