import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { getProject } from '@/data/projects';
import { homeLab } from '@/data/homeLab';
import { useReducedMotion } from '@/lib/motion';
import { cn } from '@/lib/cn';
import RB from '@/components/ui/RB';
import StatusMark from '@/components/reactbits/StatusMark';
import LatticeLoader from '@/components/reactbits/LatticeLoader';
import { Rise, SectionHead } from './fx';
import { useNearViewport } from './hooks';

interface Proc {
  name: string;
  detail: string;
  state: string;
  /** Rows without a page of their own (the home lab) render as plain text: no link, no arrow. */
  to?: string;
}

const otnow = getProject('otnow');
const cisco = getProject('cisco-networking-labs');
const p2p = getProject('p2p-messaging');
// The Proxmox lab is genuinely technical work in progress (info.txt), but no page covers it yet: no link.

const running: Proc[] = [
  otnow && { name: otnow.shortTitle, detail: 'v1.5.0 · independent build', state: otnow.status, to: '/log/otnow' },
  cisco && { name: cisco.shortTitle, detail: cisco.role, state: cisco.status, to: '/log/cisco-networking-labs' },
  p2p && { name: p2p.title, detail: p2p.category, state: p2p.status, to: '/log/p2p-messaging' },
  { name: 'Proxmox home lab', detail: homeLab.platform, state: homeLab.status }
].filter(Boolean) as Proc[];

/** Monochrome, like the card: a still white arc for each piece of running work. */
const MARK = '#e8e8e8';

/** State tag; on phones it moves under the process name instead of taking a column. */
function StatePill({ p, className }: { p: Proc; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-[3px] border border-line-strong px-2 py-0.5 font-mono text-[0.75rem] text-chalk', className)}>
      {p.state}
    </span>
  );
}

function Rows({ items }: { items: Proc[] }) {
  return (
    <>
      {items.map((p, i) => (
        <tr key={p.name} className={cn('border-t border-line', p.to && 'group transition-colors duration-200 hover:bg-ink-850')}>
          <td className="hidden py-3.5 lg:py-3 pl-5 align-middle font-mono text-[0.75rem] text-fg-dim sm:table-cell">{String(i + 1).padStart(2, '0')}</td>
          <td className="py-3.5 lg:py-3 pr-12 pl-4 align-middle sm:pr-3 sm:pl-3">
            <div className="flex items-center gap-3">
              <span aria-hidden className="inline-flex">
                {/* A still arc: the lattice in the title bar is the table's one moving part. */}
                <StatusMark status="running" progress={0.68} color={MARK} size={16} strokeWidth={2} />
              </span>
              {/* Wide screens read like `ps` output: name and detail on one line. */}
              <div className="min-w-0 lg:flex lg:items-baseline lg:gap-4">
                {p.to ? (
                  <Link
                    to={p.to}
                    className="shrink-0 font-mono text-[0.9375rem] text-fg decoration-fg-dim underline-offset-4 group-hover:underline after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4"
                  >
                    {p.name}
                  </Link>
                ) : (
                  <span className="block shrink-0 font-mono text-[0.9375rem] text-fg">{p.name}</span>
                )}
                <p className="mt-0.5 font-mono text-[0.75rem] text-fg-muted lg:mt-0">
                  {p.detail}
                </p>
                <StatePill p={p} className="mt-2 sm:hidden" />
              </div>
            </div>
            {/* Decoration only, pinned to the row's right edge (the row is the positioned box). */}
            {p.to && (
              <ArrowRight
                aria-hidden
                size={15}
                strokeWidth={1.75}
                className="absolute top-1/2 right-5 -translate-y-1/2 text-fg-dim transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-fg"
              />
            )}
          </td>
          <td className="hidden py-3.5 pr-12 pl-3 align-middle lg:py-3 sm:table-cell">
            <StatePill p={p} className="whitespace-nowrap" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default function ProcessesSection() {
  const reduced = useReducedMotion();
  // The lattice runs only while its own title bar is on screen (no margin): a few cells ticking
  // just off screen still cost every frame on a phone.
  const [barRef, near] = useNearViewport<HTMLDivElement>('0px');
  const spin = near && !reduced;
  const head = 'px-3 py-2.5 text-left font-mono text-[0.75rem] font-normal text-fg-dim';

  return (
    <section aria-labelledby="proc-title" className="relative py-16 md:py-20">
      <div className="container-signal">
        <SectionHead
          id="proc-title"
          path="~"
          cmd="ps --state=running"
          title="Now"
          aside={
            <p className="max-w-[36ch] text-[0.9375rem] leading-relaxed text-fg-muted md:pb-1 md:text-right">
              Published, ongoing, and in-progress work.
            </p>
          }
        />

        <Rise className="mt-8 md:mt-10">
          <div className="panel overflow-hidden">
            {/* Title bar, like `top`: the one moving part is the small lattice that says "still running". */}
            <div ref={barRef} className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5 sm:px-5">
              <span aria-hidden className="truncate font-mono text-[0.75rem] text-fg-muted">
                top <span className="text-fg-dim">-</span> affan@shaikh
              </span>
              <RB name="LatticeLoader" as="span" className="inline-flex shrink-0">
                {/* Animates only while this title bar is on screen (and never in reduced motion). */}
                <span aria-hidden className={cn('inline-flex', !spin && '[&_.ll-run>span]:[animation-play-state:paused]')}>
                  <LatticeLoader
                    status="working"
                    label={`${running.length} running`}
                    pattern="snake"
                    grid={3}
                    shape="square"
                    color="#a8a8a8"
                    doneColor="#a8a8a8"
                    cellSize={4}
                    gap={2}
                    fontSize={11}
                    showTimer={false}
                    className="font-mono text-[0.75rem]! text-fg-muted"
                  />
                </span>
              </RB>
            </div>

            <RB name="StatusMark">
              <table className="w-full border-collapse">
                <caption className="sr-only">Work currently in progress</caption>
                <thead>
                  <tr>
                    <th scope="col" className={cn(head, 'hidden pl-5 sm:table-cell')}>
                      PID
                    </th>
                    <th scope="col" className={cn(head, 'pl-4 sm:pl-3')}>
                      PROCESS
                    </th>
                    <th scope="col" className={cn(head, 'hidden pr-12 sm:table-cell')}>
                      STATE
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr]:relative">
                  <Rows items={running} />
                </tbody>
              </table>
            </RB>
          </div>
        </Rise>
      </div>
    </section>
  );
}
