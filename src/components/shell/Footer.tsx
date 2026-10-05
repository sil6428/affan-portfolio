import { Link } from 'react-router';
import CurvedLoop from '@/components/reactbits/CurvedLoop';
import RB from '@/components/ui/RB';
import InView from '@/lib/InView';
import { ASCII_CAT } from '@/data/card';
import { navRoutes } from '@/data/navigation';
import { contact, profile } from '@/data/profile';
import { useMotionPreference } from '@/lib/motion';
import { isLowPowerDevice, useFinePointer, useIsDesktop } from '@/lib/media';
import { preloadRoute } from '@/app/routeModules';

const ticker = `open to co-op — ${profile.seeking.map((s) => s.toLowerCase()).join(' — ')} — `;

/** Every link here opens in a new tab (the resume PDF included). */
const elsewhere = [
  { label: 'resume.pdf', href: contact.resume.href },
  { label: 'github', href: contact.github.href },
  { label: 'linkedin', href: contact.linkedin.href },
  { label: 'interactive-lab', href: contact.interactiveLab.href }
];

/**
 * The shell's sign-off: a slow, dim ticker of the roles Affan is looking for (ReactBits CurvedLoop,
 * unmounted off-screen, and only on a desktop-width screen with a mouse, full motion and a capable
 * device: the same gate as the /about badge, so touch tablets and phones never run it), then the
 * card's cat, the address, the site map (shell path + plain name), links elsewhere, and the motion switch.
 */
export default function Footer() {
  const motionPref = useMotionPreference();
  const desktop = useIsDesktop();
  const fine = useFinePointer();
  const showTicker = !motionPref.reduced && desktop && fine && !isLowPowerDevice();

  return (
    <footer className="relative mt-10 border-t border-line lg:pb-dock" aria-labelledby="footer-title">
      {showTicker && (
        <RB name="CurvedLoop" className="overflow-hidden text-[#2c2c2c]">
          <InView className="aspect-[100/12]">
            <CurvedLoop
              marqueeText={ticker}
              speed={0.4}
              curveAmount={36}
              direction="left"
              interactive
              className="font-mono text-[3.5rem] font-semibold normal-case tracking-[-0.04em]"
            />
          </InView>
        </RB>
      )}

      <div className="container-signal grid gap-12 pt-12 md:grid-cols-12 md:pt-14">
        <div className="md:col-span-6 lg:col-span-5">
          <p aria-hidden className="font-mono text-[0.75rem] text-fg-muted">
            <span className="text-fg-dim">affan@shaikh</span>:~$ logout
          </p>
          <div className="mt-5 flex items-start gap-6">
            <div className="min-w-0">
              <h2 id="footer-title" className="text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-fg">
                Say hello
                <span aria-hidden className="ml-1 inline-block h-[0.8em] w-[0.45em] translate-y-[0.06em] bg-fg/25" />
              </h2>
              <a
                href={`mailto:${contact.email}`}
                className="link-underline mt-4 inline-block break-all font-mono text-[0.9375rem] text-fg-muted transition-colors hover:text-fg"
              >
                {contact.email}
              </a>
              <p className="mt-3 flex items-center gap-2 font-mono text-[0.75rem] text-fg-muted">
                <span aria-hidden className="size-1.5 rounded-full bg-phosphor" />
                {profile.status} · {profile.locationShort}
              </p>
            </div>
            <pre aria-hidden className="ascii ml-auto hidden text-[0.8125rem] text-fg-dim sm:block md:hidden lg:block">
              {ASCII_CAT}
            </pre>
          </div>
        </div>

        <nav aria-label="Footer site map" className="md:col-span-3 lg:col-start-7">
          <h3 className="mb-4 font-mono text-[0.75rem] font-normal text-fg-muted">
            <span aria-hidden>## </span>sitemap
          </h3>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-1">
            {navRoutes.map((r) => (
              <li key={r.path}>
                <Link
                  to={r.path}
                  onPointerDown={() => void preloadRoute(r.path)}
                  className="group inline-flex min-h-6 items-center gap-3 font-mono text-[0.8125rem] text-fg-muted transition-colors hover:text-fg"
                >
                  <span className="text-fg underline-offset-4 group-hover:underline">{r.label}</span>
                  <span aria-hidden className="hidden text-[0.75rem] text-fg-dim lg:inline">{r.path === '/' ? '~/' : r.code}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h3 className="mb-4 font-mono text-[0.75rem] font-normal text-fg-muted">
            <span aria-hidden>## </span>elsewhere
          </h3>
          <ul className="space-y-2">
            {elsewhere.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-6 items-center gap-2 font-mono text-[0.8125rem] text-fg underline-offset-4 transition-colors hover:underline"
                >
                  {l.label}
                  <span aria-hidden className="text-fg-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-fg">
                    ↗
                  </span>
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container-signal mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-line pb-6 pt-5 font-mono text-[0.6875rem] text-fg-muted">
        <p>© 2026 {profile.name} · built with React and ReactBits</p>
        <button
          type="button"
          onClick={motionPref.toggle}
          aria-pressed={motionPref.reduced}
          aria-label="Reduce motion"
          className="inline-flex items-center gap-2 rounded-[3px] border border-line px-2.5 py-1.5 transition-colors hover:border-fg/40 hover:text-fg"
        >
          <span aria-hidden>--reduce-motion</span>
          <span aria-hidden className={motionPref.reduced ? 'text-fg' : 'text-fg-dim'}>[{motionPref.reduced ? 'on' : 'off'}]</span>
        </button>
      </div>
    </footer>
  );
}
