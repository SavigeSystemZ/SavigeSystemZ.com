# Vault (owner encrypted storage)

## Behavior

- **At rest:** Payloads are **AES-256-GCM** with a 32-byte key from `VAULT_ENCRYPTION_KEY` (64 hex characters). Stored JSON shape: `{ "note", "tags", optional "s3Bucket", "s3Key" }` (`VaultPayloadV1`).
- **Size limit:** UTF-8 byte length of that JSON before encryption is capped (default **64 KiB**, max **1 MiB**). Override with `VAULT_MAX_PLAINTEXT_BYTES`.
- **Audit:** `vault.placeholder.submit` logs `noteLength`, `tagCount`, `persisted`, `hasS3`, and `targetId` when a row is created.
- **Authorization:** Owner session required for all vault routes below.

## Configuration

| Variable | Purpose |
|----------|---------|
| `VAULT_ENCRYPTION_KEY` | Required to persist ciphertext (64 hex chars). Without it: audit-only for submissions. |
| `VAULT_ENCRYPTION_KEY_LEGACY` | Optional; **decrypt-only** second key (previous primary) for rotation — see `docs/VAULT_KEY_ROTATION.md`. |
| `VAULT_MAX_PLAINTEXT_BYTES` | Optional; max UTF-8 bytes of JSON manifest (default 65536). |
| `AWS_S3_VAULT_BUCKET` | Optional; enables **POST `/api/vault/s3-upload-url`** (presigned PUT). Must match bucket in `POST /api/vault` when attaching S3. |
| `AWS_S3_VAULT_SSE_KMS_KEY_ID` | Optional; SSE-KMS on vault PUT presigns — see `docs/S3_VAULT_HARDENING.md`. |
| `AWS_S3_PRESIGN_ENABLED` | Set to `0` to disable all S3 presigning (vault + release assets). |
| `AWS_REGION` + default AWS credentials | Used by the AWS SDK for presigned URLs. |

**Rate limits:** `POST /api/vault` and `POST /api/vault/s3-upload-url` share a per-IP mutation cap (in-memory; see `lib/vault-rate-limit.ts`).

## API

- `GET /api/vault` — list metadata; includes `encryption`, **`decryption`** (primary or legacy key), `s3Vault`, `maxPlaintextBytes`.
- `POST /api/vault` — `vaultPlaceholderSchema`. If `s3Bucket` + `s3Key` are set, they must equal `AWS_S3_VAULT_BUCKET` and the key must start with `vault/<ownerUserId>/`.
- `POST /api/vault/s3-upload-url` — returns presigned **PUT** for `vault/<ownerUserId>/<uuid>`.
- `GET /api/vault/[artifactId]` — decrypts manifest; if S3 fields exist and presigning works, includes **`s3DownloadUrl`** (short-lived GET).

## UI

Admin **Vault** page: request upload URL, PUT file, **Attach to next vault row**, then submit (note optional if S3-only).

## Key rotation

See `docs/VAULT_KEY_ROTATION.md` (includes **`pnpm --filter web vault:reencrypt`**). Vault POST rate limits: `docs/RATE_LIMITS.md`.

## Next steps

- SSE-KMS on the vault bucket; virus scanning on uploaded objects; stricter Content-Type on PUT.
