import { describe, expect, it } from "vitest";
import { canAttemptS3Presign } from "@/lib/s3-presign";

describe("canAttemptS3Presign", () => {
  it("returns false when bucket or key missing", () => {
    expect(canAttemptS3Presign({ s3Bucket: null, s3Key: "k" })).toBe(false);
    expect(canAttemptS3Presign({ s3Bucket: "b", s3Key: null })).toBe(false);
    expect(canAttemptS3Presign({ s3Bucket: "", s3Key: "k" })).toBe(false);
  });

  it("returns true when both set", () => {
    expect(canAttemptS3Presign({ s3Bucket: "my-bucket", s3Key: "path/to/file" })).toBe(true);
  });
});
