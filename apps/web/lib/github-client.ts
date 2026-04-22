const GITHUB_API = "https://api.github.com";

export type GithubRepoSummary = {
  fullName: string;
  name: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  defaultBranch: string | null;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  visibility: "public" | "private" | null;
  pushedAt: string | null;
};

export type GithubCommitSummary = {
  sha: string;
  message: string;
  committedAt: string | null;
};

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "SavigeSystemZ-web",
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function ghFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: githubHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub ${path} → ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export function parseGithubRepoRef(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const urlMatch = trimmed.match(/^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+?)(?:\.git)?\/?$/i);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2] };
  const slashMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (slashMatch) return { owner: slashMatch[1], repo: slashMatch[2] };
  return null;
}

export async function fetchGithubRepo(owner: string, repo: string): Promise<GithubRepoSummary> {
  type Raw = {
    name: string;
    full_name: string;
    description: string | null;
    html_url: string;
    homepage: string | null;
    default_branch: string | null;
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    visibility: string | null;
    pushed_at: string | null;
    owner: { login: string };
  };
  const raw = await ghFetch<Raw>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  const visibility = raw.visibility === "public" || raw.visibility === "private" ? raw.visibility : null;
  return {
    fullName: raw.full_name,
    name: raw.name,
    owner: raw.owner.login,
    description: raw.description,
    htmlUrl: raw.html_url,
    homepage: raw.homepage,
    defaultBranch: raw.default_branch,
    language: raw.language,
    stargazersCount: raw.stargazers_count,
    forksCount: raw.forks_count,
    openIssuesCount: raw.open_issues_count,
    visibility,
    pushedAt: raw.pushed_at,
  };
}

export async function fetchGithubLatestCommit(
  owner: string,
  repo: string,
  branch: string | null | undefined,
): Promise<GithubCommitSummary | null> {
  const ref = branch ?? "HEAD";
  try {
    type Raw = {
      sha: string;
      commit: { message: string; committer: { date: string | null } | null };
    };
    const raw = await ghFetch<Raw>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(ref)}`,
    );
    return {
      sha: raw.sha,
      message: raw.commit.message.split("\n")[0]?.slice(0, 240) ?? "",
      committedAt: raw.commit.committer?.date ?? null,
    };
  } catch {
    return null;
  }
}
