import { useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import BorderGlow from '@/components/reactbits/BorderGlow';
import JellyRadio from '@/components/reactbits/JellyRadio';
import WarmTooltip, { WarmTooltipGroup } from '@/components/reactbits/WarmTooltip';
import RB from '@/components/ui/RB';
import Section from '@/components/ui/Section';
import BrandIcon from '@/components/ui/BrandIcon';
import { skillCategories, type SkillCategoryId } from '@/data/skills';
import { useReducedMotion } from '@/lib/motion';
import { useIsMobile } from '@/lib/media';
import { cn } from '@/lib/cn';
import { thumbSrc, THUMB_SIZE } from '@/lib/art';
import { LISTED_ONLY, TIP, projectsFor, projectsForCategory, skillsInCategory, type SkillNode } from './data';
import { SectionHead, SkillTipContent, StackLabel } from './parts';

type Filter = 'all' | SkillCategoryId;

/** Every category traces its edge in chalk — green is kept for the card's accents, not for categories. */
const CHALK = { hsl: '0 0 91', colors: ['#e8e8e8', '#a8a8a8', '#8a8a8a'] };

function SkillChipLink({ skill }: { skill: SkillNode }) {
  const used = projectsFor(skill);
  const icon = skill.icon ? <BrandIcon slug={skill.icon} size={13} className="shrink-0 opacity-85" /> : null;
  if (!used.length) {
    return (
      <WarmTooltip {...TIP} content={<SkillTipContent skill={skill} />}>
        <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-dashed border-line-strong px-2.5 py-1.5 text-[12.5px] leading-none text-fg-muted">
          <span aria-hidden className="size-[6px] rounded-[1px] border border-fg-dim" />
          {icon}
          {skill.name}
          <span className="sr-only"> ({LISTED_ONLY.toLowerCase()})</span>
        </span>
      </WarmTooltip>
    );
  }
  return (
    <WarmTooltip {...TIP} content={<SkillTipContent skill={skill} />}>
      <Link
        to={`/log/${used[0].slug}`}
        aria-label={`${skill.name} — open ${used[0].title}${
          used.length > 1
            ? ` (also used in ${used
                .slice(1)
                .map((p) => p.title)
                .join(', ')})`
            : ''
        }`}
        className="inline-flex items-center gap-1.5 rounded-[3px] border border-line-strong bg-ink-950 px-2.5 py-1.5 text-[12.5px] leading-none text-fg transition-[border-color,color,background-color,transform] duration-200 hover:-translate-y-px hover:border-fg/40 hover:bg-ink-850 active:scale-[0.97]"
      >
        <span aria-hidden className="size-[6px] rounded-[1px] bg-fg/75" />
        {icon}
        {skill.name}
        {used.length > 1 && (
          <span aria-hidden className="font-mono text-[10px] text-fg-muted">
            ×{used.length}
          </span>
        )}
      </Link>
    </WarmTooltip>
  );
}

function CategoryCard({ id, expanded }: { id: SkillCategoryId; expanded: boolean }) {
  const cat = skillCategories.find((c) => c.id === id)!;
  const list = skillsInCategory(id);
  const traced = list.filter((s) => s.usedIn.length).length;
  const files = projectsForCategory(id);
  const g = CHALK;
  return (
    <BorderGlow
      className="h-full"
      backgroundColor="#0b0b0b"
      borderRadius={6}
      glowColor={g.hsl}
      colors={g.colors}
      glowRadius={18}
      glowIntensity={0.45}
      edgeSensitivity={28}
      fillOpacity={0.2}
    >
      <article
        aria-labelledby={`cat-${id}`}
        className={cn(
          'grid h-full gap-8 p-6 md:p-8',
          expanded && 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-12'
        )}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-4">
            <span aria-hidden className="font-mono text-[13px] text-fg-dim">## {cat.index}</span>
            <span className="font-mono text-[0.75rem] text-fg-muted">
              {list.length} skills · {traced} traced
            </span>
          </div>
          <h3
            id={`cat-${id}`}
            className="mt-5 text-[clamp(1.75rem,2.8vw,2.5rem)] font-semibold leading-[1] tracking-[-0.03em] text-fg"
          >
            {cat.title}
          </h3>
          <p className="mt-4 max-w-[54ch] text-[15px] leading-relaxed text-fg-muted">{cat.blurb}</p>
          <ul className="mt-7 flex flex-wrap gap-2" aria-label={`${cat.title} skills`}>
            {list.map((s) => (
              <li key={s.id} className="flex">
                <SkillChipLink skill={s} />
              </li>
            ))}
          </ul>
        </div>

        {expanded && (
          <div className="flex flex-col border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="font-mono text-[0.75rem] text-fg-muted">
              <span className="text-fg-dim"># </span>case files ({files.length})
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {files.map((p) => {
                const n = list.filter((s) => s.usedIn.includes(p.slug)).length;
                return (
                  <li key={p.slug}>
                    <Link
                      to={`/log/${p.slug}`}
                      className="group flex items-center gap-4 rounded-[var(--radius-md)] border border-line bg-ink-950 p-2.5 pr-4 transition-[border-color,background-color] duration-200 hover:border-fg/40 hover:bg-ink-850"
                    >
                      <img
                        src={thumbSrc(p.slug)}
                        alt=""
                        width={THUMB_SIZE}
                        height={THUMB_SIZE}
                        loading="lazy"
                        className="size-14 shrink-0 rounded-[var(--radius-sm)] object-cover"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-mono text-[0.6875rem] text-fg-muted">
                          ~/log/{p.slug} · {n} {n === 1 ? 'skill' : 'skills'}
                        </span>
                        <span className="mt-1 block truncate text-[15px] font-medium text-fg decoration-fg/40 underline-offset-4 group-hover:underline">
                          {p.title}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        size={16}
                        strokeWidth={1.75}
                        className="shrink-0 text-fg-muted transition-[transform,color] duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg"
                      />
                    </Link>
                  </li>
                );
              })}
              {files.length === 0 && <li className="text-[14px] text-fg-muted">{LISTED_ONLY}.</li>}
            </ul>
          </div>
        )}
      </article>
    </BorderGlow>
  );
}

export default function CategoryExplorer() {
  const [filter, setFilter] = useState<Filter>('all');
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const shown = filter === 'all' ? skillCategories.map((c) => c.id) : [filter];
  const shownSkills = shown.reduce((n, id) => n + skillsInCategory(id).length, 0);
  const shownFiles = new Set(shown.flatMap((id) => projectsForCategory(id).map((p) => p.slug))).size;
  const items = [{ value: 'all', label: 'All' }, ...skillCategories.map((c) => ({ value: c.id, label: c.title }))];
  const announce =
    filter === 'all'
      ? `Showing all ${skillCategories.length} categories`
      : `Showing ${skillCategories.find((c) => c.id === filter)?.title}: ${skillsInCategory(filter).length} skills`;

  return (
    <Section id="explorer" aria-labelledby="explorer-title">
      <StackLabel index="02" path="~/stack/categories" />
      <SectionHead
        id="explorer-title"
        kicker="filter by category"
        title={
          <>
            Read the stack <span className="text-fg-muted">by category</span>
          </>
        }
      >
        <p>
          Solid chips open the first case file that used the skill; hover or focus one to see every case file it appears
          in. Dashed chips are listed skills without a case file yet.
        </p>
      </SectionHead>

      <div className="mb-8 flex flex-col gap-3 md:mb-10 md:flex-row md:items-center md:justify-between md:gap-6">
        <RB
          name="JellyRadio"
          className="-mx-4 overflow-x-auto px-4 py-1 [scrollbar-width:none] md:mx-0 md:overflow-visible md:px-0"
        >
          <JellyRadio
            items={items}
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            ariaLabel="Filter skills by category"
            size={mobile ? 'sm' : 'md'}
            chipColor="#161616"
            activeColor="#eeeeee"
            textColor="#a8a8a8"
            activeTextColor="#060606"
            gap={mobile ? 6 : 8}
            radius={3}
            className="-ml-[var(--jr-pad-x)]"
          />
        </RB>
        <p aria-hidden className="flex items-center gap-2 font-mono text-[0.75rem] text-fg-muted">
          <span className="text-fg-dim">&gt;</span>
          {shownSkills} skills · {shownFiles} case files
        </p>
      </div>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <WarmTooltipGroup delay={300} warmWindow={400}>
        <RB name="BorderGlow, WarmTooltip">
          <motion.div layout={!reduced} className={cn('grid gap-4 md:gap-5', filter === 'all' && 'lg:grid-cols-2')}>
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((id) => (
                <motion.div
                  key={id}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: reduced ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <CategoryCard id={id} expanded={filter !== 'all'} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </RB>
      </WarmTooltipGroup>
    </Section>
  );
}
