import type { RBUsage } from '@/data/reactbits';

/** Case-study pages (/log/:slug). Exported as `workBits` for the registry aggregator. */
const route = '/log/:slug';

const BACKGROUND_ROLE =
  'Case-file header background in the card’s greys over near-black, masked to the poster side with no pointer tracking. Desktop only and mounted via InView; phones, low-power devices and reduced motion get a static grid.';

export const workBits: RBUsage[] = [
  { component: 'Scanner', category: 'Backgrounds', route, where: 'Header — File Integrity Monitor', role: BACKGROUND_ROLE },
  { component: 'WebThreads', category: 'Backgrounds', route, where: 'Header — P2P Messaging', role: BACKGROUND_ROLE },
  { component: 'LightTunnel', category: 'Backgrounds', route, where: 'Header — Secure File Transfer', role: BACKGROUND_ROLE },
  { component: 'Radar', category: 'Backgrounds', route, where: 'Header — SSIK', role: BACKGROUND_ROLE },
  { component: 'SlicedWaves', category: 'Backgrounds', route, where: 'Header — OTNow', role: BACKGROUND_ROLE },
  { component: 'Threads', category: 'Backgrounds', route, where: 'Header — Cisco Networking Labs', role: BACKGROUND_ROLE },
  { component: 'Grainient', category: 'Backgrounds', route, where: 'Header — Archtech', role: BACKGROUND_ROLE },
  { component: 'Prism', category: 'Backgrounds', route, where: 'Header — Interactive Portfolio', role: BACKGROUND_ROLE },
  {
    component: 'TextType',
    category: 'Text Animations',
    route,
    where: 'Breadcrumb prompt',
    role: 'Types "cat README.md" after affan@shaikh:~/log/<slug>$, where ~ and log are real breadcrumb links; a CSS block caret (no JS loop) sits beside it.'
  },
  {
    component: 'TiltedCard',
    category: 'Components',
    route,
    where: 'Header poster (desktop)',
    role: 'The project poster in a bracketed frame, tilting a few degrees toward the pointer while hovered.'
  },
  {
    component: 'DecryptedText',
    category: 'Text Animations',
    route,
    where: 'Spec sheet field labels',
    role: 'Field labels decrypt once as the spec sheet scrolls into view; the fact values are plain text from the first frame.'
  },
  {
    component: 'CountUp',
    category: 'Text Animations',
    route,
    where: 'By the numbers',
    role: 'Counts each reported figure (files, changes detected, items, pages) up from zero in 0.6s once visible, with its label directly underneath.'
  },
  {
    component: 'LineSidebar',
    category: 'Components',
    route,
    where: 'Journal contents (desktop)',
    role: 'Sticky table of contents: real hash links, and a green marker on the section being read (the one accent on screen). No pointer-proximity shift.'
  },
  {
    component: 'SpringCheck',
    category: 'Micro',
    route,
    where: 'Journal procedures (./run-procedure.sh)',
    role: 'Step-by-step procedures become a checklist the reader can tick through, with a verified count and reset.'
  },
  {
    component: 'FadeContent',
    category: 'Animations',
    route,
    where: 'Not claimed list',
    role: 'Quiet opacity-only entrance for the boundaries the file draws around its own evidence.'
  },
  {
    component: 'Folder',
    category: 'Components',
    route,
    where: 'Artifacts — evidence folder',
    role: 'Opens to fan out the project’s real links (repository, live site, release, full journal) as papers; the readable index sits beside it.'
  },
  {
    component: 'PixelTransition',
    category: 'Animations',
    route,
    where: 'Previous / next file',
    role: 'Hovering a neighbouring file dissolves its poster into a title plate (cd ../<slug>) through a dark grey pixel grid.'
  }
];
