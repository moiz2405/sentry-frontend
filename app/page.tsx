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
  IconMessageCircle,
  IconAlertTriangle,
  IconCheck,
  IconBrain,
  IconActivityHeartbeat,
} from "@tabler/icons-react"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const isLoggedIn = status === "authenticated"

  const ctaButton = isLoggedIn ? (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
    >
      <IconLayoutDashboard className="size-5" />
      Go to Dashboard
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5"
    >
      Get started free
      <IconArrowRight className="size-5" />
    </button>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <IconTerminal2 className="size-5 text-blue-400" />
            <span className="text-lg font-extrabold tracking-tight">Sentry</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-100 transition-colors">How it works</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-100 transition-colors"
            >
              GitHub
            </a>
          </nav>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <IconLayoutDashboard className="size-4" />
              Dashboard
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Sign in
              <IconArrowRight className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-28 pb-20 text-center overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute left-1/4 top-1/2 h-[300px] w-[400px] rounded-full bg-violet-600/5 blur-[80px]" />
        </div>

        <div className="relative max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 uppercase tracking-widest">
            <IconBolt className="size-3.5" />
            AI-Powered Log Intelligence
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight leading-[1.1] sm:text-6xl">
            Stop guessing.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Start knowing.
            </span>
          </h1>

          <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Drop two lines of Python into your app. An AI-powered dashboard tells you exactly which
            services are healthy, which are failing, and why.
          </p>

          {/* Stat pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-zinc-400">
            {["2-line setup", "Python-native", "No YAML", "Free to start"].map((s) => (
              <span key={s} className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">
                <IconCheck className="size-3 text-green-400" />
                {s}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {ctaButton}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
            >
              <IconBrandGithub className="size-5" />
              View on GitHub
            </a>
          </div>
        </div>

        {/* Terminal preview */}
        <div className="relative mt-16 w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/70 overflow-hidden text-left">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-950/70">
            <span className="size-3 rounded-full bg-red-500/70" />
            <span className="size-3 rounded-full bg-yellow-500/70" />
            <span className="size-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-zinc-500 font-mono">my_service/main.py</span>
          </div>
          <pre className="px-6 py-5 text-sm font-mono leading-loose overflow-x-auto">
            <span className="text-zinc-600"># Install once{"\n"}</span>
            <span className="text-green-400">pip</span>
            <span className="text-zinc-300"> install sentry-logger{"\n\n"}</span>
            <span className="text-zinc-600"># Two lines in your app{"\n"}</span>
            <span className="text-blue-400">from</span>
            <span className="text-zinc-300"> sentry_logger </span>
            <span className="text-blue-400">import</span>
            <span className="text-zinc-300"> init{"\n"}</span>
            <span className="text-yellow-400">init</span>
            <span className="text-zinc-300">(){"\n\n"}</span>
            <span className="text-zinc-600"># All your logging flows to the dashboard automatically{"\n"}</span>
            <span className="text-blue-400">import</span>
            <span className="text-zinc-300"> logging{"\n"}</span>
            <span className="text-zinc-300">logging.</span>
            <span className="text-yellow-400">error</span>
            <span className="text-zinc-300">(</span>
            <span className="text-green-300">&quot;Payment gateway timeout&quot;</span>
            <span className="text-zinc-300">)  </span>
            <span className="text-zinc-600"># → AI flags it instantly</span>
          </pre>
        </div>
      </section>

      {/* ── Features bento ──────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
              Built for the logs you already write
            </h2>
            <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
              No new logging format. No agents. Just your existing Python logging, made intelligent.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Large card — AI Analysis */}
            <div className="sm:col-span-2 relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7 overflow-hidden group hover:border-blue-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-blue-600/10 border border-blue-500/20 p-3">
                  <IconBrain className="size-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">AI-Powered Analysis</h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                  Every log batch is processed by an AI model that detects anomalies, classifies
                  severity, predicts failures, and generates plain-English health summaries — automatically.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Anomaly detection", "Failure prediction", "Root cause hints"].map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 overflow-hidden group hover:border-emerald-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-emerald-600/10 border border-emerald-500/20 p-3">
                  <IconActivityHeartbeat className="size-5 text-emerald-400" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">Live Dashboard</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Service health, error rates, and risk scores refresh every few seconds.
                </p>
              </div>
            </div>

            {/* Service health */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 overflow-hidden group hover:border-violet-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-violet-600/10 border border-violet-500/20 p-3">
                  <IconShieldCheck className="size-5 text-violet-400" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">Service Monitoring</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Track every microservice separately. Spot degradation before it becomes an outage.
                </p>
              </div>
            </div>

            {/* Ask your logs */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-cyan-600/10 border border-cyan-500/20 p-3">
                  <IconMessageCircle className="size-5 text-cyan-400" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">Ask Your Logs</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Chat with your logs. Ask "why is auth failing?" and get a direct answer.
                </p>
              </div>
            </div>

            {/* Alerts */}
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 overflow-hidden group hover:border-orange-500/30 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <div className="mb-4 inline-flex rounded-xl bg-orange-600/10 border border-orange-500/20 p-3">
                  <IconAlertTriangle className="size-5 text-orange-400" />
                </div>
                <h3 className="text-base font-semibold text-zinc-100 mb-2">Risk Alerts</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Get notified when a service risk score spikes. Catch fires before users notice.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-zinc-800/40">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
              Up and running in 3 minutes
            </h2>
            <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
              No YAML. No complex setup. Three steps and your logs are flowing to the dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-9 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

            {[
              {
                num: "1",
                icon: IconPackage,
                title: "Install the SDK",
                desc: "One pip install. No heavy dependencies, no external agents.",
                code: "pip install sentry-logger",
                color: "blue",
              },
              {
                num: "2",
                icon: IconTerminal2,
                title: "Link your app",
                desc: "The CLI opens a browser tab to authenticate and generates your API key.",
                code: 'sentry-logger init --app-name "my-api"',
                color: "violet",
              },
              {
                num: "3",
                icon: IconCode,
                title: "Add two lines",
                desc: "Drop this at the top of your app. Every log statement flows to your dashboard.",
                code: "from sentry_logger import init\ninit()",
                color: "emerald",
              },
            ].map((step) => {
              const colorMap: Record<string, { ring: string; numBg: string; numText: string; iconText: string }> = {
                blue:    { ring: "ring-blue-500/30",    numBg: "bg-blue-500/10",    numText: "text-blue-400",    iconText: "text-blue-400"    },
                violet:  { ring: "ring-violet-500/30",  numBg: "bg-violet-500/10",  numText: "text-violet-400",  iconText: "text-violet-400"  },
                emerald: { ring: "ring-emerald-500/30", numBg: "bg-emerald-500/10", numText: "text-emerald-400", iconText: "text-emerald-400" },
              }
              const c = colorMap[step.color]
              return (
                <div key={step.num} className="flex flex-col gap-4">
                  {/* Step number circle */}
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full ring-1 ${c.ring} ${c.numBg} flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${c.numText}`}>{step.num}</span>
                    </div>
                    <div className="h-px flex-1 bg-zinc-800 md:hidden" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <step.icon className={`size-4 ${c.iconText} shrink-0`} />
                      <h3 className="text-base font-semibold text-zinc-100">{step.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                  </div>

                  <pre className="rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-3.5 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed">
                    {step.code}
                  </pre>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-zinc-800/40">
        <div className="mx-auto max-w-3xl">
          <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 px-8 py-16 text-center overflow-hidden">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-[300px] w-[500px] rounded-full bg-blue-600/10 blur-[80px]" />
            </div>
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300 uppercase tracking-widest">
                <IconBolt className="size-3.5" />
                Free forever for personal use
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight text-zinc-100 mb-4 leading-tight">
                Ready to see your logs clearly?
              </h2>
              <p className="text-zinc-400 mb-8 max-w-md mx-auto">
                Sign in with Google and connect your first app in under a minute.
                No credit card. No config files.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/25 hover:-translate-y-0.5"
                  >
                    <IconLayoutDashboard className="size-5" />
                    Go to Dashboard
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/25 hover:-translate-y-0.5"
                  >
                    Get started — it&apos;s free
                    <IconArrowRight className="size-5" />
                  </button>
                )}
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-8 py-3.5 text-base font-semibold text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors"
                >
                  <IconBrandGithub className="size-5" />
                  Star on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/40 py-10 px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <IconTerminal2 className="size-4 text-blue-400" />
            <span className="text-sm font-bold text-zinc-300">Sentry</span>
            <span className="text-zinc-700 mx-2">·</span>
            <span className="text-xs text-zinc-600">Built for developers</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <a href="#features" className="hover:text-zinc-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-zinc-400 transition-colors">Docs</a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors flex items-center gap-1"
            >
              <IconBrandGithub className="size-3.5" />
              GitHub
            </a>
            <span>No telemetry · Open source</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
