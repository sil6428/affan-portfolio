import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StaggeredMenu } from '@/components/reactbits/StaggeredMenu';
import RB from '@/components/ui/RB';
import { navRoutes } from '@/data/navigation';
import { contact } from '@/data/profile';
import { preloadRoute } from '@/app/routeModules';

/**
 * Mobile + tablet navigation (<1024px): ReactBits StaggeredMenu. Two flat grey layers slide in
 * before a black panel listing the routes by name, each with its shell path underneath.
 * Touching an item starts downloading its route (phones skip idle warm-up). `onOpenChange` lets
 * the shell make the page behind the open menu inert.
 */
export default function MobileMenu({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const navigate = useNavigate();
  // Unmounting (e.g. the window grows past 1024px) must never leave the page inert.
  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);

  return (
    <RB name="StaggeredMenu" className="pointer-events-none fixed inset-0 z-[55] lg:hidden">
      <StaggeredMenu
        isFixed
        position="right"
        colors={['#161616', '#262626']}
        accentColor="#ffffff"
        menuButtonColor="#eeeeee"
        openMenuButtonColor="#eeeeee"
        changeMenuColorOnOpen={false}
        displayItemNumbering
        items={navRoutes.map((route) => ({
          label: route.label,
          hint: route.path === '/' ? '~/' : route.code,
          ariaLabel: `${route.label} — ${route.description}`,
          link: route.path
        }))}
        socialItems={[
          { label: 'resume.pdf', link: contact.resume.href },
          { label: 'email', link: `mailto:${contact.email}` },
          { label: 'github', link: contact.github.href },
          { label: 'linkedin', link: contact.linkedin.href }
        ]}
        onItemClick={(link) => navigate(link)}
        onItemIntent={preloadRoute}
        onMenuOpen={() => onOpenChange?.(true)}
        onMenuClose={() => onOpenChange?.(false)}
      />
    </RB>
  );
}
