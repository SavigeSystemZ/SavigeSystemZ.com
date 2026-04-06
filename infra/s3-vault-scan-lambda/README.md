# S3 vault scan Lambda

Scans newly uploaded vault objects for malware using ClamAV, quarantines infected files, and optionally sends SNS notifications.

## Flow

1. S3 `ObjectCreated` event triggers this Lambda (via S3 notification or SNS/SQS)
2. Downloads the object to `/tmp` (Lambda ephemeral storage, max 512 MB)
3. Scans with ClamAV (`clamscan` binary from Lambda layer)
4. Tags the S3 object with `scan-status` (clean / infected / error) and `scan-timestamp`
5. If infected: copies to quarantine prefix, deletes original
6. Publishes result to SNS topic (if configured)

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `QUARANTINE_PREFIX` | `quarantine/` | S3 key prefix for quarantined files |
| `SNS_TOPIC_ARN` | (none) | Optional SNS topic ARN for scan notifications |
| `CLAMSCAN_PATH` | `/opt/bin/clamscan` | Path to clamscan binary (from ClamAV layer) |
| `MAX_FILE_SIZE_MB` | `100` | Skip files larger than this (tags as error) |

## IAM permissions

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject",
    "s3:PutObjectTagging",
    "s3:CopyObject",
    "s3:DeleteObject"
  ],
  "Resource": "arn:aws:s3:::YOUR_VAULT_BUCKET/*"
}
```

Add `sns:Publish` on the topic ARN if using notifications.

## Deploy

1. **ClamAV Lambda layer**: Use a community ClamAV layer (e.g., `clamav-lambda-layer`) that bundles `/opt/bin/clamscan` and virus definitions at `/opt/share/clamav/`. Update definitions via a scheduled Lambda or layer rebuild.

2. **Package**: `zip handler.zip handler.mjs`

3. **Create function**:
   - Runtime: Node.js 20.x
   - Handler: `handler.handler`
   - Memory: 1024 MB (ClamAV needs ~512 MB for virus definitions)
   - Timeout: 300 seconds
   - Ephemeral storage: 512 MB
   - Attach ClamAV layer

4. **Wire S3 notification**:
   ```bash
   aws s3api put-bucket-notification-configuration \
     --bucket YOUR_VAULT_BUCKET \
     --notification-configuration '{
       "LambdaFunctionConfigurations": [{
         "LambdaFunctionArn": "arn:aws:lambda:REGION:ACCOUNT:function:vault-scan",
         "Events": ["s3:ObjectCreated:*"],
         "Filter": { "Key": { "FilterRules": [{ "Name": "prefix", "Value": "vault/" }] } }
       }]
     }'
   ```

5. **Add Lambda permission** for S3 to invoke:
   ```bash
   aws lambda add-permission \
     --function-name vault-scan \
     --statement-id s3-invoke \
     --action lambda:InvokeFunction \
     --principal s3.amazonaws.com \
     --source-arn arn:aws:s3:::YOUR_VAULT_BUCKET
   ```

## Local testing

```bash
# Using AWS SAM CLI
sam local invoke -e example-event.json VaultScanFunction

# Or direct Node.js test (requires AWS credentials + ClamAV installed)
node -e "import('./handler.mjs').then(m => m.handler($(cat example-event.json)).then(console.log))"
```

## Monitoring

- CloudWatch Logs: filter on `phase` field (`scan_start`, `scan_complete`, `quarantined`, `scan_error`)
- CloudWatch Metrics: `Invocations`, `Errors`, `Duration`
- SNS notifications for infected file alerts

See also: `docs/S3_VAULT_LAMBDA_SCAN.md`
