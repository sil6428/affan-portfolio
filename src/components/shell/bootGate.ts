/** sessionStorage flag: the boot sequence has played in this browser session. */
export const BOOT_KEY = 'signal:booted';

/** First visit of the session, with full motion. */
export function shouldBoot(reduced: boolean): boolean {
  if (reduced) return false;
  try {
    return window.sessionStorage.getItem(BOOT_KEY) !== '1';
  } catch {
    return false;
  }
}
