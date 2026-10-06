import type { Plugin } from 'vite';

/**
 * Build-only: start downloading the current route's chunk in parallel with the entry bundle.
 *
 * Every page is a React.lazy chunk (src/app/routeModules.ts), so without this the browser only asks
 * for it after the ~146 kB entry has downloaded and run, which pushed LCP on phones past 3 s. After
 * the build, this reads the bundle, finds each route module's chunk plus its static imports (minus
 * what the entry already preloads), and puts a tiny inline script before the entry <script> that maps
 * location.pathname to that list and appends <link rel="modulepreload"> tags. Vite's own preload
 * helper skips files that already have a link, so nothing downloads twice. Dev is untouched.
 *
 * The links are fetchpriority=low: on a thin connection they would otherwise split bandwidth with
 * the entry and delay it (measured: no gain at 1.6 Mbps, ~100–200 ms earlier content at ~9 Mbps);
 * low priority lets an HTTP/2 host send the entry first and the route files straight after.
 *
 * Keep ROUTE_MODULES and the path mapping in the inline script in step with src/app/router.tsx.
 */
const ROUTE_MODULES: Record<string, string> = {
  home: 'src/pages/home/index.tsx',
  about: 'src/pages/about/index.tsx',
  stack: 'src/pages/stack/index.tsx',
  log: 'src/pages/log/index.tsx',
  case: 'src/pages/log/case/index.tsx',
  contact: 'src/pages/contact/index.tsx',
  notFound: 'src/pages/not-found/index.tsx'
};

/** Inline, minified by hand: pathname → route key → <link rel=modulepreload> for each file. */
function preloadScript(files: Record<string, string[]>): string {
  return `(function(){var m=${JSON.stringify(files)};var p=location.pathname.toLowerCase().replace(/\\/+$/,'')||'/';var k=p==='/'?'home':p==='/about'?'about':p==='/stack'?'stack':p==='/log'||p==='/work'?'log':p==='/contact'?'contact':/^\\/(log|work)\\/[^/]+$/.test(p)?'case':'notFound';(m[k]||[]).forEach(function(f){var l=document.createElement('link');l.rel='modulepreload';l.crossOrigin='';l.fetchPriority='low';l.href=f;document.head.appendChild(l)})})();`;
}

export function routePreload(): Plugin {
  let base = '/';
  return {
    name: 'portfolio:route-preload',
    apply: 'build',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const chunks = Object.values(ctx.bundle).flatMap((item) => (item.type === 'chunk' ? [item] : []));
        const byFile = new Map(chunks.map((c) => [c.fileName, c]));
        const norm = (id: string) => id.replace(/\\/g, '/');

        // Everything the entry already loads statically (Vite preloads these from the HTML itself).
        const closure = (start: string[], into = new Set<string>()) => {
          for (const file of start) {
            if (into.has(file)) continue;
            into.add(file);
            closure(byFile.get(file)?.imports ?? [], into);
          }
          return into;
        };
        const entry = chunks.filter((c) => c.isEntry).map((c) => c.fileName);
        const preloaded = closure(entry);

        const files: Record<string, string[]> = {};
        for (const [key, modulePath] of Object.entries(ROUTE_MODULES)) {
          const chunk = chunks.find((c) => c.facadeModuleId && norm(c.facadeModuleId).endsWith(`/${modulePath}`));
          if (!chunk) {
            this.warn(`[route-preload] no chunk found for ${modulePath}; that route will not be preloaded`);
            continue;
          }
          files[key] = [...closure([chunk.fileName])].filter((f) => !preloaded.has(f)).map((f) => base + f);
        }

        const tag = `<script>${preloadScript(files)}</script>\n    `;
        const at = html.indexOf('<script type="module"');
        return at < 0 ? html.replace('</head>', `${tag}</head>`) : html.slice(0, at) + tag + html.slice(at);
      }
    }
  };
}

/**
 * Absolute link-preview URLs. Message apps (LinkedIn, Slack, iMessage) need an absolute og:image, and
 * og:url / twitter:image help them pick the right card. Set VITE_SITE_URL at build time
 * (e.g. VITE_SITE_URL=https://<project>.pages.dev npm run build) to get absolute tags. Unset, the
 * relative og:image in index.html is left exactly as written and nothing else is added.
 */
export function socialMeta(siteUrl: string | undefined): Plugin {
  const raw = siteUrl?.trim();
  const valid = !!raw && /^https?:\/\/[^\s"<>]+$/i.test(raw);
  const origin = valid ? raw.replace(/\/+$/, '') : '';
  return {
    name: 'portfolio:social-meta',
    transformIndexHtml(html) {
      if (raw && !valid) this.warn(`[social-meta] VITE_SITE_URL "${raw}" is not an http(s) URL; keeping relative og:image`);
      if (!origin) return html;
      const image = `${origin}/art/business-card-og.jpg`;
      return html.replace(
        /<meta property="og:image" content="[^"]*"\s*\/>/,
        `<meta property="og:image" content="${image}" />\n    <meta property="og:url" content="${origin}/" />\n    <meta name="twitter:image" content="${image}" />`
      );
    }
  };
}
