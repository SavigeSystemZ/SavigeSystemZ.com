import { describe, expect, it } from "vitest";
import { probeHttpHealth, probePresignRoutes } from "@/lib/staging-probes";

describe("staging-probes", () => {
  it("probeHttpHealth returns false for unreachable host", async () => {
    const result = await probeHttpHealth("http://127.0.0.1:59999");
    expect(result.ok).toBe(false);
  });

  it("probePresignRoutes fails gracefully without server", async () => {
    const result = await probePresignRoutes("http://127.0.0.1:59999", "e2e-owner-code");
    expect(result.ok).toBe(false);
    expect(result.detail).toBeTruthy();
  });
});
