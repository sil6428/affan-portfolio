import { useEffect } from 'react';

const SITE = 'Affan Shaikh';
/** Title for the home page (matches index.html). */
const HOME_TITLE = 'Affan Shaikh — Networking & IT Security';

/** Sets the document title (and description) for a route; `null` gives the home title. */
export function usePageMeta(title: string | null, description?: string) {
  useEffect(() => {
    document.title = title === null ? HOME_TITLE : `${title} — ${SITE}`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
}
