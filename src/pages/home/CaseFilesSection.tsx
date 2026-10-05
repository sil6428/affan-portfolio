import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { projects, type Project } from '@/data/projects';
import { useReducedMotion } from '@/lib/motion';
import RB from '@/components/ui/RB';
import { StatusChip } from '@/components/ui/Chip';
import Shuffle from '@/components/reactbits/Shuffle';
import { cn } from '@/lib/cn';
import { THUMB_SIZE, thumbSrc } from '@/lib/art';
import { MoreLink, Rise, SectionHead } from './fx';
import { useNearViewport } from './hooks';

/** A short teaser — the full archive lives on /log. Three builds that carry the most evidence. */
const PICKS = ['otnow', 'cisco-networking-labs', 'p2p-messaging'];
const picks = PICKS.flatMap((slug) => projects.find((p) => p.slug === slug) ?? []);

function CaseRow({ project }: { project: Project }) {
  return (
    <Link
      to={`/log/${project.slug}`}
      className="group grid grid-cols-[72px_minmax(0,1fr)] items-start gap-4 rounded-[6px] border border-line bg-ink-900 p-3 transition-colors duration-200 hover:border-fg/40 hover:bg-ink-850 sm:grid-cols-[112px_minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:p-4"
    >
      <div className="aspect-square overflow-hidden rounded-[3px] border border-line bg-ink-950">
        <img
          src={thumbSrc(project.slug)}
          alt=""
          width={THUMB_SIZE}
          height={THUMB_SIZE}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
      </div>

      {/* The title is first in the DOM so the link's name starts with it; the path/status line is moved
          above it visually. The shell path is decoration; the status chip stays readable. */}
      <div className="flex min-w-0 flex-col">
        <h3 className="mt-2.5 text-[clamp(1.125rem,2vw,1.5rem)] font-semibold leading-tight tracking-[-0.02em] text-fg decoration-fg-dim decoration-1 underline-offset-[5px] group-hover:underline">
          {project.title}
        </h3>
        <div className="order-first flex flex-wrap items-center gap-x-3 gap-y-2">
          <span aria-hidden className="font-mono text-[0.75rem] text-fg-muted">
            <span className="text-fg-dim">[{project.index}]</span> ~/log/{project.slug}
          </span>
          <StatusChip tone={project.statusTone}>{project.status}</StatusChip>
        </div>
        <p className="mt-1.5 max-w-[80ch] md:line-clamp-2 text-[0.9375rem] leading-relaxed text-fg-muted">{project.summary}</p>
      </div>

      <ArrowRight
        aria-hidden
        size={18}
        strokeWidth={1.75}
        className="hidden text-fg-dim transition-[color,transform] duration-200 group-hover:translate-x-1 group-hover:text-fg sm:block"
      />
    </Link>
  );
}

export default function CaseFilesSection() {
  const reduced = useReducedMotion();
  // The status chips' dots pulse only while the list is near the viewport.
  const [listRef, near] = useNearViewport<HTMLUListElement>();

  const title = reduced ? (
    'Case files'
  ) : (
    <RB name="Shuffle" as="span" className="inline-block">
      <span className="sr-only">Case files</span>
      <span aria-hidden>
        <Shuffle
          text="Case files"
          tag="span"
          textAlign="left"
          shuffleDirection="right"
          duration={0.4}
          stagger={0.035}
          shuffleTimes={2}
          scrambleCharset={'/\\|_-01'}
          colorFrom="#3fe07a"
          colorTo="#eeeeee"
          rootMargin="-60px"
          className="font-semibold normal-case! text-[length:inherit]! leading-[inherit]!"
        />
      </span>
    </RB>
  );

  return (
    <section id="work" aria-labelledby="cases-title" className="relative scroll-mt-16 py-16 md:py-20">
      <div className="container-signal">
        <SectionHead
          id="cases-title"
          path="~/log"
          cmd="ls case-files --top 3"
          title={title}
          aside={
            <MoreLink to="/log#case-files" className="md:pb-2">
              all {projects.length} case files
            </MoreLink>
          }
        />

        <Rise className="mt-8 md:mt-10">
          <ul ref={listRef} className={cn('grid gap-3', !near && '[&_.animate-pulse-dot]:[animation-play-state:paused]')}>
            {picks.map((p) => (
              <li key={p.slug}>
                <CaseRow project={p} />
              </li>
            ))}
          </ul>
        </Rise>
      </div>
    </section>
  );
}
