import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import SquishSwitch from '@/components/reactbits/SquishSwitch';
import RB from '@/components/ui/RB';
import { navRoutes } from '@/data/navigation';
import { projects } from '@/data/projects';
import { contact } from '@/data/profile';
import { useDevMode } from '@/lib/devmode';
import { useMotionPreference } from '@/lib/motion';
import { copyText, useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { preloadRoute } from '@/app/routeModules';

type Group = 'navigate' | 'case files' | 'actions';

interface PaletteItem {
  id: string;
  group: Group;
  /** Accessible name: the plain title first, then the command ("About — cd ~/whoami"). */
  name: string;
  /** The "command" printed in the row, e.g. `cd ~/stack`. */
  title: string;
  hint: string;
  keywords: string;
  run: () => void;
  path?: string;
}

/** Subsequence fuzzy score: higher is better, -1 means no match. */
function score(query: string, text: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct >= 0) return 100 - direct;
  let ti = 0;
  let gaps = 0;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found < 0) return -1;
    gaps += found - ti;
    ti = found + 1;
  }
  return 50 - gaps;
}

/** Hidden commands: left out of the default list, shown only when the query asks for them. */
const HIDDEN: Record<string, string> = { 'act-devmode': 'devmode' };

/**
 * ⌘K / Ctrl+K — a terminal prompt over the page: type to filter routes, case files and actions,
 * arrows to move, Enter to run. The footer holds the reduce-motion switch. Developer Mode stays
 * hidden: it is listed only when the query matches "devmode" (or toggled with Alt+Shift+D).
 */
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const devMode = useDevMode();
  const motionPref = useMotionPreference();
  const { notify } = useToast();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const listId = useId();
  const toggleDevMode = devMode.toggle;

  const items = useMemo<PaletteItem[]>(() => {
    const go = (path: string) => () => navigate(path);
    const external = (href: string) => () => window.open(href, '_blank', 'noopener,noreferrer');
    return [
      ...navRoutes.map((r) => ({
        id: `nav-${r.path}`,
        group: 'navigate' as const,
        name: `${r.label} — cd ${r.code}`,
        title: `cd ${r.code}`,
        hint: r.label.toLowerCase(),
        keywords: `${r.label} ${r.description} ${r.path}`,
        run: go(r.path),
        path: r.path
      })),
      ...projects.map((p) => ({
        id: `case-${p.slug}`,
        group: 'case files' as const,
        name: `${p.shortTitle} — cat ~/log/${p.slug}`,
        title: `cat ~/log/${p.slug}`,
        hint: p.shortTitle,
        keywords: `${p.title} ${p.kicker} ${p.stack.join(' ')} ${p.category}`,
        run: go(`/log/${p.slug}`),
        path: `/log/${p.slug}`
      })),
      {
        id: 'act-copy-email',
        group: 'actions' as const,
        name: `Copy email — ${contact.email}`,
        title: 'copy email',
        hint: contact.email,
        keywords: 'email copy contact mail clipboard',
        run: () => {
          void copyText(contact.email).then((ok) =>
            notify(
              ok
                ? { title: 'Email copied', description: contact.email, tone: 'success' }
                : { title: 'Copy blocked by the browser', description: contact.email, tone: 'error' }
            )
          );
        }
      },
      {
        id: 'act-mail',
        group: 'actions' as const,
        name: 'Mail Affan — mail affan (opens your mail app)',
        title: 'mail affan',
        hint: 'opens your mail app',
        keywords: 'email mailto write message contact',
        run: () => {
          window.location.href = `mailto:${contact.email}`;
        }
      },
      {
        id: 'act-resume',
        group: 'actions' as const,
        name: 'Resume — open resume.pdf (PDF, opens in a new tab)',
        title: 'open resume.pdf',
        hint: 'pdf',
        keywords: 'resume cv pdf',
        run: external(contact.resume.href)
      },
      {
        id: 'act-github',
        group: 'actions' as const,
        name: 'GitHub — open github (opens in a new tab)',
        title: 'open github',
        hint: contact.github.label,
        keywords: 'github code repositories source',
        run: external(contact.github.href)
      },
      {
        id: 'act-linkedin',
        group: 'actions' as const,
        name: 'LinkedIn — open linkedin (opens in a new tab)',
        title: 'open linkedin',
        hint: contact.linkedin.label,
        keywords: 'linkedin profile network',
        run: external(contact.linkedin.href)
      },
      {
        id: 'act-room',
        group: 'actions' as const,
        name: '3D portfolio — open 3d-portfolio (opens in a new tab)',
        title: 'open 3d-portfolio',
        hint: contact.interactiveLab.label,
        keywords: '3d portfolio three room interactive original',
        run: external(contact.interactiveLab.href)
      },
      {
        id: 'act-devmode',
        group: 'actions' as const,
        name: 'Developer Mode — devmode --toggle',
        title: 'devmode --toggle',
        hint: 'reactbits overlay',
        keywords: 'devmode developer mode reactbits components debug inspect hud',
        run: toggleDevMode
      }
    ];
  }, [navigate, notify, toggleDevMode]);

  const results = useMemo(() => {
    const q = query.trim();
    const ql = q.toLowerCase();
    const asked = (word: string) => ql.length >= 3 && (word.startsWith(ql) || ql.startsWith(word));
    const visible = items.filter((item) => !HIDDEN[item.id] || asked(HIDDEN[item.id]));
    if (!q) return visible;
    return visible
      .map((item) => ({ item, s: Math.max(score(q, item.title), score(q, item.keywords) - 10, score(q, item.hint) - 5) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.item);
  }, [items, query]);

  // Open: remember focus, reset, focus the input. Close: restore focus.
  useEffect(() => {
    if (open) {
      restoreRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
        restoreRef.current?.focus?.();
      };
    }
  }, [open]);

  useEffect(() => {
    const item = results[active];
    if (item?.path) preloadRoute(item.path);
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, results, listId]);

  const runItem = (item: PaletteItem | undefined) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runItem(results[active]);
    } else if (e.key === 'Tab') {
      // Focus trap between the input and the footer switches.
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('input, button, [tabindex="0"]');
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-ink-950/85 px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            onKeyDown={onKeyDown}
            className="panel w-full max-w-xl overflow-hidden border-line-strong font-mono shadow-[0_24px_80px_-24px_rgb(0_0_0/0.9)]"
            initial={{ y: 10, opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 6, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div aria-hidden className="flex items-center justify-between border-b border-line px-4 py-2 text-[0.6875rem] text-fg-muted">
              <span>
                <span className="text-fg-dim">affan@shaikh</span>:~/bin/palette
              </span>
              <span>esc to close</span>
            </div>

            <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
              <span aria-hidden className="text-base font-semibold text-fg-dim">
                &gt;
              </span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="cd, cat, open, copy…"
                className="w-full bg-transparent text-[0.9375rem] text-fg caret-phosphor placeholder:text-fg-muted focus:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls={listId}
                aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
                aria-label="Type a command"
                spellCheck={false}
                autoComplete="off"
              />
              <span aria-hidden className="shrink-0 text-[0.625rem] text-fg-muted">
                {results.length}
              </span>
            </div>

            <ul id={listId} role="listbox" aria-label="Commands" className="max-h-[50vh] overflow-y-auto py-1.5">
              {results.length === 0 && (
                <li className="px-4 py-6 text-[0.8125rem] text-fg-muted">
                  <span className="text-alert">command not found:</span> {query}
                </li>
              )}
              {results.map((item, index) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                const isActive = index === active;
                return (
                  <li key={item.id} role="presentation">
                    {header && <div className="px-4 pb-1 pt-3 text-[0.6875rem] text-fg-muted"># {header}</div>}
                    <div
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={isActive}
                      aria-label={item.name}
                      onMouseMove={() => setActive(index)}
                      onClick={() => runItem(item)}
                      className="relative mx-1.5 flex cursor-pointer items-center gap-3 rounded-[3px] px-2.5 py-2 text-[0.8125rem]"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="palette-highlight"
                          className="absolute inset-0 rounded-[3px] bg-ink-700"
                          transition={{ type: 'spring', stiffness: 700, damping: 48 }}
                        />
                      )}
                      <span aria-hidden className={cn('relative w-3 shrink-0', isActive ? 'text-phosphor' : 'text-fg-dim')}>
                        {isActive ? '›' : ' '}
                      </span>
                      <span className={cn('relative min-w-0 flex-1 truncate', isActive ? 'font-semibold text-fg' : 'text-fg')}>
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          'relative hidden max-w-[45%] truncate text-[0.6875rem] sm:inline',
                          isActive ? 'text-fg-muted' : 'text-fg-dim'
                        )}
                      >
                        {item.hint}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>

            <RB
              name="SquishSwitch"
              className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-line px-4 py-3 text-[0.6875rem] text-fg-muted"
            >
              <label className="flex items-center gap-2.5">
                <SquishSwitch
                  checked={motionPref.reduced}
                  onChange={(checked) => motionPref.setOverride(checked ? 'reduced' : 'full')}
                  ariaLabel="Reduce motion"
                  width={34}
                  height={18}
                  radius={3}
                  trackColor="#1f1f1f"
                  trackOnColor="#e8e8e8"
                  thumbColor="#a8a8a8"
                  thumbOnColor="#060606"
                />
                <span aria-hidden>--reduce-motion</span>
              </label>
              <span aria-hidden className="ml-auto hidden sm:inline">
                ↑↓ select · ↵ run
              </span>
            </RB>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
