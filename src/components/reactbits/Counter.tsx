// Vendored from ReactBits (reactbits.dev) — Components/Counter, TS + Tailwind variant.

import { MotionValue, motion, useSpring, useTransform, type SpringOptions } from 'motion/react';
import type React from 'react';
import { useEffect } from 'react';

type PlaceValue = number | '.';

interface NumberProps {
  mv: MotionValue<number>;
  number: number;
  height: number;
}

function Number({ mv, number, height }: NumberProps) {
  const y = useTransform(mv, latest => {
    const placeValue = latest % 10;
    const offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return <motion.span style={{ ...baseStyle, y }}>{number}</motion.span>;
}

function normalizeNearInteger(num: number): number {
  const nearest = Math.round(num);
  const tolerance = 1e-9 * Math.max(1, Math.abs(num));
  return Math.abs(num - nearest) < tolerance ? nearest : num;
}

function getValueRoundedToPlace(value: number, place: number): number {
  const scaled = value / place;
  return Math.floor(normalizeNearInteger(scaled));
}

/**
 * Local addition (odometer mode): where the column for `place` sits when the whole number reads `v`.
 * The finest column follows `v`; every higher column holds still until all the columns below it roll
 * over, then turns with them. So the digits on screen never read past `v` (no "49" on the way to 45).
 */
function cascade(v: number, place: number, unit: number): number {
  if (place <= unit) return v / place;
  const whole = Math.floor(v / place);
  const below = v - whole * place;
  return whole + Math.min(1, Math.max(0, (below - (place - unit)) / unit));
}

interface DigitProps {
  place: PlaceValue;
  value: number;
  height: number;
  digitStyle?: React.CSSProperties;
  spring?: SpringOptions;
  /** Local addition: odometer mode's shared value, and the finest place it is measured in. */
  source?: MotionValue<number>;
  unit?: number;
}

function Digit({ place, value, height, digitStyle, spring, source, unit = 1 }: DigitProps) {
  // Decimal point digit
  if (place === '.') {
    return (
      <span
        className="relative inline-flex items-center justify-center"
        style={{ height, width: 'fit-content', ...digitStyle }}
      >
        .
      </span>
    );
  }

  if (source) {
    return <OdometerDigit place={place} unit={unit} source={source} height={height} digitStyle={digitStyle} />;
  }

  // Numeric digit (split into its own component so its hooks are never called conditionally)
  return <NumericDigit place={place} value={value} height={height} digitStyle={digitStyle} spring={spring} />;
}

interface NumericDigitProps extends Omit<DigitProps, 'place' | 'source' | 'unit'> {
  place: number;
}

const digitBoxStyle = (height: number): React.CSSProperties => ({
  height,
  position: 'relative',
  width: '1ch',
  fontVariantNumeric: 'tabular-nums'
});

interface OdometerDigitProps {
  place: number;
  unit: number;
  source: MotionValue<number>;
  height: number;
  digitStyle?: React.CSSProperties;
}

/** Local addition: one column in odometer mode, positioned from the shared value. */
function OdometerDigit({ place, unit, source, height, digitStyle }: OdometerDigitProps) {
  const position = useTransform(source, (v) => cascade(v, place, unit));
  return (
    <span className="relative inline-flex overflow-hidden" style={{ ...digitBoxStyle(height), ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={position} number={i} height={height} />
      ))}
    </span>
  );
}

function NumericDigit({ place, value, height, digitStyle, spring }: NumericDigitProps) {
  const valueRoundedToPlace = getValueRoundedToPlace(value, place);
  // Local addition: an optional spring config (e.g. critically damped, so a digit never overshoots).
  const animatedValue = useSpring(valueRoundedToPlace, spring);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <span className="relative inline-flex overflow-hidden" style={{ ...digitBoxStyle(height), ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <Number key={i} mv={animatedValue} number={i} height={height} />
      ))}
    </span>
  );
}

interface CounterProps {
  value: number;
  fontSize?: number;
  padding?: number;
  /**
   * An array of place values that determines which digit positions
   * should be displayed. For decimal places, use "." to represent
   * the decimal point. Leave this prop empty to enable automatic
   * detection based on the current value.
   */
  places?: PlaceValue[];
  gap?: number;
  borderRadius?: number;
  horizontalPadding?: number;
  textColor?: string;
  fontWeight?: React.CSSProperties['fontWeight'];
  containerStyle?: React.CSSProperties;
  counterStyle?: React.CSSProperties;
  digitStyle?: React.CSSProperties;
  gradientHeight?: number;
  gradientFrom?: string;
  gradientTo?: string;
  topGradientStyle?: React.CSSProperties;
  bottomGradientStyle?: React.CSSProperties;
  /** Local addition: spring config for every digit (motion's default when omitted). */
  spring?: SpringOptions;
  /**
   * Local addition: drive every column from one shared spring, odometer style (a column turns only
   * while the columns below it roll over), so no in-between frame shows a number past the real one.
   */
  odometer?: boolean;
}

export default function Counter({
  value,
  fontSize = 100,
  padding = 0,
  places = [...value.toString()].map((ch, i, a) => {
    if (ch === '.') {
      return '.';
    }

    const dotIndex = a.indexOf('.');
    const isInteger = dotIndex === -1;

    const exponent = isInteger ? a.length - i - 1 : i < dotIndex ? dotIndex - i - 1 : -(i - dotIndex);

    return 10 ** exponent;
  }),
  gap = 8,
  borderRadius = 4,
  horizontalPadding = 8,
  textColor = 'inherit',
  fontWeight = 'inherit',
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 16,
  gradientFrom = 'black',
  gradientTo = 'transparent',
  topGradientStyle,
  bottomGradientStyle,
  spring,
  odometer = false
}: CounterProps) {
  const height = fontSize + padding;

  // Local addition: odometer mode's shared spring (always created so hooks stay unconditional; idle otherwise).
  const shared = useSpring(value, spring);
  useEffect(() => {
    if (odometer) shared.set(value);
  }, [shared, value, odometer]);
  const numericPlaces = places.filter((p): p is number => p !== '.');
  const unit = numericPlaces.length ? Math.min(...numericPlaces) : 1;

  const defaultContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block'
  };

  const defaultCounterStyle: React.CSSProperties = {
    fontSize,
    display: 'flex',
    gap,
    overflow: 'hidden',
    borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    lineHeight: 1,
    color: textColor,
    fontWeight,
    direction: "ltr"
  };

  const gradientContainerStyle: React.CSSProperties = {
    pointerEvents: 'none',
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  };

  const defaultTopGradientStyle: React.CSSProperties = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`
  };

  const defaultBottomGradientStyle: React.CSSProperties = {
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`
  };

  return (
    <span style={{ ...defaultContainerStyle, ...containerStyle }}>
      <span style={{ ...defaultCounterStyle, ...counterStyle }}>
        {places.map(place => (
          <Digit
            key={place}
            place={place}
            value={value}
            height={height}
            digitStyle={digitStyle}
            spring={spring}
            source={odometer ? shared : undefined}
            unit={unit}
          />
        ))}
      </span>
      <span style={gradientContainerStyle}>
        <span style={topGradientStyle ?? defaultTopGradientStyle} />
        <span style={bottomGradientStyle ?? defaultBottomGradientStyle} />
      </span>
    </span>
  );
}
