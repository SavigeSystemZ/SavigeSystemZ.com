/**
 * Write per-catalog SVG showcase frames to public/showcase/generated/.
 *
 * Usage: pnpm code:generate-showcases
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildFullCatalogSeeds } from "../lib/flagship-applications";
import { catalogKindForGithubRepo } from "../lib/catalog-from-repos";
import { renderCatalogShowcaseSvg } from "../lib/catalog-showcase-svg";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(webRoot, "public", "showcase", "generated");

function applyEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const m = /^(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

async function main(): Promise<void> {
  applyEnvFile(path.join(webRoot, ".env.local"));
  applyEnvFile(path.join(webRoot, ".env"));

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is required.");
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const seeds = await buildFullCatalogSeeds();
  let written = 0;

  for (const seed of seeds) {
    const kind = catalogKindForGithubRepo(seed.githubRepo);
    const stackLang = seed.stackItems?.[0] ?? null;
    const base = {
      slug: seed.slug,
      name: seed.name,
      githubRepo: seed.githubRepo,
      summary: seed.summary,
      primaryLanguage: stackLang,
      kind,
    };

    const heroPath = path.join(outputDir, `${seed.slug}.svg`);
    const previewPath = path.join(outputDir, `${seed.slug}-preview.svg`);

    fs.writeFileSync(heroPath, renderCatalogShowcaseSvg({ ...base, variant: "hero" }), "utf8");
    fs.writeFileSync(previewPath, renderCatalogShowcaseSvg({ ...base, variant: "preview" }), "utf8");
    written += 2;
  }

  console.log(JSON.stringify({ outputDir, catalogEntries: seeds.length, filesWritten: written }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
