/**
 * Derived views over src/data (skills + projects) for the /stack page.
 * Nothing here adds facts: every count is computed from the source arrays.
 */
import { skills, skillCategories, type Skill, type SkillCategory, type SkillCategoryId } from '@/data/skills';
import { projects, type Project } from '@/data/projects';

export interface SkillNode extends Skill {
  /** Stable DOM-safe id, e.g. "sha-256". */
  id: string;
  /** Position in the flat, category-ordered list (used for roving focus). */
  order: number;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const categoryOrder: SkillCategoryId[] = skillCategories.map((c) => c.id);

/** Skills in category order, each with a stable id. */
export const skillNodes: SkillNode[] = [...skills]
  .sort((a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category))
  .map((s, order) => ({ ...s, id: slugify(s.name), order }));

export const categoryById = Object.fromEntries(skillCategories.map((c) => [c.id, c])) as Record<
  SkillCategoryId,
  SkillCategory
>;

export const projectBySlug: Record<string, Project> = Object.fromEntries(projects.map((p) => [p.slug, p]));

export function projectsFor(skill: Skill): Project[] {
  return skill.usedIn.map((slug) => projectBySlug[slug]).filter((p): p is Project => Boolean(p));
}

export function skillsForProject(slug: string): SkillNode[] {
  return skillNodes.filter((s) => s.usedIn.includes(slug));
}

export function skillsInCategory(id: SkillCategoryId): SkillNode[] {
  return skillNodes.filter((s) => s.category === id);
}

/** Case files referenced by any skill in a category, in portfolio order. */
export function projectsForCategory(id: SkillCategoryId): Project[] {
  const slugs = new Set(skillsInCategory(id).flatMap((s) => s.usedIn));
  return projects.filter((p) => slugs.has(p.slug));
}

/** Every skill → case-file link. */
export const links = skillNodes.flatMap((s) => s.usedIn.map((slug) => ({ skill: s.id, project: slug })));

export const stats = {
  skills: skillNodes.length,
  categories: skillCategories.length,
  traced: skillNodes.filter((s) => s.usedIn.length > 0).length,
  listed: skillNodes.filter((s) => s.usedIn.length === 0).length,
  links: links.length,
  caseFiles: new Set(links.map((l) => l.project)).size
};


export const LISTED_ONLY = 'Listed skill — not yet tied to a case file';

/** Short mono tag used in the terminal output, e.g. "networks", "systems". */
export function categoryTag(id: SkillCategoryId): string {
  return categoryById[id].title.split(' ')[0].toLowerCase();
}

export function formatMetric(value: number, separator?: boolean, prefix = '', suffix = ''): string {
  const body = separator ? value.toLocaleString('en-US') : String(value);
  return `${prefix}${body}${suffix}`;
}

/* ---------------------------------------------------------------------------------------------
 * Constellation layout: case files sit on the outer bezel (top and bottom rails), ordered so
 * the wires from each category cluster stay as short as possible.
 * ------------------------------------------------------------------------------------------- */
export const graphTop = ['cisco-networking-labs', 'archtech', 'ssik', 'secure-file-transfer'];
export const graphBottom = ['interactive-portfolio', 'otnow', 'p2p-messaging', 'file-integrity-monitor'];
/** Category clusters in reading order: top-left, top-right, bottom-left, bottom-right. */
export const graphClusters: SkillCategoryId[] = ['networking', 'security', 'systems', 'development'];

/* ---------------------------------------------------------------------------------------------
 * Terminal explorer: one grep-able line per skill.
 * ------------------------------------------------------------------------------------------- */
export interface GrepLine {
  skill: SkillNode;
  tag: string;
  /** Plain text of the printed line — what the query is matched against. */
  text: string;
}

export const grepLines: GrepLine[] = skillNodes.map((skill) => {
  const tag = categoryTag(skill.category);
  const target = skill.usedIn.length ? skill.usedIn.join(', ') : '(listed only)';
  return { skill, tag, text: `[${tag}] ${skill.name} → ${target}` };
});

/* ---------------------------------------------------------------------------------------------
 * Strongest evidence: a skill set paired with a metric the case file itself reports.
 * ------------------------------------------------------------------------------------------- */
export interface EvidenceItem {
  project: Project;
  metric: Project['metrics'][number];
  skills: SkillNode[];
}

const evidencePicks: { slug: string; metric: number; skills: string[] }[] = [
  { slug: 'file-integrity-monitor', metric: 0, skills: ['SHA-256', 'File-integrity monitoring', 'Python'] },
  { slug: 'secure-file-transfer', metric: 1, skills: ['TLS', 'SHA-256', 'scrypt password records'] },
  { slug: 'ssik', metric: 0, skills: ['RBAC', 'SSRF defenses', 'Audit logging'] },
  { slug: 'otnow', metric: 0, skills: ['Chrome Manifest V3', 'REST APIs', 'JavaScript'] }
];

export const evidence: EvidenceItem[] = evidencePicks.flatMap(({ slug, metric, skills: names }) => {
  const project = projectBySlug[slug];
  const m = project?.metrics[metric];
  if (!project || !m) return [];
  const picked = names
    .map((n) => skillNodes.find((s) => s.name === n))
    .filter((s): s is SkillNode => Boolean(s && s.usedIn.includes(slug)));
  return [{ project, metric: m, skills: picked }];
});

/** WarmTooltip palette shared by every tooltip on the page: an inverted readout (chalk on ink), like a terminal selection. */
export const TIP = {
  surfaceColor: '#eeeeee',
  inkColor: '#060606',
  radius: 3,
  size: 'md' as const
};

/** Plain-language description for aria-describedby. */
export function skillDescription(skill: Skill): string {
  const cat = categoryById[skill.category].title;
  const used = projectsFor(skill).map((p) => p.title);
  if (used.length === 0) return `${cat}. ${LISTED_ONLY}.`;
  return `${cat}. Used in ${used.join(', ')}.`;
}
