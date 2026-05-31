import Link from "next/link";
import { GitTreeEntry } from "@/lib/git-local";

export function GitTree({
  slug,
  tree,
  currentPath = "",
}: {
  slug: string;
  tree: GitTreeEntry[];
  currentPath?: string;
}) {
  if (tree.length === 0) {
    return <p className="text-sm text-slate-400">Empty directory</p>;
  }

  const sortedTree = [...tree].sort((a, b) => {
    if (a.type === "tree" && b.type !== "tree") return -1;
    if (a.type !== "tree" && b.type === "tree") return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/40">
      <ul className="divide-y divide-white/5">
        {currentPath !== "" && (
          <li className="flex items-center gap-3 px-4 py-2 hover:bg-slate-900/50">
            <span className="text-slate-500">..</span>
            <Link
              href={`/repos/${slug}/tree/HEAD/${currentPath.split("/").slice(0, -1).join("/")}`}
              className="text-sm font-medium text-cyan-200 hover:underline"
            >
              (parent directory)
            </Link>
          </li>
        )}
        {sortedTree.map((entry) => {
          const isDir = entry.type === "tree";
          const itemPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
          const routePrefix = isDir ? "tree" : "blob";

          return (
            <li key={entry.name} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-900/50">
              <span className="text-slate-500">{isDir ? "📁" : "📄"}</span>
              <Link
                href={`/repos/${slug}/${routePrefix}/HEAD/${itemPath}`}
                className={`text-sm font-medium ${isDir ? "text-cyan-200" : "text-slate-200"} hover:underline`}
              >
                {entry.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
