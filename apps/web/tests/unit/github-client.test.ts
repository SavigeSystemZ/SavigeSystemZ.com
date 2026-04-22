import { describe, expect, it } from "vitest";
import { parseGithubRepoRef } from "@/lib/github-client";

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
