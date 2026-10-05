import { Fragment, useMemo } from 'react';
import { skillCategories, skills, type Skill } from '@/data/skills';
import { useReducedMotion } from '@/lib/motion';
import { isLowPowerDevice, useMediaQuery } from '@/lib/media';
import InView from '@/lib/InView';
import { cn } from '@/lib/cn';
import RB from '@/components/ui/RB';
import ScrollVelocity from '@/components/reactbits/ScrollVelocity';
import { MoreLink, SectionHead } from './fx';
import { useNearViewport } from './hooks';

/** Only skills a case file actually shows in use; the full list (with the rest) is on /stack. */
const shown = skills.filter((s) => s.usedIn.length > 0);
const rowA = shown.filter((s) => s.category === 'networking' || s.category === 'security');
const rowB = shown.filter((s) => s.category === 'development' || s.category === 'systems');

/** One marquee row: names alternate white / grey, separated by a dim slash (no accent: it repeats ~100 times). */
function Row({ items, offset = 0 }: { items: Skill[]; offset?: number }) {
  return (
    <span className="inline-flex items-center">
      {items.map((s, i) => (
        <Fragment key={s.name}>
          <span className={(i + offset) % 2 ? 'text-fg-dim' : 'text-fg'}>{s.name}</span>
          <span aria-hidden className="mx-[0.5em] font-normal text-fg-dim/45">
            /
          </span>
        </Fragment>
      ))}
    </span>
  );
}

const ROW = 'text-[clamp(1.75rem,4.4vw,3.75rem)] leading-[1.2] font-semibold tracking-[-0.03em]';
/** Same, with !important so it beats the component's own scroller type styles. */
const ROW_FORCED = 'text-[clamp(1.75rem,4.4vw,3.75rem)]! leading-[1.2]! font-semibold! tracking-[-0.03em]! drop-shadow-none!';
const EDGE_FADE = '[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]';

/**
 * Touch screens: the same two rows drift as a plain CSS animation (compositor only, no per-frame JS,
 * no scroll listener), paused while off screen. Each track holds two copies and moves by one copy.
 */
function DriftRows() {
  const [ref, near] = useNearViewport<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className={cn('home-drift overflow-hidden', EDGE_FADE, !near && 'home-drift-paused')}>
      {[rowA, rowB].map((items, r) => (
        <div key={r} className={cn('home-drift-track py-1', r === 1 && 'home-drift-reverse', ROW)}>
          {[0, 1].map((copy) => (
            <span key={copy} className="whitespace-nowrap">
              <Row items={items} offset={r + copy * items.length} />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function StackSignalSection() {
  const reduced = useReducedMotion();
  const lowPower = useMemo(() => isLowPowerDevice(), []);
  const still = reduced || lowPower;
  const coarse = useMediaQuery('(pointer: coarse)');
  const staticRows = (
    <div aria-hidden className="overflow-hidden">
      <p className={cn('whitespace-nowrap py-1 pl-[4vw]', ROW)}>
        <Row items={rowA} />
      </p>
      <p className={cn('-ml-[30vw] whitespace-nowrap py-1', ROW)}>
        <Row items={rowB} offset={1} />
      </p>
    </div>
  );

  return (
    <section aria-labelledby="stack-title" className="relative overflow-hidden py-16 md:py-20">
      <div className="container-signal">
        <SectionHead
          id="stack-title"
          path="~/stack"
          cmd="ls --by-category"
          title={
            <>
              {skillCategories.map((c, i) => (
                <Fragment key={c.id}>
                  {i > 0 && <span className="text-fg-dim">{i === skillCategories.length - 1 ? ', and ' : ', '}</span>}
                  <span className={i === 1 ? 'text-phosphor' : undefined}>{c.title.toLowerCase()}</span>
                </Fragment>
              ))}
              <span className="text-fg-dim">.</span>
            </>
          }
          aside={
            <MoreLink to="/stack" className="md:pb-2">
              {/* The shell prefix is decoration: the link reads "open stack · N entries". */}
              open <span aria-hidden>~/</span>stack · {skills.length} entries
            </MoreLink>
          }
        />
      </div>

      {/* The one effect here: two opposing rows that speed up with scroll velocity (mouse and trackpad);
          on touch screens they drift at a steady pace in CSS. Decorative copies; the real list is the sr-only one. */}
      <div className="relative mt-8 md:mt-12">
        <ul className="sr-only">
          {shown.map((s) => (
            <li key={s.name}>{s.name}</li>
          ))}
        </ul>
        {still ? (
          staticRows
        ) : coarse ? (
          <DriftRows />
        ) : (
          <RB name="ScrollVelocity" className={EDGE_FADE}>
            {/* Mounted only near the viewport, so the per-frame loop and scroll listener stop off-screen;
                the static rows (same height) hold the space meanwhile. */}
            <InView fallback={staticRows}>
              <div aria-hidden>
                <ScrollVelocity
                  texts={[<Row key="a" items={rowA} />, <Row key="b" items={rowB} offset={1} />]}
                  velocity={30}
                  numCopies={3}
                  damping={50}
                  stiffness={400}
                  velocityMapping={{ input: [0, 1000], output: [0, 3] }}
                  parallaxClassName="py-1"
                  scrollerClassName={ROW_FORCED}
                />
              </div>
            </InView>
          </RB>
        )}
      </div>
    </section>
  );
}
