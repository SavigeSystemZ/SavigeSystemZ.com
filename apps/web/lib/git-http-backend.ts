import { spawn } from "node:child_process";

export async function serveGitHttpBackend(
  req: Request,
  repoSlug: string,
  path: string,
  reposPath: string
): Promise<Response> {
  const url = new URL(req.url);
  const gitPath = `/${repoSlug}.git/${path}`;
  const search = url.search;

  // CGI environment variables required by git-http-backend
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    GIT_PROJECT_ROOT: reposPath,
    GIT_HTTP_EXPORT_ALL: "1",
    PATH_INFO: gitPath,
    QUERY_STRING: search.substring(1), // Remove '?'
    REQUEST_METHOD: req.method,
    CONTENT_TYPE: req.headers.get("content-type") || "",
  };

  const remoteUser = req.headers.get("remote_user");
  if (remoteUser) {
    env.REMOTE_USER = remoteUser;
  }

  // Spawn the git-http-backend process
  const child = spawn("git", ["http-backend"], { env });

  // If request has a body (e.g. POST for git-receive-pack), pipe it to stdin
  if (req.body) {
    // req.body is a Web ReadableStream, we need to pipe it to child.stdin (Node Writable)
    const reader = req.body.getReader();
    const pump = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            child.stdin.end();
            break;
          }
          child.stdin.write(Buffer.from(value));
        }
      } catch (err) {
        child.stdin.destroy(err as Error);
      }
    };
    pump();
  } else {
    child.stdin.end();
  }

  // git-http-backend writes headers and body to stdout
  // The output format is:
  // Header-Name: Header-Value\r\n
  // ...
  // \r\n
  // Body...

  return new Promise<Response>((resolve) => {
    let headersParsed = false;
    let headerBuffer = Buffer.alloc(0);
    const headers = new Headers();
    let status = 200;

    // We will stream the body to the response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    child.stdout.on("data", (chunk: Buffer) => {
      if (!headersParsed) {
        headerBuffer = Buffer.concat([headerBuffer, chunk]);
        const headerEndIndex = headerBuffer.indexOf("\r\n\r\n");

        if (headerEndIndex !== -1) {
          headersParsed = true;
          const headerString = headerBuffer.subarray(0, headerEndIndex).toString("utf8");
          const lines = headerString.split("\r\n");

          for (const line of lines) {
            if (!line) continue;
            const colonIndex = line.indexOf(":");
            if (colonIndex === -1) continue;
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();

            if (key.toLowerCase() === "status") {
              status = parseInt(value.substring(0, 3), 10);
            } else {
              headers.append(key, value);
            }
          }

          // Resolve the Response promise once headers are fully parsed
          resolve(
            new Response(readable, {
              status,
              headers,
            })
          );

          // Write any remaining body bytes to the stream
          const bodyBytes = headerBuffer.subarray(headerEndIndex + 4);
          if (bodyBytes.length > 0) {
            writer.write(bodyBytes);
          }
        }
      } else {
        writer.write(chunk);
      }
    });

    child.stdout.on("end", () => {
      if (!headersParsed) {
        // If it ended before headers were parsed, it probably crashed or output nothing
        resolve(new Response("Git process exited early without valid headers", { status: 500 }));
      }
      writer.close();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      console.error(`[git-http-backend ${repoSlug}]`, chunk.toString("utf8"));
    });

    child.on("error", (err) => {
      console.error(`[git-http-backend spawn error]`, err);
      if (!headersParsed) {
        resolve(new Response("Internal Server Error", { status: 500 }));
      }
    });
  });
}
