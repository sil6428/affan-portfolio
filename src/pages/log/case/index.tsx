import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { usePageMeta } from '@/lib/usePageMeta';
import { LinkButton } from '@/components/ui/Button';
import { ASCII_CAT } from '@/data/card';
import { getProject, projects, type Project } from '@/data/projects';
import CaseHeader from './CaseHeader';
import SpecSheet from './SpecSheet';
import Metrics from './Metrics';
import Journal from './Journal';
import Boundaries from './Boundaries';
import Artifacts from './Artifacts';
import PrevNext from './PrevNext';
import { caseHref } from './util';

/** Old addresses from the original site (/work/portfolio → sourcePath) resolve to the canonical slug. */
function aliasFor(slug: string): Project | undefined {
  return projects.find((p) => p.sourcePath.split('/').pop() === slug);
}

function CaseFile({ project }: { project: Project }) {
  usePageMeta(project.title, project.summary);
  // Number only the sections that render (SpecSheet is ## 01; Metrics returns null without metrics).
  const hasMetrics = project.metrics.length > 0;
  const code = (n: number) => String(n + (hasMetrics ? 1 : 0)).padStart(2, '0');
  const metricsCode = '02';
  const journalCode = code(2);
  const limitsCode = code(3);
  const artifactsCode = code(4);
  return (
    <main id="main" className="relative">
      <CaseHeader project={project} />
      <SpecSheet project={project} />
      <Metrics project={project} code={metricsCode} />
      <Journal project={project} code={journalCode} />
      <Boundaries project={project} code={limitsCode} />
      <Artifacts project={project} code={artifactsCode} />
      <div className="pb-dock">
        <PrevNext project={project} />
      </div>
    </main>
  );
}

function MissingFile({ slug }: { slug: string }) {
  usePageMeta('Case file not found', 'No case file matches this address.');
  return (
    <main id="main" className="relative isolate overflow-hidden pt-28 pb-dock md:pt-36">
      <div className="container-signal max-w-3xl">
        <div className="panel brackets overflow-hidden">
          <p className="border-b border-line px-5 py-3 font-mono text-[12px] text-fg-muted md:px-8">
            <span className="text-fg-dim">affan@shaikh</span>
            <span className="text-fg-dim">:</span>
            <span className="text-fg-muted">~/log</span>
            <span className="text-fg-dim">$ </span>cat {slug}
          </p>
          <div className="p-5 md:p-8">
            <p className="font-mono text-[13px] text-alert">cat: {slug}: No such file or directory</p>
            <div className="mt-6 flex items-start gap-6">
              <pre aria-hidden className="ascii hidden shrink-0 text-[15px] text-fg-muted sm:block">
                {ASCII_CAT}
              </pre>
              <div className="min-w-0">
                <h1 className="text-[clamp(1.75rem,4.5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.03em]">No case file at this address</h1>
                <p className="mt-4 max-w-[56ch] text-[15px] leading-relaxed text-fg-muted">
                  Nothing is filed under{' '}
                  <code className="rounded-[var(--radius-sm)] bg-ink-800 px-1.5 py-0.5 font-mono text-[0.9em] text-fg">{slug}</code>. These are
                  the {projects.length} documented builds:
                </p>
              </div>
            </div>
            <ul className="mt-6 grid border-t border-line sm:grid-cols-2">
              {projects.map((p) => (
                <li key={p.slug} className="border-b border-line">
                  <Link
                    to={caseHref(p.slug)}
                    className="flex items-baseline gap-3 px-1 py-3 text-[15px] text-fg underline-offset-4 hover:underline"
                  >
                    <span className="font-mono text-[12px] text-fg-dim">{p.index}</span>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
            <LinkButton to="/log#case-files" variant="primary" className="mt-8">
              Back to all case files
            </LinkButton>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CaseStudyPage() {
  const { slug = '' } = useParams();
  const project = getProject(slug);
  const alias = project ? undefined : aliasFor(slug);

  // A fresh case file starts at the top (prev/next links keep the scroll position otherwise).
  useEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [slug]);

  if (alias) return <Navigate to={caseHref(alias.slug)} replace />;
  if (!project) return <MissingFile slug={slug} />;
  // Keyed by slug so every component (checklists, observers, WebGL scenes) remounts per file.
  return <CaseFile key={project.slug} project={project} />;
}
