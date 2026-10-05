import Section from '@/components/ui/Section';
import { ASCII_CAT } from '@/data/card';
import { profile } from '@/data/profile';
import { Reveal, SectionLabel, SplitHeading } from './fx';

/**
 * The long-form bio, read like a file: a sticky column with the heading and the one-line
 * intro as a quoted line, and the bio on the right with editor-style line numbers in the gutter.
 */
export default function BioSection() {
  const [lead, ...rest] = profile.bio;

  return (
    <Section aria-labelledby="bio-title" className="overflow-hidden">
      <SectionLabel index="01" path="cat ~/whoami/context.md" className="mb-12 md:mb-16" />
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SplitHeading id="bio-title" text="A little" accent="context" />

            <Reveal kind="slide" delay={0.1} className="mt-10 md:mt-12">
              <figure className="relative max-w-[30rem] border-l border-line-strong pl-5 md:pl-6">
                <blockquote className="text-[clamp(1.2rem,1.9vw,1.55rem)] font-medium leading-[1.4] tracking-[-0.02em] text-fg">
                  <p>
                    <span aria-hidden="true" className="text-fg-dim">
                      &gt;{' '}
                    </span>
                    {profile.intro}
                  </p>
                </blockquote>
                <figcaption className="mt-5 font-mono text-[0.75rem] text-fg-muted">
                  <span className="text-fg-dim">-- </span>
                  {profile.name}, {profile.locationShort}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>

        <div className="relative lg:col-span-7 lg:pt-2">
          {/* Lead paragraph: larger, white */}
          <Reveal kind="resolve" className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[3rem_minmax(0,1fr)]">
            <span aria-hidden="true" className="border-r border-line pr-3 pt-1 text-right font-mono text-[0.6875rem] text-fg-dim">
              01
            </span>
            <p className="max-w-[44ch] text-[clamp(1.1rem,1.6vw,1.35rem)] font-medium leading-[1.5] tracking-[-0.015em] text-fg">
              {lead}
            </p>
          </Reveal>

          <div className="mt-8 space-y-6 md:mt-10 md:space-y-8">
            {rest.map((para, i) => (
              <div key={para.slice(0, 24)} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[3rem_minmax(0,1fr)]">
                <span aria-hidden="true" className="border-r border-line pr-3 pt-1 text-right font-mono text-[0.6875rem] text-fg-dim">
                  {String(i + 2).padStart(2, '0')}
                </span>
                <Reveal kind="rise" delay={i * 0.06} distance={24}>
                  <p className="max-w-[64ch] text-[0.9375rem] leading-relaxed text-fg-muted md:text-base">{para}</p>
                </Reveal>
              </div>
            ))}
          </div>

          {/* End of file — with the card's cat. */}
          <div aria-hidden="true" className="mt-10 grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[3rem_minmax(0,1fr)]">
            <span className="border-r border-line pr-3 text-right font-mono text-[0.6875rem] text-fg-dim">~</span>
            <div className="flex items-end gap-5">
              <pre className="ascii m-0 text-[0.8125rem] text-fg-dim">{ASCII_CAT}</pre>
              <span className="pb-1 font-mono text-[0.75rem] text-fg-dim">-- EOF --</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
