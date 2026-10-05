/** Small "AS" key — the site's identity glyph: a square terminal key with a white monogram and grey caret. */
export default function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" fill="none">
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="4" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.5" />
      <text
        x="6.5"
        y="25"
        fill="var(--color-fg)"
        fontFamily="var(--font-mono)"
        fontSize="14"
        fontWeight="700"
        letterSpacing="-0.6"
      >
        AS
      </text>
      <rect x="29" y="14" width="4.5" height="12" fill="currentColor" />
    </svg>
  );
}
