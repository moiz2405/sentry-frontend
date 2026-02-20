"use client"

import { useState } from "react"
import {
  IconPackage,
  IconTerminal2,
  IconCode,
  IconCheck,
  IconCopy,
  IconBrandPython,
  IconArrowRight,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"

const STEPS = [
  {
    number: "01",
    icon: IconPackage,
    title: "Install the SDK",
    description:
      "Add the Sentry Logger package to your Python project. It works with any app that uses the standard Python logging module — FastAPI, Flask, Django, scripts, anything.",
    code: "pip install sentry-logger",
    language: "bash",
    tip: "Using a virtual environment? Activate it first before running pip install.",
  },
  {
    number: "02",
    icon: IconTerminal2,
    title: "Link your app via CLI",
    description:
      "Run the init command once from your terminal. It opens a browser tab where you sign in and authorize the app. Your API key is saved automatically — you never have to handle it manually.",
    code: 'sentry-logger init --app-name "my-service"',
    language: "bash",
    tip: 'Replace "my-service" with a unique name for this app. It will appear on your dashboard.',
  },
  {
    number: "03",
    icon: IconCode,
    title: "Add one line to your app",
    description:
      "Drop init() at the top of your entry point. It reads the saved credentials automatically. All Python logging.* calls anywhere in your app will flow to your Sentry dashboard.",
    code: `from sentry_logger import init
init()  # reads credentials saved by the CLI

import logging
logging.info("User signed in")
logging.warning("Payment retry attempt")
logging.error("DB connection failed")`,
    language: "python",
    tip: "You can also pass api_key= directly to init() if you prefer to manage credentials via environment variables.",
  },
]

const MANUAL_STEP = {
  icon: IconBrandPython,
  title: "Or register manually (no CLI)",
  description:
    "Skip the CLI flow. Register your app on the dashboard, copy your API key, and pass it directly to init().",
  code: `from sentry_logger import init

init(api_key="your-api-key-here")`,
  language: "python",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handle() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={handle}
      className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-zinc-700 bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all opacity-0 group-hover:opacity-100"
    >
      {copied ? <IconCheck className="size-3.5 text-green-400" /> : <IconCopy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export default function SetupPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-0 @container/main">
      {/* ── Header ──────────────────────────────────── */}
      <div className="px-4 pt-6 pb-6 lg:px-8 border-b border-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-100">Setup Guide</h1>
        <p className="mt-1 text-sm text-zinc-400 max-w-xl">
          Get logs flowing from your Python app to your dashboard in under 3 minutes.
        </p>
      </div>

      {/* ── Steps ───────────────────────────────────── */}
      <div className="px-4 py-8 lg:px-8 max-w-3xl space-y-6">

        {STEPS.map((step, idx) => (
          <div
            key={step.number}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden"
          >
            {/* Step header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-900/80">
              <span className="flex items-center justify-center size-8 rounded-full bg-blue-600/20 border border-blue-500/30 text-sm font-bold text-blue-300 shrink-0">
                {idx + 1}
              </span>
              <step.icon className="size-5 text-zinc-400 shrink-0" />
              <h2 className="text-base font-semibold text-zinc-100">{step.title}</h2>
            </div>

            {/* Step body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">{step.description}</p>

              {/* Code block */}
              <div className="relative group">
                <pre className="rounded-lg bg-zinc-950 border border-zinc-800 px-5 py-4 text-sm font-mono text-zinc-200 overflow-x-auto leading-relaxed whitespace-pre">
                  {step.code}
                </pre>
                <CopyButton text={step.code} />
              </div>

              {/* Tip */}
              <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                <span className="shrink-0 mt-0.5 text-blue-500">ℹ</span>
                {step.tip}
              </p>
            </div>
          </div>
        ))}

        {/* ── Manual alternative ──────────────────── */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-800">
            <MANUAL_STEP.icon className="size-5 text-zinc-400 shrink-0" />
            <h2 className="text-base font-semibold text-zinc-100">{MANUAL_STEP.title}</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-zinc-400 leading-relaxed">{MANUAL_STEP.description}</p>
            <div className="relative group">
              <pre className="rounded-lg bg-zinc-950 border border-zinc-800 px-5 py-4 text-sm font-mono text-zinc-200 overflow-x-auto leading-relaxed whitespace-pre">
                {MANUAL_STEP.code}
              </pre>
              <CopyButton text={MANUAL_STEP.code} />
            </div>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              Register an app to get your key
              <IconArrowRight className="size-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
