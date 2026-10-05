import { Suspense, lazy } from 'react';
import Section from '@/components/ui/Section';
import { LinkButton } from '@/components/ui/Button';
import InView from '@/lib/InView';
import { useFinePointer, useIsDesktop } from '@/lib/media';
import { contact } from '@/data/profile';
import { Resolve, SectionHeading } from './shared';

// Desktop only: the folder stage (FolderFloat + matter-js) is its own chunk, never fetched on phones.
const DocsStage = lazy(() => import('./DocsStage'));

/** Same height as the stage, so nothing shifts while the chunk arrives. */
const STAGE_FALLBACK = <div aria-hidden className="h-full" />;

export default function Documents() {
  const desktop = useIsDesktop();
  const fine = useFinePointer();

  return (
    <Section id="documents" aria-labelledby="documents-title" className="border-t border-line pb-dock">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-20">
        <div>
          <SectionHeading id="documents-title" comment="documents" title="Take the file.">
            <p>
              The resume as a PDF, and my interactive 3D portfolio.
              {desktop && (fine ? ' The papers in the folder float and can be dragged around.' : ' Tap the folder to open or close it.')}
            </p>
          </SectionHeading>
          <Resolve delay={0.08} className="mt-9 flex flex-wrap gap-3">
            <LinkButton to={contact.resume.href} variant="primary">
              resume.pdf
            </LinkButton>
            <LinkButton to={contact.interactiveLab.href} external>
              Interactive Lab
            </LinkButton>
          </Resolve>
        </div>

        {desktop && (
          <Resolve delay={0.12}>
            <div className="panel brackets relative h-[400px] overflow-hidden px-4 pb-12 pt-10 [--bracket-opacity:0.6]">
              <p aria-hidden className="absolute left-5 top-4 font-mono text-[0.6875rem] text-fg-muted">
                <span className="text-fg-dim">$</span> open ~/docs
              </p>
              <p aria-hidden className="absolute right-5 top-4 font-mono text-[0.6875rem] text-fg-muted">
                {fine ? 'click · drag' : 'tap'}
              </p>
              <InView className="h-full" rootMargin="100px 0px" fallback={STAGE_FALLBACK}>
                <Suspense fallback={STAGE_FALLBACK}>
                  <DocsStage />
                </Suspense>
              </InView>
            </div>
          </Resolve>
        )}
      </div>
    </Section>
  );
}
