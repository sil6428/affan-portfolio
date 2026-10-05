import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PixelTransition from '@/components/reactbits/PixelTransition';
import RB from '@/components/ui/RB';
import { LinkButton } from '@/components/ui/Button';
import { useReducedMotion } from '@/lib/motion';
import { getAdjacentProjects, JOURNAL_UPDATED, projects, type Project } from '@/data/projects';
import { caseHref, squareSrc } from './util';

const total = String(projects.length).padStart(2, '0');

function TitlePlate({ p }: { p: Project }) {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-ink-900 p-5 md:p-6">
      <span className="font-mono text-[11.5px] text-fg-dim">
        cd ../
        {p.slug}
      </span>
      <span className="text-[clamp(1.25rem,2.2vw,1.875rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-fg">{p.title}</span>
      <span className="font-mono text-[11px] text-fg-muted">
        {p.index}/{total} · {p.category.toLowerCase()}
      </span>
    </div>
  );
}

function AdjacentCard({ p, dir }: { p: Project; dir: 'prev' | 'next' }) {
  const reduced = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);

  // PixelTransition makes its root focusable; the surrounding <Link> is the only tab stop here.
  useEffect(() => {
    wrap.current?.querySelector('[tabindex="0"]')?.setAttribute('tabindex', '-1');
  });

  const Arrow = dir === 'prev' ? ArrowLeft : ArrowRight;

  return (
    <Link
      to={caseHref(p.slug)}
      aria-label={`${dir === 'prev' ? 'Previous' : 'Next'} case file ${p.index}: ${p.title}`}
      className="group block"
    >
      <div ref={wrap} className="relative">
        {reduced ? (
          <div className="aspect-square overflow-hidden rounded-[var(--radius-lg)] border border-line">
            <TitlePlate p={p} />
          </div>
        ) : (
          <PixelTransition
            firstContent={<img src={squareSrc(p.slug)} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />}
            secondContent={<TitlePlate p={p} />}
            gridSize={10}
            pixelColor="#2a2a2a"
            animationStepDuration={0.3}
            aspectRatio="100%"
            className="w-full! max-w-none! rounded-[var(--radius-lg)]! border! border-line! bg-ink-900! text-fg! transition-[border-color] duration-300 group-hover:border-fg/40!"
          />
        )}
      </div>
      <div className={`mt-4 flex items-center gap-3 ${dir === 'next' ? 'justify-end text-right' : ''}`}>
        {dir === 'prev' && (
          <Arrow aria-hidden size={16} strokeWidth={1.75} className="text-fg-muted transition-transform duration-300 group-hover:-translate-x-1 group-hover:text-fg" />
        )}
        <span>
          <span className="block font-mono text-[11px] text-fg-muted">{dir === 'prev' ? 'previous file' : 'next file'}</span>
          <span className="mt-1 block text-[15px] font-medium text-fg">{p.shortTitle}</span>
        </span>
        {dir === 'next' && (
          <Arrow aria-hidden size={16} strokeWidth={1.75} className="text-fg-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-fg" />
        )}
      </div>
    </Link>
  );
}

/** Prev / next case files with a PixelTransition poster → title plate, plus the way back to the listing. */
export default function PrevNext({ project }: { project: Project }) {
  const { prev, next } = getAdjacentProjects(project.slug);
  return (
    <div className="relative pt-14 md:pt-20">
      <nav aria-label="More case files" className="container-signal">
        <RB name="PixelTransition" className="grid grid-cols-2 gap-4 md:grid-cols-[minmax(0,16rem)_1fr_minmax(0,16rem)] md:items-center md:gap-8">
          <AdjacentCard p={prev} dir="prev" />
          <div className="order-last col-span-2 flex flex-col items-center gap-4 text-center md:order-none md:col-span-1">
            <span aria-hidden className="font-mono text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-none tracking-[-0.04em] text-fg-dim">
              {project.index}
              <span className="text-[0.45em] text-fg-dim">/{total}</span>
            </span>
            <LinkButton to="/log#case-files" variant="secondary">
              All case files
            </LinkButton>
          </div>
          <AdjacentCard p={next} dir="next" />
        </RB>
      </nav>
      <p className="container-signal mt-12 text-center font-mono text-[11.5px] text-fg-muted md:mt-16">
        <span className="block border-t border-line pt-6">
          <span className="text-fg-dim"># </span>journal updated {JOURNAL_UPDATED}
        </span>
      </p>
    </div>
  );
}
