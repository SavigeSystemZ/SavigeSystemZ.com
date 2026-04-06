/**
 * S3 vault scan Lambda — scans newly uploaded objects for malware.
 *
 * Flow:
 *   1. S3 ObjectCreated event triggers this handler
 *   2. Download the object to /tmp (Lambda ephemeral storage)
 *   3. Scan with ClamAV (via clamscan binary in Lambda layer)
 *   4. Tag object with scan result (clean / infected / error)
 *   5. If infected, copy to quarantine prefix and delete original
 *   6. Optionally publish result to SNS for alerting
 *
 * Environment variables:
 *   QUARANTINE_PREFIX  — S3 key prefix for quarantined files (default: "quarantine/")
 *   SNS_TOPIC_ARN      — Optional SNS topic for scan result notifications
 *   CLAMSCAN_PATH      — Path to clamscan binary (default: "/opt/bin/clamscan")
 *   MAX_FILE_SIZE_MB   — Skip files larger than this (default: 100)
 *
 * IAM permissions needed:
 *   s3:GetObject, s3:PutObjectTagging, s3:CopyObject, s3:DeleteObject on vault bucket
 *   sns:Publish on SNS_TOPIC_ARN (if set)
 *
 * Lambda layer: Use a ClamAV layer (e.g., clamav-lambda-layer) that provides
 * /opt/bin/clamscan and /opt/share/clamav/ virus definitions.
 */

import { execFile } from "node:child_process";
import { createWriteStream, unlinkSync, statSync } from "node:fs";
import { pipeline } from "node:stream/promises";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  PutObjectTaggingCommand,
} from "@aws-sdk/client-s3";

let snsPublish;
try {
  const { SNSClient, PublishCommand } = await import("@aws-sdk/client-sns");
  const snsClient = new SNSClient({});
  snsPublish = (topicArn, message) =>
    snsClient.send(new PublishCommand({ TopicArn: topicArn, Message: message }));
} catch {
  // SNS SDK not available — notifications disabled
  snsPublish = null;
}

const s3 = new S3Client({});

const QUARANTINE_PREFIX = process.env.QUARANTINE_PREFIX ?? "quarantine/";
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN ?? "";
const CLAMSCAN_PATH = process.env.CLAMSCAN_PATH ?? "/opt/bin/clamscan";
const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB ?? "100");
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

function scanFile(filePath) {
  return new Promise((resolve) => {
    execFile(
      CLAMSCAN_PATH,
      ["--no-summary", "--stdout", filePath],
      { timeout: 120_000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (!error) {
          resolve({ clean: true, output: stdout.trim() });
        } else if (error.code === 1) {
          // Exit code 1 = virus found
          resolve({ clean: false, output: stdout.trim(), infected: true });
        } else {
          // Exit code 2+ = scan error
          resolve({ clean: false, output: stderr.trim() || stdout.trim(), error: true });
        }
      },
    );
  });
}

async function tagObject(bucket, key, scanResult) {
  const tags = [
    { Key: "scan-status", Value: scanResult.clean ? "clean" : scanResult.infected ? "infected" : "error" },
    { Key: "scan-timestamp", Value: new Date().toISOString() },
  ];
  await s3.send(
    new PutObjectTaggingCommand({ Bucket: bucket, Key: key, Tagging: { TagSet: tags } }),
  );
}

async function quarantineObject(bucket, key) {
  const quarantineKey = `${QUARANTINE_PREFIX}${key}`;
  await s3.send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: quarantineKey,
      CopySource: `${bucket}/${encodeURIComponent(key)}`,
    }),
  );
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return quarantineKey;
}

async function notifyScanResult(bucket, key, result) {
  if (!SNS_TOPIC_ARN || !snsPublish) return;
  const message = JSON.stringify({
    event: "vault_scan_complete",
    bucket,
    key,
    status: result.clean ? "clean" : result.infected ? "infected" : "error",
    output: result.output?.slice(0, 500),
    timestamp: new Date().toISOString(),
  });
  try {
    await snsPublish(SNS_TOPIC_ARN, message);
  } catch (err) {
    console.error("SNS publish failed:", err.message);
  }
}

export async function handler(event) {
  const records = event.Records ?? [];
  const results = [];

  for (const record of records) {
    const bucket = record.s3?.bucket?.name;
    const rawKey = record.s3?.object?.key ?? "";
    const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
    const size = record.s3?.object?.size ?? 0;

    if (!bucket || !key) {
      results.push({ ok: false, key, reason: "missing_bucket_or_key" });
      continue;
    }

    const logContext = { bucket, key, size };
    console.log(JSON.stringify({ phase: "scan_start", ...logContext }));

    // Skip oversized files
    if (size > MAX_FILE_SIZE_BYTES) {
      console.log(JSON.stringify({ phase: "scan_skip_size", ...logContext, maxMB: MAX_FILE_SIZE_MB }));
      await tagObject(bucket, key, { clean: false, error: true, output: "file_too_large" });
      results.push({ ok: true, key, status: "skipped_size" });
      continue;
    }

    // Download to /tmp
    const tmpPath = `/tmp/${Date.now()}-${key.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    try {
      const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const writeStream = createWriteStream(tmpPath);
      await pipeline(response.Body, writeStream);
    } catch (err) {
      console.error(JSON.stringify({ phase: "download_error", ...logContext, error: err.message }));
      results.push({ ok: false, key, reason: "download_failed", error: err.message });
      continue;
    }

    // Scan
    let scanResult;
    try {
      scanResult = await scanFile(tmpPath);
    } catch (err) {
      console.error(JSON.stringify({ phase: "scan_error", ...logContext, error: err.message }));
      scanResult = { clean: false, error: true, output: err.message };
    }

    // Clean up temp file
    try { unlinkSync(tmpPath); } catch { /* ignore */ }

    console.log(JSON.stringify({
      phase: "scan_complete",
      ...logContext,
      clean: scanResult.clean,
      infected: scanResult.infected ?? false,
      output: scanResult.output?.slice(0, 200),
    }));

    // Tag the object
    await tagObject(bucket, key, scanResult);

    // Quarantine if infected
    let quarantineKey = null;
    if (scanResult.infected) {
      try {
        quarantineKey = await quarantineObject(bucket, key);
        console.log(JSON.stringify({ phase: "quarantined", ...logContext, quarantineKey }));
      } catch (err) {
        console.error(JSON.stringify({ phase: "quarantine_error", ...logContext, error: err.message }));
      }
    }

    // Notify
    await notifyScanResult(bucket, key, scanResult);

    results.push({
      ok: true,
      key,
      status: scanResult.clean ? "clean" : scanResult.infected ? "quarantined" : "scan_error",
      quarantineKey,
    });
  }

  return { statusCode: 200, body: JSON.stringify({ processed: results.length, results }) };
}
