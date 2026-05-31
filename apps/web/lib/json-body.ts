/**
 * Read a JSON request body with a hard size cap. Use this anywhere we accept
 * client JSON to prevent a malicious caller from sending a 100MB body and
 * pinning the event loop on parse / GC.
 *
 * Returns a discriminated union; routes pattern-match and translate.
 *
 * Default cap: 256 KB. Bump per-route only when there is a real payload size
 * justification (image/video metadata, batch operations).
 */
export type ReadJsonResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; reason: "too_large"; limitBytes: number; sawBytes: number }
  | { ok: false; reason: "invalid_json" };

const DEFAULT_MAX_BYTES = 256 * 1024;

export async function readJsonBody<T = unknown>(
  request: Request,
  maxBytes: number = DEFAULT_MAX_BYTES,
): Promise<ReadJsonResult<T>> {
  const declared = Number(request.headers.get("content-length") ?? "");
  if (Number.isFinite(declared) && declared > maxBytes) {
    return { ok: false, reason: "too_large", limitBytes: maxBytes, sawBytes: declared };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, reason: "invalid_json" };
  }

  // Byte length, not character length — multi-byte UTF-8 must count for what
  // it transmits, not what it renders.
  const sawBytes = new TextEncoder().encode(text).byteLength;
  if (sawBytes > maxBytes) {
    return { ok: false, reason: "too_large", limitBytes: maxBytes, sawBytes };
  }

  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, reason: "invalid_json" };
  }
}
