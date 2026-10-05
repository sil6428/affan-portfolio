import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import ElectricBorder from '@/components/reactbits/ElectricBorder';
import CallChip, { type CallChipStatus } from '@/components/reactbits/CallChip';
import RB from '@/components/ui/RB';
import { useReducedMotion } from '@/lib/motion';
import { isLowPowerDevice, useIsDesktop } from '@/lib/media';
import { copyText, useToast } from '@/lib/toast';
import { contact } from '@/data/profile';
import { channels } from './shared';

/**
 * Desktop + full motion: a thin, slow grey ElectricBorder line (no glow) marks the one card that matters.
 * Everywhere else the card keeps a static hairline + corner brackets, so phones never run the canvas loop.
 */
function Frame({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  if (!desktop || reduced || isLowPowerDevice()) return <>{children}</>;
  return (
    <RB name="ElectricBorder">
      <ElectricBorder color="#8a8a8a" speed={0.35} chaos={0.045} borderRadius={6} glow={false}>
        {children}
      </ElectricBorder>
    </RB>
  );
}

/**
 * The primary channel: the address is the biggest thing on the card and a real mailto link.
 * One click copies it; the CallChip reports the real clipboard call (status + measured duration)
 * and the toast is the one thing that announces it (the chip stays quiet). The other channels are
 * listed underneath like symlinks in `ls -la`.
 */
export default function PrimaryCard() {
  const { notify } = useToast();
  const [status, setStatus] = useState<CallChipStatus>('idle');
  const [elapsed, setElapsed] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState(false);
  const busy = useRef(false);
  const resetTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setStatus('running');
    const started = performance.now();
    const ok = await copyText(contact.email);
    const ms = performance.now() - started;
    setElapsed(`${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`);
    setStatus(ok ? 'done' : 'error');
    setCopied(ok);
    window.clearTimeout(resetTimer.current);
    if (ok) resetTimer.current = window.setTimeout(() => setCopied(false), 1600);
    notify(
      ok
        ? { title: 'Email copied', description: contact.email, tone: 'success' }
        : { title: 'Copy blocked by the browser', description: `Select it manually: ${contact.email}`, tone: 'error' }
    );
    busy.current = false;
  }, [notify]);

  return (
    <Frame>
      <article
        aria-labelledby="primary-channel-title"
        className="panel brackets relative bg-ink-900 p-5 [--bracket-opacity:0.7] sm:p-7"
      >
        <header className="flex items-center justify-between gap-4 font-mono text-[0.75rem] text-fg-muted">
          <h2 id="primary-channel-title">
            <span aria-hidden>## </span>primary channel
          </h2>
          <span className="text-fg-dim">email</span>
        </header>

        <a
          href={`mailto:${contact.email}`}
          className="mt-6 inline-block max-w-full break-all text-[clamp(1.35rem,5.6vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.035em] text-fg underline decoration-fg/25 decoration-1 underline-offset-[0.18em] transition-[text-decoration-color] duration-200 hover:decoration-fg sm:break-normal lg:text-[clamp(1.5rem,2.3vw,2.4rem)]"
        >
          {contact.email}
          <span className="sr-only"> (opens your mail app)</span>
        </a>
        <p className="mt-3 font-mono text-[0.8125rem] leading-relaxed text-fg-muted"># click the address to open your mail app, or copy it</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void copy()}
            className="inline-flex h-10 items-center gap-2.5 rounded-[3px] border border-line-strong bg-ink-950 px-4 font-mono text-[0.8125rem] text-fg transition-colors duration-200 hover:border-fg/60 hover:bg-ink-850"
          >
            {copied ? <Check aria-hidden size={15} strokeWidth={2} /> : <Copy aria-hidden size={15} strokeWidth={1.75} />}
            {copied ? 'copied' : 'copy email'}
          </button>
          <RB name="CallChip" as="span" className="inline-flex">
            <CallChip
              icon="terminal"
              name="copy_email()"
              argument="→ clipboard"
              status={status}
              expectedMs={600}
              size={32}
              radius={3}
              color="#a8a8a8"
              surfaceColor="#101010"
              progressColor="#e8e8e8"
              progressOpacity={0.14}
              timerText={elapsed}
              onRetry={copy}
              announce={false}
              className="font-mono"
            />
          </RB>
        </div>

        <nav aria-label="Other channels" className="mt-7 border-t border-line pt-5">
          <p aria-hidden className="font-mono text-[0.75rem] text-fg-muted">
            <span className="text-fg-dim">$</span> ls -la ~/contact
          </p>
          <ul className="mt-3 font-mono text-[0.8125rem]">
            {channels.map((c) => (
              <li key={c.name}>
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group grid grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] items-baseline gap-x-3 rounded-[3px] px-2 py-1.5 -mx-2 transition-colors duration-150 hover:bg-ink-800"
                >
                  <span className="text-fg underline-offset-4 group-hover:underline">
                    <span aria-hidden className="mr-3 hidden text-fg-dim sm:inline">lrwxr-xr-x</span>
                    {c.name}
                  </span>
                  <span className="truncate text-fg-muted">
                    <span aria-hidden>-&gt; </span>
                    <span className="sr-only">: </span>
                    {c.target}
                  </span>
                  <span aria-hidden className="text-fg-muted transition-transform duration-200 group-hover:-translate-y-px group-hover:text-fg">
                    ↗
                  </span>
                  {c.external && <span className="sr-only">(opens in a new tab)</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </article>
    </Frame>
  );
}
