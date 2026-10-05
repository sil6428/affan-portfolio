import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import ClickSpark from '@/components/reactbits/ClickSpark';
import Header from '@/components/shell/Header';
import DesktopDock from '@/components/shell/DesktopDock';
import TransitionOutlet from '@/components/shell/TransitionOutlet';
import Footer from '@/components/shell/Footer';
import ToastViewport from '@/components/shell/ToastViewport';
import { shouldBoot } from '@/components/shell/bootGate';
import { ToastProvider } from '@/lib/toast';
import { DevModeProvider, useDevMode } from '@/lib/devmode';
import { useReducedMotion } from '@/lib/motion';
import { useFinePointer, useIsDesktop } from '@/lib/media';
import { preloadRoute } from './routeModules';

// Chrome that is not needed for the first paint loads on demand, keeping gsap, the project
// data and the ReactBits registry out of the entry chunk (it matters most on phones).
const loadPalette = () => import('@/components/shell/CommandPalette');
const CommandPalette = lazy(loadPalette);
const MobileMenu = lazy(() => import('@/components/shell/MobileMenu'));
const DevModeOverlay = lazy(() => import('@/components/shell/DevModeOverlay'));
const BootSequence = lazy(() => import('@/components/shell/BootSequence'));

/** Routes warmed (one at a time) once the first page has loaded and the browser is idle. */
const WARM_ROUTES = ['/about', '/stack', '/log', '/contact'];

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

/** Data saver or a slow link: do not spend the visitor's bandwidth on pages they may never open. */
function constrainedNetwork(): boolean {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!conn?.saveData || ['slow-2g', '2g', '3g'].includes(conn?.effectiveType ?? '');
}

function Shell() {
  const [paletteOpen, setPaletteOpenState] = useState(false);
  const [paletteUsed, setPaletteUsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const devMode = useDevMode();
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const finePointer = useFinePointer();
  const [boot] = useState(() => shouldBoot(reduced));
  const setPaletteOpen = useCallback((next: boolean | ((open: boolean) => boolean)) => {
    setPaletteUsed(true);
    setPaletteOpenState(next);
  }, []);
  const openPalette = useCallback(() => setPaletteOpen(true), [setPaletteOpen]);
  const closePalette = useCallback(() => setPaletteOpen(false), [setPaletteOpen]);

  // Global shortcuts: ⌘K / Ctrl+K toggles the palette. Developer Mode stays hidden behind
  // Alt+Shift+D (a modified chord, so it never fires while someone is just typing).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
        return;
      }
      if (isTyping(e.target)) return;
      if (e.code === 'KeyD' && e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        devMode.toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [devMode, setPaletteOpen]);

  // Warm the other route chunks, but only after the first page is fully loaded and painted, one
  // chunk at a time, in idle time, and never on data saver / slow links. Touch devices skip this:
  // their menu items preload on touchstart instead, so a phone's first load has the network to itself.
  useEffect(() => {
    if (constrainedNetwork() || window.matchMedia('(pointer: coarse)').matches) return;
    let cancelled = false;
    let raf = 0;
    let idleId: number | undefined;
    let timer: number | undefined;
    let observer: MutationObserver | undefined;

    const warm = async () => {
      for (const path of WARM_ROUTES) {
        if (cancelled) return;
        await preloadRoute(path);
      }
      if (!cancelled) await loadPalette().catch(() => undefined);
    };
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === 'function') idleId = window.requestIdleCallback(() => void warm(), { timeout: 4000 });
      else timer = window.setTimeout(() => void warm(), 1500);
    };
    // Two frames after the route's <main> exists, so its first paint is not competing.
    const afterPaint = () => {
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(whenIdle);
      });
    };
    const whenRouteRendered = () => {
      if (document.getElementById('main')) return afterPaint();
      observer = new MutationObserver(() => {
        if (!document.getElementById('main')) return;
        observer?.disconnect();
        afterPaint();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === 'complete') whenRouteRendered();
    else window.addEventListener('load', whenRouteRendered, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', whenRouteRendered);
      observer?.disconnect();
      cancelAnimationFrame(raf);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      if (timer !== undefined) clearTimeout(timer);
    };
  }, []);

  // While the phone menu is open, everything behind it is inert (no Tab stops, no AT reading).
  const pageInert = !desktop && menuOpen;

  return (
    <ClickSpark fixed disabled={reduced || !finePointer} sparkColor="#cfcfcf" sparkCount={10} sparkSize={9} sparkRadius={22} duration={420} canvasClassName="z-[85]">
      {/* Tab order: skip link, then (below 1024px) the menu toggle, then the page. Both sit outside
          the inert wrapper; the skip link goes inert with the page while the menu is open. */}
      <a
        href="#main"
        inert={pageInert || undefined}
        className="sr-only-focusable fixed left-4 top-3 z-[90] rounded-[3px] bg-fg px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink-950"
      >
        Skip to content
      </a>
      {!desktop && (
        <Suspense fallback={null}>
          <MobileMenu onOpenChange={setMenuOpen} />
        </Suspense>
      )}
      <div data-rb="ClickSpark" className="relative min-h-dvh" inert={pageInert || undefined}>
        <Header onOpenPalette={openPalette} />
        {desktop && <DesktopDock />}
        <TransitionOutlet />
        <Footer />
      </div>
      {paletteUsed && (
        <Suspense fallback={null}>
          <CommandPalette open={paletteOpen} onClose={closePalette} />
        </Suspense>
      )}
      <ToastViewport />
      {devMode.enabled && (
        <Suspense fallback={null}>
          <DevModeOverlay />
        </Suspense>
      )}
      {boot && (
        <Suspense fallback={<div aria-hidden className="fixed inset-0 z-[100] bg-ink-950" />}>
          <BootSequence />
        </Suspense>
      )}
    </ClickSpark>
  );
}

/** Root layout: providers + the global chrome around every route. */
export default function RootLayout() {
  return (
    <ToastProvider>
      <DevModeProvider>
        <Shell />
      </DevModeProvider>
    </ToastProvider>
  );
}
