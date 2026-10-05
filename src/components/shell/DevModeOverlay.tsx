import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import GlitchText from '@/components/reactbits/GlitchText';
import { reactBitsUsage, uniqueComponents } from '@/data/reactbits';
import { useDevMode } from '@/lib/devmode';
import { useMotionPreference } from '@/lib/motion';

interface Tag {
  id: number;
  name: string;
  x: number;
  y: number;
}

const MAX_TAGS = 40;

function collectTags(): Tag[] {
  const tags: Tag[] = [];
  const vh = window.innerHeight;
  const els = document.querySelectorAll<HTMLElement>('[data-rb]');
  let id = 0;
  for (const el of els) {
    if (tags.length >= MAX_TAGS) break;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    if (r.bottom < 0 || r.top > vh) continue;
    tags.push({ id: id++, name: el.dataset.rb ?? '', x: Math.max(4, r.left), y: Math.max(68, r.top) });
  }
  return tags;
}

function onPageNames(): string[] {
  const names = new Set<string>();
  document.querySelectorAll<HTMLElement>('[data-rb]').forEach((el) =>
    (el.dataset.rb ?? '').split(',').forEach((n) => n.trim() && names.add(n.trim()))
  );
  return [...names].sort();
}

/**
 * Developer Mode (hidden: type `devmode` in the command palette, or Alt+Shift+D): outlines and labels every ReactBits
 * region on screen and shows a small `top`-style HUD with the route, counts and a live FPS meter.
 */
export default function DevModeOverlay() {
  const { enabled, setEnabled } = useDevMode();
  const { reduced } = useMotionPreference();
  const { pathname } = useLocation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [fps, setFps] = useState(0);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const raf = useRef(0);

  // Label positions: recompute on scroll/resize, throttled to one per frame.
  useEffect(() => {
    if (!enabled) return;
    let queued = false;
    const update = () => {
      queued = false;
      setTags(collectTags());
      setNames(onPageNames());
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };
    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    update();
    const interval = window.setInterval(schedule, 1200); // catches lazily mounted regions
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [enabled, pathname]);

  // FPS meter.
  useEffect(() => {
    if (!enabled) return;
    let frames = 0;
    let last = performance.now();
    const tick = (now: number) => {
      frames++;
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [enabled]);

  if (!enabled) return null;

  const rows: [string, string, string?][] = [
    ['route', pathname],
    ['on page', `${names.length} components`],
    ['site-wide', `${uniqueComponents().length} components · ${reactBitsUsage.length} placements`],
    ['fps', fps ? String(fps) : '—', fps && fps < 40 ? 'text-alert' : 'text-fg'],
    ['viewport', `${size.w}×${size.h}`],
    ['motion', reduced ? 'reduced' : 'full']
  ];

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
        {tags.map((t) => (
          <span
            key={t.id}
            className="absolute max-w-[60vw] truncate rounded-[2px] bg-fg px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold leading-tight text-ink-950"
            style={{ left: t.x, top: t.y }}
          >
            {t.name}
          </span>
        ))}
      </div>

      <aside
        aria-label="Developer Mode"
        className="panel fixed bottom-4 left-4 z-[72] w-[min(92vw,20rem)] overflow-hidden border-line-strong font-mono text-[0.75rem] lg:bottom-[104px]"
      >
        <div className="flex items-center justify-between border-b border-line px-3.5 py-2">
          <span data-rb="GlitchText" className="text-[0.75rem] font-semibold tracking-[0.12em] text-chalk [--glitch-bg:var(--color-ink-900)]">
            {reduced ? 'DEV MODE' : <GlitchText speed={0.7} enableShadows className="!text-[0.75rem] !font-semibold">DEV MODE</GlitchText>}
          </span>
          <button
            type="button"
            onClick={() => setEnabled(false)}
            aria-label="Close Developer Mode"
            className="rounded-[2px] px-1.5 py-0.5 text-fg-muted transition-colors hover:bg-ink-700 hover:text-fg"
          >
            :q
          </button>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-3.5 py-3">
          {rows.map(([k, v, tone]) => (
            <div key={k} className="contents">
              <dt className="text-fg-muted">{k}</dt>
              <dd className={`truncate ${tone ?? 'text-fg'}`}>{v}</dd>
            </div>
          ))}
        </dl>
        {names.length > 0 && (
          <p className="max-h-28 overflow-y-auto border-t border-line px-3.5 py-2.5 leading-relaxed text-fg-muted">
            <span className="text-fg-dim">$ ls components/</span>
            <br />
            {names.join('  ')}
          </p>
        )}
      </aside>
    </>
  );
}
