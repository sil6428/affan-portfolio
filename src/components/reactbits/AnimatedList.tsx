// Vendored from ReactBits (reactbits.dev) — Components/AnimatedList, TS + Tailwind variant.
//
// Local changes:
// - Generic items with an optional `renderItem(item, index, selected)` (the default still renders
//   the string in the original card), plus `getItemKey` and `getItemLabel` (option accessible name).
// - Accessibility fix: keyboard handling moved from a global window listener (which hijacked Tab
//   for the whole page) onto the focusable list itself, which is now a proper listbox
//   (role="listbox" / role="option", aria-selected, aria-activedescendant). Arrow keys, Home/End,
//   Enter/Space.
// - Optional controlled `selectedIndex` + `onHighlightChange`, `selectOnHover`, `ariaLabel`,
//   `reducedMotion` (no scale-in), `listClassName` / `widthClassName` overrides, palette-tinted
//   gradients and scrollbar (`gradientColor`).

import { useRef, useState, useEffect, useCallback, useId, type ReactNode, type MouseEventHandler, type UIEvent, type KeyboardEvent } from 'react';
import { motion, useInView } from 'motion/react';

interface AnimatedItemProps {
  children: ReactNode;
  label?: string;
  delay?: number;
  index: number;
  id: string;
  selected: boolean;
  reducedMotion: boolean;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

function AnimatedItem({ children, label, delay = 0, index, id, selected, reducedMotion, onMouseEnter, onClick }: AnimatedItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5, once: false });
  return (
    <motion.div
      ref={ref}
      id={id}
      role="option"
      aria-selected={selected}
      aria-label={label}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={reducedMotion ? false : { scale: 0.7, opacity: 0 }}
      animate={reducedMotion || inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      className="mb-4 cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

interface AnimatedListProps<T> {
  items?: T[];
  onItemSelect?: (item: T, index: number) => void;
  /** Fires whenever the highlighted item changes (hover, click, keyboard). */
  onHighlightChange?: (index: number) => void;
  renderItem?: (item: T, index: number, selected: boolean) => ReactNode;
  /** Accessible name for each option (otherwise the rendered content's text is used). */
  getItemLabel?: (item: T, index: number) => string;
  getItemKey?: (item: T, index: number) => string | number;
  showGradients?: boolean;
  gradientColor?: string;
  enableArrowNavigation?: boolean;
  selectOnHover?: boolean;
  className?: string;
  itemClassName?: string;
  listClassName?: string;
  widthClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  /** Controlled highlight index. */
  selectedIndex?: number;
  ariaLabel?: string;
  reducedMotion?: boolean;
}

const DEFAULT_ITEMS = Array.from({ length: 15 }, (_, i) => `Item ${i + 1}`);

export default function AnimatedList<T = string>({
  items = DEFAULT_ITEMS as unknown as T[],
  onItemSelect,
  onHighlightChange,
  renderItem,
  getItemKey,
  getItemLabel,
  showGradients = true,
  gradientColor = '#0b0b0b',
  enableArrowNavigation = true,
  selectOnHover = true,
  className = '',
  itemClassName = '',
  listClassName = 'max-h-[400px] overflow-y-auto p-4',
  widthClassName = 'w-[500px]',
  displayScrollbar = true,
  initialSelectedIndex = -1,
  selectedIndex: controlledIndex,
  ariaLabel = 'List',
  reducedMotion = false
}: AnimatedListProps<T>) {
  const uid = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [innerIndex, setInnerIndex] = useState<number>(initialSelectedIndex);
  const selectedIndex = controlledIndex ?? innerIndex;
  const [keyboardNav, setKeyboardNav] = useState<boolean>(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState<number>(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState<number>(1);

  const highlight = useCallback(
    (index: number) => {
      setInnerIndex(index);
      onHighlightChange?.(index);
    },
    [onHighlightChange]
  );

  const handleItemMouseEnter = useCallback(
    (index: number) => {
      if (selectOnHover) highlight(index);
    },
    [highlight, selectOnHover]
  );

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      highlight(index);
      onItemSelect?.(item, index);
    },
    [highlight, onItemSelect]
  );

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLDivElement;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1));
  };

  // Hide the bottom fade when the list does not overflow at all.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    setBottomGradientOpacity(el.scrollHeight <= el.clientHeight + 1 ? 0 : 1);
  }, [items]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!enableArrowNavigation || items.length === 0) return;
    const last = items.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = Math.min(selectedIndex + 1, last);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = Math.max(selectedIndex - 1, 0);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else if (e.key === 'Enter' || e.key === ' ') {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        onItemSelect?.(items[selectedIndex], selectedIndex);
      }
      return;
    }
    if (next === null) return;
    e.preventDefault();
    setKeyboardNav(true);
    highlight(next);
  };

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null;
    if (selectedItem && container.scrollHeight > container.clientHeight) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: reducedMotion ? 'auto' : 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: reducedMotion ? 'auto' : 'smooth'
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav, reducedMotion]);

  const optionId = (index: number) => `${uid}-opt-${index}`;

  return (
    <div className={`relative ${widthClassName} ${className}`}>
      <div
        ref={listRef}
        role="listbox"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-activedescendant={selectedIndex >= 0 ? optionId(selectedIndex) : undefined}
        onKeyDown={handleKeyDown}
        className={`${listClassName} ${
          displayScrollbar
            ? '[&::-webkit-scrollbar]:w-[8px] [&::-webkit-scrollbar-track]:bg-ink-900 [&::-webkit-scrollbar-thumb]:bg-ink-700 [&::-webkit-scrollbar-thumb]:rounded-[4px]'
            : '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        }`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none',
          scrollbarColor: displayScrollbar ? '#1f1f1f #0b0b0b' : undefined
        }}
      >
        {items.map((item, index) => (
          <AnimatedItem
            key={getItemKey ? getItemKey(item, index) : index}
            label={getItemLabel?.(item, index)}
            delay={reducedMotion ? 0 : 0.1}
            index={index}
            id={optionId(index)}
            selected={selectedIndex === index}
            reducedMotion={reducedMotion}
            onMouseEnter={() => handleItemMouseEnter(index)}
            onClick={() => handleItemClick(item, index)}
          >
            {renderItem ? (
              renderItem(item, index, selectedIndex === index)
            ) : (
              <div className={`p-4 rounded-lg ${selectedIndex === index ? 'bg-ink-700' : 'bg-ink-850'} ${itemClassName}`}>
                <p className="text-fg m-0">{String(item)}</p>
              </div>
            )}
          </AnimatedItem>
        ))}
      </div>
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-[50px] pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: topGradientOpacity, background: `linear-gradient(to bottom, ${gradientColor}, transparent)` }}
            aria-hidden="true"
          ></div>
          <div
            className="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none transition-opacity duration-300 ease"
            style={{ opacity: bottomGradientOpacity, background: `linear-gradient(to top, ${gradientColor}, transparent)` }}
            aria-hidden="true"
          ></div>
        </>
      )}
    </div>
  );
}
