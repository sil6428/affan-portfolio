import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { usePageMeta } from '@/lib/usePageMeta';
import LogHero from './LogHero';
import SectionNav from './SectionNav';
import CaseFiles from './CaseFiles';
import ExperienceLog from './ExperienceLog';
import Education from './Education';
import Community from './Community';
import { LOG_SECTIONS, jumpToSection } from './model';

/** Deep links like /log#community land on the section once the page has laid out. */
function useInitialHash() {
  const { hash } = useLocation();
  useEffect(() => {
    const id = hash.replace('#', '');
    if (!LOG_SECTIONS.some((s) => s.id === id)) return;
    const t = window.setTimeout(() => jumpToSection(id, true), 120);
    return () => window.clearTimeout(t);
    // Only on arrival — in-page navigation is handled by the section nav.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default function LogPage() {
  usePageMeta(
    'Projects & experience',
    'Case files, experience, education, and community work for Affan Shaikh.'
  );
  useInitialHash();

  return (
    <main id="main" className="relative">
      <LogHero />
      <div className="relative">
        <SectionNav />
        <CaseFiles />
        <ExperienceLog />
        <Education />
        <Community />
      </div>
    </main>
  );
}
