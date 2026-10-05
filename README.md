# Affan Shaikh Portfolio

Professional portfolio for Affan Shaikh, a Networking and IT Security student at Ontario Tech University.

[Open the live portfolio](https://affan-shaikh.pages.dev) · [Explore the Interactive Lab](https://affan-interactive-lab.pages.dev)

![Affan Shaikh portfolio preview](public/art/og.jpg)

## What this site contains

The site presents project case studies, applied Cisco networking work, experience, education, technical skills, a downloadable resume, and direct contact links. It is designed around the same black, white, grey, and phosphor-green visual system as Affan's business card.

The case studies separate current results, measured evidence, security boundaries, and future work. Older `/work/*` links redirect to the matching `/log/*` case file so links already used on the resume and elsewhere remain valid.

Main routes:

- `/` — overview and evidence board
- `/about` — background and working approach
- `/stack` — skills connected to the projects that use them
- `/log` — case files, experience, education, and community work
- `/log/:slug` — long-form project case studies
- `/contact` — email, profiles, resume, and Interactive Lab

## Technology

- React 19, TypeScript, Vite, and React Router
- Tailwind CSS and a curated set of React Bits components
- GSAP, Motion, Three.js, React Three Fiber, OGL, and Matter.js for deliberately scoped interactions
- Cloudflare Pages hosting with SPA route fallback
- Generated project artwork and social-preview imagery; no stock imagery

## Local development

```bash
git clone https://github.com/sil6428/affan-portfolio.git
cd affan-portfolio
npm install
npm run dev
```

The local server uses `http://localhost:5199`. Build and preview the production output with:

```bash
npm run build
npm run preview
```

## Verification

```bash
npm run lint
npm run build
node scripts/audit.mjs --routes "/,/about,/stack,/log,/log/otnow,/contact"
```

The audit script checks page structure, accessibility, overflow, canvas use, and broken links in a real browser. Reduced-motion and lower-power paths avoid downloading or mounting the heavier background effects.

## Deployment

Cloudflare Pages serves the static `dist/` output. The production build uses `VITE_SITE_URL` for absolute social-preview metadata:

```powershell
$env:VITE_SITE_URL='https://affan-shaikh.pages.dev'
npm run deploy:pages
Remove-Item Env:VITE_SITE_URL
```

`public/_redirects` sends direct route requests to `index.html`, allowing links such as `/log/otnow` and the legacy `/work/otnow` to work when opened directly.

## Visual system and interaction rules

- Near-black surfaces, white Geist Mono typography, restrained grey structure, and phosphor green as the primary accent
- Rust used only as a secondary highlight
- Terminal language kept readable as normal navigation, with deeper shell references acting as optional details
- Motion used to communicate loading, completion, navigation, and state changes
- One continuous canvas/WebGL effect at most per page, with reduced-motion and lower-power fallbacks
- Semantic routes and conventional links preserved underneath the visual presentation

## React Bits

React Bits components are adapted for specific jobs rather than used as a single visual effect. Examples include the Counter evidence board, Lanyard identity badge, Magic Bento layout, Spotlight Cards, project-specific animated backgrounds, Spring Check state feedback, Folder artifact browser, and Electric Border contact treatment. The complete usage registry lives in `src/data/reactbits.ts`.

## Related site

The original Three.js room now lives independently as the [Affan Interactive Lab](https://affan-interactive-lab.pages.dev), with source at [sil6428/affan-interactive-lab](https://github.com/sil6428/affan-interactive-lab). It remains the deeper technical showcase and long-form source journal for the main portfolio's case files.

## License

Copyright © 2026 Affan Shaikh. All rights reserved. The source is public for portfolio review; reuse, redistribution, modification, or publication requires prior written permission.
