# S3 vault hardening (operations)

## Server-side encryption (SSE-KMS)

When **`AWS_S3_VAULT_SSE_KMS_KEY_ID`** is set, presigned **PUT** URLs for `POST /api/vault/s3-upload-url` include `aws:kms` encryption. The app role needs **`kms:GenerateDataKey`** / **`kms:Decrypt`** for that key (see AWS docs for SSE-KMS + S3).

## Bucket policy (example sketch)

- **Deny** non-TLS: `aws:SecureTransport` = `false` → Deny.
- **Allow** app role `s3:PutObject`, `s3:GetObject` only on `vault/*` prefix.
- **Block public access** on the bucket (account defaults).

## IAM

- Separate role for the **runtime** app (presign) vs **human** admin.
- Least privilege: only `AWS_S3_VAULT_BUCKET` + KMS key used for vault.

## CORS

If browsers upload directly to S3, configure bucket CORS for `PUT` from your site origin only. For **curl**/CLI uploads from developer machines, CORS does not apply.

## Malware scanning

S3 does not scan by default. Options: **S3 Event → Lambda** → ClamAV / commercial scanner; quarantine prefix; block `GetObject` until clean. Not implemented in-app. See **`docs/S3_VAULT_LAMBDA_SCAN.md`** for a concrete flow sketch.

## Content-Type

Presigned PUT does not force `Content-Type`; enforce in Lambda on `s3:ObjectCreated:*` or reject unexpected types.
