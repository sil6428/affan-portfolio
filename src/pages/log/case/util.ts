import type { Project } from '@/data/projects';

/**
 * Background ramp for a case file. On the card green is reserved for the ASCII name and rust for the
 * TNT, so every header background is painted in chalk/grey only — the texture, never the accent.
 */
export interface Ramp {
  base: string;
  soft: string;
  deep: string;
  rgb: string;
}

/** Chalk files get a slightly lighter grey ramp; every ramp stays well below the white headline. */
const CHALK: Ramp = { base: '#a8a8a8', soft: '#8a8a8a', deep: '#4a4a4a', rgb: '168 168 168' };
const ASH: Ramp = { base: '#8a8a8a', soft: '#6b6b6b', deep: '#3a3a3a', rgb: '138 138 138' };

export const rampFor = (accent: Project['accent']): Ramp => (accent === 'chalk' ? CHALK : ASH);

export { posterSrc, squareSrc } from '@/lib/art';
export const caseHref = (slug: string) => `/log/${slug}`;

/** Scramble set for data labels: hex + a few shell glyphs, never letters that read as words. */
export const DECRYPT_CHARS = '0123456789abcdef#/:<>_';
