import path from "node:path";
import { fileURLToPath } from "node:url";

/** Absolute path to `apps/web` (works from scripts and lib). */
export function getWebAppRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
}
