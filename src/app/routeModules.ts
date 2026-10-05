/**
 * Route chunk loaders. Shared by React.lazy (router.tsx) and by the shell, which
 * preloads a route's chunk on hover/focus of a nav item so the pixel transition
 * reveals an already-downloaded page.
 */
export const routeModules = {
  home: () => import('@/pages/home'),
  caseStudy: () => import('@/pages/log/case'),
  about: () => import('@/pages/about'),
  stack: () => import('@/pages/stack'),
  log: () => import('@/pages/log'),
  contact: () => import('@/pages/contact'),
  notFound: () => import('@/pages/not-found')
} as const;

const byPath: Record<string, () => Promise<unknown>> = {
  '/': routeModules.home,
  '/about': routeModules.about,
  '/stack': routeModules.stack,
  '/log': routeModules.log,
  '/contact': routeModules.contact
};

/**
 * Starts downloading the chunk for a path (no-op if unknown or already cached by the browser).
 * Resolves when the chunk has arrived (or failed), so callers can warm routes one at a time.
 */
export function preloadRoute(path: string): Promise<void> {
  const clean = path.split(/[?#]/)[0];
  const loader = byPath[clean] ?? (clean.startsWith('/log/') ? routeModules.caseStudy : undefined);
  if (!loader) return Promise.resolve();
  return loader().then(
    () => undefined,
    () => {
      /* a failed preload is retried by the real navigation */
    }
  );
}
