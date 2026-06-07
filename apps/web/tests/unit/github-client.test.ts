import { describe, expect, it } from "vitest";
import { listGithubOrgRepos, parseGithubRepoRef } from "@/lib/github-client";

describe("parseGithubRepoRef", () => {
  it("accepts `owner/repo` shorthand", () => {
    expect(parseGithubRepoRef("alice/portfolio")).toEqual({ owner: "alice", repo: "portfolio" });
  });

  it("accepts an HTTPS github.com URL", () => {
    expect(parseGithubRepoRef("https://github.com/alice/portfolio")).toEqual({
      owner: "alice",
      repo: "portfolio",
    });
  });

  it("strips a trailing .git", () => {
    expect(parseGithubRepoRef("https://github.com/alice/portfolio.git")).toEqual({
      owner: "alice",
      repo: "portfolio",
    });
  });

  it("trims surrounding whitespace", () => {
    expect(parseGithubRepoRef("  alice/portfolio  ")).toEqual({ owner: "alice", repo: "portfolio" });
  });

  it("rejects malformed refs", () => {
    expect(parseGithubRepoRef("")).toBeNull();
    expect(parseGithubRepoRef("justone")).toBeNull();
    expect(parseGithubRepoRef("too/many/slashes")).toBeNull();
    expect(parseGithubRepoRef("https://gitlab.com/alice/portfolio")).toBeNull();
  });
});

describe("listGithubOrgRepos (mock mode)", () => {
  it("returns deterministic org repos when GITHUB_MOCK_MODE=1", async () => {
    process.env.GITHUB_MOCK_MODE = "1";
    const repos = await listGithubOrgRepos("SavigeSystemZ");
    expect(repos.length).toBeGreaterThanOrEqual(50);
    expect(repos.some((repo) => repo.fullName === "SavigeSystemZ/Immortality")).toBe(true);
    delete process.env.GITHUB_MOCK_MODE;
  });
});
