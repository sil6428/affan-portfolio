/**
 * Site map. `label` is the plain name used for navigation (dock, menu, footer); `code` is the
 * shell-style path shown in the header prompt and as secondary text ("~/stack").
 * The shell (dock, mobile menu, command palette) renders from this list.
 */

export interface NavRoute {
  path: string;
  label: string;
  code: string;
  description: string;
  /** lucide-react icon name used by the dock and menus. */
  icon: 'Terminal' | 'Fingerprint' | 'Network' | 'ScrollText' | 'Send';
  /** Shorter caption where space is tight (the dock); must be a word of `label` (Label in Name). */
  short?: string;
}

export const navRoutes: NavRoute[] = [
  { path: '/', label: 'Home', code: '~', icon: 'Terminal', description: 'Identity, evidence, and what is running now' },
  { path: '/about', label: 'About', code: '~/whoami', icon: 'Fingerprint', description: 'Identity, education, and how I work' },
  { path: '/stack', label: 'Stack', code: '~/stack', icon: 'Network', description: 'Networks, security, development, systems' },
  { path: '/log', label: 'Projects & experience', short: 'Projects', code: '~/log', icon: 'ScrollText', description: 'Case files, experience, education, community' },
  { path: '/contact', label: 'Contact', code: '~/contact', icon: 'Send', description: 'Open a channel' }
];

export function routeForPath(pathname: string): NavRoute | undefined {
  if (pathname === '/') return navRoutes[0];
  return navRoutes
    .filter((r) => r.path !== '/')
    .find((r) => pathname === r.path || pathname.startsWith(`${r.path}/`));
}

/** Shell-style location for any pathname: "~/log/ssik", or a missing-file marker for unknown routes. */
export function shellPath(pathname: string): string {
  const route = routeForPath(pathname);
  if (!route) return '~/?? : no such file';
  if (route.path === '/log' && pathname.startsWith('/log/')) return `~/log/${pathname.slice(5)}`;
  return route.code;
}
