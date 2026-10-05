import { usePageMeta } from '@/lib/usePageMeta';
import { profile } from '@/data/profile';
import ContactHero from './ContactHero';
import Compose from './Compose';
import Documents from './Documents';

/** ~/contact — the address first (mailto + click-to-copy + the other channels), then a mail composer and the documents. */
export default function ContactPage() {
  usePageMeta('Contact', `${profile.status}. Email, LinkedIn, GitHub, and resume for ${profile.name}.`);
  return (
    <main id="main" className="relative">
      <ContactHero />
      <Compose />
      <Documents />
    </main>
  );
}
