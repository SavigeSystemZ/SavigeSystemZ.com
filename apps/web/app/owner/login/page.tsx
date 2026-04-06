"use client";

import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { passkeyLogin } from "@/lib/passkey-browser";

export default function OwnerLoginPage() {
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [webAuthnSupported, setWebAuthnSupported] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => {
      setWebAuthnSupported(browserSupportsWebAuthn());
    });
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ accessCode }),
    });

    if (!response.ok) {
      setError(response.status === 429 ? "Too many attempts. Wait a moment and try again." : "Invalid access code.");
      return;
    }
    router.push("/admin");
  }

  async function onPasskey() {
    setError("");
    setPasskeyBusy(true);
    const result = await passkeyLogin();
    setPasskeyBusy(false);
    if (!result.ok) {
      setError(result.error ?? "Passkey sign-in failed.");
      return;
    }
    router.push("/admin");
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Owner Login</h1>
      <p className="mt-2 text-sm text-zinc-300">Enter your owner access code to reach admin surfaces.</p>
      {webAuthnSupported === true ? (
        <div className="mt-6">
          <button
            type="button"
            disabled={passkeyBusy}
            onClick={() => void onPasskey()}
            className="w-full rounded border border-cyan-500/40 bg-zinc-900 px-4 py-2 text-sm font-medium text-cyan-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            {passkeyBusy ? "Waiting for passkey…" : "Sign in with passkey"}
          </button>
          <p className="mt-2 text-center text-xs text-zinc-500">or use your access code below</p>
        </div>
      ) : webAuthnSupported === false ? (
        <p className="mt-6 text-xs text-zinc-500">
          Passkey sign-in is unavailable in this browser. Use the access code, or try Chrome, Safari,
          Firefox, or Edge on HTTPS or localhost.
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        <input
          type="password"
          value={accessCode}
          onChange={(event) => setAccessCode(event.target.value)}
          className="rounded border border-zinc-700 bg-zinc-950 p-2"
          placeholder="Owner access code"
        />
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button className="rounded bg-cyan-400 px-4 py-2 font-medium text-zinc-950">Sign in</button>
      </form>
    </main>
  );
}
