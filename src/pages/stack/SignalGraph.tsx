import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode
} from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import WarmTooltip, { WarmTooltipGroup } from '@/components/reactbits/WarmTooltip';
import RB from '@/components/ui/RB';
import BrandIcon from '@/components/ui/BrandIcon';
import InView from '@/lib/InView';
import { useReducedMotion } from '@/lib/motion';
import { isLowPowerDevice, useIsDesktop } from '@/lib/media';
import { cn } from '@/lib/cn';
import { thumbSrc, THUMB_SIZE } from '@/lib/art';
import type { Project } from '@/data/projects';
import type { SkillCategoryId } from '@/data/skills';
import {
  categoryById,
  graphBottom,
  graphClusters,
  graphTop,
  links,
  projectBySlug,
  projectsFor,
  projectsForCategory,
  skillNodes,
  skillsForProject,
  skillsInCategory,
  skillDescription,
  TIP,
  type SkillNode
} from './data';
import { SkillTipContent } from './parts';
import { useOnScreen } from './useOnScreen';

const DotField = lazy(() => import('@/components/reactbits/DotField'));

/** Low-power devices keep the static grid behind the graph instead of the dot-field canvas. */
const LOW_POWER = isLowPowerDevice();

type FocusKind = 'skill' | 'project' | 'hub';
interface Focus {
  kind: FocusKind;
  id: string;
}

interface Geometry {
  w: number;
  h: number;
  pts: Record<string, { x: number; y: number }>;
}

type NodeState = 'idle' | 'lit' | 'dim';

const key = {
  skill: (id: string) => `s:${id}`,
  project: (slug: string) => `p:${slug}`,
  hub: (id: string) => `h:${id}`
};

/** Which skills, case files and hubs light up for the current focus. */
function relationsFor(focus: Focus | null) {
  const skills = new Set<string>();
  const projects = new Set<string>();
  const hubs = new Set<string>();
  if (!focus) return { skills, projects, hubs, any: false };
  if (focus.kind === 'skill') {
    const s = skillNodes.find((n) => n.id === focus.id);
    if (s) {
      skills.add(s.id);
      s.usedIn.forEach((p) => projects.add(p));
      hubs.add(s.category);
    }
  } else if (focus.kind === 'project') {
    projects.add(focus.id);
    skillsForProject(focus.id).forEach((s) => {
      skills.add(s.id);
      hubs.add(s.category);
    });
  } else {
    const cat = focus.id as SkillCategoryId;
    hubs.add(cat);
    skillsInCategory(cat).forEach((s) => skills.add(s.id));
    projectsForCategory(cat).forEach((p) => projects.add(p.slug));
  }
  return { skills, projects, hubs, any: true };
}

function stateOf(set: Set<string>, id: string, any: boolean): NodeState {
  if (!any) return 'idle';
  return set.has(id) ? 'lit' : 'dim';
}

/** Vertical S-curve between two points — reads as a signal wire. */
function wire(a: { x: number; y: number }, b: { x: number; y: number }) {
  const my = (a.y + b.y) / 2;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${a.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${my.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

/* ------------------------------------------------------------------------------------------- */

function ProjectNode({
  project,
  placement,
  state,
  self,
  anchor,
  onFocusNode,
  onBlurNode
}: {
  project: Project;
  placement: 'top' | 'bottom';
  state: NodeState;
  /** The node under the pointer / focus — the graph's one green element. */
  self: boolean;
  anchor: string;
  onFocusNode: (f: Focus) => void;
  onBlurNode: () => void;
}) {
  const count = skillsForProject(project.slug).length;
  const descId = `graph-desc-p-${project.slug}`;
  const dot = (
    <span
      data-anchor={anchor}
      aria-hidden
      className={cn(
        'relative grid size-11 place-items-center overflow-hidden rounded-[4px] border bg-ink-900 transition-[border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)]',
        state === 'lit'
          ? cn('scale-[1.12]', self ? 'border-phosphor' : 'border-fg/70')
          : 'border-line-strong group-hover/proj:border-fg/40'
      )}
    >
      {/* At rest the port shows its case-file number; lit, the case file's poster resolves in. */}
      <span
        className={cn(
          'font-mono text-[12px] tracking-[0.04em] transition-opacity duration-300',
          state === 'lit' ? 'opacity-0' : 'text-fg-muted group-hover/proj:text-fg'
        )}
      >
        {project.index}
      </span>
      <img
        src={thumbSrc(project.slug)}
        alt=""
        width={THUMB_SIZE}
        height={THUMB_SIZE}
        loading="lazy"
        draggable={false}
        className={cn(
          'absolute inset-0 size-full scale-[1.9] object-cover object-[50%_42%] transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)]',
          state === 'lit' ? 'scale-[1.6] opacity-100' : 'scale-[1.9] opacity-0'
        )}
      />
      <span className="absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-ink-950/60" />
    </span>
  );
  return (
    <div className="flex justify-center">
      <WarmTooltip
        {...TIP}
        side={placement === 'top' ? 'top' : 'bottom'}
        content={
          <span className="inline-flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] opacity-60">
              case file {project.index}
            </span>
            <span>
              {count} linked {count === 1 ? 'skill' : 'skills'} · open
            </span>
          </span>
        }
      >
        <Link
          to={`/log/${project.slug}`}
          aria-describedby={descId}
          onPointerEnter={() => onFocusNode({ kind: 'project', id: project.slug })}
          onPointerLeave={onBlurNode}
          onFocus={() => onFocusNode({ kind: 'project', id: project.slug })}
          onBlur={onBlurNode}
          className={cn(
            'group/proj flex flex-col items-center gap-2 rounded-[var(--radius-md)] px-2 py-1 text-center transition-opacity duration-300',
            state === 'dim' && 'opacity-35'
          )}
        >
          {placement === 'bottom' && dot}
          <span className="flex flex-col items-center gap-1">
            <span className={cn('font-mono text-[11px]', state === 'lit' ? 'text-fg-muted' : 'text-fg-dim')}>
              [{project.index}]
            </span>
            <span
              className={cn(
                'text-[13px] font-medium leading-tight tracking-[-0.01em] text-fg underline-offset-4 transition-colors duration-300',
                state === 'lit' ? 'underline decoration-fg/40' : 'decoration-line-strong group-hover/proj:underline'
              )}
            >
              {project.shortTitle}
            </span>
          </span>
          {placement === 'top' && dot}
        </Link>
      </WarmTooltip>
      <span id={descId} hidden>
        {project.title}. {count} linked {count === 1 ? 'skill' : 'skills'}. Opens the case file.
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------- */

function SkillChip({
  skill,
  state,
  self,
  pinned,
  tabbable,
  anchor,
  onFocusNode,
  onBlurNode,
  onPin,
  onKey
}: {
  skill: SkillNode;
  state: NodeState;
  /** The node under the pointer / focus — the graph's one green element. */
  self: boolean;
  pinned: boolean;
  tabbable: boolean;
  anchor: string;
  onFocusNode: (f: Focus) => void;
  onBlurNode: () => void;
  onPin: (f: Focus) => void;
  onKey: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
}) {
  const traced = skill.usedIn.length > 0;
  const focus: Focus = { kind: 'skill', id: skill.id };
  return (
    <WarmTooltip {...TIP} content={<SkillTipContent skill={skill} />}>
      <button
        data-chip={skill.id}
        type="button"
        tabIndex={tabbable ? 0 : -1}
        aria-pressed={pinned}
        aria-describedby={`graph-desc-s-${skill.id}`}
        onPointerEnter={() => onFocusNode(focus)}
        onPointerLeave={onBlurNode}
        onFocus={() => onFocusNode(focus)}
        onBlur={onBlurNode}
        onClick={() => onPin(focus)}
        onKeyDown={onKey}
        className={cn(
          'relative inline-flex items-center gap-1.5 rounded-[3px] border py-1 pl-2 pr-2.5 text-[12px] leading-none tracking-[-0.01em] transition-[opacity,border-color,background-color,color,transform] duration-200 hover:-translate-y-px active:scale-[0.97]',
          !traced && 'border-dashed',
          pinned
            ? 'border-fg bg-fg text-ink-950'
            : self
              ? 'border-phosphor bg-ink-850 text-fg'
              : state === 'lit'
                ? 'border-fg/50 bg-ink-850 text-fg'
                : traced
                  ? 'border-line-strong bg-ink-900 text-fg hover:border-fg/40'
                  : 'border-line-strong bg-ink-950 text-fg-muted hover:border-fg-dim',
          state === 'dim' && !pinned && 'opacity-30'
        )}
      >
        <span
          data-anchor={anchor}
          aria-hidden
          className={cn(
            'size-[7px] shrink-0 rounded-[1px] transition-colors duration-300',
            traced
              ? pinned
                ? 'bg-ink-950'
                : self
                  ? 'bg-phosphor'
                  : state === 'lit'
                    ? 'bg-fg'
                    : 'bg-fg/75'
              : 'border border-fg-dim bg-transparent'
          )}
        />
        {skill.icon && <BrandIcon slug={skill.icon} size={12} className="shrink-0 opacity-80" />}
        <span className="whitespace-nowrap">{skill.name}</span>
      </button>
    </WarmTooltip>
  );
}

/* ------------------------------------------------------------------------------------------- */

function HubNode({
  id,
  state,
  self,
  pinned,
  anchor,
  onFocusNode,
  onBlurNode,
  onPin
}: {
  id: SkillCategoryId;
  state: NodeState;
  /** The node under the pointer / focus — the graph's one green element. */
  self: boolean;
  pinned: boolean;
  anchor: string;
  onFocusNode: (f: Focus) => void;
  onBlurNode: () => void;
  onPin: (f: Focus) => void;
}) {
  const cat = categoryById[id];
  const count = skillsInCategory(id).length;
  const files = projectsForCategory(id).length;
  const focus: Focus = { kind: 'hub', id };
  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-label={`${cat.title}: ${count} skills, linked to ${files} case ${files === 1 ? 'file' : 'files'}`}
      onPointerEnter={() => onFocusNode(focus)}
      onPointerLeave={onBlurNode}
      onFocus={() => onFocusNode(focus)}
      onBlur={onBlurNode}
      onClick={() => onPin(focus)}
      className={cn(
        'group/hub relative my-0.5 inline-flex items-center gap-3 rounded-[4px] border py-1.5 pl-1.5 pr-4 transition-[opacity,border-color,box-shadow,background-color] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97]',
        self
          ? 'border-phosphor bg-ink-850'
          : pinned
            ? 'border-fg bg-ink-850'
            : state === 'lit'
              ? 'border-fg/50 bg-ink-850'
              : 'border-line-strong bg-ink-900 hover:border-fg/40',
        state === 'dim' && 'opacity-40'
      )}
    >
      <span aria-hidden className="relative grid size-8 place-items-center rounded-[3px] border border-line-strong bg-ink-950">
        <span data-anchor={anchor} className={cn('relative size-2.5 rounded-[1px] transition-colors duration-200', self ? 'bg-phosphor' : 'bg-fg')} />
      </span>
      <span className="flex items-baseline gap-2">
        <span className="font-mono text-[11px] text-fg-dim">{cat.index}</span>
        <span className="text-[14px] font-semibold tracking-[-0.02em] text-fg">{cat.title}</span>
        <span className="font-mono text-[11px] text-fg-muted">({count})</span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------------------------------- */

function Readout({ focus, pinned, onClear }: { focus: Focus | null; pinned: boolean; onClear: () => void }) {
  let tag = 'readout';
  let title = 'Hover, focus, or click a node';
  let body: ReactNode = (
    <span className="text-fg-muted">
      Skills light the case files that used them; case files light their skills. Click a skill or category to pin it,
      then follow its links.
    </span>
  );
  if (focus?.kind === 'skill') {
    const s = skillNodes.find((n) => n.id === focus.id)!;
    const used = projectsFor(s);
    tag = categoryById[s.category].title;
    title = s.name;
    body = used.length ? (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-[0.75rem] text-fg-dim">used in</span>
        {used.map((p) => (
          <Link
            key={p.slug}
            to={`/log/${p.slug}`}
            className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
          >
            {p.title}
          </Link>
        ))}
      </span>
    ) : (
      <span className="text-fg-muted">Listed skill — not yet tied to a case file.</span>
    );
  } else if (focus?.kind === 'project') {
    const p = projectBySlug[focus.id];
    const s = skillsForProject(focus.id);
    tag = `~/log/${p.slug}`;
    title = p.title;
    body = <span className="text-fg-muted">{s.map((n) => n.name).join(' · ')}</span>;
  } else if (focus?.kind === 'hub') {
    const cat = categoryById[focus.id as SkillCategoryId];
    const files = projectsForCategory(cat.id);
    tag = `category ${cat.index}`;
    title = cat.title;
    body = (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="font-mono text-[0.75rem] text-fg-dim">case files</span>
        {files.map((p) => (
          <Link
            key={p.slug}
            to={`/log/${p.slug}`}
            className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
          >
            {p.shortTitle}
          </Link>
        ))}
      </span>
    );
  }
  return (
    <figcaption className="relative z-[2] flex min-h-[64px] flex-col gap-2 border-t border-line bg-ink-950 px-5 py-3.5 md:flex-row md:items-center md:gap-6 md:px-7">
      <span className="flex shrink-0 items-center gap-3 md:w-[300px]">
        <span aria-hidden className={cn('font-mono text-[0.8125rem]', focus ? 'text-fg' : 'text-fg-dim')}>&gt;</span>
        <span className="font-mono text-[0.75rem] text-fg-muted">{tag}</span>
        <span className="truncate text-[15px] font-semibold tracking-[-0.02em] text-fg">{title}</span>
      </span>
      <span className="min-w-0 flex-1 text-[14px] leading-relaxed">{body}</span>
      {pinned && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-[3px] border border-line-strong px-3 py-1.5 font-mono text-[0.75rem] text-fg-muted transition-colors hover:border-fg/40 hover:text-fg md:self-center"
        >
          <X aria-hidden size={13} strokeWidth={1.75} /> unpin
        </button>
      )}
    </figcaption>
  );
}

/* ------------------------------------------------------------------------------------------- */

export default function SignalGraph() {
  const reduced = useReducedMotion();
  const desktop = useIsDesktop();
  const stageRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const [geom, setGeom] = useState<Geometry | null>(null);
  const [hover, setHover] = useState<Focus | null>(null);
  const [pinned, setPinned] = useState<Focus | null>(null);
  const [drawn, setDrawn] = useState(false);
  const live = useOnScreen(figureRef, '100px 0px');
  const [roving, setRoving] = useState<Record<string, string>>(() =>
    Object.fromEntries(graphClusters.map((c) => [c, skillsInCategory(c)[0].id]))
  );

  const active = hover ?? pinned;
  const rel = useMemo(() => relationsFor(active), [active]);

  // Measure node anchors relative to the stage; re-run on resize and once fonts settle.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let raf = 0;
    const measure = () => {
      const box = stage.getBoundingClientRect();
      const pts: Geometry['pts'] = {};
      stage.querySelectorAll<HTMLElement>('[data-anchor]').forEach((el) => {
        const k = el.dataset.anchor ?? '';
        const r = el.getBoundingClientRect();
        pts[k] = { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      setGeom({ w: box.width, h: box.height, pts });
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    const ro = new ResizeObserver(schedule);
    ro.observe(stage);
    document.fonts?.ready.then(schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [desktop]);

  // Wires draw in the first time the instrument scrolls into view.
  useEffect(() => {
    const el = figureRef.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const onFocusNode = useCallback((f: Focus) => setHover(f), []);
  const onBlurNode = useCallback(() => setHover(null), []);
  const onPin = useCallback(
    (f: Focus) => setPinned((prev) => (prev && prev.kind === f.kind && prev.id === f.id ? null : f)),
    []
  );

  // Escape clears a pinned selection from anywhere inside the instrument.
  const onFigureKey = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape' && pinned) setPinned(null);
  };

  // Roving focus inside a cluster: arrows / Home / End move between that category's skills.
  const onChipKey = (cat: SkillCategoryId, index: number) => (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const list = skillsInCategory(cat);
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % list.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + list.length) % list.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const id = list[next].id;
    setRoving((r) => ({ ...r, [cat]: id }));
    stageRef.current?.querySelector<HTMLButtonElement>(`[data-chip="${id}"]`)?.focus();
  };

  const isPinned = (kind: FocusKind, id: string) => pinned?.kind === kind && pinned.id === id;
  const isSelf = (kind: FocusKind, id: string) => active?.kind === kind && active.id === id;

  const renderCluster = (cat: SkillCategoryId) => {
    const list = skillsInCategory(cat);
    const half = Math.ceil(list.length / 2);
    const chip = (s: SkillNode, i: number) => (
      <SkillChip
        key={s.id}
        skill={s}
        state={stateOf(rel.skills, s.id, rel.any)}
        self={isSelf('skill', s.id)}
        pinned={isPinned('skill', s.id)}
        tabbable={roving[cat] === s.id}
        anchor={key.skill(s.id)}
        onFocusNode={(f) => {
          setRoving((r) => (r[cat] === s.id ? r : { ...r, [cat]: s.id }));
          onFocusNode(f);
        }}
        onBlurNode={onBlurNode}
        onPin={onPin}
        onKey={onChipKey(cat, i)}
      />
    );
    return (
      <div
        key={cat}
        role="group"
        aria-label={`${categoryById[cat].title} skills`}
        className="flex flex-col items-center justify-center gap-2 px-2 py-1 lg:px-4"
      >
        <div className="flex max-w-[40rem] flex-wrap items-end justify-center gap-1.5">
          {list.slice(0, half).map((s, i) => chip(s, i))}
        </div>
        <HubNode
          id={cat}
          state={stateOf(rel.hubs, cat, rel.any)}
          self={isSelf('hub', cat)}
          pinned={isPinned('hub', cat)}
          anchor={key.hub(cat)}
          onFocusNode={onFocusNode}
          onBlurNode={onBlurNode}
          onPin={onPin}
        />
        <div className="flex max-w-[40rem] flex-wrap items-start justify-center gap-1.5">
          {list.slice(half).map((s, i) => chip(s, i + half))}
        </div>
      </div>
    );
  };

  /* ---------------- SVG wiring ---------------- */
  const svg = useMemo(() => {
    if (!geom) return null;
    const P = geom.pts;
    const edges = links.flatMap((l, i) => {
      const a = P[key.skill(l.skill)];
      const b = P[key.project(l.project)];
      if (!a || !b) return [];
      const lit = rel.any && rel.skills.has(l.skill) && rel.projects.has(l.project);
      return [{ id: `${l.skill}>${l.project}`, d: wire(a, b), lit, i }];
    });
    const spokes = skillNodes.flatMap((s) => {
      const a = P[key.hub(s.category)];
      const b = P[key.skill(s.id)];
      if (!a || !b) return [];
      const lit = rel.any && rel.skills.has(s.id) && rel.hubs.has(s.category);
      return [{ id: s.id, d: `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, lit }];
    });
    const topY = graphTop.map((s) => P[key.project(s)]?.y ?? 0);
    const botY = graphBottom.map((s) => P[key.project(s)]?.y ?? 0);
    const firstX = P[key.project(graphTop[0])]?.x ?? 60;
    const y1 = Math.min(...topY);
    const y2 = Math.max(...botY);
    const pad = 16;
    const r = Math.max(24, Math.min(140, firstX - pad - 18, (y2 - y1) / 2));
    const bezel = `M ${pad + r} ${y1} H ${geom.w - pad - r} A ${r} ${r} 0 0 1 ${geom.w - pad} ${y1 + r} V ${y2 - r} A ${r} ${r} 0 0 1 ${geom.w - pad - r} ${y2} H ${pad + r} A ${r} ${r} 0 0 1 ${pad} ${y2 - r} V ${y1 + r} A ${r} ${r} 0 0 1 ${pad + r} ${y1} Z`;
    return { edges, spokes, bezel };
  }, [geom, rel]);

  const describe = 'graph-help';

  return (
    <WarmTooltipGroup delay={260} warmWindow={420}>
      <figure
        ref={figureRef}
        onKeyDown={onFigureKey}
        aria-labelledby="graph-title"
        aria-describedby={describe}
        className={cn('panel brackets stack-graph relative overflow-hidden', reduced && 'stack-static')}
        data-drawn={drawn || reduced ? 'true' : 'false'}
        data-live={live ? 'true' : 'false'}
      >
        <h3 id="graph-title" className="sr-only">
          Skill constellation
        </h3>
        <p id={describe} className="sr-only">
          Interactive graph of four category hubs, their skills, and the eight case files. Tab moves between case files,
          categories and skill clusters; arrow keys move between skills inside a cluster; Enter pins a selection and
          Escape clears it.
        </p>
        {skillNodes.map((s) => (
          <span key={s.id} id={`graph-desc-s-${s.id}`} hidden>
            {skillDescription(s)}
          </span>
        ))}
        <span className="sr-only" aria-live="polite">
          {pinned
            ? `Pinned ${pinned.kind === 'hub' ? categoryById[pinned.id as SkillCategoryId].title : pinned.kind === 'project' ? projectBySlug[pinned.id].title : skillNodes.find((s) => s.id === pinned.id)?.name}.`
            : ''}
        </span>

        {/* Background: interactive dot field, or a designed static grid when motion is reduced. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="grid-lines absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_75%_70%_at_50%_45%,black,transparent)]" />
          {!reduced && !LOW_POWER && (
            <RB
              name="DotField"
              className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_75%_at_50%_45%,black_30%,transparent)]"
            >
              <InView className="absolute inset-0" rootMargin="300px 0px">
                <Suspense fallback={null}>
                  <DotField
                    dotRadius={1.4}
                    dotSpacing={18}
                    cursorRadius={260}
                    bulgeStrength={42}
                    glowRadius={180}
                    gradientFrom="rgba(232, 232, 232, 0.22)"
                    gradientTo="rgba(232, 232, 232, 0.1)"
                    glowColor="#161616"
                  />
                </Suspense>
              </InView>
            </RB>
          )}
        </div>

        {/* Stage: nodes laid out by CSS grid; wires measured from them and drawn underneath. */}
        <RB name="WarmTooltip" className="relative z-[1]">
          <div ref={stageRef} className="relative px-3 pb-5 pt-6 md:px-6 lg:px-10 lg:pt-7">
            {svg && geom && (
              <svg
                aria-hidden
                width={geom.w}
                height={geom.h}
                viewBox={`0 0 ${geom.w} ${geom.h}`}
                className="pointer-events-none absolute inset-0 overflow-visible"
              >
                <path d={svg.bezel} fill="none" stroke="rgb(238 238 238 / 0.09)" strokeWidth={1} />
                <path
                  d={svg.bezel}
                  fill="none"
                  stroke="rgb(238 238 238 / 0.14)"
                  strokeWidth={5}
                  strokeDasharray="1 23"
                />
                <g>
                  {svg.spokes.map((s) => (
                    <path
                      key={s.id}
                      d={s.d}
                      fill="none"
                      stroke={s.lit ? 'rgb(238 238 238 / 0.5)' : 'rgb(232 232 232 / 0.12)'}
                      strokeWidth={1}
                      strokeDasharray="3 4"
                      style={{ transition: 'stroke 0.3s ease' }}
                    />
                  ))}
                </g>
                <g>
                  {svg.edges.map((e) => (
                    <path
                      key={e.id}
                      d={e.d}
                      pathLength={1}
                      fill="none"
                      className="stack-edge"
                      stroke={
                        e.lit
                          ? 'rgb(238 238 238 / 0.8)'
                          : rel.any
                            ? 'rgb(238 238 238 / 0.05)'
                            : 'rgb(238 238 238 / 0.14)'
                      }
                      strokeWidth={e.lit ? 1.6 : 1}
                      style={{ transitionDelay: `${e.i * 16}ms, 0ms, 0ms` }}
                    />
                  ))}
                </g>
                {!reduced && (
                  <g>
                    {svg.edges
                      .filter((e) => e.lit)
                      .map((e) => (
                        <path
                          key={`f-${e.id}`}
                          d={e.d}
                          pathLength={1}
                          fill="none"
                          className="stack-edge-flow"
                          stroke="rgb(63 224 122 / 0.9)"
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                      ))}
                  </g>
                )}
              </svg>
            )}

            <div className="relative grid grid-cols-4 gap-2">
              {graphTop.map((slug) => (
                <ProjectNode
                  key={slug}
                  project={projectBySlug[slug]}
                  placement="top"
                  state={stateOf(rel.projects, slug, rel.any)}
                  self={isSelf('project', slug)}
                  anchor={key.project(slug)}
                  onFocusNode={onFocusNode}
                  onBlurNode={onBlurNode}
                />
              ))}
            </div>

            <div className="relative my-7 grid grid-cols-2 gap-x-4 gap-y-8 lg:my-9 lg:gap-x-10 lg:gap-y-9">
              {graphClusters.map(renderCluster)}
            </div>

            <div className="relative grid grid-cols-4 gap-2">
              {graphBottom.map((slug) => (
                <ProjectNode
                  key={slug}
                  project={projectBySlug[slug]}
                  placement="bottom"
                  state={stateOf(rel.projects, slug, rel.any)}
                  self={isSelf('project', slug)}
                  anchor={key.project(slug)}
                  onFocusNode={onFocusNode}
                  onBlurNode={onBlurNode}
                />
              ))}
            </div>
          </div>
        </RB>

        <Readout focus={active} pinned={Boolean(pinned) && active === pinned} onClear={() => setPinned(null)} />
      </figure>
    </WarmTooltipGroup>
  );
}
