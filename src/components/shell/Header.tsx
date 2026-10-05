import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, useScroll, useSpring } from 'motion/react';
import { FileText } from 'lucide-react';
import DecryptedText from '@/components/reactbits/DecryptedText';
import RB from '@/components/ui/RB';
import { shellPath } from '@/data/navigation';
import { contact } from '@/data/profile';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import Monogram from './Monogram';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/**
 * Top bar, styled like a terminal title line: the AS key + name on the left, the live shell prompt
 * (affan@shaikh:~/path $) in the middle, and the resume + command palette keys on the right.
 * Below 640px the resume collapses to a compact "resume" key and the palette key hides, leaving room
 * for the phone menu toggle (StaggeredMenu, drawn on top at the right edge). The skip link is
 * rendered by the shell (RootLayout), ahead of that toggle in the Tab order.
 */
export default function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.3 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const label = shellPath(pathname);

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-fg/30"
        style={{ scaleX: reduced ? scrollYProgress : progress }}
      />

      <header
        className={cn(
          'pointer-events-none fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
          scrolled ? 'border-line bg-ink-950' : 'border-transparent'
        )}
      >
        <div className="container-signal flex h-16 items-center gap-5">
          <Link to="/" className="pointer-events-auto group flex items-center gap-3" aria-label="Affan Shaikh — home">
            <Monogram className="size-8 text-fg-muted transition-colors duration-200 group-hover:text-fg" />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-[0.875rem] font-semibold tracking-[-0.02em] text-fg underline-offset-4 group-hover:underline">
                Affan Shaikh
              </span>
              <span className="mt-1 font-mono text-[0.625rem] text-fg-muted">Networking &amp; IT Security</span>
            </span>
          </Link>

          <span aria-hidden className="hidden h-5 w-px bg-line-strong md:block" />

          <RB name="DecryptedText" className="hidden min-w-0 flex-1 md:block">
            <p className="flex items-center font-mono text-[0.75rem] text-fg-muted">
              <span className="sr-only">Current location: {label}</span>
              <span aria-hidden className="text-fg-dim">affan@shaikh</span>
              <span aria-hidden>:</span>
              {reduced ? (
                <span aria-hidden className="text-fg">{label}</span>
              ) : (
                <span aria-hidden>
                  <DecryptedText
                    key={label}
                    text={label}
                    animateOn="view"
                    sequential
                    speed={26}
                    revealDirection="start"
                    characters="abcdefghijklmnop/~_-"
                    className="text-fg"
                    encryptedClassName="text-fg-dim"
                  />
                </span>
              )}
              <span aria-hidden className="ml-1.5 text-fg-muted">$</span>
              <span aria-hidden className="ml-1.5 inline-block h-[1.05em] w-[0.55em] translate-y-px bg-fg-dim" />
            </p>
          </RB>

          {/* Phones: a compact "resume" key, clear of the menu toggle. The visible word starts the
              accessible name (Label in Name); the sr-only tail adds the file type and new-tab note. */}
          <a
            href={contact.resume.href}
            target="_blank"
            rel="noopener"
            className="pointer-events-auto ml-auto mr-[6.5rem] inline-flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-[3px] border border-line-strong bg-ink-950 px-2.5 font-mono text-[0.75rem] text-fg transition-colors duration-200 hover:border-fg/40 sm:hidden"
          >
            <FileText aria-hidden size={14} strokeWidth={1.75} className="text-fg-muted" />
            resume
            <span className="sr-only"> (PDF, opens in a new tab)</span>
          </a>
          <a
            href={contact.resume.href}
            target="_blank"
            rel="noopener"
            className="pointer-events-auto ml-auto hidden h-9 items-center gap-2 rounded-[3px] border border-line-strong bg-ink-950 px-3 font-mono text-[0.75rem] text-fg transition-colors duration-200 hover:border-fg/40 sm:inline-flex"
          >
            resume.pdf
            <span aria-hidden className="text-fg-muted">↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <button
            type="button"
            onClick={onOpenPalette}
            className="pointer-events-auto ml-3 mr-[6.5rem] hidden h-9 items-center gap-2 rounded-[3px] border border-line-strong bg-ink-950 px-3 font-mono text-[0.75rem] text-fg-muted transition-colors duration-200 hover:border-fg/40 hover:text-fg sm:inline-flex lg:mr-0"
            aria-label="Open command palette"
            aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
          >
            <span aria-hidden className="text-fg-dim">&gt;</span>
            <span>command</span>
            <kbd className="rounded-[2px] border border-line px-1.5 py-px font-mono text-[0.625rem] text-fg-muted [@media(pointer:coarse)]:hidden">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>
        </div>
      </header>
    </>
  );
}
