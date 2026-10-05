import type { RBUsage } from '@/data/reactbits';

const route = '/about';

export const aboutBits: RBUsage[] = [
  {
    component: 'DepthText',
    category: 'Text Animations',
    route,
    where: 'Whoami header — the "whoami" title',
    role: 'A static grey 3D extrusion behind the white title, like the outlined ASCII words on the business card. No animation loop; the h1 exposes "Whoami — Affan Shaikh" to assistive tech.'
  },
  {
    component: 'TextType',
    category: 'Text Animations',
    route,
    where: 'Whoami header — tty1 terminal',
    role: 'Types the "whoami" command, then a neofetch-style readout prints beside the ASCII monogram; "run again" replays it. A static transcript is provided for screen readers.'
  },
  {
    component: 'DecryptedText',
    category: 'Text Animations',
    route,
    where: 'Whoami header — the card-word texture around the badge',
    role: 'The scattered business-card words scramble and resolve when hovered (fine pointers only). Everything else on the page is plain text.'
  },
  {
    component: 'Lanyard',
    category: 'Components',
    route,
    where: 'Whoami header — right column (desktop)',
    role: 'Physics ID badge on a lanyard (rapier + three) you can grab and swing, with the badge art front and back; lazy-loaded the first time it is in view, then paused (no render loop, no physics) while off-screen so it never re-drops. Phones, touch, low-power devices and reduced motion get a flippable static badge.'
  },
  {
    component: 'SplitText',
    category: 'Text Animations',
    route,
    where: 'Section headings (context, identity, how I work, next)',
    role: 'A short character rise on each section heading; the second half of each heading is set in muted grey.'
  },
  {
    component: 'FadeContent',
    category: 'Animations',
    route,
    where: 'Bio lead paragraph and the documentation-approach statement',
    role: 'Prose fades in as it enters the viewport (opacity only, so it stays cheap on phones).'
  },
  {
    component: 'AnimatedContent',
    category: 'Animations',
    route,
    where: 'Bio quote, remaining bio paragraphs and the next-route cards',
    role: 'Small staggered slide and rise reveals so each block arrives in order.'
  },
  {
    component: 'MagicBento',
    category: 'Components',
    route,
    where: 'Identity dashboard',
    role: 'Seven-tile fact grid with a faint chalk border glow near the pointer (desktop only; particles, tilt and the floating spotlight are off). The co-founder and contact tiles are full-tile links.'
  },
  {
    component: 'CardSwap',
    category: 'Components',
    route,
    where: 'How I work',
    role: 'A stack of the four documentation principles that eases to the next card every few seconds, paused off-screen and on hover, synced to a visible legend. Phones and reduced motion get a static grid.'
  },
  {
    component: 'GlareHover',
    category: 'Animations',
    route,
    where: 'Next — ~/stack, ~/log and ~/contact cards',
    role: 'A faint light sweep crosses each exit card on hover or keyboard focus.'
  }
];
