/**
 * Joins class names (skipping falsy values) and resolves conflicting Tailwind utilities so a caller's
 * `className` really overrides a component's base classes: cn('uppercase text-fg-muted', 'normal-case text-fg')
 * → 'normal-case text-fg'. Same rule as tailwind-merge: for each variant + group, the LAST class wins,
 * and a shorthand removes earlier longhands (p-4 drops an earlier px-2; size-4 drops w-2/h-2).
 *
 * This is a small, deliberately conservative subset of tailwind-merge (the package is not a dependency
 * here): it only knows the groups this site uses. Anything it does not recognise is kept as written,
 * so the worst case is the old plain-join behaviour.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return mergeClasses(classes.filter(Boolean).join(' '));
}

/* ------------------------------------------------------------------------------------------------ */

const THEME_COLOR = /^(ink|fg|line|phosphor|chalk|ash|rust|alert|transparent|black|white|current|inherit)(-[\w-]+)?(\/[\w.[\]%]+)?$/;
const ARBITRARY_COLOR = /^\[(color:|#|rgb|hsl|oklch|oklab|color-mix|var\(--color)/;
const ARBITRARY_LENGTH = /^\[(length:|\d|\.|clamp|calc|min\(|max\(|var\(--text)/;
const TEXT_SIZE = /^(xs|sm|base|lg|xl|[2-9]xl|display|mega)(\/.+)?$/;
const FONT_WEIGHT = /^(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|\[\d+\])$/;
const FONT_FAMILY = /^(sans|mono|serif)$/;

const isColor = (v: string) => THEME_COLOR.test(v) || ARBITRARY_COLOR.test(v);

const KEYWORD_GROUP: Record<string, string> = {};
const keywords = (group: string, words: string) => words.split(' ').forEach((w) => (KEYWORD_GROUP[w] = group));
keywords('display', 'block inline-block inline flex inline-flex grid inline-grid hidden contents table flow-root list-item');
keywords('position', 'static fixed absolute relative sticky');
keywords('case', 'uppercase lowercase capitalize normal-case');
keywords('visibility', 'visible invisible collapse');
keywords('decoration-line', 'underline overline line-through no-underline');
keywords('font-style', 'italic not-italic');
keywords('grow', 'grow grow-0');
keywords('shrink', 'shrink shrink-0');
keywords('transition', 'transition transition-none transition-all transition-colors transition-opacity transition-transform transition-shadow');

/** Prefix-only groups: `tracking-*` etc. Longest prefixes first so `min-w-` wins over `w-`-style clashes. */
const PREFIX_GROUPS = [
  'tracking', 'leading', 'whitespace', 'opacity', 'z', 'order', 'cursor', 'pointer-events', 'select',
  'duration', 'ease', 'delay', 'items', 'self', 'justify-items', 'justify-self', 'justify',
  'gap-x', 'gap-y', 'gap', 'min-w', 'max-w', 'min-h', 'max-h', 'size', 'w', 'h',
  'inset-x', 'inset-y', 'inset', 'top', 'right', 'bottom', 'left',
  'translate-x', 'translate-y', 'overflow-x', 'overflow-y', 'overflow',
  'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe', 'p',
  'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me', 'm'
];

/** A later class in the key group also removes earlier classes in these groups. */
const OVERRIDES: Record<string, string[]> = {
  p: ['px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe'],
  px: ['pr', 'pl', 'ps', 'pe'],
  py: ['pt', 'pb'],
  m: ['mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me'],
  mx: ['mr', 'ml', 'ms', 'me'],
  my: ['mt', 'mb'],
  gap: ['gap-x', 'gap-y'],
  size: ['w', 'h'],
  inset: ['inset-x', 'inset-y', 'top', 'right', 'bottom', 'left'],
  'inset-x': ['right', 'left'],
  'inset-y': ['top', 'bottom'],
  overflow: ['overflow-x', 'overflow-y'],
  rounded: ['rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl']
};

function groupOf(raw: string): string | null {
  const u = raw.startsWith('-') ? raw.slice(1) : raw;
  if (KEYWORD_GROUP[u]) return KEYWORD_GROUP[u];

  const rounded = /^rounded(?:-(t|r|b|l|tl|tr|br|bl))?(?:-(none|sm|md|lg|xl|2xl|3xl|full|\[.+\]))?$/.exec(u);
  if (rounded) return rounded[1] ? `rounded-${rounded[1]}` : 'rounded';

  const dash = u.indexOf('-');
  if (dash < 0) return null;
  const head = u.slice(0, dash);
  const rest = u.slice(dash + 1);

  if (head === 'text') {
    if (TEXT_SIZE.test(rest) || ARBITRARY_LENGTH.test(rest)) return 'text-size';
    if (/^(left|center|right|justify|start|end)$/.test(rest)) return 'text-align';
    if (isColor(rest)) return 'text-color';
    return null;
  }
  if (head === 'font') {
    if (FONT_WEIGHT.test(rest)) return 'font-weight';
    if (FONT_FAMILY.test(rest)) return 'font-family';
    return null;
  }
  if (head === 'bg') return isColor(rest) ? 'bg-color' : null;
  if (head === 'border') {
    if (isColor(rest)) return 'border-color';
    if (/^(0|2|4|8|\[\d[\d.]*px\])$/.test(rest)) return 'border-w';
    return null;
  }
  if (head === 'flex') {
    if (/^(row|col)(-reverse)?$/.test(rest)) return 'flex-direction';
    if (/^(wrap|nowrap|wrap-reverse)$/.test(rest)) return 'flex-wrap';
    if (/^(1|auto|initial|none|\[.+\])$/.test(rest)) return 'flex';
    return null;
  }
  if (u === 'border') return 'border-w';
  if (head === 'transition') return 'transition';

  for (const g of PREFIX_GROUPS) {
    if (u.startsWith(`${g}-`)) {
      // `justify-items-*` / `justify-self-*` are matched before `justify-*` by list order.
      return g;
    }
  }
  return null;
}

/** Splits `md:hover:!px-2` into its variant prefix, important flag and utility, ignoring ':' inside brackets. */
function parse(cls: string): { prefix: string; important: boolean; utility: string } {
  let depth = 0;
  let cut = 0;
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (c === ':' && depth === 0) cut = i + 1;
  }
  let utility = cls.slice(cut);
  let important = false;
  if (utility.startsWith('!')) {
    important = true;
    utility = utility.slice(1);
  } else if (utility.endsWith('!')) {
    important = true;
    utility = utility.slice(0, -1);
  }
  return { prefix: cls.slice(0, cut), important, utility };
}

function mergeClasses(input: string): string {
  const list = input.split(/\s+/).filter(Boolean);
  const claimed = new Set<string>();
  const kept: string[] = [];
  for (let i = list.length - 1; i >= 0; i--) {
    const cls = list[i];
    const { prefix, important, utility } = parse(cls);
    const group = groupOf(utility);
    if (!group) {
      kept.push(cls);
      continue;
    }
    const scope = `${prefix}${important ? '!' : ''}`;
    if (claimed.has(scope + group)) continue;
    claimed.add(scope + group);
    for (const sub of OVERRIDES[group] ?? []) claimed.add(scope + sub);
    kept.push(cls);
  }
  return kept.reverse().join(' ');
}
