import type { RBUsage } from '@/data/reactbits';

/** ReactBits on "/" (~), in page order. */
export const homeBits: RBUsage[] = [
  // Hero — the business card
  {
    component: 'Radar',
    category: 'Backgrounds',
    route: '/',
    where: 'Hero background (desktop only)',
    role: 'A dim grey radar — slow rings, faint spokes, one sweep — behind the card words, masked out behind the name. The only WebGL on the page: lazy-loaded, mounted only while in view, and replaced by the static word texture on phones, low-power devices and reduced motion.'
  },
  {
    component: 'DecryptedText',
    category: 'Text Animations',
    route: '/',
    where: 'Hero ASCII name; scattered card words',
    role: 'Each line of the figlet “AFFAN SHAIKH” decrypts from stray stroke characters into the art, top to bottom, then settles back to plain text (static in reduced motion; on a first visit it waits for the boot screen to start fading). The scattered terminal words behind it scramble when hovered with a mouse.'
  },
  {
    component: 'TextType',
    category: 'Text Animations',
    route: '/',
    where: 'Hero subtitle; closing headline',
    role: 'Types “Networking & IT Security @ Ontario Tech” under the name and, at the end of the page, “Let’s build something useful.”, both ending on a blinking block caret. Final width is reserved so nothing shifts.'
  },

  // ~/log $ ls case-files --top 3
  {
    component: 'Shuffle',
    category: 'Text Animations',
    route: '/',
    where: '“Case files” heading',
    role: 'Characters shuffle in through stroke glyphs, green to white, when the heading scrolls in; hovering re-runs it.'
  },
  {
    component: 'AnimatedContent',
    category: 'Animations',
    route: '/',
    where: 'Case-file list, process table',
    role: 'A short 24px rise-in for two blocks; plain and visible immediately in reduced motion.'
  },

  // ~ $ cat thesis.txt
  {
    component: 'ScrollReveal',
    category: 'Text Animations',
    route: '/',
    where: 'Thesis sentence',
    role: 'The thesis resolves word by word (opacity only, no blur) as it scrolls through the viewport.'
  },

  // ~/log $ cat */metrics
  {
    component: 'Counter',
    category: 'Components',
    route: '/',
    where: 'Evidence board tiles',
    role: 'Rolling digits for measured project outcomes: 286 Canvas items organized across 6 opt-in reporting installations, eight verified file-transfer round trips, 45/45 controlled file changes detected, and a 12-stage review workflow. One overdamped spring drives all columns, odometer style, so no frame on the way up reads past the real value; phones and reduced motion show the final values without a roll. Each tile links to the case file that explains the number and its limits.'
  },

  // ~ $ ps --state=running
  {
    component: 'LatticeLoader',
    category: 'Micro',
    route: '/',
    where: '“Now” table title bar',
    role: 'Small snake-pattern lattice next to the running count, signalling the listed work is still in progress. It animates only while the title bar is on screen (paused otherwise and in reduced motion).'
  },
  {
    component: 'StatusMark',
    category: 'Micro',
    route: '/',
    where: '“Now” table rows',
    role: 'A still monochrome arc beside each piece of in-progress work; the title-bar lattice is the table’s one moving part.'
  },

  // ~/stack $ ls --by-category
  {
    component: 'ScrollVelocity',
    category: 'Text Animations',
    route: '/',
    where: 'Stack marquee',
    role: 'Two opposing rows of the skills a case file shows in use, speeding up with scroll velocity (mouse and trackpad). Mounted only near the viewport (static rows hold the space otherwise, and on low-power devices and reduced motion). Touch screens get a plain CSS drift of the same rows instead, with no per-frame script, paused off screen.'
  }
];
