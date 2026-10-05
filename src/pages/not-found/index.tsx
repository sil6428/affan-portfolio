import { Suspense, lazy } from 'react';
import { Link, useLocation } from 'react-router';
import DecryptedText from '@/components/reactbits/DecryptedText';
import RB from '@/components/ui/RB';
import TermField from '@/components/ui/TermField';
import { LinkButton } from '@/components/ui/Button';
import InView from '@/lib/InView';
import { ASCII_CAT } from '@/data/card';
import { navRoutes } from '@/data/navigation';
import { usePageMeta } from '@/lib/usePageMeta';
import { useReducedMotion } from '@/lib/motion';
import { isLowPowerDevice, useIsDesktop } from '@/lib/media';

const FuzzyText = lazy(() => import('@/components/reactbits/FuzzyText'));

/** "404" in the card's small figlet style — the static version (phones, reduced motion, low power). */
const ASCII_404 = [
  ' _ _    ___    _ _',
  '| | |  / _ \\  | | |',
  '|_  _|| (_) | |_  _|',
  '  |_|  \\___/    |_|'
].join('\n');

const CLEAR_DESKTOP = [
  { x0: 0, y0: 0, x1: 100, y1: 10 },
  { x0: 0, y0: 18, x1: 58, y1: 82 },
  { x0: 60, y0: 30, x1: 100, y1: 72 }
];
const CLEAR_MOBILE = [
  { x0: 0, y0: 0, x1: 100, y1: 8 },
  { x0: 0, y0: 12, x1: 100, y1: 100 }
];

function Static404() {
  return (
    <pre aria-hidden className="ascii text-[clamp(1.5rem,6vw,3.5rem)] leading-[1.02] text-chalk">
      {ASCII_404}
    </pre>
  );
}

/** 404 — a shell that just failed to `cd` into the requested path, with the real directories listed. */
export default function NotFoundPage() {
  usePageMeta('No such file', 'This route does not exist on affan@shaikh.');
  const { pathname } = useLocation();
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const live = desktop && !reduced && !isLowPowerDevice();
  const error = `bash: cd: ${pathname}: No such file or directory`;

  return (
    <main id="main" className="relative isolate flex min-h-dvh items-center overflow-hidden pb-dock pt-28">
      <TermField seed={4041} clear={desktop ? CLEAR_DESKTOP : CLEAR_MOBILE} grid={[9, 7]} glyphRatio={0.24} className="-z-10" />

      <div className="container-signal grid items-center gap-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="min-w-0">
          <div className="panel overflow-hidden font-mono text-[0.8125rem] leading-relaxed">
            <p aria-hidden className="border-b border-line px-4 py-2 text-[0.6875rem] text-fg-muted">~/ — bash</p>
            <div className="space-y-1 px-4 py-4">
              <p className="text-fg-muted [overflow-wrap:anywhere]">
                <span className="text-fg-dim">affan@shaikh</span>:~$ <span className="text-fg">cd {pathname}</span>
              </p>
              <RB name="DecryptedText" as="div" className="text-rust [overflow-wrap:anywhere]">
                {reduced ? (
                  <p>{error}</p>
                ) : (
                  <p>
                    {/* Screen readers get the error line itself; the scramble is visual only. */}
                    <span className="sr-only">{error}</span>
                    <span aria-hidden>
                      <DecryptedText
                        text={error}
                        animateOn="view"
                        sequential
                        speed={14}
                        revealDirection="start"
                        characters="01<>/\\|_-$#"
                        className="text-rust"
                        encryptedClassName="text-fg-dim"
                      />
                    </span>
                  </p>
                )}
              </RB>
              <p className="pt-2 text-fg-muted">
                <span className="text-fg-dim">affan@shaikh</span>:~$ <span className="text-fg">ls ~</span>
              </p>
              <nav aria-label="Directories">
                <ul className="flex flex-wrap gap-x-5 gap-y-1">
                  {navRoutes.map((r) => (
                    <li key={r.path}>
                      <Link to={r.path} className="text-fg underline decoration-fg/30 underline-offset-4 transition-colors hover:text-white hover:decoration-fg">
                        {r.path === '/' ? '~/' : `${r.code.slice(2)}/`}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <p className="pt-2 text-fg-muted">
                <span className="text-fg-dim">affan@shaikh</span>:~${' '}
                <span aria-hidden className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.2em] bg-fg/60" />
              </p>
            </div>
          </div>

          <h1 className="mt-10 text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-fg">
            <span className="sr-only">404 — </span>No such page.
          </h1>
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-fg-muted">
            Nothing lives at <code className="rounded-[3px] bg-ink-800 px-1.5 py-0.5 text-[0.875rem] text-fg">{pathname}</code>. The
            link may be old, or the path never existed. Head home, or read the case files in the log.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton to="/" variant="primary">
              cd ~
            </LinkButton>
            <LinkButton to="/log#case-files">ls ~/log/case-files</LinkButton>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 lg:items-end">
          <RB name="FuzzyText" className="flex min-h-[9rem] w-full items-center justify-center lg:min-h-[15rem] lg:justify-end">
            {live ? (
              <InView className="flex w-full items-center justify-center lg:justify-end" fallback={<Static404 />}>
                <Suspense fallback={<Static404 />}>
                  <FuzzyText
                    fontSize="clamp(8rem, 15vw, 14rem)"
                    fontWeight={700}
                    fontFamily="'Geist Mono Variable', ui-monospace, monospace"
                    color="#e8e8e8"
                    baseIntensity={0.1}
                    hoverIntensity={0.42}
                    fps={30}
                    letterSpacing={-6}
                    enableHover
                  >
                    404
                  </FuzzyText>
                </Suspense>
              </InView>
            ) : (
              <Static404 />
            )}
          </RB>
          <div aria-hidden className="flex items-end gap-4 font-mono text-[0.75rem] text-fg-muted">
            <span className="pb-1"># even the cat looked</span>
            <pre className="ascii text-[0.875rem] text-chalk">{ASCII_CAT}</pre>
          </div>
        </div>
      </div>
    </main>
  );
}
