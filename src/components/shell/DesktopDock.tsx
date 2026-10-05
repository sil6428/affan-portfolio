import { useLocation } from 'react-router';
import Dock from '@/components/reactbits/Dock';
import RB from '@/components/ui/RB';
import { navRoutes } from '@/data/navigation';
import { preloadRoute } from '@/app/routeModules';
import { NavIcon, isRouteActive } from './navIcons';

/**
 * Primary desktop navigation (≥1024px): the ReactBits Dock as a row of square terminal keys.
 * Each key is a real link (middle-click opens a new tab) with its name always captioned underneath
 * ("Projects" for /log); hover adds the longer tooltip ("Projects & experience · ~/log"). The active
 * route gets a phosphor underline, and hover/focus preloads the route's chunk.
 * A soft ink fade sits behind the dock so body text never reads through under it. If the dock's
 * height changes, keep --dock-clearance / scroll-padding-bottom (index.css) and the toast offset in step.
 */
export default function DesktopDock() {
  const { pathname } = useLocation();

  const items = navRoutes.map((route) => ({
    icon: <NavIcon name={route.icon} />,
    label: `${route.label} · ${route.code}`,
    ariaLabel: route.label,
    caption: route.short ?? route.label,
    href: route.path,
    onIntent: () => preloadRoute(route.path),
    active: isRouteActive(route, pathname)
  }));

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-40 hidden h-28 bg-gradient-to-t from-ink-950 to-transparent lg:block" />
      <RB name="Dock" as="nav" aria-label="Primary" className="pointer-events-none fixed inset-x-0 bottom-1 z-50 hidden justify-center lg:flex">
        <Dock items={items} baseItemSize={42} magnification={56} distance={140} panelHeight={80} dockHeight={108} />
      </RB>
    </>
  );
}
