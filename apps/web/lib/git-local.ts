import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const REPOS_PATH = process.env.GIT_REPOS_PATH || "/tmp/savigesystemz-repos";

export type GitTreeEntry = {
  mode: string;
  type: "blob" | "tree" | "commit";
  hash: string;
  name: string;
};

export async function getLocalGitTree(slug: string, ref = "HEAD", subPath = ""): Promise<GitTreeEntry[]> {
  const repoDir = path.join(REPOS_PATH, `${slug}.git`);
  const treeish = subPath ? `${ref}:${subPath}` : ref;

  try {
    const { stdout } = await execFileAsync("git", ["ls-tree", treeish], { cwd: repoDir });
    const lines = stdout.split("\n").filter(Boolean);
    
    return lines.map((line) => {
      // 100644 blob e69de29bb2d1d6434b8b29ae775ad8c2e48c5391	filename
      const [info, name] = line.split("\t");
      const [mode, type, hash] = info.split(" ");
      return {
        mode,
        type: type as GitTreeEntry["type"],
        hash,
        name,
      };
    });
  } catch (err) {
    console.error("Local Git tree fetch failed:", err);
    return [];
  }
}

export async function getLocalGitBlob(slug: string, hashOrRef: string): Promise<string | null> {
  const repoDir = path.join(REPOS_PATH, `${slug}.git`);
  try {
    const { stdout } = await execFileAsync("git", ["show", hashOrRef], { cwd: repoDir, maxBuffer: 1024 * 1024 * 10 }); // 10MB limit
    return stdout;
  } catch (err) {
    console.error("Local Git blob fetch failed:", err);
    return null;
  }
}

export async function getLocalGitReadme(slug: string, ref = "HEAD"): Promise<string | null> {
  const tree = await getLocalGitTree(slug, ref);
  const readmeEntry = tree.find((entry) => entry.name.toLowerCase() === "readme.md");
  if (!readmeEntry) return null;

  return getLocalGitBlob(slug, readmeEntry.hash);
}
