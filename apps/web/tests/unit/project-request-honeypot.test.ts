import { describe, expect, it } from "vitest";
import { isProjectRequestHoneypotTripped } from "@/lib/project-request-honeypot";

describe("isProjectRequestHoneypotTripped", () => {
  it("is false for empty or whitespace-only", () => {
    expect(isProjectRequestHoneypotTripped(undefined)).toBe(false);
    expect(isProjectRequestHoneypotTripped("")).toBe(false);
    expect(isProjectRequestHoneypotTripped("   ")).toBe(false);
  });

  it("is true when non-empty content", () => {
    expect(isProjectRequestHoneypotTripped("http://spam.test")).toBe(true);
    expect(isProjectRequestHoneypotTripped(" x ")).toBe(true);
  });
});
