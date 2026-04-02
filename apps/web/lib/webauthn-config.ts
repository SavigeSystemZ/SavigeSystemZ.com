/**
 * WebAuthn RP settings. Set PASSKEY_RP_ID and PASSKEY_ORIGIN in production to match the deployed host.
 */
export function getRpId(): string {
  return process.env.PASSKEY_RP_ID ?? "localhost";
}

export function getRpName(): string {
  return process.env.PASSKEY_RP_NAME ?? "SavigeSystemZ";
}

export function getExpectedOrigin(request: Request): string {
  const fromEnv = process.env.PASSKEY_ORIGIN;
  if (fromEnv) return fromEnv;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export function requireUserVerificationStrict(): boolean {
  return process.env.PASSKEY_REQUIRE_USER_VERIFICATION !== "0";
}
