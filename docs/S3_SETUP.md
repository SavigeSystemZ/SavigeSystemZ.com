# S3 Configuration Guide for SavigeSystemZ.com

This guide covers setting up Amazon S3 buckets for the SavigeSystemZ platform to enable release asset uploads, application media uploads, and optional vault storage.

## Quick Start

### 1. Create S3 Buckets

Create three buckets (or fewer if you want to share):

```bash
# Release assets bucket (application versions, downloads)
aws s3api create-bucket \
  --bucket savige-releases \
  --region us-east-1

# Application media bucket (screenshots, logos, artwork)
aws s3api create-bucket \
  --bucket savige-media \
  --region us-east-1

# Optional: Vault bucket (end-to-end encrypted artifacts)
aws s3api create-bucket \
  --bucket savige-vault \
  --region us-east-1
```

### 2. Enable CORS (for browser uploads)

For each bucket, create `cors.json`:

```json
[
  {
    "AllowedHeaders": ["Authorization", "Content-Type"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://127.0.0.1:43907", "https://savigesystemz.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

Apply CORS:

```bash
aws s3api put-bucket-cors \
  --bucket savige-releases \
  --cors-configuration file://cors.json

aws s3api put-bucket-cors \
  --bucket savige-media \
  --cors-configuration file://cors.json
```

### 3. Create IAM User/Role

Create an IAM user or role with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": [
        "arn:aws:s3:::savige-releases/*",
        "arn:aws:s3:::savige-media/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::savige-releases/*",
        "arn:aws:s3:::savige-media/*"
      ]
    }
  ]
}
```

### 4. Configure Environment Variables

Add to `apps/web/.env.local`:

```bash
# Enable presign-based uploads (required)
AWS_S3_PRESIGN_ENABLED=1

# Set AWS region
AWS_REGION=us-east-1

# Bucket names (use same bucket for both or different buckets)
AWS_S3_RELEASE_BUCKET=savige-releases
AWS_S3_MEDIA_BUCKET=savige-media

# Optional: KMS encryption keys for at-rest security
# AWS_S3_RELEASE_SSE_KMS_KEY_ID=arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID
# AWS_S3_MEDIA_SSE_KMS_KEY_ID=arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID

# Optional: Separate vault bucket with stronger security
# AWS_S3_VAULT_BUCKET=savige-vault
# AWS_S3_VAULT_SSE_KMS_KEY_ID=arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID
```

### 5. Set AWS Credentials

Option A: Use AWS CLI credentials (`.aws/credentials` or `~/.aws/config`):

```bash
# CLI will auto-detect from ~/.aws/credentials
# No additional env vars needed
```

Option B: Use environment variables:

```bash
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 6. Verify Configuration

Check the launch readiness page:

```bash
pnpm dev:web
# Navigate to http://127.0.0.1:43907/admin/launch
```

Look for green checkmarks on:
- "AWS S3 presign enabled"
- "Release bucket configured"
- "Media bucket configured"

If any are red, check:

```bash
# Test S3 connectivity
aws s3 ls s3://savige-releases --region us-east-1

# Check IAM permissions
aws s3api put-object \
  --bucket savige-releases \
  --key test-write-permission.txt \
  --body /dev/null

aws s3api get-object \
  --bucket savige-releases \
  --key test-write-permission.txt \
  /dev/null
```

### 7. Test Upload Flow

1. Go to `/admin/applications`
2. Create or edit an application
3. Click "Add Media" or "Upload Release"
4. Select a file — you should see a presigned upload URL in the network inspector
5. Upload should succeed and file should appear in S3

## Staging vs. Production

### Staging Configuration

Use test buckets with less restrictive policies:

```bash
# In apps/web/.env.staging.local
AWS_S3_PRESIGN_ENABLED=1
AWS_S3_RELEASE_BUCKET=savige-releases-staging
AWS_S3_MEDIA_BUCKET=savige-media-staging
```

### Production Configuration

Use dedicated production buckets with maximum security:

- Enable versioning for rollback
- Enable bucket encryption (KMS)
- Restrict public access
- Enable access logging
- Enable MFA delete (if using IAM root)
- Use separate IAM role per deployment environment
- Implement bucket lifecycle policies to archive/delete old objects

```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket savige-releases \
  --versioning-configuration Status=Enabled

# Block public access
aws s3api put-public-access-block \
  --bucket savige-releases \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket savige-releases \
  --server-side-encryption-configuration '{
    "Rules": [
      {
        "ApplyServerSideEncryptionByDefault": {
          "SSEAlgorithm": "aws:kms",
          "KMSMasterKeyID": "arn:aws:kms:us-east-1:ACCOUNT_ID:key/KEY_ID"
        }
      }
    ]
  }'
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access Denied" on presign request | Check IAM user/role has `s3:PutObject` permission on bucket |
| Presigned URL expires too soon | Check `PRESIGNED_URL_EXPIRY` (default 1 hour) in `lib/s3-presign.ts` |
| Upload succeeds but file not visible | Check bucket name in admin launch readiness; verify IAM role attached |
| CORS errors in browser | Apply CORS config to bucket; check allowed origins match `SITE_URL` |
| File appears but media doesn't render | Check S3 bucket is public-readable or presigned URL is included in media URLs |

## See Also

- `docs/S3_VAULT_HARDENING.md` — End-to-end encryption for vault artifacts
- `docs/S3_VAULT_LAMBDA_SCAN.md` — Malware scanning for vault uploads
- `apps/web/lib/s3-presign.ts` — Presign implementation
- `apps/web/lib/s3-release-presign.ts` — Release asset configuration
- `apps/web/lib/s3-application-media-presign.ts` — Media asset configuration
