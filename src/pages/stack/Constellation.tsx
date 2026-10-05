import Section from '@/components/ui/Section';
import { useIsMobile } from '@/lib/media';
import { projects } from '@/data/projects';
import { stats } from './data';
import { SectionHead, StackLabel } from './parts';
import SignalGraph from './SignalGraph';
import SignalTree from './SignalTree';

function Legend() {
  return (
    <ul aria-label="Legend" className="flex flex-wrap gap-x-5 gap-y-2.5 font-mono text-[0.75rem] text-fg-muted lg:max-w-[340px] lg:justify-end">
      <li className="flex items-center gap-2">
        <span aria-hidden className="size-[7px] rounded-[1px] bg-fg/75" /> traced skill
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className="size-[7px] rounded-[1px] border border-fg-dim" /> listed only
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className="h-px w-5 bg-fg/60" /> skill → case file
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className="h-0 w-5 border-t border-dashed border-fg-dim" /> category spoke
      </li>
    </ul>
  );
}

export default function Constellation() {
  const mobile = useIsMobile();
  return (
    <Section id="constellation" aria-labelledby="constellation-title" className="scroll-mt-20">
      <StackLabel index="01" path="~/stack/map" />
      <SectionHead
        id="constellation-title"
        kicker={`${stats.categories} hubs · ${stats.skills} skills · ${projects.length} case files`}
        title={
          <>
            {stats.traced} of {stats.skills} skills, wired to their <span className="text-fg-muted">evidence</span>
          </>
        }
        aside={!mobile && <Legend />}
      >
        {mobile ? (
          <p>
            Open a category and tap a skill. The readout pins the case files that used it, or says plainly when a skill
            is listed but not yet tied to one.
          </p>
        ) : (
          <p>
            Hover or focus a skill to trace the case files that used it; hover a case file to light every skill it leans
            on. Dashed chips are listed skills that are not yet tied to a case file.
          </p>
        )}
      </SectionHead>
      {mobile ? <SignalTree /> : <SignalGraph />}
    </Section>
  );
}
