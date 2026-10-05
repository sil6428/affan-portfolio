/**
 * ReactBits usage registry — powers Developer Mode (Alt + Shift + D, or `devmode` in the command palette).
 * Each page owns a slice in `src/pages/<page>/reactbits.ts`; this file only aggregates.
 * Slices import the types below with `import type`, so there is no runtime cycle.
 */
import { shellBits } from '@/components/shell/reactbits';
import { homeBits } from '@/pages/home/reactbits';
import { workBits } from '@/pages/log/case/reactbits';
import { aboutBits } from '@/pages/about/reactbits';
import { stackBits } from '@/pages/stack/reactbits';
import { logBits } from '@/pages/log/reactbits';
import { contactBits } from '@/pages/contact/reactbits';

export type RBCategory = 'Backgrounds' | 'Animations' | 'Text Animations' | 'Components' | 'Micro';

export interface RBUsage {
  /** ReactBits component name, exactly as in the library (e.g. 'SplitText'). */
  component: string;
  category: RBCategory;
  /** Route where it appears ('*' = global shell). */
  route: string;
  /** Human-readable location on the page. */
  where: string;
  /** What job it does in the design. */
  role: string;
}

export const reactBitsUsage: RBUsage[] = [
  ...shellBits,
  ...homeBits,
  ...workBits,
  ...aboutBits,
  ...stackBits,
  ...logBits,
  ...contactBits
];

/** Distinct ReactBits components used anywhere on the site. */
export function uniqueComponents(usages: RBUsage[] = reactBitsUsage): string[] {
  return Array.from(new Set(usages.map((u) => u.component))).sort();
}
