# S3 vault object-created handler (starter)

Reference **Node.js** Lambda for **`s3:ObjectCreated:*`** (via SNS/SQS or direct S3 → Lambda). Replace the body with ClamAV, a commercial API, or an async job enqueue.

- Wire the bucket notification to this function per **`docs/S3_VAULT_LAMBDA_SCAN.md`**.
- Grant **`s3:GetObject`**, **`s3:PutObjectTagging`** (or quarantine copy permissions) on the vault prefix.
- Keep keys under `vault/` aligned with `lib/s3-vault-presign.ts`.

## Deploy (outline)

1. Zip `handler.mjs` (or bundle with your toolchain).
2. Create function runtime **Node.js 20.x**, handler **`handler.handler`**.
3. Attach IAM role with S3 read on `AWS_S3_VAULT_BUCKET` + tagging or copy to quarantine prefix.

## Local test event

Use AWS SAM / `lambda invoke` with a minimal S3 notification payload; see `example-event.json`.
