// Vendored from ReactBits (reactbits.dev) — Components/Dock, TS + Tailwind variant.
// Local changes: terminal palette, `active` items (aria-current), no false aria-haspopup,
// pointer-events limited to the panel; square keys, solid panel (no backdrop blur), bar indicator;
// items with `href` render as real router links (middle-click, open in new tab), and the panel is a
// plain group (the caller supplies the <nav> landmark) instead of a toolbar; optional always-visible
// `caption` under each key (the hover label stays as the longer tooltip).

import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
  AnimatePresence
} from 'motion/react';
import React, { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';

const MotionLink = motion.create(Link);

export type DockItemData = {
  icon: React.ReactNode;
  label: React.ReactNode;
  /** Local change: optional when `href` is set (the link navigates by itself). */
  onClick?: () => void;
  /** Local change: render the item as a react-router <Link> to this path. */
  href?: string;
  /** Local change: called on hover / focus / touch (e.g. to preload a route chunk). */
  onIntent?: () => void;
  className?: string;
  /** Marks the current route (aria-current + indicator dot). */
  active?: boolean;
  /** Accessible name when `label` is not a plain string. */
  ariaLabel?: string;
  /**
   * Local change: short text shown under the key at all times (aria-hidden, so keep it inside the
   * accessible name for Label in Name). Panels with captions get extra room at the bottom.
   */
  caption?: string;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
  dockHeight?: number;
  magnification?: number;
  spring?: SpringOptions;
};

type DockItemProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  baseItemSize: number;
  magnification: number;
  label?: React.ReactNode;
  active?: boolean;
  ariaLabel?: string;
  href?: string;
  onIntent?: () => void;
  caption?: string;
};

function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  label,
  active = false,
  ariaLabel,
  href,
  onIntent,
  caption
}: DockItemProps) {
  const ref = useRef<HTMLElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const shared = {
    style: { width: size, height: size },
    onHoverStart: () => {
      isHovered.set(1);
      onIntent?.();
    },
    onHoverEnd: () => isHovered.set(0),
    onFocus: () => {
      isHovered.set(1);
      onIntent?.();
    },
    onBlur: () => isHovered.set(0),
    onTouchStart: onIntent,
    className: `relative inline-flex items-center justify-center rounded-[4px] border transition-colors duration-200 ${
      active ? 'bg-ink-800 border-fg/40 text-fg' : 'bg-ink-850 border-line text-fg-muted hover:border-fg/40 hover:text-fg'
    } ${className}`,
    'aria-current': active ? ('page' as const) : undefined,
    'aria-label': ariaLabel ?? (typeof label === 'string' ? label : undefined)
  };

  const content = (
    <>
      {active && <span aria-hidden className="absolute -bottom-[7px] left-1/2 h-[3px] w-3 -translate-x-1/2 bg-phosphor" />}
      {caption && (
        <span
          aria-hidden
          className={`pointer-events-none absolute left-1/2 top-full mt-[11px] -translate-x-1/2 whitespace-nowrap font-mono text-[0.65625rem] leading-[12px] ${
            active ? 'text-fg' : 'text-fg-muted'
          }`}
        >
          {caption}
        </span>
      )}
      {Children.map(children, child =>
        React.isValidElement(child)
          ? cloneElement(child as React.ReactElement<{ isHovered?: MotionValue<number> }>, { isHovered })
          : child
      )}
    </>
  );

  if (href) {
    return (
      <MotionLink ref={ref as React.Ref<HTMLAnchorElement>} to={href} onClick={onClick} {...shared}>
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      {...shared}
    >
      {content}
    </motion.div>
  );
}

type DockLabelProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockLabel({ children, className = '', isHovered }: DockLabelProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', latest => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`${className} absolute -top-7 left-1/2 w-fit whitespace-pre rounded-[3px] border border-line-strong bg-ink-950 px-2 py-1 font-mono text-[0.6875rem] text-fg`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type DockIconProps = {
  className?: string;
  children: React.ReactNode;
  isHovered?: MotionValue<number>;
};

function DockIcon({ children, className = '' }: DockIconProps) {
  return <div className={`flex items-center justify-center ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxHeight = useMemo(() => Math.max(dockHeight, magnification + magnification / 2 + 4), [magnification]);
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);
  // Local change: captions sit under the keys, so the panel keeps room for them at the bottom.
  const hasCaptions = items.some(item => item.caption);

  return (
    <motion.div style={{ height, scrollbarWidth: 'none' }} className="pointer-events-none mx-2 flex max-w-full items-center">
      <motion.div
        onMouseMove={({ pageX }) => {
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`${className} pointer-events-auto absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-end w-fit rounded-[6px] border border-line-strong bg-ink-900 px-2.5 ${
          hasCaptions ? 'gap-3.5 pb-[30px]' : 'gap-2.5 pb-2'
        }`}
        style={{ height: panelHeight }}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
            active={item.active}
            ariaLabel={item.ariaLabel}
            href={item.href}
            onIntent={item.onIntent}
            caption={item.caption}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </motion.div>
    </motion.div>
  );
}
