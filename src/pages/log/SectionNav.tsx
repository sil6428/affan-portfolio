import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import PillNav, { type PillNavItem } from '@/components/reactbits/PillNav';
import RB from '@/components/ui/RB';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { LOG_SECTIONS, jumpToSection, type LogSectionId } from './model';

// The visible short label is the accessible name (no separate aria-label to drift from it).
const ITEMS: PillNavItem[] = LOG_SECTIONS.map((s) => ({ label: s.short, href: `#${s.id}` }));

/**
 * Sticky in-page index (ReactBits PillNav) as a flat terminal tab strip. Hash links scroll smoothly,
 * the active section is tracked with an IntersectionObserver band, and a scroll-linked hairline shows
 * read progress. While the hero's own index (#log-index) is still on screen the strip is inert and
 * faded out (its height is kept, so nothing shifts), so only one set of section links is ever live.
 */
export default function SectionNav() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<LogSectionId | null>(null);
  const [shown, setShown] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Active section = the one crossing a band ~40% down the viewport.
  useEffect(() => {
    const sections = LOG_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!sections.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (hit.length) setActive(hit[0].target.id as LogSectionId);
        else if (sections[0].getBoundingClientRect().top > window.innerHeight * 0.4) setActive(null);
      },
      { rootMargin: '-38% 0px -58% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    // The strip takes over once the hero index has scrolled up under the header (64px).
    const heroIo = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < 64), {
      rootMargin: '-64px 0px 0px 0px'
    });
    heroIo.observe(document.getElementById('log-index') ?? sections[0]);
    return () => {
      io.disconnect();
      heroIo.disconnect();
    };
  }, []);

  // Keep the active pill visible inside the horizontally scrolling strip (mobile / tablet).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !active) return;
    const link = strip.querySelector<HTMLElement>('[aria-current="location"]');
    const track = link?.closest('ul')?.parentElement;
    if (!link || !track || track.scrollWidth <= track.clientWidth) return;
    const left = link.offsetLeft - track.clientWidth / 2 + link.offsetWidth / 2;
    track.scrollTo({ left, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  // Read progress through the log body (everything after the hero).
  const { scrollYProgress } = useScroll({ target: progressRef, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  const activeMeta = LOG_SECTIONS.find((s) => s.id === active);

  return (
    <>
      {/* Invisible measuring frame spanning the log body for scroll progress. */}
      <div ref={progressRef} aria-hidden className="pointer-events-none absolute inset-0" />
      <div className="sticky top-16 z-30">
        <div
          inert={!shown}
          className={cn(
            'border-y border-line bg-ink-950',
            !reduced && 'transition-[opacity,transform] duration-300 ease-[var(--ease-out-expo)]',
            shown ? 'opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
          )}
        >
        <div className="container-signal">
          <div className="flex items-center gap-4 py-2">
            <p aria-hidden className="hidden w-[13rem] shrink-0 truncate font-mono text-[12px] text-fg-muted lg:block">
              <span className="text-fg-dim">~/log</span>
              <span className="text-fg-dim">/</span>
              <span className="text-fg">{activeMeta?.short ?? ''}</span>
            </p>
            <RB name="PillNav" className="relative min-w-0 max-w-full overflow-hidden">
              <div ref={stripRef}>
                <PillNav
                  items={ITEMS}
                  activeHref={active ? `#${active}` : undefined}
                  ariaLabel="Log sections"
                  floating={false}
                  mobileMenu={false}
                  baseColor="#e8e8e8"
                  trackColor="transparent"
                  pillColor="transparent"
                  pillTextColor="#a8a8a8"
                  hoveredPillTextColor="#060606"
                  activePillColor="#1f1f1f"
                  activePillTextColor="#eeeeee"
                  pillClassName="rounded-[3px]! font-mono! text-[12px]! font-medium! normal-case! tracking-normal!"
                  initialLoadAnimation={false}
                  ease="power3.out"
                  onItemClick={(item, event) => {
                    event.preventDefault();
                    const id = item.href.slice(1) as LogSectionId;
                    setActive(id);
                    jumpToSection(id, reduced);
                  }}
                />
              </div>
            </RB>
            <div aria-hidden className="hidden flex-1 lg:block">
              <div className="relative h-px w-full overflow-hidden bg-line">
                <motion.div className="absolute inset-0 origin-left bg-fg-dim" style={{ scaleX: reduced ? scrollYProgress : progress }} />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
