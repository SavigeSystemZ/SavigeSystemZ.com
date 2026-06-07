export type HttpProbeResult = {
  ok: boolean;
  catalogApplicationCount?: number;
};

export type PresignProbeResult = {
  ok: boolean;
  mediaStatus: number | null;
  releaseStatus: number | null;
  mediaConfigured: boolean;
  releaseConfigured: boolean;
  detail?: string;
};

function parseSessionCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const match = /(?:^|,)\s*sz_session=([^;]+)/i.exec(setCookieHeader);
  return match?.[1] ?? null;
}

export async function probeHttpHealth(siteUrl: string): Promise<HttpProbeResult> {
  const url = `${siteUrl.replace(/\/$/, "")}/api/health?probe=catalog`;
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return { ok: false };
    const body = (await response.json()) as { ok?: boolean; catalogApplicationCount?: number };
    return { ok: body.ok === true, catalogApplicationCount: body.catalogApplicationCount };
  } catch {
    return { ok: false };
  }
}

export async function probePresignRoutes(
  siteUrl: string,
  accessCode: string,
): Promise<PresignProbeResult> {
  const base = siteUrl.replace(/\/$/, "");
  try {
    const login = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ accessCode }),
  });

  if (!login.ok) {
    return {
      ok: false,
      mediaStatus: null,
      releaseStatus: null,
      mediaConfigured: false,
      releaseConfigured: false,
      detail: `Owner login failed (${login.status})`,
    };
  }

  const sessionValue = parseSessionCookie(login.headers.get("set-cookie"));
  if (!sessionValue) {
    return {
      ok: false,
      mediaStatus: null,
      releaseStatus: null,
      mediaConfigured: false,
      releaseConfigured: false,
      detail: "Owner login succeeded but sz_session cookie was missing",
    };
  }

  const cookieHeader = `sz_session=${sessionValue}`;
  const appsRes = await fetch(`${base}/api/admin/applications`, {
    headers: { cookie: cookieHeader },
  });

  if (!appsRes.ok) {
    return {
      ok: false,
      mediaStatus: null,
      releaseStatus: null,
      mediaConfigured: false,
      releaseConfigured: false,
      detail: `Admin applications fetch failed (${appsRes.status})`,
    };
  }

  const appsBody = (await appsRes.json()) as {
    items: Array<{ id: string; versions: Array<{ id: string }> }>;
  };
  const application = appsBody.items[0];
  const version = application?.versions[0];

  if (!application) {
    return {
      ok: false,
      mediaStatus: null,
      releaseStatus: null,
      mediaConfigured: false,
      releaseConfigured: false,
      detail: "No applications available for presign probe",
    };
  }

  const mediaRes = await fetch(`${base}/api/admin/application-media/s3-upload-url`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie: cookieHeader },
    body: JSON.stringify({
      applicationId: application.id,
      fileName: "staging-probe.png",
      contentType: "image/png",
    }),
  });

  let releaseStatus: number | null = null;
  if (version) {
    const releaseRes = await fetch(`${base}/api/admin/release-assets/s3-upload-url`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieHeader },
      body: JSON.stringify({
        versionId: version.id,
        fileName: "staging-probe.zip",
        contentType: "application/zip",
      }),
    });
    releaseStatus = releaseRes.status;
  }

  const mediaConfigured = mediaRes.status === 200;
  const releaseConfigured = releaseStatus === 200;
  const expectConfigured =
    process.env.AWS_S3_PRESIGN_ENABLED === "1" &&
    Boolean(process.env.AWS_S3_MEDIA_BUCKET?.trim() || process.env.AWS_S3_RELEASE_BUCKET?.trim());

  return {
    ok: expectConfigured ? mediaConfigured && releaseConfigured : mediaRes.status === 501 && (releaseStatus === 501 || releaseStatus === null),
    mediaStatus: mediaRes.status,
    releaseStatus,
    mediaConfigured,
    releaseConfigured,
    detail: expectConfigured
      ? undefined
      : "Expected 501 when S3 presign is not configured (local dev default)",
  };
  } catch (error) {
    return {
      ok: false,
      mediaStatus: null,
      releaseStatus: null,
      mediaConfigured: false,
      releaseConfigured: false,
      detail: error instanceof Error ? error.message : "Presign probe failed",
    };
  }
}
