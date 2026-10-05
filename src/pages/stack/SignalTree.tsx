import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import BranchedMenu, { type BranchedMenuItem } from '@/components/reactbits/BranchedMenu';
import RB from '@/components/ui/RB';
import BrandIcon from '@/components/ui/BrandIcon';
import { thumbSrc, THUMB_SIZE } from '@/lib/art';
import { skillCategories } from '@/data/skills';
import { categoryById, LISTED_ONLY, projectsFor, skillNodes, skillsInCategory } from './data';

/**
 * Phones: the constellation becomes a branched index — categories fold open into their
 * skills, and the selected skill's case files are pinned in a readout under the thumb.
 */
export default function SignalTree() {
  const first = skillsInCategory('networking')[0];
  const [selected, setSelected] = useState(first.id);
  const skill = skillNodes.find((s) => s.id === selected) ?? first;
  const used = projectsFor(skill);
  const readoutRef = useRef<HTMLDivElement>(null);

  // The sticky readout covers the bottom of the viewport, so a tree button focused from the
  // keyboard could land underneath it (WCAG 2.4.11). Publish its height as
  // --readout-clearance and pad the page's scroll-into-view by it. When the viewport is too
  // short the readout is static (see its class) and needs no clearance.
  useEffect(() => {
    const el = readoutRef.current;
    if (!el) return undefined;
    const root = document.documentElement;
    const measure = () => {
      const sticky = getComputedStyle(el).position === 'sticky';
      const clearance = sticky ? Math.ceil(el.getBoundingClientRect().height + 12) : 0;
      root.style.setProperty('--readout-clearance', `${clearance}px`);
      root.style.scrollPaddingBottom = 'calc(var(--readout-clearance, 0px) + 16px)';
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      root.style.removeProperty('--readout-clearance');
      root.style.removeProperty('scroll-padding-bottom');
    };
  }, []);

  const items: BranchedMenuItem[] = useMemo(
    () =>
      skillCategories.map((c) => ({
        label: `${c.index} · ${c.title}`,
        value: c.id,
        children: skillsInCategory(c.id).map((s) => ({
          value: s.id,
          label: s.name,
          icon: s.icon ? (
            <BrandIcon slug={s.icon} size={14} />
          ) : (
            <span
              className={
                s.usedIn.length
                  ? 'mx-[3px] size-[7px] rounded-[1px] bg-fg/75'
                  : 'mx-[3px] size-[7px] rounded-[1px] border border-fg-dim'
              }
            />
          )
        }))
      })),
    []
  );

  return (
    <div className="relative">
      <RB name="BranchedMenu" className="panel brackets px-4 py-5">
        <p className="mb-4 font-mono text-[0.75rem] text-fg-muted">
          <span className="text-fg-dim"># </span>tap a category, then a skill
        </p>
        <BranchedMenu
          items={items}
          defaultOpen={[0]}
          defaultActive={first.id}
          onSelect={(value) => setSelected(value)}
          ariaLabel="Skills by category"
          color="#eeeeee"
          accentColor="#3fe07a"
          lineColor="rgba(238, 238, 238, 0.18)"
          width={420}
          rowHeight={40}
          indent={42}
          fontSize={15}
          className="w-full"
        />
      </RB>

      {/* Readout stays under the thumb while the tree scrolls past. */}
      <div ref={readoutRef} className="sticky bottom-3 z-10 mt-4 [@media(max-height:560px)]:static">
        <div
          aria-live="polite"
          className="rounded-[var(--radius-lg)] border border-line-strong bg-ink-900 p-4 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.9)]"
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.75rem] text-fg-dim">{categoryById[skill.category].index}</span>
            <span className="font-mono text-[0.75rem] text-fg-muted">{categoryById[skill.category].title}</span>
          </div>
          <p className="mt-1.5 text-[19px] font-semibold leading-tight tracking-[-0.02em] text-fg">{skill.name}</p>
          {used.length ? (
            <ul className="mt-3 flex flex-col gap-1.5">
              {used.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/log/${p.slug}`}
                    className="group flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-ink-950/60 p-2 pr-3 transition-colors hover:border-fg/40"
                  >
                    <img
                      src={thumbSrc(p.slug)}
                      alt=""
                      width={THUMB_SIZE}
                      height={THUMB_SIZE}
                      loading="lazy"
                      className="size-9 shrink-0 rounded-[var(--radius-sm)] object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span aria-hidden="true" className="block truncate font-mono text-[0.6875rem] text-fg-muted">~/log/{p.slug}</span>
                      <span className="block truncate text-[14px] text-fg">{p.title}</span>
                    </span>
                    <ArrowUpRight aria-hidden size={16} strokeWidth={1.75} className="shrink-0 text-fg-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{LISTED_ONLY}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
