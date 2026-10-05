/**
 * Paths to the generated project art (scripts/generate-art.mjs → public/art/projects).
 * Use the smallest file that fills the box: phones download every byte.
 */

/** 1200×1500 poster (case-study headers, large previews). */
export const posterSrc = (slug: string) => `/art/projects/${slug}.webp`;

/** 1024×1024 square (large square previews). */
export const squareSrc = (slug: string) => `/art/projects/${slug}-square.webp`;

/** 320×320 square thumbnail (list rows, orbit chips, rails: boxes up to ~110 CSS px at 3x). */
export const THUMB_SIZE = 320;
export const thumbSrc = (slug: string) => `/art/projects/${slug}-square-320.webp`;
