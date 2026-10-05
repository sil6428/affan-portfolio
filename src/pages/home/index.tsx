import { useEffect, useRef } from 'react';
import { ScrollTrigger } from '@/lib/scrolltrigger';
import { usePageMeta } from '@/lib/usePageMeta';
import { profile } from '@/data/profile';
import HeroSection from './HeroSection';
import ThesisSection from './ThesisSection';
import EvidenceSection from './EvidenceSection';
import CaseFilesSection from './CaseFilesSection';
import StackSignalSection from './StackSignalSection';
import ProcessesSection from './ProcessesSection';
import ClosingSection from './ClosingSection';
import './home.css';

/**
 * "/" (~). The business card, then a short terminal session: case files → thesis → evidence →
 * running processes → stack → open a channel. The work comes first; how it is documented follows.
 */
export default function HomePage() {
  usePageMeta(null, `${profile.name} — ${profile.title}. ${profile.siteDescription}`);
  const mainRef = useRef<HTMLElement>(null);

  // Scroll-linked effects measure positions once; lazy images and web fonts change the page
  // height after mount, so re-measure whenever the height settles.
  useEffect(() => {
    const el = mainRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    let t = 0;
    let lastH = 0;
    const ro = new ResizeObserver(([entry]) => {
      const h = Math.round(entry.contentRect.height);
      if (Math.abs(h - lastH) < 2) return;
      lastH = h;
      window.clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 160);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <main id="main" ref={mainRef} className="relative">
      <HeroSection />
      <CaseFilesSection />
      <ThesisSection />
      <EvidenceSection />
      <ProcessesSection />
      <StackSignalSection />
      <ClosingSection />
    </main>
  );
}
