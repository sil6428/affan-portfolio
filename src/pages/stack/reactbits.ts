import type { RBUsage } from '@/data/reactbits';

const route = '/stack';

export const stackBits: RBUsage[] = [
  {
    component: 'VariableProximity',
    category: 'Text Animations',
    route,
    where: 'Hero — the “Signal map” headline',
    role: 'Geist Mono’s weight axis swells under the pointer, letter by letter, so the title reacts like a sensor (static text on touch, phones and reduced motion).'
  },
  {
    component: 'OrbitImages',
    category: 'Animations',
    route,
    where: 'Hero — instrument dial beside the headline',
    role: 'Two counter-rotating orbits of development and systems logos in chalk (the inner ring dimmed) around the card’s ASCII monogram (outer ring: development, inner ring: systems & tools); paused off-screen, and standing still on phones and with reduced motion.'
  },
  {
    component: 'DecryptedText',
    category: 'Text Animations',
    route,
    where: 'Hero — the card-word texture behind the headline',
    role: 'The scattered business-card words scramble and resolve when hovered (fine pointers only). Counts and metrics stay plain text so they read correctly at a glance.'
  },
  {
    component: 'DotField',
    category: 'Backgrounds',
    route,
    where: 'Map — behind the skill graph (desktop)',
    role: 'A grey dot lattice that bulges gently around the cursor as you trace wires; it stops drawing once the field settles, mounts only near the viewport (desktop only), and is replaced by a static grid on low-power devices and with reduced motion.'
  },
  {
    component: 'WarmTooltip',
    category: 'Micro',
    route,
    where: 'Map nodes and category-explorer chips',
    role: 'One inverted (chalk-on-ink) tooltip glides between nodes, reading out where each skill was used (or that it is listed only) and how many skills each case file links.'
  },
  {
    component: 'BranchedMenu',
    category: 'Micro',
    route,
    where: 'Map on phones',
    role: 'Replaces the graph below 768px: categories fold open into their skills, the one selected branch draws in phosphor, and a readout pins its case files.'
  },
  {
    component: 'JellyRadio',
    category: 'Micro',
    route,
    where: 'Category explorer — filter',
    role: 'Elastic radio group (All / Networks / Security / Development / Systems & tools) that squashes its neighbours as the selection moves.'
  },
  {
    component: 'BorderGlow',
    category: 'Components',
    route,
    where: 'Category explorer — one card per category',
    role: 'A thin chalk edge trace that follows the pointer around each category card.'
  },
  {
    component: 'StatusMark',
    category: 'Micro',
    route,
    where: 'stack.log terminal — title bar',
    role: 'Spins while a grep is running, then settles into a check (matches) or an alert cross (no match).'
  },
  {
    component: 'SpotlightCard',
    category: 'Components',
    route,
    where: 'Strongest evidence — metric cards',
    role: 'A faint pointer spotlight over cards pairing a metric reported by each case file with the skills it used to get there.'
  }
];
