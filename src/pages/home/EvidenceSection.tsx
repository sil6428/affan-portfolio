import { Fragment, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { projects, type Project, type ProjectMetric } from '@/data/projects';
import { useReducedMotion } from '@/lib/motion';
import { useIsMobile } from '@/lib/media';
import { cn } from '@/lib/cn';
import RB from '@/components/ui/RB';
import Counter from '@/components/reactbits/Counter';
import { SectionHead } from './fx';
import { useSeen } from './hooks';

/**
 * Which metric of which case file each tile shows (values come straight from projects.ts). The big
 * tile lists the project's other metrics on wide screens; when it has none, `facts` names the
 * project facts (by label) to list instead.
 */
const PICKS: { slug: string; metric: number; layout: string; big?: boolean; facts?: string[] }[] = [
  {
    slug: 'otnow',
    metric: 0,
    layout: 'md:col-span-6 lg:col-span-5 lg:row-span-2',
    big: true,
    facts: ['Platform', 'Data source', 'Optional statistics', 'Distribution']
  },
  { slug: 'secure-file-transfer', metric: 0, layout: 'md:col-span-6 lg:col-span-7' },
  { slug: 'file-integrity-monitor', metric: 0, layout: 'md:col-span-3 lg:col-span-4' },
  { slug: 'ssik', metric: 0, layout: 'md:col-span-3 lg:col-span-3' }
];

interface Row {
  label: string;
  value: string;
}

interface Tile {
  key: string;
  project: Project;
  metric: ProjectMetric;
  layout: string;
  big: boolean;
  /** Wide-screen readout for the big tile: other metrics, else the named facts. */
  readout: Row[];
}

const metricText = (m: ProjectMetric) =>
  `${m.prefix ?? ''}${m.separator ? m.value.toLocaleString('en-US') : m.value}${m.suffix ?? ''}`;

const tiles: Tile[] = PICKS.flatMap((p) => {
  const project = projects.find((x) => x.slug === p.slug);
  const metric = project?.metrics[p.metric];
  if (!project || !metric) return [];
  const others = project.metrics.filter((m) => m !== metric).map((m) => ({ label: m.label, value: metricText(m) }));
  const facts = (p.facts ?? []).flatMap((label) => project.facts.find((f) => f.label === label) ?? []);
  const readout = p.big ? (others.length ? others : facts) : [];
  return [{ key: `${p.slug}-${p.metric}`, project, metric, layout: p.layout, big: !!p.big, readout }];
});

const placesFor = (n: number) => {
  const digits = Math.max(1, String(Math.floor(n)).length);
  return Array.from({ length: digits }, (_, i) => 10 ** (digits - 1 - i));
};

const HIDE: CSSProperties = { display: 'none' };
/**
 * Damping ratio ≈ 1.1 (24 / 2√120): the value rises once and stops. Odometer mode turns the columns
 * from that one value, so no frame on the way up reads past the real number.
 */
const SPRING = { stiffness: 120, damping: 24, mass: 1 };
const MASK: CSSProperties = {
  maskImage: 'linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)',
  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)'
};

/** Rolling digits; long values are split into 3-digit groups so the separators stay put. */
function Rolling({ value, separator, fontSize, live }: { value: number; separator?: boolean; fontSize: number; live: boolean }) {
  const common = {
    fontSize,
    gap: 0,
    padding: 4,
    horizontalPadding: 0,
    borderRadius: 0,
    fontWeight: 600,
    textColor: 'inherit',
    spring: SPRING,
    odometer: true,
    counterStyle: MASK,
    topGradientStyle: HIDE,
    bottomGradientStyle: HIDE
  };
  if (!separator || value < 1000) {
    return <Counter value={live ? value : 0} places={placesFor(value)} {...common} />;
  }
  const groups: number[] = [];
  let v = Math.floor(value);
  while (v >= 1000) {
    groups.unshift(v % 1000);
    v = Math.floor(v / 1000);
  }
  groups.unshift(v);
  return (
    <span className="inline-flex items-end">
      {groups.map((g, i) => (
        <Fragment key={i}>
          <Counter value={live ? g : 0} places={i === 0 ? placesFor(g) : [100, 10, 1]} {...common} />
          {i < groups.length - 1 && (
            <span
              style={{ fontSize, lineHeight: 1, height: fontSize + common.padding }}
              className="-mx-[0.12em] inline-flex items-center text-fg-dim"
            >
              ,
            </span>
          )}
        </Fragment>
      ))}
    </span>
  );
}

/** Label ··· value lines, like a CLI summary. Long values wrap, right-aligned. */
function Readout({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;
  return (
    <ul className="space-y-1.5 font-mono text-[0.75rem]">
      {rows.map((r) => (
        <li key={r.label} className="flex items-baseline gap-2 text-fg-muted">
          <span className="shrink-0">{r.label}</span>
          <span aria-hidden className="min-w-4 flex-1 translate-y-[-0.2em] border-b border-dotted border-line-strong" />
          <span className="min-w-0 text-right text-fg">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** "20 modifications · 10 deletions · …" → a plain ASCII bar chart, like a CLI summary. */
function AsciiBars({ detail }: { detail: string }) {
  const parts = [...detail.matchAll(/(\d+)\s+([a-z]+)/gi)].map((m) => ({ n: Number(m[1]), label: m[2] }));
  if (parts.length < 2) return <p className="font-mono text-[0.75rem] text-fg-muted">{detail}</p>;
  const max = Math.max(...parts.map((p) => p.n));
  const pad = Math.max(...parts.map((p) => p.label.length));
  const width = 20;
  return (
    <>
      <p className="sr-only">{detail}</p>
      <div aria-hidden className="ascii overflow-hidden text-[0.75rem] leading-[1.7]">
        {parts.map((p) => {
          const fill = Math.max(1, Math.round((p.n / max) * width));
          return (
            <span key={p.label} className="block">
              <span className="text-fg-muted">{p.label.padEnd(pad)}</span> <span className="text-fg-dim">[</span>
              <span className="text-chalk">{'#'.repeat(fill)}</span>
              <span className="text-ink-700">{'.'.repeat(width - fill)}</span>
              <span className="text-fg-dim">]</span> <span className="text-fg">{String(p.n).padStart(2)}</span>
            </span>
          );
        })}
      </div>
    </>
  );
}

function EvidenceTile({ tile, live, mobile }: { tile: Tile; live: boolean; mobile: boolean }) {
  const { project, metric, big } = tile;
  const long = String(metric.value).length > 6;
  const fontSize = mobile ? (long ? 40 : 52) : big ? 104 : long ? 72 : 64;
  const formatted = metricText(metric);

  return (
    <Link
      to={`/log/${project.slug}`}
      className="group panel flex h-full flex-col justify-between gap-8 p-5 transition-colors duration-200 hover:border-fg/40 md:p-7"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[1.0625rem] leading-snug font-semibold tracking-[-0.01em] text-fg decoration-fg-dim decoration-1 underline-offset-4 group-hover:underline">
              {project.title}
            </h3>
            {/* Read right after the title, so the link's name is "OTNow 286 Canvas items organized …". */}
            <p className="sr-only">
              {formatted} {metric.label}.
            </p>
            <p aria-hidden className="mt-1 truncate font-mono text-[0.75rem] text-fg-muted">
              ~/log/{project.slug}
            </p>
          </div>
          <ArrowUpRight aria-hidden size={15} strokeWidth={1.75} className="shrink-0 text-fg-dim transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg" />
        </div>
        {tile.readout.length > 0 && (
          <div className="mt-6 hidden border-t border-line pt-5 lg:block">
            <Readout rows={tile.readout} />
          </div>
        )}
      </div>

      <div>
        <div aria-hidden className="flex items-end gap-1 leading-none text-fg">
          {metric.prefix && <span style={{ fontSize: fontSize * 0.5 }}>{metric.prefix}</span>}
          <Rolling value={metric.value} separator={metric.separator} fontSize={fontSize} live={live} />
          {metric.suffix && (
            <span className="pb-[0.1em] font-semibold tracking-[-0.04em] text-fg-dim" style={{ fontSize: fontSize * 0.46 }}>
              {metric.suffix}
            </span>
          )}
        </div>
        <p aria-hidden className={cn('mt-4 max-w-[38ch] leading-snug text-fg-muted', big ? 'text-[1.0625rem]' : 'text-[0.9375rem]')}>
          {metric.label}
        </p>
        {big && metric.detail && (
          <div className="mt-6 border-t border-line pt-5">
            <AsciiBars detail={metric.detail} />
          </div>
        )}
      </div>
    </Link>
  );
}

export default function EvidenceSection() {
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const [gridRef, seen] = useSeen<HTMLUListElement>('0px 0px -15% 0px');
  // Phones mount at the final values: no roll while the page is being scrolled with a thumb.
  const live = seen || reduced || mobile;

  return (
    <section aria-labelledby="evidence-title" className="relative py-16 md:py-20">
      <div className="container-signal">
        <SectionHead
          id="evidence-title"
          path="~/log"
          cmd="cat */metrics --no-sum"
          title="Evidence board"
          aside={
            <p className="max-w-[36ch] text-[0.9375rem] leading-relaxed text-fg-muted md:pb-1 md:text-right">
              Every number links to the case file that produced it. Per-project values, nothing summed.
            </p>
          }
        />

        {/* The one effect here: digits roll into place when the board scrolls in (desktop and tablet). */}
        <RB name="Counter" className="mt-8 md:mt-10">
          <ul ref={gridRef} className="grid grid-cols-1 gap-3 md:grid-cols-6 md:gap-4 lg:grid-cols-12">
            {tiles.map((tile) => (
              <li key={tile.key} className={tile.layout}>
                <EvidenceTile tile={tile} live={live} mobile={mobile} />
              </li>
            ))}
          </ul>
        </RB>
      </div>
    </section>
  );
}
