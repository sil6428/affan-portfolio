import { Copy } from 'lucide-react';
import { contact } from '@/data/profile';
import { copyText, useToast } from '@/lib/toast';
import { useReducedMotion } from '@/lib/motion';
import RB from '@/components/ui/RB';
import { LinkButton } from '@/components/ui/Button';
import TextType from '@/components/reactbits/TextType';
import { CmdLink, Prompt } from './fx';
import { useNearViewport } from './hooks';

const HEADLINE = 'Let’s build something useful.';

/**
 * Headline types out once it scrolls in; the final width is reserved so nothing below jumps.
 * TextType's root is forced inline so the caret follows the last typed character across the line
 * wrap (as an inline-block it would drop onto its own line under the text).
 */
function Headline({ animate, blink }: { animate: boolean; blink: boolean }) {
  const caretBox = 'ml-[0.08em] inline-block h-[0.9em] w-[0.5em] translate-y-[0.1em] bg-fg-dim';
  // Blinks only near the viewport: off-screen it would still restyle every frame.
  const caret = <span aria-hidden className={blink ? `${caretBox} animate-blink` : caretBox} />;
  const caretSpace = <span aria-hidden className={caretBox} />;
  if (!animate) {
    return (
      <>
        {HEADLINE}
        {caret}
      </>
    );
  }
  return (
    <span className="relative block">
      <span className="sr-only">{HEADLINE}</span>
      <span aria-hidden className="invisible">
        {HEADLINE}
        {caretSpace}
      </span>
      <RB name="TextType" as="span" className="absolute inset-0">
        <span aria-hidden>
          <TextType as="span" text={HEADLINE} loop={false} showCursor={false} typingSpeed={45} startOnVisible className="inline! tracking-[-0.03em]!" />
          {caret}
        </span>
      </RB>
    </span>
  );
}

/**
 * The last command of the session. Deliberately short: the global footer right below already
 * carries the email, status, and the co-op focus list.
 */
export default function ClosingSection() {
  const reduced = useReducedMotion();
  const { notify } = useToast();
  const [sectionRef, near] = useNearViewport<HTMLElement>();

  const copy = async () => {
    const ok = await copyText(contact.email);
    notify(
      ok
        ? { title: 'Email copied', description: contact.email, tone: 'success' }
        : { title: 'Copy blocked by the browser', description: contact.email, tone: 'error' }
    );
  };

  return (
    <section ref={sectionRef} aria-labelledby="closing-title" className="relative pb-16 md:pb-20">
      <div className="container-signal">
        <div className="border-t border-line pt-12 md:pt-16">
          <Prompt path="~/contact" cmd="./open-channel" decorative />
          <h2
            id="closing-title"
            className="mt-5 max-w-[18ch] text-[clamp(2.25rem,6vw,5.5rem)] font-semibold leading-[1] tracking-[-0.03em] text-fg"
          >
            <Headline animate={!reduced} blink={near} />
          </h2>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <CmdLink to="/contact" path="~/contact" label="open a channel" primary />
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2.5 rounded-[3px] border border-line-strong bg-ink-950 px-5 py-3 font-mono text-[0.875rem] text-fg transition-colors duration-200 hover:border-fg/60 hover:bg-ink-850"
            >
              <Copy aria-hidden size={15} strokeWidth={1.75} />
              copy email
            </button>
            <LinkButton to={contact.resume.href} variant="ghost" className="normal-case! tracking-normal! text-[0.875rem]!">
              resume.pdf
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
