import { lazy, Suspense } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import RB from '@/components/ui/RB';
import TermField, { type ClearZone } from '@/components/ui/TermField';
import { LinkButton } from '@/components/ui/Button';
import { StatusChip } from '@/components/ui/Chip';
import { useDevMode } from '@/lib/devmode';
import { useIsDesktop } from '@/lib/media';
import { useReducedMotion } from '@/lib/motion';
import { projects, type Project } from '@/data/projects';
import ThemeBackground from './ThemeBackground';
import { posterSrc } from './util';

const TiltedCard = lazy(() => import('@/components/reactbits/TiltedCard'));
const TextType = lazy(() => import('@/components/reactbits/TextType'));

const EASE = [0.16, 1, 0.3, 1] as const;
/** CSS block caret (no JS loop), as on the home subtitle. */
const CARET = <span className="ml-0.5 inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] bg-phosphor motion-safe:animate-blink" />;
const COMMAND = 'cat README.md';
const total = String(projects.length).padStart(2, '0');

/** Desktop: words stay out of the text column and the poster, scattered in the band above and the gutter. */
const CLEAR: ClearZone[] = [
  { x0: 0, y0: 0, x1: 100, y1: 9 },
  { x0: 0, y0: 17, x1: 62, y1: 100 },
  { x0: 70, y0: 21, x1: 100, y1: 92 }
];

/** Phones / tablets: the poster sits in its own band with card words around it (never behind it). */
const POSTER_CLEAR: ClearZone[] = [{ x0: 18, y0: 9, x1: 82, y1: 91 }];

/** Breadcrumb written as a shell prompt: affan@shaikh:~/log/<slug>$ cat README.md */
function Breadcrumb({ project }: { project: Project }) {
  const reduced = useReducedMotion();
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-[12px] leading-relaxed md:text-[13px]">
      <ol className="flex flex-wrap items-baseline">
        <li aria-hidden className="text-fg-dim">
          affan@shaikh<span className="text-fg-dim">:</span>
        </li>
        <li>
          <Link to="/" className="inline-flex min-h-6 min-w-6 items-center justify-center px-1 text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline">
            ~<span className="sr-only"> (home)</span>
          </Link>
          <span aria-hidden className="text-fg-dim">/</span>
        </li>
        <li>
          <Link to="/log#case-files" className="inline-flex min-h-6 min-w-6 items-center justify-center px-1 text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline">
            log<span className="sr-only"> (all case files)</span>
          </Link>
          <span aria-hidden className="text-fg-dim">/</span>
        </li>
        <li aria-current="page" className="text-fg">
          {project.slug}
        </li>
        <li aria-hidden className="text-fg-dim">
          $&nbsp;
        </li>
        <li aria-hidden className="text-fg-muted">
          {reduced ? (
            COMMAND
          ) : (
            <RB name="TextType" as="span">
              <Suspense fallback={COMMAND}>
                <TextType as="span" text={COMMAND} typingSpeed={60} initialDelay={300} loop={false} showCursor={false} />
              </Suspense>
            </RB>
          )}
          {CARET}
        </li>
      </ol>
    </nav>
  );
}

export default function CaseHeader({ project }: { project: Project }) {
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const { enabled: devMode } = useDevMode();
  const [primary, ...secondary] = project.links;
  // "Source private" only where the project's own facts say so (SFT, Archtech); otherwise no claim.
  const sourcePrivate = project.facts.some((f) => (f.label === 'Source' || f.label === 'Repository') && f.value === 'Private');
  const seed = Number(project.index) * 131 + 17;

  const fade = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: EASE, delay }
        };
  // Title and lead are visible from the first frame (LCP is never held back by a fade); they only settle.
  const rise = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { y: 10 },
          animate: { y: 0 },
          transition: { duration: 0.6, ease: EASE, delay: desktop ? delay : 0 }
        };

  return (
    <header className="relative isolate overflow-hidden" aria-labelledby="case-title">
      <div aria-hidden className="absolute inset-0 -z-10">
        <ThemeBackground project={project} />
        {desktop && <TermField seed={seed} clear={CLEAR} grid={[9, 6]} glyphRatio={0.22} interactive={false} className="opacity-60" />}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-b from-transparent to-ink-950" />
      </div>

      <div className="container-signal grid items-end gap-12 pt-28 pb-14 md:pt-32 md:pb-20 lg:min-h-[80svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-16">
        <div className="min-w-0">
          <Breadcrumb project={project} />

          <motion.p className="mt-8 font-mono text-[12px] text-fg-muted md:mt-10" {...fade(0.05)}>
            <span className="text-fg-dim">
              {project.index}/{total}
            </span>
            <span className="text-fg-dim"> # </span>
            {project.kicker}
          </motion.p>

          <motion.h1
            id="case-title"
            className="mt-4 max-w-[22ch] text-[clamp(2.25rem,5.6vw,5rem)] font-semibold leading-[1] tracking-[-0.035em] text-fg"
            {...rise(0.12)}
          >
            {project.title}
          </motion.h1>

          <motion.div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3" {...fade(0.2)}>
            <StatusChip tone={project.statusTone} className="normal-case tracking-normal">
              {project.status}
            </StatusChip>
            <span className="font-mono text-[12px] text-fg">{project.role}</span>
            {project.collaborators?.length ? (
              <span className="font-mono text-[12px] text-fg-muted">
                with <span className="text-fg">{project.collaborators.join(', ')}</span>
              </span>
            ) : null}
          </motion.div>

          <motion.p className="mt-7 max-w-[68ch] text-[16px] leading-[1.75] text-fg-muted md:text-[17px]" {...rise(0.28)}>
            {project.lead}
          </motion.p>

          <motion.div className="mt-9 flex flex-wrap items-center gap-3" {...fade(0.36)}>
            {primary ? (
              <LinkButton to={primary.href} external variant="primary">
                {primary.label}
              </LinkButton>
            ) : (
              <span className="inline-flex items-center gap-2.5 rounded-[3px] border border-line-strong bg-ink-900 px-4 py-2.5 font-mono text-[12px] text-fg-muted">
                {sourcePrivate && <Lock aria-hidden size={13} strokeWidth={1.75} className="text-fg-muted" />}
                {sourcePrivate ? 'source private: architecture and evidence below' : 'no public links: details below'}
              </span>
            )}
            {secondary.map((l) => (
              <LinkButton key={l.href} to={l.href} external variant="secondary">
                {l.label}
              </LinkButton>
            ))}
          </motion.div>

          {/* Phones / tablets: the poster (static image, no tilt) framed by the card's scattered words. */}
          {!desktop && (
            <div className="relative mt-10 py-14">
              <TermField seed={seed + 7} clear={POSTER_CLEAR} grid={[6, 5]} glyphRatio={0.3} interactive={false} className="opacity-80" />
              <figure className="relative mx-auto w-[min(15rem,68%)]">
                <div className="brackets rounded-[var(--radius-lg)] border border-line bg-ink-900 p-2">
                  <img
                    src={posterSrc(project.slug)}
                    alt={`${project.title}: case-file poster`}
                    width={330}
                    height={412}
                    loading="lazy"
                    decoding="async"
                    className="block aspect-[330/412] w-full rounded-[4px] object-cover"
                  />
                </div>
                <figcaption aria-hidden className="mt-2 flex justify-between px-1 font-mono text-[11px] text-fg-muted">
                  <span>poster.webp</span>
                  <span className="text-fg-dim">
                    {project.index}/{total}
                  </span>
                </figcaption>
              </figure>
            </div>
          )}
        </div>

        {desktop && (
          <RB name="TiltedCard" className="relative hidden justify-self-end lg:block">
            <div className="brackets rounded-[var(--radius-lg)] border border-line bg-ink-900 p-3">
              {reduced ? (
                <img
                  src={posterSrc(project.slug)}
                  alt={`${project.title}: case-file poster`}
                  width={330}
                  height={412}
                  className="block h-[412px] w-[330px] rounded-[4px] object-cover"
                />
              ) : (
                <Suspense fallback={<div className="h-[412px] w-[330px] rounded-[4px] bg-ink-850" />}>
                  <TiltedCard
                    imageSrc={posterSrc(project.slug)}
                    altText={`${project.title}: case-file poster`}
                    containerHeight="412px"
                    containerWidth="330px"
                    imageHeight="412px"
                    imageWidth="330px"
                    rotateAmplitude={6}
                    scaleOnHover={1.02}
                    showMobileWarning={false}
                    showTooltip={false}
                  />
                </Suspense>
              )}
            </div>
            <p aria-hidden className="mt-3 flex justify-between px-1 font-mono text-[11px] text-fg-muted">
              <span>poster.webp</span>
              {/* Build detail: the header background's name shows only in Developer Mode. */}
              {devMode && <span className="text-fg-dim">bg: {project.theme.toLowerCase()}</span>}
            </p>
          </RB>
        )}
      </div>
    </header>
  );
}
