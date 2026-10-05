import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight, FileDown } from 'lucide-react';
import GlareHover from '@/components/reactbits/GlareHover';
import Section from '@/components/ui/Section';
import { LinkButton } from '@/components/ui/Button';
import { navRoutes, type NavRoute } from '@/data/navigation';
import { contact } from '@/data/profile';
import { useFinePointer } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { Reveal, SectionLabel, SplitHeading } from './fx';

const NEXT = ['/stack', '/log', '/contact'];
const PANEL_BG = 'var(--color-ink-900)';
const PRIMARY_BG = 'var(--color-ink-850)';

/**
 * Light sweep wrapper. GlareHover only mounts with a fine pointer and full motion; otherwise the
 * card keeps the same flat surface without the effect.
 */
function Surface({ primary, glare, children }: { primary: boolean; glare: boolean; children: ReactNode }) {
  const background = primary ? PRIMARY_BG : PANEL_BG;
  if (!glare) {
    return (
      <div className="group h-full rounded-[6px]" style={{ background }}>
        {children}
      </div>
    );
  }
  return (
    <GlareHover
      width="100%"
      height="100%"
      background={background}
      borderRadius="6px"
      borderColor="transparent"
      glareColor="#eeeeee"
      glareOpacity={primary ? 0.1 : 0.07}
      glareAngle={-35}
      glareSize={240}
      transitionDuration={700}
      overlayOnTop
      className="group !cursor-auto !border-0"
    >
      {children}
    </GlareHover>
  );
}

function ExitCard({ route, primary }: { route: NavRoute; primary: boolean }) {
  return (
    <Link
      to={route.path}
      className={cn(
        'relative flex h-full min-h-[13rem] w-full flex-col rounded-[6px] border p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 md:min-h-[16rem] md:p-7',
        primary ? 'border-line-strong hover:border-fg/40' : 'border-line hover:border-fg/40'
      )}
    >
      <span className="flex items-start justify-between gap-4">
        <span className="font-mono text-[0.8125rem]">
          <span className="text-fg-dim">$ </span>
          <span className="text-fg">cd </span>
          <span className="text-fg-muted">{route.code}</span>
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-[3px] border transition-[background-color,border-color,color] duration-200',
            primary
              ? 'border-fg bg-fg text-ink-950 group-hover:bg-transparent group-hover:text-fg'
              : 'border-line-strong text-fg-muted group-hover:border-fg/40 group-hover:text-fg'
          )}
        >
          <ArrowUpRight size={17} strokeWidth={1.75} />
        </span>
      </span>
      <span className="mt-auto block pt-12">
        <span className="block text-[clamp(2rem,3.4vw,3rem)] font-semibold leading-[1] tracking-[-0.035em] text-fg">
          {route.label}
          <span className={cn('transition-colors duration-200', 'text-fg-dim group-hover:text-fg')}>
            /
          </span>
        </span>
        <span className="mt-3 block max-w-[30ch] text-[0.9375rem] leading-snug text-fg-muted md:min-h-[2.75em]">
          {route.description}
        </span>
      </span>
    </Link>
  );
}

/** Closing section: three exits, each a large route card with a light sweep on hover/focus. */
export default function NextLinks() {
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const glare = fine && !reduced;
  const routes = NEXT.map((path) => navRoutes.find((r) => r.path === path)).filter((r) => r !== undefined);

  return (
    <Section aria-labelledby="next-title" className="pb-dock">
      <SectionLabel index="04" path="ls ~" className="mb-12 md:mb-16" />
      <div className="mb-10 flex flex-col gap-6 md:mb-12 md:flex-row md:items-end md:justify-between">
        <SplitHeading id="next-title" text="Where to" accent="next" />
        <LinkButton
          to={contact.resume.href}
          variant="secondary"
          icon={<FileDown aria-hidden="true" size={15} strokeWidth={1.75} />}
          className="self-start md:self-auto"
        >
          {contact.resume.label}
        </LinkButton>
      </div>

      <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
        {routes.map((route, i) => {
          const primary = route.path === '/contact';
          return (
            <li key={route.path} data-rb="GlareHover">
              <Reveal kind="rise" delay={i * 0.06} distance={28} className="h-full">
                <Surface primary={primary} glare={glare}>
                  <ExitCard route={route} primary={primary} />
                </Surface>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
