import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const clientOutput = path.join(projectRoot, "dist", "client");
const serverOutput = path.join(projectRoot, "dist", "server");
const pagesOutput = path.join(projectRoot, "dist", "pages");
const pagesServerOutput = path.join(pagesOutput, "_server");
const workerDeployRedirect = path.join(
  projectRoot,
  ".wrangler",
  "deploy",
  "config.json",
);

await rm(pagesOutput, { recursive: true, force: true });
await mkdir(pagesOutput, { recursive: true });

await cp(clientOutput, pagesOutput, { recursive: true });
await cp(serverOutput, pagesServerOutput, {
  recursive: true,
  filter(source) {
    const relativePath = path.relative(serverOutput, source);

    return (
      relativePath !== ".wrangler" &&
      !relativePath.startsWith(`.wrangler${path.sep}`) &&
      relativePath !== "wrangler.json"
    );
  },
});

await writeFile(
  path.join(pagesOutput, "_worker.js"),
  `import app from "./_server/index.js";

export default {
  async fetch(request, env, context) {
    if (request.method === "GET" || request.method === "HEAD") {
      const assetResponse = await env.ASSETS.fetch(request);

      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    return app.fetch(request, env, context);
  },
};
`,
  "utf8",
);

// vinext creates a redirect to its Workers deployment config. Pages must use
// the project-level Pages config instead; a later vinext build recreates this.
await rm(workerDeployRedirect, { force: true });

console.log(`Prepared Cloudflare Pages output at ${pagesOutput}`);
