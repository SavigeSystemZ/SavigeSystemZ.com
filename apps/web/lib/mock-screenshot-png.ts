import fs from "node:fs";
import path from "node:path";

/** Minimal valid 1×1 PNG (dark slate) for CI mock bootstrap when GitHub OG is unavailable. */
const MINIMAL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

export function writeMockScreenshotPng(targetPath: string): void {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, MINIMAL_PNG);
}
