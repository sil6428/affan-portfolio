import { useState } from 'react';
import { ArrowUpRight, BookOpen, Download, FolderOpen, GitBranch, Globe } from 'lucide-react';
import Folder from '@/components/reactbits/Folder';
import RB from '@/components/ui/RB';
import { useIsMobile } from '@/lib/media';
import { SOURCE_SITE, type Project, type ProjectLink } from '@/data/projects';
import { CoordLabel } from './shared';

type Artifact = { kind: ProjectLink['kind'] | 'journal'; label: string; href: string };

const KIND = {
  repo: { tag: 'Source', Icon: GitBranch },
  live: { tag: 'Live', Icon: Globe },
  release: { tag: 'Release', Icon: Download },
  journal: { tag: 'Journal', Icon: BookOpen }
} as const;

const host = (href: string) => {
  try {
    const u = new URL(href);
    return `${u.host}${u.pathname === '/' ? '' : u.pathname}`.replace(/\/$/, '');
  } catch {
    return href;
  }
};

/** A paper inside the folder: tiny, because the whole folder is scaled up (fonts are in unscaled px). */
function Paper({ item }: { item: Artifact }) {
  const { tag, Icon } = KIND[item.kind];
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      className="flex h-full w-full flex-col justify-between rounded-[10px] p-[5px] text-ink-950 outline-offset-1"
    >
      <span className="flex items-center justify-between">
        <span className="font-mono text-[6px] font-semibold">{tag}</span>
        <Icon aria-hidden size={7} strokeWidth={2} />
      </span>
      <span className="text-[5.5px] leading-[1.15] font-medium">{item.label}</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

/** Artifacts: a ReactBits Folder whose papers are the project's real links, plus a readable evidence index. */
export default function Artifacts({ project, code }: { project: Project; code: string }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const items: Artifact[] = [
    ...project.links.map((l) => ({ kind: l.kind, label: l.label, href: l.href })),
    { kind: 'journal' as const, label: 'Full journal in the Interactive Lab', href: `${SOURCE_SITE}${project.sourcePath}` }
  ];
  const papers = items.slice(0, 3);
  const size = isMobile ? 1.7 : 2;

  return (
    <section aria-labelledby="artifacts-title" className="relative py-16 md:py-24">
      <div className="container-signal">
        <div className="panel grid overflow-hidden md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <RB
            name="Folder"
            className="relative flex min-h-[380px] flex-col items-center justify-end border-b border-line pb-8 md:min-h-[460px] md:border-r md:border-b-0"
          >
            <div aria-hidden className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative mb-20 md:mb-24">
              <Folder
                color="#101010"
                backColor="#0b0b0b"
                edgeColor="rgb(238 238 238 / 0.16)"
                size={size}
                open={open}
                onOpenChange={setOpen}
                paperColors={['#bdbdbd', '#d6d6d6', '#eeeeee']}
                items={papers.map((p) => (
                  <Paper key={p.href} item={p} />
                ))}
              />
            </div>
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="relative inline-flex items-center gap-2 rounded-[3px] border border-line-strong bg-ink-950 px-4 py-2.5 font-mono text-[12px] text-fg transition-colors duration-200 hover:border-fg/60 hover:bg-ink-850 active:scale-[0.97]"
            >
              <FolderOpen aria-hidden size={14} strokeWidth={1.75} className="text-fg-muted" />
              {open ? 'close ./evidence' : 'open ./evidence'}
            </button>
          </RB>

          <div className="p-6 md:p-10">
            <CoordLabel code={code}>artifacts</CoordLabel>
            <h2 id="artifacts-title" className="mt-5 text-[clamp(1.5rem,2.8vw,2.25rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
              Evidence folder
            </h2>
            {!project.links.length && (
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-fg-muted">
                No public links for this file — the folder holds the full written journal.
              </p>
            )}
            <ul id="artifact-index" className="mt-8 grid border-t border-line">
              {items.map((it) => {
                const { tag, Icon } = KIND[it.kind];
                return (
                  <li key={it.href} className="border-b border-line">
                    <a
                      href={it.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 py-4 transition-colors duration-200"
                    >
                      <span className="grid size-9 place-items-center rounded-[3px] border border-line-strong transition-colors duration-300 group-hover:border-fg/40">
                        <Icon aria-hidden size={15} strokeWidth={1.75} className="text-fg-muted" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[11px] text-fg-muted">{tag.toLowerCase()}</span>
                        <span className="mt-1 block text-[15px] text-fg decoration-fg-dim underline-offset-4 group-hover:underline">{it.label}</span>
                        <span className="mt-0.5 block truncate font-mono text-[11.5px] text-fg-muted">{host(it.href)}</span>
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        size={18}
                        strokeWidth={1.5}
                        className="text-fg-dim transition-[transform,color] duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                      />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
