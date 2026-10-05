import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { CornerDownLeft } from 'lucide-react';
import { ASCII_CAT } from '@/data/card';
import StatusMark, { type StatusMarkStatus } from '@/components/reactbits/StatusMark';
import RB from '@/components/ui/RB';
import Section from '@/components/ui/Section';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { grepLines, projectBySlug, stats, type GrepLine } from './data';
import { SectionHead, StackLabel } from './parts';

const PRESETS = ['tls', 'cisco', 'python', 'security', 'listed'];

/** Wraps every case-insensitive occurrence of `q` in an inverted (selected) mark — white, like a terminal selection. */
function mark(text: string, q: string): ReactNode {
  if (!q) return text;
  const lower = text.toLowerCase();
  const out: ReactNode[] = [];
  let i = 0;
  let hit = lower.indexOf(q, i);
  while (hit !== -1) {
    if (hit > i) out.push(text.slice(i, hit));
    out.push(
      <mark key={hit} className="rounded-[1px] bg-fg px-px text-ink-950">
        {text.slice(hit, hit + q.length)}
      </mark>
    );
    i = hit + q.length;
    hit = lower.indexOf(q, i);
  }
  if (i < text.length) out.push(text.slice(i));
  return out;
}

function Line({ line, q }: { line: GrepLine; q: string }) {
  const { skill, tag } = line;
  return (
    <li className="group flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-[var(--radius-sm)] px-2 py-1 transition-colors hover:bg-ink-800">
      <span className="shrink-0 text-fg-dim">
        [{mark(tag, q)}]
      </span>
      <span className="text-fg">{mark(skill.name, q)}</span>
      <span aria-hidden className="text-fg-dim">
        →
      </span>
      <span className="sr-only">used in</span>
      {skill.usedIn.length ? (
        skill.usedIn.map((slug, i) => (
          <Fragment key={slug}>
            <Link
              to={`/log/${slug}`}
              aria-label={`${projectBySlug[slug]?.title ?? slug} (${slug})`}
              className="text-fg-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-fg"
            >
              {mark(slug, q)}
            </Link>
            {i < skill.usedIn.length - 1 && <span className="-ml-2 text-fg-dim">,</span>}
          </Fragment>
        ))
      ) : (
        <span className="text-fg-dim">{mark('(listed only)', q)}</span>
      )}
    </li>
  );
}

export default function TerminalExplorer() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const inputId = useId();
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [settled, setSettled] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => (q ? grepLines.filter((l) => l.text.toLowerCase().includes(q)) : grepLines), [q]);

  // A short "running" beat after each keystroke, then the result settles (instant when reduced).
  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setSettled(q), 260);
    return () => window.clearTimeout(t);
  }, [q, reduced]);

  const running = !reduced && settled !== q;
  const status: StatusMarkStatus = running ? 'running' : matches.length ? 'done' : 'failed';
  const statusLabel = running
    ? 'grepping…'
    : !q
      ? `${stats.skills} lines · type to filter`
      : matches.length
        ? `${matches.length} of ${stats.skills} ${matches.length === 1 ? 'line' : 'lines'}`
        : 'no match';

  const run = (value: string) => {
    setQuery(value);
    setNotice(null);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      setNotice(null);
      return;
    }
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (!q) {
      setNotice('Type part of a skill, category, or case-file slug first.');
    } else if (matches.length === 1) {
      const target = matches[0].skill.usedIn[0];
      if (target) navigate(`/log/${target}`);
      else setNotice(`${matches[0].skill.name} is listed only — there is no case file to open yet.`);
    } else if (matches.length > 1) {
      setNotice(`${matches.length} lines match — narrow it to one line and press Enter to open its case file.`);
    } else {
      setNotice('Nothing to open — no line matches.');
    }
  };

  return (
    <Section id="terminal" aria-labelledby="terminal-title" className="scroll-mt-20">
      <StackLabel index="03" path="~/stack/stack.log" />
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="self-start lg:sticky lg:top-28 lg:col-span-4">
          <SectionHead
            stacked
            id="terminal-title"
            kicker="grep the stack"
            title={
              <>
                Query it like a <span className="text-fg-muted">log</span>
              </>
            }
          >
            <p>
              One line per skill: category, name, and the case files that used it. The filter runs on every keystroke;
              when exactly one line is left, Enter opens its first case file.
            </p>
          </SectionHead>
          <figure className="mt-8 hidden rounded-[var(--radius-md)] border border-line bg-ink-900 p-4 font-mono text-[12px] md:block">
            <figcaption className="mb-3 text-fg-muted">
              <span className="text-fg-dim"># </span>reading a line
            </figcaption>
            <p className="leading-relaxed">
              <span className="text-fg-dim">[category]</span> <span className="text-fg">skill</span>{' '}
              <span className="text-fg-dim">→</span>{' '}
              <span className="text-fg-muted underline decoration-line-strong underline-offset-4">case-file-slug</span>
            </p>
            <p className="mt-2 text-fg-muted">Slugs are links. “(listed only)” marks a skill with no case file yet.</p>
          </figure>
        </div>

        <RB name="StatusMark" className="panel brackets overflow-hidden font-mono lg:col-span-8">
          {/* Title bar */}
          <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 md:px-6">
            <span className="text-[0.75rem] text-fg-muted">
              <span className="text-fg-dim">[tty2]</span> affan@shaikh: ~/stack/stack.log
            </span>
            <span id={statusId} className="flex items-center gap-2 text-[11px] text-fg-muted">
              <StatusMark
                status={status}
                label={statusLabel}
                color="#eeeeee"
                doneColor="#3fe07a"
                errorColor="#ff5f56"
                size={16}
                fontSize={11}
                strike={false}
                style={{ gap: 8 }}
              />
            </span>
          </div>

          {/* Prompt */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-ink-950 px-5 py-4 md:px-6">
            <label htmlFor={inputId} className="shrink-0 text-[14px] text-fg-muted">
              <span aria-hidden className="text-fg-dim">
                ${' '}
              </span>
              skills --grep
            </label>
            <div className="relative min-w-[10rem] flex-1">
              <input
                ref={inputRef}
                id={inputId}
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setNotice(null);
                }}
                onKeyDown={onKeyDown}
                placeholder="sha, vlan, python, ssik…"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-describedby={statusId}
                aria-controls="terminal-output"
                className="stack-terminal-input w-full rounded-[var(--radius-sm)] border border-transparent bg-transparent px-2 py-1.5 text-[15px] text-fg outline-none placeholder:text-fg-dim focus-visible:border-phosphor/60 focus-visible:outline-none"
              />
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] text-fg-dim sm:inline-flex" aria-hidden>
              <CornerDownLeft size={13} strokeWidth={1.75} /> open · esc clear
            </span>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3 md:px-6">
            <span className="mr-1 text-[0.75rem] text-fg-dim">try:</span>
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => run(p)}
                aria-pressed={q === p}
                className={cn(
                  'rounded-[3px] border px-2.5 py-1 text-[12px] transition-[border-color,color,background-color] duration-200 active:scale-[0.97]',
                  q === p
                    ? 'border-fg bg-fg text-ink-950'
                    : 'border-line-strong text-fg-muted hover:border-fg/40 hover:text-fg'
                )}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Output */}
          <div className="relative">
            <ul
              id="terminal-output"
              aria-label="Matching skills"
              className="stack-scroll max-h-[420px] overflow-y-auto px-3 py-4 text-[13px] leading-relaxed md:px-4"
            >
              {matches.map((l) => (
                <Line key={l.skill.id} line={l} q={q} />
              ))}
              {matches.length === 0 && (
                <li className="flex flex-wrap items-end gap-x-5 gap-y-3 px-2 py-1 text-fg-muted">
                  <span className="min-w-0 flex-1 basis-[16rem]">
                    <span className="text-alert">grep:</span> no skill line contains “{query.trim()}”. Try a category
                    (networks, security, development, systems), a case-file slug, or “listed”.
                  </span>
                  <pre aria-hidden className="ascii m-0 text-fg-dim">
                    {ASCII_CAT}
                  </pre>
                </li>
              )}
            </ul>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-ink-900 to-transparent"
            />
          </div>

          <div className="flex items-start gap-2 border-t border-line px-5 py-3 text-[12px] md:px-6" aria-live="polite">
            <span aria-hidden className="text-fg-dim">
              ›
            </span>
            <span className={notice ? 'text-fg' : 'text-fg-muted'}>
              {notice ??
                (matches.length === 1 && q
                  ? matches[0].skill.usedIn.length
                    ? `1 line — press Enter to open ${projectBySlug[matches[0].skill.usedIn[0]]?.title}.`
                    : `1 line — ${matches[0].skill.name} is listed only.`
                  : 'Filters skill names, categories, and case-file slugs.')}
            </span>
          </div>
        </RB>
      </div>
    </Section>
  );
}
