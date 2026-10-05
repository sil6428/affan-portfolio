import {
  siCisco,
  siCloudflarepages,
  siFastapi,
  siGit,
  siGithub,
  siGithubpages,
  siGoogle,
  siGooglechrome,
  siJavascript,
  siJson,
  siLinux,
  siNextdotjs,
  siNodedotjs,
  siProxmox,
  siPytest,
  siPython,
  siReact,
  siThreedotjs,
  siTypescript,
  siWireshark
} from 'simple-icons';

// Named imports keep the bundle to the ~20 logos actually used (skills.ts `icon` slugs).
const bySlug: Record<string, { title: string; path: string }> = Object.fromEntries(
  [
    siCisco,
    siCloudflarepages,
    siFastapi,
    siGit,
    siGithub,
    siGithubpages,
    siGoogle,
    siGooglechrome,
    siJavascript,
    siJson,
    siLinux,
    siNextdotjs,
    siNodedotjs,
    siProxmox,
    siPytest,
    siPython,
    siReact,
    siThreedotjs,
    siTypescript,
    siWireshark
  ].map((icon) => [icon.slug, icon])
);

interface BrandIconProps {
  /** simple-icons slug, e.g. 'python', 'cisco', 'wireshark'. */
  slug: string;
  size?: number;
  className?: string;
  /** Accessible name; omit for decorative use next to visible text. */
  title?: string;
}

/** Technology logo from simple-icons, drawn in currentColor. */
export default function BrandIcon({ slug, size = 20, className, title }: BrandIconProps) {
  const icon = bySlug[slug];
  if (!icon) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={icon.path} />
    </svg>
  );
}

