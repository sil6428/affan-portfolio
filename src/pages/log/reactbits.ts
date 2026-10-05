import type { RBUsage } from '@/data/reactbits';

const route = '/log';

export const logBits: RBUsage[] = [
  {
    component: 'Topography',
    category: 'Backgrounds',
    route,
    where: 'Hero backdrop, right side (desktop only)',
    role: 'Slow grey contour map behind the log index, masked to the right and with no pointer tracking. The only continuously animating effect on the page; phones, low-power devices and reduced motion get the static word texture only.'
  },
  {
    component: 'TextType',
    category: 'Text Animations',
    route,
    where: 'Hero shell prompt',
    role: 'Types "cd ~/log && ls" once into the prompt above the h1; a CSS block caret (no JS loop) blinks beside it.'
  },
  {
    component: 'PillNav',
    category: 'Components',
    route,
    where: 'Sticky section tabs under the header',
    role: 'Flat terminal tab strip for case-files · experience · education · community, with smooth hash scrolling and the active section tracked by an IntersectionObserver.'
  },
  {
    component: 'RubberSegment',
    category: 'Micro',
    route,
    where: 'Case files — --category filter',
    role: 'Segmented control that filters the ls -la listing by category (all / security / comms / infra / venture / web), with counts from the data.'
  },
  {
    component: 'AnimatedList',
    category: 'Components',
    route,
    where: 'Experience — record list (desktop)',
    role: 'Keyboard-navigable listbox of log records ([2026-05] SSIK :: co-founder) that drives the detail panel.'
  },
  {
    component: 'ScrollFloat',
    category: 'Text Animations',
    route,
    where: 'Experience — year rail (2026 / 2025)',
    role: 'Scroll-scrubbed year markers that ease into place beside the trace line as the records pass.'
  },
  {
    component: 'CountUp',
    category: 'Text Animations',
    route,
    where: 'Community hours total',
    role: 'Counts the 430 community hours up from zero, settling on the displayed figure in under a second once on screen.'
  },
  {
    component: 'AnimatedContent',
    category: 'Animations',
    route,
    where: 'Education panel and community tanks',
    role: 'Short rise-and-fade entrances (transform/opacity only) for the main panels.'
  },
  {
    component: 'SloshGauge',
    category: 'Micro',
    route,
    where: 'Community — two hour tanks',
    role: 'Liquid tanks (chalk and grey) that slosh up to each organization’s share of 430 volunteer hours, then park (no idle loop).'
  }
];
