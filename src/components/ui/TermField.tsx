import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import DecryptedText from '@/components/reactbits/DecryptedText';
import { CARD_GLYPHS, CARD_WORDS } from '@/data/card';
import { useFinePointer, useIsMobile } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';

/** Percent rectangle kept clear of words (e.g. where the name sits). */
export interface ClearZone {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface TermFieldProps {
  /** Changes the scatter; two fields on one page should use different seeds. */
  seed?: number;
  /** Areas to leave empty, in percent of the field. */
  clear?: ClearZone[];
  /** Cells per row/column on desktop; phones use a sparser grid automatically. */
  grid?: [cols: number, rows: number];
  /** Fraction of cells that hold a big outlined word instead of a small one. */
  glyphRatio?: number;
  /** Small words scramble (ReactBits DecryptedText) when hovered — fine pointers only. */
  interactive?: boolean;
  /**
   * Slow ambient drift: words sit on three depth layers that float at different speeds
   * (small words far and slow, big outlined words near and faster). Compositor-only
   * transforms, paused off-screen, off under reduced motion.
   */
  drift?: boolean;
  className?: string;
}

/** Depth layers for `drift`: travel (px) and half-cycle duration (s). Far → near. */
const LAYERS: { dx: number; dy: number; dur: number }[] = [
  { dx: 22, dy: -14, dur: 19 },
  { dx: -34, dy: 20, dur: 15 },
  { dx: 48, dy: 26, dur: 12 }
];

interface Item {
  key: string;
  left: number;
  top: number;
  rotate: number;
  opacity: number;
  size: number;
  text: string;
  glyph: boolean;
  rust: boolean;
  layer: number;
}

const NO_ZONES: ClearZone[] = [];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inside(x: number, y: number, zones: ClearZone[]) {
  return zones.some((z) => x >= z.x0 && x <= z.x1 && y >= z.y0 && y <= z.y1);
}

/**
 * One word of the texture. Its text is painted from `data-text` (CSS ::before), so it never becomes
 * page text: scrapers, résumé screeners and screen readers see nothing. A live word (fine pointer,
 * full motion) mounts the ReactBits DecryptedText scramble only while hovered.
 */
function Word({ it, live }: { it: Item; live: boolean }) {
  const [hot, setHot] = useState(false);
  return (
    <span
      className={cn(
        'term-word absolute whitespace-pre font-mono leading-none',
        it.glyph ? 'ascii' : 'tracking-tight',
        it.rust ? 'text-rust-deep' : 'text-[#5a5a5a]',
        live && 'pointer-events-auto'
      )}
      data-text={it.text}
      data-hot={hot || undefined}
      onMouseEnter={live ? () => setHot(true) : undefined}
      onMouseLeave={live ? () => setHot(false) : undefined}
      style={{
        left: `${it.left}%`,
        top: `${it.top}%`,
        fontSize: `${it.size}px`,
        opacity: it.rust ? 0.9 : it.opacity,
        transform: `translate(-50%, -50%) rotate(${it.rotate.toFixed(1)}deg)`
      }}
    >
      {live && hot ? (
        <DecryptedText
          text={it.text}
          animateOn="view"
          speed={40}
          maxIterations={8}
          characters="01<>/|_-$#"
          className="text-[#5a5a5a]"
          encryptedClassName="text-phosphor"
        />
      ) : null}
    </span>
  );
}

/**
 * The scattered terminal words from the business card, as a static texture: a jittered grid of
 * small grey words and larger outlined ASCII words at slight angles, with one rust "TNT".
 * Pure DOM and deterministic (seeded); with `drift` the words float on three depth layers
 * (compositor transforms only). On fine pointers each small word decrypts when hovered. Every word is
 * painted from a data attribute (CSS ::before), keeping decoration out of page text, the
 * accessibility tree and contrast audits.
 */
export default function TermField({
  seed = 7,
  clear = NO_ZONES,
  grid = [8, 6],
  glyphRatio = 0.28,
  interactive = true,
  drift = false,
  className
}: TermFieldProps) {
  const isMobile = useIsMobile();
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  const live = interactive && fine && !reduced;
  const [cols, rows] = isMobile ? [3, Math.max(6, Math.round(grid[1] * 1.4))] : grid;

  const items = useMemo<Item[]>(() => {
    const rand = mulberry32(seed);
    const out: Item[] = [];
    let w = Math.floor(rand() * CARD_WORDS.length);
    let g = Math.floor(rand() * CARD_GLYPHS.length);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const left = ((c + 0.12 + rand() * 0.6) / cols) * 100;
        const top = ((r + 0.12 + rand() * 0.6) / rows) * 100;
        if (inside(left, top, clear)) continue;
        const glyph = rand() < glyphRatio;
        const source = glyph ? CARD_GLYPHS[g++ % CARD_GLYPHS.length] : null;
        out.push({
          key: `${r}-${c}`,
          left,
          top,
          rotate: (rand() - 0.5) * 18,
          opacity: 0.35 + rand() * 0.45,
          size: glyph ? (isMobile ? 8 : 10) + rand() * 5 : 10 + rand() * (isMobile ? 6 : 12),
          text: source ? source.art : CARD_WORDS[w++ % CARD_WORDS.length],
          glyph,
          rust: !!source?.rust,
          layer: 0
        });
      }
    }
    // Depth from size (no extra random draws, so layouts stay identical with or without drift).
    for (const it of out) it.layer = it.glyph || it.size >= 17 ? 2 : it.size >= 13 ? 1 : 0;
    return out;
  }, [seed, cols, rows, clear, glyphRatio, isMobile]);

  // Pause the drift while the field is off-screen.
  const rootRef = useRef<HTMLDivElement>(null);
  const moving = drift && !reduced;
  useEffect(() => {
    const el = rootRef.current;
    if (!moving || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => el.toggleAttribute('data-paused', !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [moving]);

  const renderItem = (it: Item) => <Word key={it.key} it={it} live={live && !it.glyph} />;

  return (
    <div ref={rootRef} aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden select-none', className)}>
      {moving
        ? LAYERS.map((l, i) => (
            <div
              key={i}
              className="term-layer absolute inset-0"
              style={{ '--dx': `${l.dx}px`, '--dy': `${l.dy}px`, '--dur': `${l.dur}s` } as CSSProperties}
            >
              {items.filter((it) => it.layer === i).map(renderItem)}
            </div>
          ))
        : items.map(renderItem)}
    </div>
  );
}
