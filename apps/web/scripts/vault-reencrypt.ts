/**
 * Offline job: decrypt every `VaultArtifact` (primary + optional legacy keys) and
 * re-encrypt with the current `VAULT_ENCRYPTION_KEY`.
 *
 * Usage (from repo root):
 *   pnpm --filter web vault:reencrypt -- --dry-run
 *   pnpm --filter web vault:reencrypt
 *
 * Loads `apps/web/.env.local` then `.env` if present (does not override existing `process.env`).
 * Requires `DATABASE_URL`, decrypt-capable keys, and a valid primary key for encrypt.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

import {
  decryptVaultPayload,
  encryptVaultPayload,
  isVaultDecryptionConfigured,
  isVaultEncryptionConfigured,
  VAULT_STORED_KEY_VERSION,
} from "../lib/vault-crypto";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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
      val = val.slice(1, -1).replace(/\\n/g, "\n");
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

applyEnvFile(path.join(webRoot, ".env.local"));
applyEnvFile(path.join(webRoot, ".env"));

const dryRun = process.argv.includes("--dry-run");

async function main(): Promise<void> {
  if (!isVaultEncryptionConfigured()) {
    console.error("Abort: VAULT_ENCRYPTION_KEY (64 hex) is required for re-encryption.");
    process.exit(1);
  }
  if (!isVaultDecryptionConfigured()) {
    console.error("Abort: no decryption keys configured (primary and/or VAULT_ENCRYPTION_KEY_LEGACY).");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  const rows = await prisma.vaultArtifact.findMany({
    select: { id: true, payloadCipher: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${rows.length} vault row(s). dryRun=${dryRun}`);

  let ok = 0;
  const failures: { id: string; message: string }[] = [];

  for (const row of rows) {
    try {
      const plain = decryptVaultPayload(row.payloadCipher);
      const nextCipher = encryptVaultPayload(plain);
      if (nextCipher === row.payloadCipher) {
        ok += 1;
        continue;
      }
      if (!dryRun) {
        await prisma.vaultArtifact.update({
          where: { id: row.id },
          data: { payloadCipher: nextCipher, keyVersion: VAULT_STORED_KEY_VERSION },
        });
      }
      ok += 1;
      console.log(`${dryRun ? "[dry-run] would update" : "updated"} ${row.id}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      failures.push({ id: row.id, message });
      console.error(`row ${row.id}: ${message}`);
    }
  }

  await prisma.$disconnect();

  console.log(`Done. ok=${ok} failed=${failures.length}`);
  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
