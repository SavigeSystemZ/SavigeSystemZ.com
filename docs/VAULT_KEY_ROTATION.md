# Vault encryption key rotation

## Current model

- `VaultArtifact.keyVersion` defaults to **1** (reserved for future multi-key decrypt).
- Ciphertext is **AES-256-GCM** using `VAULT_ENCRYPTION_KEY` (application secret, not per-row).

## Rotating `VAULT_ENCRYPTION_KEY`

### Zero-downtime read path (app-supported)

1. Deploy **new** primary key as `VAULT_ENCRYPTION_KEY` and set **`VAULT_ENCRYPTION_KEY_LEGACY`** to the **previous** 64-hex key.
2. The API **decrypts** with primary first, then legacy, so existing rows still open.
3. **New rows** encrypt only with the primary key.
4. When ready, run an offline job to **re-encrypt** all rows with the new key, then remove `VAULT_ENCRYPTION_KEY_LEGACY`.

### Full rewrite (offline)

1. **Plan downtime or read-only window** for vault decrypt paths (or accept brief failures).
2. **Backup** the database and the **old** key material from your secrets manager.
3. For each `VaultArtifact` row (script or job):
   - Decrypt with the **old** key.
   - Re-encrypt with the **new** key.
   - Optionally bump `keyVersion` when you teach the app to try multiple keys.
4. Deploy the **new** key as `VAULT_ENCRYPTION_KEY`.
5. Verify `GET /api/vault/[artifactId]` on a sample of rows.

## Built-in re-encrypt script

After setting env vars (same as the app: `DATABASE_URL`, `VAULT_ENCRYPTION_KEY`, and during rotation `VAULT_ENCRYPTION_KEY_LEGACY`):

```bash
pnpm --filter web vault:reencrypt -- --dry-run
pnpm --filter web vault:reencrypt
```

The script loads `apps/web/.env.local` then `.env` when variables are not already set, decrypts each row with primary-then-legacy logic, and re-encrypts with the primary key. **Back up the database first.**

## Future enhancement

- Store a **key id** in the encrypted blob header or a column, and load multiple keys from KMS for seamless rotation without a full rewrite window.
