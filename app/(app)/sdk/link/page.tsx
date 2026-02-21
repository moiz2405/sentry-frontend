"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type LinkState = "loading" | "needs_login" | "success" | "error";

function SdkLinkContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [state, setState] = useState<LinkState>("loading");
  const [message, setMessage] = useState("Linking your CLI session...");
  const [done, setDone] = useState(false);

  const backendBase = useMemo(
    () => (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:9000").replace(/\/$/, ""),
    []
  );

  const deviceCode = searchParams.get("device_code") ?? "";
  const appName = searchParams.get("app_name") ?? "";

  useEffect(() => {
    if (!deviceCode) {
      setState("error");
      setMessage("Missing device code.");
      return;
    }

    if (status === "loading") {
      setState("loading");
      return;
    }

    if (status !== "authenticated") {
      setState("needs_login");
      setMessage("Please sign in to finish app linking.");
      return;
    }

    if (done) {
      return;
    }

    const userId = session?.user?.id as string | undefined;
    if (!userId) {
      setState("error");
      setMessage("Logged in, but user id is missing.");
      return;
    }

    setDone(true);
    fetch(`${backendBase}/sdk/device/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_code: deviceCode,
        user_id: userId,
        app_name: appName || undefined,
        // Include profile so backend can resolve canonical id via upsert_user
        user_email: session?.user?.email ?? undefined,
        user_name: session?.user?.name ?? undefined,
        user_image: session?.user?.image ?? undefined,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.detail || "Link failed");
        }
        setState("success");
        setMessage("App linked. You can close this tab and return to your terminal.");
      })
      .catch((err) => {
        setState("error");
        setMessage(err?.message || "Link failed");
      });
  }, [status, session, deviceCode, appName, backendBase, done]);

  return (
    <main className="mx-auto mt-20 max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100">
      <h1 className="mb-2 text-2xl font-semibold">SDK CLI Linking</h1>
      <p className="text-zinc-300">{message}</p>
      {state === "needs_login" ? (
        <button
          type="button"
          onClick={() => signIn("google")}
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      ) : null}
      {state === "success" ? (
        <p className="mt-4 text-green-400">Terminal will continue automatically.</p>
      ) : null}
      {state === "error" ? <p className="mt-4 text-red-400">Please retry `sentry-logger init`.</p> : null}
    </main>
  );
}

export default function SdkLinkPage() {
  return (
    <Suspense fallback={
      <main className="mx-auto mt-20 max-w-2xl rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-zinc-100">
        <h1 className="mb-2 text-2xl font-semibold">SDK CLI Linking</h1>
        <p className="text-zinc-300">Loading...</p>
      </main>
    }>
      <SdkLinkContent />
    </Suspense>
  );
}
