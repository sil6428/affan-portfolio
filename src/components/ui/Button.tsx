import { forwardRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  /** Show the trailing arrow (external links get ArrowUpRight automatically). */
  icon?: ReactNode;
  className?: string;
}

interface LinkButtonProps extends BaseProps {
  to: string;
  /** Opens in a new tab with rel="noreferrer" and an off-site arrow. PDFs always open in a new tab. */
  external?: boolean;
  download?: boolean;
  onClick?: () => void;
}

interface ActionButtonProps extends BaseProps {
  onClick: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  'aria-label'?: string;
}

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-[3px] font-mono normal-case tracking-normal text-[0.8125rem] transition-[background,color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  // Hover inverts to an outlined key: green stays an accent and never fills a control.
  primary: 'border border-fg bg-fg text-ink-950 px-6 py-3.5 hover:bg-fg/10 hover:text-fg',
  secondary:
    'border border-line-strong bg-ink-950 text-fg px-6 py-3.5 hover:border-fg/60 hover:bg-ink-850',
  ghost: 'text-fg-muted px-2 py-2 hover:text-fg'
};

function Arrow({ external }: { external?: boolean }) {
  return (
    <ArrowUpRight
      aria-hidden
      size={15}
      strokeWidth={1.75}
      className={cn(
        'transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5',
        !external && 'rotate-45 group-hover:translate-y-0'
      )}
    />
  );
}

/** Router or external link styled as a button. */
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(function LinkButton(
  { to, external, download, children, variant = 'secondary', icon, className, onClick },
  ref
) {
  const cls = cn(base, variants[variant], className);
  const pdf = to.endsWith('.pdf') && !download;
  const newTab = external || pdf;
  const trailing = icon ?? <Arrow external={newTab || download} />;
  if (newTab || download || to.startsWith('mailto:')) {
    return (
      <a
        ref={ref}
        href={to}
        className={cls}
        onClick={onClick}
        {...(newTab ? { target: '_blank', rel: external ? 'noreferrer' : 'noopener' } : {})}
        {...(download ? { download: true } : {})}
      >
        <span>{children}</span>
        {trailing}
        {newTab && <span className="sr-only">(opens in a new tab)</span>}
      </a>
    );
  }
  return (
    <Link ref={ref} to={to} className={cls} onClick={onClick}>
      <span>{children}</span>
      {trailing}
    </Link>
  );
});

/** Native <button> with the same visual language. */
export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(function ActionButton(
  { children, variant = 'secondary', icon, className, onClick, type = 'button', disabled, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={rest['aria-label']}
      className={cn(base, variants[variant], className)}
    >
      <span>{children}</span>
      {icon}
    </button>
  );
});
