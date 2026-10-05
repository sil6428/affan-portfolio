import type { RBUsage } from '@/data/reactbits';

export const contactBits: RBUsage[] = [
  {
    component: 'DecryptedText',
    category: 'Text Animations',
    route: '/contact',
    where: 'Hero — the word "channel" in the headline',
    role: 'Decrypts once on arrival, ending on a block caret'
  },
  {
    component: 'ElectricBorder',
    category: 'Animations',
    route: '/contact',
    where: 'Hero — primary channel card (desktop)',
    role: 'A thin, slow grey line with no glow marks the one card that matters; static hairline on phones and reduced motion'
  },
  {
    component: 'CallChip',
    category: 'Micro',
    route: '/contact',
    where: 'Primary channel card — copy_email() chip',
    role: 'Reports the real clipboard call behind "copy email": running, done or failed, with the measured duration'
  },
  {
    component: 'Stepper',
    category: 'Components',
    route: '/contact',
    where: 'Compose — subject, message, review',
    role: 'Three validated steps that build a mail draft and hand it to the visitor’s own mail app'
  },
  {
    component: 'FolderFloat',
    category: 'Micro',
    route: '/contact',
    where: 'Documents — the ~/docs folder (desktop)',
    role: 'The resume and the 3D portfolio spring out of a folder as papers; with a mouse they float on physics and can be dragged (lazy chunk, never loaded on phones)'
  }
];
