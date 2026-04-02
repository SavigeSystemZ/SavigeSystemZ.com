/**
 * Placeholder S3 event handler — log + optional tagging hook.
 * Swap in virus scan / quarantine (see README and docs/S3_VAULT_LAMBDA_SCAN.md).
 */
export async function handler(event) {
  const records = event.Records ?? [];
  const out = [];

  for (const record of records) {
    const bucket = record.s3?.bucket?.name;
    const rawKey = record.s3?.object?.key ?? "";
    const key = decodeURIComponent(rawKey.replace(/\+/g, " "));

    if (!bucket || !key) {
      out.push({ ok: false, reason: "missing_bucket_or_key" });
      continue;
    }

    console.log(
      JSON.stringify({
        phase: "vault_scan_placeholder",
        bucket,
        key,
        size: record.s3?.object?.size,
      }),
    );

    // TODO: download head/object, scan, then tag or copy to quarantine prefix.
    out.push({ ok: true, bucket, key });
  }

  return { statusCode: 200, body: JSON.stringify({ processed: out.length, out }) };
}
