import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The one place ScrollTrigger is registered. Every component imports it from here, never from
 * 'gsap/ScrollTrigger' directly.
 *
 * Why: the first gsap.registerPlugin(ScrollTrigger) calls ScrollTrigger.enable(), which starts a
 * keep-alive loop (`_rafBugFix`: requestAnimationFrame(itself), forever) meant to smooth repaints in
 * old Firefox. On this site it kept the main thread awake at idle for the rest of the session and
 * made the browser re-check every running CSS animation each frame, which costs real battery on a
 * phone. enable() uses requestAnimationFrame only for that loop, so we stub it for the duration of
 * the first registration and restore it straight after. ScrollTrigger's scroll/resize updates use
 * their own rAF calls later and are untouched. Later registerPlugin calls in the vendored ReactBits
 * files are no-ops (ScrollTrigger guards on _coreInitted).
 */
if (typeof window !== 'undefined') {
  const raf = window.requestAnimationFrame;
  window.requestAnimationFrame = () => 0;
  try {
    gsap.registerPlugin(ScrollTrigger);
  } finally {
    window.requestAnimationFrame = raf;
  }
}

export { ScrollTrigger };
