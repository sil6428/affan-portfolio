import type { RBUsage } from '@/data/reactbits';

export const shellBits: RBUsage[] = [
  { component: 'Dock', category: 'Components', route: '*', where: 'Bottom of every page (desktop)', role: 'Primary navigation: square terminal keys (real links) that magnify on hover, labels like "About · ~/whoami" and a small phosphor bar under the active route' },
  { component: 'StaggeredMenu', category: 'Components', route: '*', where: 'Menu button, top right (mobile + tablet)', role: 'Full-screen navigation: two grey layers wipe in, then the routes by name with their shell paths, plus the resume, email, GitHub and LinkedIn' },
  { component: 'DecryptedText', category: 'Text Animations', route: '*', where: 'Header shell prompt', role: 'Re-decrypts the current path in affan@shaikh:~/path $ on every navigation' },
  { component: 'PixelSwap', category: 'Animations', route: '*', where: 'Route transitions', role: 'Pixels assemble a `cd ~/route` terminal cover while the next page swaps in underneath' },
  { component: 'LatticeLoader', category: 'Micro', route: '*', where: 'Boot sequence + lazy-route fallback', role: 'Boot status with a live timer, and the "loading ~/path" indicator while a route chunk downloads' },
  { component: 'TextType', category: 'Text Animations', route: '*', where: 'Boot sequence prompt', role: 'Types `whoami` at the first prompt before the ASCII name prints' },
  { component: 'StatusMark', category: 'Micro', route: '*', where: 'Boot sequence output', role: 'Pending → running → done marks for each boot line (case-file count, location, status from real data)' },
  { component: 'SquishSwitch', category: 'Micro', route: '*', where: 'Command palette footer', role: 'The --reduce-motion switch' },
  { component: 'ClickSpark', category: 'Animations', route: '*', where: 'Whole site', role: 'Short grey spark burst on click; its canvas only draws while a burst is alive and is off under reduced motion' },
  { component: 'SwipeToast', category: 'Micro', route: '*', where: 'Toasts (copy email, palette actions)', role: 'Swipe-to-dismiss feedback with [ ok ] / [fail] tags and a grey fuse timer' },
  { component: 'CurvedLoop', category: 'Text Animations', route: '*', where: 'Footer (desktop, full motion)', role: 'Slow, dim ticker of the co-op roles Affan is looking for; draggable, unmounted when off-screen' },
  { component: 'GlitchText', category: 'Text Animations', route: '*', where: 'Developer Mode HUD (hidden)', role: 'Glitching DEV MODE label in phosphor and ash' },
  { component: 'FuzzyText', category: 'Text Animations', route: '/404', where: '404 — the status code (desktop)', role: 'A static-y "404" that fuzzes harder on hover; a plain ASCII 404 on phones and under reduced motion' },
  { component: 'DecryptedText', category: 'Text Animations', route: '/404', where: '404 — the error line', role: 'The "No such file or directory" output decrypts in when the page opens' }
];
