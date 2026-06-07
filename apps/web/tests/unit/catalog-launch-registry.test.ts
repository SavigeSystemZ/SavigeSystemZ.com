import { describe, expect, it } from "vitest";
import {
  getCatalogLaunchEntry,
  inferLaunchUrlFromEnvExample,
  inferLaunchUrlFromLocalDevPortsMd,
  inferLaunchUrlFromWorkspacePortsRegistry,
  normalizeLaunchUrl,
} from "@/lib/catalog-launch-registry";

describe("catalog-launch-registry", () => {
  it("resolves flagship entries by slug", () => {
    const entry = getCatalogLaunchEntry("immortality", "Immortality");
    expect(entry?.launchUrl).toBe("http://127.0.0.1:3777");
    expect(entry?.surface).toBe("web");
  });

  it("marks etherweave as desktop-only", () => {
    const entry = getCatalogLaunchEntry("etherweave", "etherweave");
    expect(entry?.surface).toBe("desktop");
    expect(entry?.launchUrl).toBeUndefined();
    expect(entry?.repoDir).toBe("EtherWeave");
  });

  it("infers launch URL from NEXT_PUBLIC_APP_URL", () => {
    const url = inferLaunchUrlFromEnvExample(
      'NEXT_PUBLIC_APP_URL="http://localhost:3777"\nPORT=9999\n',
    );
    expect(url).toBe("http://127.0.0.1:3777");
  });

  it("infers launch URL from NEXTAUTH_URL", () => {
    const url = inferLaunchUrlFromEnvExample('NEXTAUTH_URL="http://localhost:3777"\n');
    expect(url).toBe("http://127.0.0.1:3777");
  });

  it("infers launch URL from PORT when no public URL", () => {
    const url = inferLaunchUrlFromEnvExample("PORT=3847\n");
    expect(url).toBe("http://127.0.0.1:3847");
  });

  it("infers launch URL from templated APP_HEALTHCHECK_URL with explicit port", () => {
    const url = inferLaunchUrlFromEnvExample(
      "APP_HEALTHCHECK_URL=http://${APP_BIND_ADDRESS:-127.0.0.1}:${APP_PORT:-3847}/health\n",
    );
    expect(url).toBe("http://127.0.0.1:3847");
  });

  it("parses prose-style LOCAL_DEV_PORTS defaults", () => {
    const url = inferLaunchUrlFromLocalDevPortsMd(
      "Reserved default host port for app services when this stack includes an HTTP service: **38205**",
    );
    expect(url).toBe("http://127.0.0.1:38205");
  });

  it("ignores generic AIAAST healthcheck fallback port", () => {
    const url = inferLaunchUrlFromEnvExample(
      "APP_HEALTHCHECK_URL=http://${APP_BIND_ADDRESS:-127.0.0.1}:${APP_PORT:-46300}/health\n",
    );
    expect(url).toBeUndefined();
  });

  it("parses ops/LOCAL_DEV_PORTS.md default APP_PORT", () => {
    const url = inferLaunchUrlFromLocalDevPortsMd(
      "| Setting | Default | Override |\n| `APP_PORT` | **38222** | Set in `ops/env/.env` |\n",
    );
    expect(url).toBe("http://127.0.0.1:38222");
  });

  it("parses workspace PORTS_REGISTRY rows", () => {
    const md = "| DeepWeave | 38205 | bootstrap |\n| Vetraxis | 38222 | |\n";
    expect(inferLaunchUrlFromWorkspacePortsRegistry(md, "DeepWeave")).toBe("http://127.0.0.1:38205");
    expect(inferLaunchUrlFromWorkspacePortsRegistry(md, "Vetraxis")).toBe("http://127.0.0.1:38222");
  });

  it("normalizes localhost to 127.0.0.1", () => {
    expect(normalizeLaunchUrl("http://localhost:3000/")).toBe("http://127.0.0.1:3000");
  });
});
