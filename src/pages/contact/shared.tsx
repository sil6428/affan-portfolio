import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '@/lib/motion';
import { contact } from '@/data/profile';

export const EASE = [0.16, 1, 0.3, 1] as const;

/** Light entrance as a block scrolls into view: opacity + a few pixels of rise (no filters — cheap on phones). */
export function Resolve({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Shell prompt line: `affan@shaikh:~/contact$ <command>`. */
export function Prompt({ path = '~/contact', children, className }: { path?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[0.75rem] text-fg-muted ${className ?? ''}`}>
      <span className="text-fg-dim">affan@shaikh</span>:{path}$ <span className="text-fg">{children}</span>
    </p>
  );
}

/** Section heading: a `## name` comment line, a white mono headline, and an optional body. */
export function SectionHeading({
  id,
  comment,
  title,
  children
}: {
  id: string;
  comment: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Resolve>
      <p className="font-mono text-[0.75rem] text-fg-muted">
        <span aria-hidden>## </span>
        {comment}
      </p>
      <h2 id={id} className="mt-4 text-[clamp(1.85rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-fg">
        {title}
      </h2>
      {children ? <div className="mt-5 max-w-[60ch] text-[0.9375rem] leading-relaxed text-fg-muted md:text-base">{children}</div> : null}
    </Resolve>
  );
}

export interface Channel {
  /** File-style name shown in the listing. */
  name: string;
  label: string;
  /** Where the "symlink" points — the real address or URL. */
  target: string;
  href: string;
  external: boolean;
}

/** The other ways to reach Affan besides email, straight from src/data/profile.ts (listed once, on the card). */
export const channels: Channel[] = [
  { name: 'linkedin', label: 'LinkedIn', target: contact.linkedin.label, href: contact.linkedin.href, external: true },
  { name: 'github', label: 'GitHub', target: contact.github.label, href: contact.github.href, external: true }
];

/** The documents (listed once, in the Documents section): the resume PDF and the interactive 3D portfolio. */
export const documents: Channel[] = [
  { name: 'resume.pdf', label: 'Resume (PDF)', target: contact.resume.href.replace(/^\//, ''), href: contact.resume.href, external: true },
  {
    name: '3d-portfolio',
    label: '3D portfolio',
    target: contact.interactiveLab.label,
    href: contact.interactiveLab.href,
    external: true
  }
];
