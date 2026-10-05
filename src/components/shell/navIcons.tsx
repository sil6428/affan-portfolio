import { FingerprintPattern, Network, ScrollText, Send, Terminal, type LucideIcon } from 'lucide-react';
import type { NavRoute } from '@/data/navigation';

const icons: Record<NavRoute['icon'], LucideIcon> = {
  Terminal,
  Fingerprint: FingerprintPattern,
  Network,
  ScrollText,
  Send
};

export function NavIcon({ name, size = 18 }: { name: NavRoute['icon']; size?: number }) {
  const Icon = icons[name];
  return <Icon size={size} strokeWidth={1.6} aria-hidden />;
}

/** True when `pathname` belongs to the nav route (case studies count as /log). */
export function isRouteActive(route: NavRoute, pathname: string): boolean {
  if (route.path === '/') return pathname === '/';
  return pathname === route.path || pathname.startsWith(`${route.path}/`);
}
