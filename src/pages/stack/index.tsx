import { usePageMeta } from '@/lib/usePageMeta';
import StackHero from './StackHero';
import Constellation from './Constellation';
import CategoryExplorer from './CategoryExplorer';
import TerminalExplorer from './TerminalExplorer';
import EvidenceRow from './EvidenceRow';
import { stats } from './data';
import { useIsMobile } from '@/lib/media';
import './stack.css';

/**
 * "/stack" — ~/stack, the signal map. Every skill from src/data/skills.ts; the traced ones are
 * wired to the case files that name them: hero → map → category explorer → stack.log → evidence.
 */
export default function StackPage() {
  const mobile = useIsMobile();
  usePageMeta(
    'Stack',
    `Networks, security, development, and systems & tools: ${stats.skills} skills, ${stats.traced} of them linked to the case files that used them.`
  );
  return (
    <main id="main" className="relative">
      <StackHero />
      <Constellation />
      <CategoryExplorer />
      {!mobile && <TerminalExplorer />}
      <EvidenceRow />
    </main>
  );
}
