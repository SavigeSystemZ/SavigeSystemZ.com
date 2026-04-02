"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";

type OptionsResponse = {
  challengeId: string;
  options: PublicKeyCredentialCreationOptionsJSON;
};

type LoginOptionsResponse = {
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
};

export async function passkeyLogin(): Promise<{ ok: boolean; error?: string }> {
  const optRes = await fetch("/api/auth/passkey/login/options", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!optRes.ok) {
    const j = (await optRes.json().catch(() => ({}))) as { error?: string };
    if (j.error === "no_passkeys_registered") {
      return {
        ok: false,
        error: "No passkeys yet. Sign in with your access code once, then register a passkey in Admin.",
      };
    }
    return { ok: false, error: "Passkey sign-in is not available." };
  }

  const { challengeId, options } = (await optRes.json()) as LoginOptionsResponse;

  try {
    const credential = await startAuthentication({ optionsJSON: options });
    const verifyRes = await fetch("/api/auth/passkey/login/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ challengeId, credential }),
    });
    if (!verifyRes.ok) {
      return { ok: false, error: "Passkey verification failed." };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Passkey cancelled or failed.";
    return { ok: false, error: message };
  }
}

export async function registerOwnerPasskey(): Promise<{ ok: boolean; error?: string }> {
  const optRes = await fetch("/api/auth/passkey/register/options", {
    method: "POST",
    credentials: "same-origin",
  });
  if (!optRes.ok) {
    return { ok: false, error: "Could not start passkey registration (owner session required)." };
  }

  const { challengeId, options } = (await optRes.json()) as OptionsResponse;

  try {
    const credential = await startRegistration({ optionsJSON: options });
    const verifyRes = await fetch("/api/auth/passkey/register/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ challengeId, credential }),
    });
    if (!verifyRes.ok) {
      return { ok: false, error: "Could not verify passkey registration." };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Passkey cancelled or failed.";
    return { ok: false, error: message };
  }
}
