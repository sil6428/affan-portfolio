import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { usePageMeta } from '@/lib/usePageMeta';
import WhoamiHero from './WhoamiHero';
import BioSection from './BioSection';
import IdentityBento from './IdentityBento';
import HowIWork from './HowIWork';
import NextLinks from './NextLinks';

/**
 * /about — ~/whoami. A terminal that answers whoami next to a badge you can grab, the
 * long-form bio read like a file, the identity dashboard, the documentation principles,
 * and the exits.
 */
export default function AboutPage() {
  usePageMeta(
    'About',
    'Affan Shaikh — Networking and IT Security student at Ontario Tech University in Oshawa, Ontario. Identity, education, focus, and how the work is documented.'
  );
  // Deep links such as /about#how-i-work: this page is lazy-loaded, so the browser's own hash
  // jump fires before the section exists. Scroll once it has mounted and laid out.
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    });
    return () => cancelAnimationFrame(raf);
  }, [hash]);
  return (
    <main id="main" className="relative">
      <WhoamiHero />
      <BioSection />
      <IdentityBento />
      <HowIWork />
      <NextLinks />
    </main>
  );
}
