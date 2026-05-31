import React from "react";

function isSafeHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function sanitizeLine(line: string): string {
  return line
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe\s*>/gi, "")
    .replace(/(\s)on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "$1");
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match = linkRegex.exec(text);
  while (match) {
    const [full, label, href] = match;
    const start = match.index;
    if (start > cursor) {
      parts.push(text.slice(cursor, start));
    }
    if (isSafeHref(href.trim())) {
      parts.push(
        <a
          key={`${keyPrefix}-link-${start}`}
          href={href.trim()}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-200 underline underline-offset-2 hover:text-cyan-100"
        >
          {label}
        </a>,
      );
    } else {
      parts.push(label);
    }
    cursor = start + full.length;
    match = linkRegex.exec(text);
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }
  return parts;
}

export function MarkdownRender({ markdown }: { markdown: string }) {
  const lines = markdown.split(/\r?\n/).map(sanitizeLine);
  const nodes: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={`list-${nodes.length}`} className="ml-5 list-disc space-y-1 text-sm text-slate-200">
          {listItems}
        </ul>,
      );
      listItems = [];
    }
  }

  function flushCode() {
    if (codeBuffer.length > 0) {
      nodes.push(
        <pre
          key={`code-${nodes.length}`}
          className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/70 p-3 text-xs text-slate-200"
        >
          <code>{codeBuffer.join("\n")}</code>
        </pre>,
      );
      codeBuffer = [];
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim().startsWith("```")) {
      if (inCode) {
        flushCode();
      } else {
        flushList();
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      codeBuffer.push(line);
      continue;
    }
    if (!line.trim()) {
      flushList();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushList();
      const level = heading[1].length;
      const content = renderInline(heading[2], `h-${nodes.length}`);
      if (level === 1) {
        nodes.push(
          <h1 key={`h1-${nodes.length}`} className="text-2xl font-semibold text-white">
            {content}
          </h1>,
        );
      } else if (level === 2) {
        nodes.push(
          <h2 key={`h2-${nodes.length}`} className="text-xl font-semibold text-white">
            {content}
          </h2>,
        );
      } else {
        nodes.push(
          <h3 key={`h3-${nodes.length}`} className="text-lg font-semibold text-white">
            {content}
          </h3>,
        );
      }
      continue;
    }
    const list = line.match(/^\s*[-*]\s+(.+)$/);
    if (list) {
      listItems.push(<li key={`li-${nodes.length}-${listItems.length}`}>{renderInline(list[1], `li-${nodes.length}`)}</li>);
      continue;
    }
    flushList();
    nodes.push(
      <p key={`p-${nodes.length}`} className="text-sm leading-7 text-slate-200">
        {renderInline(line, `p-${nodes.length}`)}
      </p>,
    );
  }

  flushList();
  if (inCode) flushCode();

  return <div className="space-y-3">{nodes}</div>;
}

export { isSafeHref, sanitizeLine };
