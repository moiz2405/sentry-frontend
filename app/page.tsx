"use client"

import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import {
  IconBolt,
  IconChartBar,
  IconShieldCheck,
  IconTerminal2,
  IconPackage,
  IconCode,
  IconArrowRight,
  IconBrandGithub,
  IconLayoutDashboard,
} from "@tabler/icons-react"

const FEATURES = [
  {
    icon: IconBolt,
    title: "AI-Powered Analysis",
    description:
      "Every batch of logs is processed by an AI model that detects anomalies, classifies severity, and generates health summaries — automatically.",
  },
  {
    icon: IconChartBar,
    title: "Real-time Dashboard",
    description:
      "Watch your service health update live. Error rates, at-risk services, and trend charts refresh every few seconds.",
  },
  {
    icon: IconShieldCheck,
    title: "Service Health Monitoring",
    description:
      "Track multiple microservices per app. Sentry spots which services are degrading before they go down.",
  },
]

const STEPS = [
  {
    number: "01",
    icon: IconPackage,
    title: "Install the SDK",
    code: "pip install sentry-logger",
    description: "One pip install — no heavy dependencies.",
  },
  {
    number: "02",
    icon: IconTerminal2,
    title: "Get your API key",
    code: 'sentry-logger init --app-name "my-api"',
    description: "The CLI opens a browser tab to link your app. You get an API key in seconds.",
  },
  {
    number: "03",
    icon: IconCode,
    title: "Add two lines of code",
    code: "from sentry_logger import init\ninit()",
    description: "Drop this at the top of your app. All Python logging output flows to your dashboard.",
  },
]

export default function LandingPage() {
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <IconTerminal2 className="size-6 text-blue-400" />
            <span className="text-xl font-extrabold tracking-tight">Sentry</span>
          </div>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <IconLayoutDashboard className="size-4" />
              Go to Dashboard
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Sign in with Google
              <IconArrowRight className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-28 pb-24 text-center overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[900px] rounded-full bg-blue-600/10 blur-[120px]" />
        </div>

        <div className="relative max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 uppercase tracking-widest">
            <IconBolt className="size-3.5" />
            AI-Powered Log Intelligence
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight leading-tight sm:text-6xl">
            Stop guessing.
            <br />
            <span className="text-blue-400">Start knowing.</span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Install our Python SDK, ship your app, and watch an AI-powered dashboard tell you exactly
            which services are healthy, which are failing, and why.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
              >
                <IconLayoutDashboard className="size-5" />
                Go to Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/25"
              >
                Get started free
                <IconArrowRight className="size-5" />
              </button>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
            >
              <IconBrandGithub className="size-5" />
              View on GitHub
            </a>
          </div>
        </div>

        {/* Terminal preview */}
        <div className="relative mt-16 w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/60 overflow-hidden text-left">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-950/60">
            <span className="size-3 rounded-full bg-red-500/80" />
            <span className="size-3 rounded-full bg-yellow-500/80" />
            <span className="size-3 rounded-full bg-green-500/80" />
            <span className="ml-2 text-xs text-zinc-500 font-mono">my_service/main.py</span>
          </div>
          <pre className="px-6 py-5 text-sm font-mono text-zinc-300 leading-relaxed overflow-x-auto">
            <span className="text-zinc-500"># Install once</span>{"\n"}
            <span className="text-green-400">pip install</span>
            <span className="text-zinc-100"> sentry-logger</span>{"\n\n"}
            <span className="text-zinc-500"># Add to your app</span>{"\n"}
            <span className="text-blue-400">from</span>
            <span className="text-zinc-100"> sentry_logger </span>
            <span className="text-blue-400">import</span>
            <span className="text-zinc-100"> init</span>{"\n"}
            <span className="text-yellow-400">init</span>
            <span className="text-zinc-100">()</span>{"\n\n"}
            <span className="text-zinc-500"># That&apos;s it — all logging flows to your dashboard</span>{"\n"}
            <span className="text-blue-400">import</span>
            <span className="text-zinc-100"> logging</span>{"\n"}
            <span className="text-zinc-100">logging.</span>
            <span className="text-yellow-400">info</span>
            <span className="text-zinc-100">(</span>
            <span className="text-green-300">&quot;Payment processed&quot;</span>
            <span className="text-zinc-100">)</span>
          </pre>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-100 mb-3">
            Everything you need to monitor Python services
          </h2>
          <p className="text-center text-zinc-400 mb-14 max-w-xl mx-auto">
            No configuration files. No complex dashboards. Just install, run, and see what's happening.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="mb-4 inline-flex rounded-lg bg-blue-600/10 p-3 border border-blue-500/20">
                  <f.icon className="size-5 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-zinc-800/50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-100 mb-3">
            Up and running in 3 minutes
          </h2>
          <p className="text-center text-zinc-400 mb-14 max-w-xl mx-auto">
            No YAML. No complex setup. Three steps and your logs are flowing.
          </p>
          <div className="flex flex-col gap-6">
            {STEPS.map((step, idx) => (
              <div
                key={step.number}
                className="flex flex-col sm:flex-row gap-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
              >
                <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2">
                  <span className="text-4xl font-black text-zinc-700 leading-none w-10 text-center">
                    {step.number}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div className="hidden sm:block w-px flex-1 bg-zinc-800 mx-auto" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <step.icon className="size-4 text-blue-400 shrink-0" />
                    <h3 className="text-base font-semibold text-zinc-100">{step.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{step.description}</p>
                  <pre className="rounded-lg bg-zinc-950 border border-zinc-800 px-4 py-3 text-xs font-mono text-zinc-300 overflow-x-auto">
                    {step.code}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-zinc-800/50">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-100 mb-4">
            Ready to see your logs clearly?
          </h2>
          <p className="text-zinc-400 mb-10 text-lg">
            Sign in with your Google account and add your first app in under a minute.
          </p>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-10 py-4 text-lg font-bold text-white hover:bg-blue-500 transition-colors shadow-xl shadow-blue-600/25"
            >
              <IconLayoutDashboard className="size-5" />
              Go to Dashboard
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="inline-flex items-center gap-3 rounded-xl bg-blue-600 px-10 py-4 text-lg font-bold text-white hover:bg-blue-500 transition-colors shadow-xl shadow-blue-600/25"
            >
              Get started — it&apos;s free
              <IconArrowRight className="size-5" />
            </button>
          )}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/50 py-8 px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
            <IconTerminal2 className="size-4 text-blue-400" />
            Sentry
          </div>
          <p className="text-xs text-zinc-600">
            Built for developers. Open source. No telemetry.
          </p>
        </div>
      </footer>

    </div>
  )
}
