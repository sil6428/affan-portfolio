import { createElement, type CSSProperties, type ReactNode } from 'react';

type RBTag = 'div' | 'section' | 'span' | 'article' | 'aside' | 'figure' | 'li' | 'header' | 'footer' | 'nav';

interface RBProps {
  /** ReactBits component name(s) rendered inside — shown by Developer Mode. Comma-separate several. */
  name: string;
  as?: RBTag;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  id?: string;
  /** Accessible name, e.g. for an RB rendered as a <nav> landmark. */
  'aria-label'?: string;
}

/**
 * Marks a region that renders ReactBits component(s). It is a normal element (default
 * `div`) carrying `data-rb`, so Developer Mode can outline it and label it on screen.
 */
export default function RB({ name, as = 'div', className, style, children, id, 'aria-label': ariaLabel }: RBProps) {
  return createElement(as, { 'data-rb': name, className, style, id, 'aria-label': ariaLabel }, children);
}
