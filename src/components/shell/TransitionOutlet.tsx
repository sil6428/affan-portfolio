import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigationType, useOutlet } from 'react-router';
import PixelSwap from '@/components/reactbits/PixelSwap';
import LatticeLoader from '@/components/reactbits/LatticeLoader';
import { shellPath } from '@/data/navigation';
import { useReducedMotion } from '@/lib/motion';
import { useIsMobile } from '@/lib/media';

const COVER_MS = 300;
const REVEAL_MS = 320;

type Phase = 'idle' | 'cover' | 'reveal';

/** Remembered scroll offsets per history entry so back/forward lands where you were. */
const scrollMemory = new Map<string, number>();

/** Lazy-route fallback: a quiet loader line, like a shell waiting on a slow command. */
function PageFallback() {
  const { pathname } = useLocation();
  return (
    <div data-rb="LatticeLoader" className="flex min-h-dvh items-center justify-center font-mono">
      <LatticeLoader
        status="working"
        label={`loading ${shellPath(pathname)}`}
        color="#a8a8a8"
        grid={3}
        cellSize={4}
        gap={2}
        fontSize={12}
      />
    </div>
  );
}

/** Terminal cover the pixels assemble into — the `cd` into the destination, with a block caret. */
function Cover({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-ink-900">
      <span className="flex items-center font-mono text-sm text-fg-muted">
        <span className="text-fg-dim">affan@shaikh</span>
        <span>:~$&nbsp;</span>
        <span className="text-fg">{label}</span>
        <span className="ml-1 inline-block h-[1.1em] w-[0.6em] bg-phosphor" />
      </span>
    </div>
  );
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/** True when the element's top edge is somewhere inside the viewport. */
function inViewport(el: HTMLElement): boolean {
  const { top } = el.getBoundingClientRect();
  return top >= 0 && top < window.innerHeight;
}

/**
 * After a route change, move focus to the hash target or the new page's h1 so keyboard and
 * screen-reader users land at the top of the new content (and hear its heading).
 */
function focusNewPage(hashId: string, oldMain: Element | null, acceptOld: boolean): boolean {
  // Only the incoming page counts: the outgoing <main> can linger for a frame (or stay hidden while
  // the new chunk suspends). Same-component routes (case study → case study) reuse their <main>,
  // so after a short wait any visible h1 is accepted.
  const fresh = (el: HTMLElement | null): el is HTMLElement =>
    !!el && (acceptOld || el.closest('main') !== oldMain) && el.getClientRects().length > 0;
  const hash = hashId ? document.getElementById(hashId) : null;
  const target = fresh(hash) ? hash : document.querySelector<HTMLElement>('main h1');
  if (!fresh(target)) return false;
  // A lazy page can arrive after the post-swap scroll ran (it found no hash target then): bring the
  // target into view before focusing it without scrolling.
  if (target === hash && !inViewport(hash)) hash.scrollIntoView();
  if (!target.matches(FOCUSABLE)) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  return document.activeElement === target;
}

/**
 * Renders the route outlet with a PixelSwap transition: on navigation the old page stays
 * frozen while pixels assemble a cover (~300ms), the new page swaps in underneath, and the
 * cover wipes away. Reduced motion → no cover; the new page swaps straight in. Every deferred callback
 * (frames, timers) belongs to one navigation and is cancelled when the next one starts, so a
 * stale reveal can never cut a newer cover short.
 */
export default function TransitionOutlet() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const outlet = useOutlet();
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();

  const [displayKey, setDisplayKey] = useState(location.key);
  const [phase, setPhaseState] = useState<Phase>('idle');
  const [coverActive, setCoverActive] = useState(false);
  const [fading, setFading] = useState(false);
  /** Changes only when a fresh cover starts; an interrupted cover keeps its PixelSwap instance. */
  const [coverKey, setCoverKey] = useState(0);
  const frozen = useRef<ReactNode>(outlet);
  const lastKey = useRef(location.key);
  const prevPath = useRef(location.pathname);
  const phaseRef = useRef<Phase>('idle');
  /** The cover finished assembling for the current navigation and the page swapped under it. */
  const covered = useRef(false);
  /** The cover is fully up but the swap is on hold: the URL already points at a newer navigation. */
  const held = useRef(false);
  /** Pending frames / timers of the current navigation. */
  const pending = useRef<{ rafs: number[]; timers: number[] }>({ rafs: [], timers: [] });
  const nav = useRef(0);

  const setPhase = (next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  };
  const cancelPending = () => {
    pending.current.rafs.forEach(cancelAnimationFrame);
    pending.current.timers.forEach(clearTimeout);
    pending.current = { rafs: [], timers: [] };
  };
  const frame = (fn: () => void) => {
    const token = nav.current;
    const id = requestAnimationFrame(() => {
      if (token === nav.current) fn();
    });
    pending.current.rafs.push(id);
  };
  const later = (fn: () => void, ms: number) => {
    const token = nav.current;
    const id = window.setTimeout(() => {
      if (token === nav.current) fn();
    }, ms);
    pending.current.timers.push(id);
  };

  useEffect(() => cancelPending, []);

  // First load with a #hash (a shared deep link): the browser's own jump happened before the lazy page
  // existed, so look for the target for up to ~3 s, then scroll to it. Polls through later(), so a
  // navigation in the meantime cancels it.
  useEffect(() => {
    const hashId = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    if (!hashId) return;
    const find = (tries: number) => {
      const el = document.getElementById(hashId);
      if (el && el.getClientRects().length > 0) {
        el.scrollIntoView();
        if (el.matches(FOCUSABLE)) el.focus({ preventScroll: true });
        // Sections above can still grow as their content mounts; if the reader has not scrolled
        // since, follow the target once or twice.
        const y = window.scrollY;
        const top = el.getBoundingClientRect().top;
        const follow = () => {
          if (Math.abs(window.scrollY - y) < 2 && Math.abs(el.getBoundingClientRect().top - top) > 4) el.scrollIntoView();
        };
        later(follow, 400);
        later(follow, 1200);
      } else if (tries < 30) later(() => find(tries + 1), 100);
    };
    frame(() => find(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changed = location.key !== displayKey;
  if (!changed) frozen.current = outlet;

  // Track the scroll position of the entry we're leaving.
  useEffect(() => {
    const onScroll = () => scrollMemory.set(lastKey.current, window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /** `moveFocus`: a real page change (not the first load, not a same-page hash change). */
  const settle = (moveFocus: boolean) => {
    lastKey.current = location.key;
    const saved = navigationType === 'POP' ? scrollMemory.get(location.key) : undefined;
    const hashId = location.hash ? decodeURIComponent(location.hash.slice(1)) : '';
    // Called before React swaps the page in, so this is still the outgoing page's <main>.
    const oldMain = document.querySelector('main');
    // A lazy page may still be downloading: keep looking for its h1 for a few seconds.
    const focusWhenReady = (tries: number) => {
      if (!focusNewPage(hashId, oldMain, tries >= 8) && tries < 30) later(() => focusWhenReady(tries + 1), 100);
    };
    frame(() => {
      // Looked up after the swap: the new page's elements exist now.
      const hash = hashId ? document.getElementById(hashId) : null;
      if (hash) hash.scrollIntoView();
      else window.scrollTo({ top: saved ?? 0, behavior: 'instant' as ScrollBehavior });
      if (moveFocus) focusWhenReady(0);
    });
  };

  /** The cover is up: swap the page underneath, then wipe the cover away. */
  const onCovered = (force = false) => {
    if (covered.current || phaseRef.current !== 'cover') return;
    // The router renders navigations in a transition, so the URL can already belong to a newer
    // navigation that has not rendered yet. Hold the cover (never reveal a stale page); that
    // navigation reuses this cover. The forced retry is a safety net if it never arrives.
    if (!force && window.location.pathname !== location.pathname) {
      if (!held.current) later(() => onCovered(true), 1500);
      held.current = true;
      return;
    }
    covered.current = true;
    held.current = false;
    setDisplayKey((current) => (current === location.key ? current : location.key));
    settle(true);
    setPhase('reveal');
    frame(() => setFading(true));
    later(() => {
      setPhase('idle');
      setCoverActive(false);
      setFading(false);
    }, REVEAL_MS + 40);
  };
  // PixelSwap snapshots its onComplete when a transition starts; route it to the latest closure.
  const onCoveredRef = useRef(onCovered);
  onCoveredRef.current = onCovered;

  useLayoutEffect(() => {
    if (!changed) return;
    // A new navigation: everything still scheduled by the previous one is void.
    nav.current += 1;
    cancelPending();
    // Same page, different hash/search: no cover.
    const samePath = prevPath.current === location.pathname;
    prevPath.current = location.pathname;
    covered.current = false;
    if (reduced || samePath) {
      held.current = false;
      setDisplayKey(location.key);
      setPhase('idle');
      setCoverActive(false);
      setFading(false);
      settle(!samePath);
      return;
    }
    if (phaseRef.current === 'cover') {
      // An interrupted navigation's cover is still assembling or already up: keep it (no flash of
      // the old page) and swap straight to this route once it is complete.
      if (held.current) frame(() => onCoveredRef.current());
      later(() => onCoveredRef.current(), COVER_MS + 250);
      return;
    }
    held.current = false;
    setCoverKey((k) => k + 1);
    setPhase('cover');
    setFading(false);
    setCoverActive(false);
    // Two frames so PixelSwap measures its box before the transition starts.
    frame(() => frame(() => setCoverActive(true)));
    later(() => onCoveredRef.current(), COVER_MS + 250);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  const coverLabel = `cd ${shellPath(location.pathname)}`;

  return (
    <>
      <div>
        <Suspense fallback={<PageFallback />}>{changed ? frozen.current : outlet}</Suspense>
      </div>

      {phase !== 'idle' && (
        <div
          aria-hidden="true"
          data-rb="PixelSwap"
          className="pointer-events-none fixed inset-0 z-[75]"
          style={{
            transition: `clip-path ${REVEAL_MS}ms cubic-bezier(0.83,0,0.17,1), opacity ${REVEAL_MS}ms ease`,
            clipPath: fading ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)',
            opacity: fading ? 0.6 : 1
          }}
        >
          <PixelSwap
            key={coverKey}
            firstContent={<div className="h-full w-full" />}
            secondContent={<Cover label={coverLabel} />}
            trigger="manual"
            active={coverActive}
            onComplete={(isActive) => {
              if (isActive) onCoveredRef.current();
            }}
            duration={COVER_MS}
            pixelDuration={140}
            pixelSize={isMobile ? 44 : 64}
            gap={0}
            pixelRadius={0}
            pattern="diagonal"
            randomness={0.35}
            aspectRatio="auto"
            className="h-full w-full"
          />
        </div>
      )}
    </>
  );
}
