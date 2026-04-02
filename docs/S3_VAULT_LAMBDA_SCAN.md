# S3 vault uploads: optional malware scan (sketch)

This document outlines an **event-driven** pattern to scan objects after client upload via presigned `PutObject`, without blocking the Next.js request path.

## Flow

1. Client completes upload to the vault prefix (see `docs/S3_VAULT_HARDENING.md`).
2. **S3** emits `s3:ObjectCreated:*` to **SNS** → **SQS** → **Lambda** (or EventBridge → Lambda).
3. Lambda downloads the object (or uses S3 Object Lambda / ClamAV layer), runs the scanner, and:
   - **Clean:** tag `scan-status=clean` or move to a `clean/` prefix (optional).
   - **Infected:** delete or move to **`quarantine/`** (e.g. `s3://bucket/quarantine/{originalKey}`), write an audit row or SNS alert.

## Application contract

- Store **`s3Bucket` / `s3Key`** in the encrypted vault manifest as today.
- Optionally add manifest fields later: `scanStatus`, `scannedAt` (requires decrypt + merge on trusted workers).
- Until scan completes, UI may show **“upload received; scan pending”** if you expose status via a separate trusted pipeline.

## Hardening ideas

- **Content-Type** allowlist on presign (`lib/s3-vault-presign.ts`) — e.g. only `application/octet-stream` or expected MIME list.
- **Size cap** — already align with `VAULT_MAX_PLAINTEXT_BYTES` for JSON; enforce `Content-Length` / max object size on the bucket policy where possible.
- **SSE-KMS** — optional `AWS_S3_VAULT_SSE_KMS_KEY_ID` for encryption at rest (see env examples).

## Operations

- Rotate quarantine lifecycle (expire after N days).
- Alert on any object in `quarantine/` without a matching ticket.

## Starter code

A minimal **Node.js** Lambda skeleton lives at **`infra/s3-vault-scan-lambda/`** (`handler.mjs` + `example-event.json`). Wire it (or your own container) to S3 notifications in your AWS account.
