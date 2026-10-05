import { useCallback, useId, useState } from 'react';
import { MailOpen } from 'lucide-react';
import Stepper, { Step } from '@/components/reactbits/Stepper';
import RB from '@/components/ui/RB';
import Section from '@/components/ui/Section';
import { ActionButton } from '@/components/ui/Button';
import { useReducedMotion } from '@/lib/motion';
import { useIsDesktop } from '@/lib/media';
import { cn } from '@/lib/cn';
import { contact } from '@/data/profile';
import { Resolve, SectionHeading } from './shared';

const SUBJECT_MIN = 3;
const MESSAGE_MIN = 10;
const SUBJECT_MAX = 140;
const MESSAGE_MAX = 2000;

const fieldClass =
  'mt-3 w-full rounded-[3px] border bg-ink-950 px-4 font-mono text-fg caret-phosphor placeholder:text-fg-muted outline-none transition-[border-color] duration-200 focus:border-phosphor';

function buildMailto(subject: string, message: string) {
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(message.trim())}`;
}

/** Live mirror of the draft as the `mail` command it becomes (desktop). Visual duplicate of the form, so hidden from AT. */
function MailPreview({ subject, message }: { subject: string; message: string }) {
  return (
    <div aria-hidden className="panel flex h-full min-h-[30rem] flex-col overflow-hidden font-mono text-[0.8125rem] leading-relaxed">
      <p className="border-b border-line px-5 py-2.5 text-[0.6875rem] text-fg-muted">~/contact — draft preview</p>
      <div className="flex-1 space-y-1 overflow-hidden px-5 py-5">
        <p className="break-all text-fg-muted">
          <span className="text-fg-dim">affan@shaikh</span>:~/contact${' '}
          <span className="text-fg">
            mail -s &quot;{subject.trim() || '…'}&quot; {contact.email}
          </span>
        </p>
        <p className="max-h-[19rem] overflow-hidden whitespace-pre-wrap break-words text-fg">
          {message.trim() || <span className="text-fg-muted"># your message prints here as you type</span>}
        </p>
        <p className="text-fg-muted">.</p>
        <p className="text-fg-muted">EOT</p>
        <p className="text-fg-muted">
          <span className="text-fg-dim">affan@shaikh</span>:~/contact${' '}
          <span className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.2em] bg-fg/60" />
        </p>
      </div>
      <p className="border-t border-line px-5 py-3 text-[0.75rem] text-fg-muted"># nothing is sent from this site — your mail app opens with this draft</p>
    </div>
  );
}

export default function Compose() {
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const uid = useId();
  const ids = {
    subject: `${uid}-subject`,
    subjectHint: `${uid}-subject-hint`,
    subjectError: `${uid}-subject-error`,
    message: `${uid}-message`,
    messageHint: `${uid}-message-hint`,
    messageError: `${uid}-message-error`,
    review: `${uid}-review`
  };

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showSubjectError, setShowSubjectError] = useState(false);
  const [showMessageError, setShowMessageError] = useState(false);
  const [handedOff, setHandedOff] = useState(false);

  const subjectOk = subject.trim().length >= SUBJECT_MIN;
  const messageOk = message.trim().length >= MESSAGE_MIN;

  const validateStep = useCallback(
    (step: number) => {
      if (step === 1) {
        setShowSubjectError(!subjectOk);
        if (!subjectOk) document.getElementById(ids.subject)?.focus();
        return subjectOk;
      }
      if (step === 2) {
        setShowMessageError(!messageOk);
        if (!messageOk) document.getElementById(ids.message)?.focus();
        return messageOk;
      }
      return true;
    },
    [subjectOk, messageOk, ids.subject, ids.message]
  );

  // Move focus into the step that just slid in (after the slide finishes, so nothing scrolls sideways).
  const onStepChange = useCallback(
    (step: number) => {
      setHandedOff(false);
      const target = step === 1 ? ids.subject : step === 2 ? ids.message : ids.review;
      window.setTimeout(() => document.getElementById(target)?.focus({ preventScroll: true }), reduced ? 0 : 430);
    },
    [ids.subject, ids.message, ids.review, reduced]
  );

  const openMailApp = useCallback(() => {
    if (!subjectOk || !messageOk) return;
    setHandedOff(true);
    window.location.href = buildMailto(subject, message);
  }, [subject, message, subjectOk, messageOk]);

  return (
    <Section id="compose" aria-labelledby="compose-title" className="border-t border-line pt-16! md:pt-24!">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-10">
        <div className="min-w-0">
          <SectionHeading id="compose-title" comment="compose" title="Draft it here.">
            <p>
              Write a subject and a message, check the draft, then hand it to your own mail app.{' '}
              <strong className="font-medium text-fg">Nothing is sent by this site</strong> — your mail app opens with the
              draft filled in, and you decide whether to send it.
            </p>
          </SectionHeading>

          <Resolve delay={0.05} className="mt-10 md:mt-12">
            <div className="panel overflow-hidden [--border-primary:transparent]">
              <p aria-hidden className="flex items-center justify-between border-b border-line px-5 py-2.5 font-mono text-[0.6875rem] text-fg-muted sm:px-8">
                <span>compose — 3 steps</span>
                <span>to: {contact.email}</span>
              </p>
              <RB name="Stepper">
                <Stepper
                  className="w-full"
                  stepCircleContainerClassName="max-w-none! rounded-none! bg-transparent"
                  stepContainerClassName="p-5! pb-3! sm:p-8! sm:pb-4!"
                  contentClassName="px-0!"
                  footerClassName="px-5! pb-6! sm:px-8! sm:pb-8!"
                  stepLabels={['Subject', 'Message', 'Review']}
                  validateStep={validateStep}
                  onStepChange={onStepChange}
                  hideCompleteButton
                  reduceMotion={reduced}
                  nextButtonText="next →"
                  backButtonText="← back"
                >
                  {/* Step 1 — subject */}
                  <Step className="px-5 pb-2 pt-1 sm:px-8">
                    <div className="flex items-baseline justify-between gap-4 font-mono text-[0.75rem]">
                      <label htmlFor={ids.subject} className="text-fg">
                        <span className="text-fg-dim">01</span> subject
                      </label>
                      <span className="tabular-nums text-fg-muted" aria-hidden>
                        {subject.length}/{SUBJECT_MAX}
                      </span>
                    </div>
                    <input
                      id={ids.subject}
                      type="text"
                      value={subject}
                      maxLength={SUBJECT_MAX}
                      autoComplete="off"
                      placeholder="e.g. Co-op opportunity: network operations"
                      aria-invalid={showSubjectError && !subjectOk}
                      aria-describedby={`${ids.subjectHint}${showSubjectError && !subjectOk ? ` ${ids.subjectError}` : ''}`}
                      onChange={(e) => setSubject(e.target.value)}
                      className={cn(fieldClass, 'h-13 text-base', showSubjectError && !subjectOk ? 'border-alert/70' : 'border-line-strong')}
                    />
                    <p id={ids.subjectHint} className="mt-2.5 text-sm text-fg-muted">
                      Becomes the subject line of the email.
                    </p>
                    {showSubjectError && !subjectOk && (
                      <p id={ids.subjectError} role="alert" className="mt-1.5 font-mono text-[0.75rem] text-alert">
                        error: subject needs at least {SUBJECT_MIN} characters.
                      </p>
                    )}
                  </Step>

                  {/* Step 2 — message */}
                  <Step className="px-5 pb-2 pt-1 sm:px-8">
                    <div className="flex items-baseline justify-between gap-4 font-mono text-[0.75rem]">
                      <label htmlFor={ids.message} className="text-fg">
                        <span className="text-fg-dim">02</span> message
                      </label>
                      <span className="tabular-nums text-fg-muted" aria-hidden>
                        {message.length}/{MESSAGE_MAX}
                      </span>
                    </div>
                    <textarea
                      id={ids.message}
                      value={message}
                      rows={7}
                      maxLength={MESSAGE_MAX}
                      placeholder="Who you are, what the role or project is, and how to reach you."
                      aria-invalid={showMessageError && !messageOk}
                      aria-describedby={`${ids.messageHint}${showMessageError && !messageOk ? ` ${ids.messageError}` : ''}`}
                      onChange={(e) => setMessage(e.target.value)}
                      className={cn(
                        fieldClass,
                        'block resize-y py-3.5 text-[0.9375rem] leading-relaxed',
                        showMessageError && !messageOk ? 'border-alert/70' : 'border-line-strong'
                      )}
                    />
                    <p id={ids.messageHint} className="mt-2.5 text-sm text-fg-muted">
                      Becomes the body of the email. You can still edit it in your mail app.
                    </p>
                    {showMessageError && !messageOk && (
                      <p id={ids.messageError} role="alert" className="mt-1.5 font-mono text-[0.75rem] text-alert">
                        error: message needs at least {MESSAGE_MIN} characters.
                      </p>
                    )}
                  </Step>

                  {/* Step 3 — review + hand-off */}
                  <Step className="px-5 pb-1 pt-1 sm:px-8">
                    <h3 id={ids.review} tabIndex={-1} className="font-mono text-[0.75rem] text-fg outline-none">
                      <span className="text-fg-dim">03</span> review the draft
                    </h3>
                    <dl className="mt-4 divide-y divide-line overflow-hidden rounded-[3px] border border-line bg-ink-950 text-[0.9375rem]">
                      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-4 py-3">
                        <dt className="font-mono text-[0.75rem] text-fg-muted">to</dt>
                        <dd className="break-all font-mono text-fg">{contact.email}</dd>
                      </div>
                      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-4 py-3">
                        <dt className="font-mono text-[0.75rem] text-fg-muted">subject</dt>
                        <dd className="break-words text-fg">{subject.trim() || '—'}</dd>
                      </div>
                      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-4 py-3">
                        <dt className="font-mono text-[0.75rem] text-fg-muted">message</dt>
                        <dd className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed text-fg-muted">
                          {message.trim() || '—'}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-7">
                      <ActionButton
                        variant="primary"
                        onClick={openMailApp}
                        disabled={!subjectOk || !messageOk}
                        icon={<MailOpen aria-hidden size={16} strokeWidth={1.75} />}
                        className="w-full sm:w-auto"
                      >
                        open mail app
                      </ActionButton>
                    </div>
                    <p className="mt-5 text-sm leading-relaxed text-fg-muted" aria-live="polite">
                      {handedOff
                        ? 'Handed to your mail app. If nothing opened, no default mail app is set up — use the address above instead.'
                        : 'Nothing leaves this page until you press send in your own mail app.'}
                    </p>
                  </Step>
                </Stepper>
              </RB>
            </div>
          </Resolve>
        </div>

        {desktop && (
          <Resolve delay={0.12} className="hidden h-full pt-[8.5rem] lg:block">
            <MailPreview subject={subject} message={message} />
          </Resolve>
        )}
      </div>
    </Section>
  );
}
