# Legacy Workers redirect

The old `affan-shaikh-portfolio.sil6428-archtech.workers.dev` endpoint permanently
redirects to the current Cloudflare Pages deployment at
`https://affan-portfolio-a1n.pages.dev`.

Paths and query strings are preserved, so an old link such as `/learning?month=august`
continues to open the equivalent location on the Pages site.

Deploy from the repository root with:

```bash
npx wrangler deploy --config legacy-redirect/wrangler.jsonc
```
