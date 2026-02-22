"use client"

import { useState } from "react"
import {
  IconPackage,
  IconTerminal2,
  IconCode,
  IconCheck,
  IconCopy,
  IconBrandPython,
  IconBrandDocker,
  IconFileText,
  IconBolt,
  IconArrowRight,
  IconInfoCircle,
  IconAlertTriangle,
  IconSettings,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Copy Button ────────────────────────────────────────────
function CopyButton({ text, className }: { text: string; className?: string }) {
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
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all",
        copied
          ? "border-emerald-600/50 bg-emerald-900/40 text-emerald-300"
          : "border-zinc-600 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 hover:border-zinc-500",
        className
      )}
    >
      {copied ? <IconCheck className="size-3.5" /> : <IconCopy className="size-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  )
}

// ─── Dracula theme ───────────────────────────────────────────
const D = {
  bg: "#282a36",
  header: "#21222c",
  border: "#44475a",
  fg: "#f8f8f2",
  comment: "#6272a4",
  cyan: "#8be9fd",
  green: "#50fa7b",
  orange: "#ffb86c",
  pink: "#ff79c6",
  purple: "#bd93f9",
  red: "#ff5555",
  yellow: "#f1fa8c",
}

// ─── Syntax tokenizer ────────────────────────────────────────
type Rule = [RegExp, string]

const LANG_RULES: Record<string, Rule[]> = {
  python: [
    [/"""[\s\S]*?"""|'''[\s\S]*?'''/g, D.yellow],
    [/f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*'/g, D.yellow],
    [/#.*/g, D.comment],
    [/\b(False|None|True|and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/g, D.pink],
    [/@[\w.]+/g, D.green],
    [/\b(self|cls)\b/g, D.orange],
    [/\b(print|len|range|str|int|float|list|dict|set|tuple|bool|type|super|isinstance|hasattr|getattr|setattr|open|enumerate|zip|map|filter|repr)\b/g, D.cyan],
    [/\b\w+(?=\s*\()/g, D.green],
    [/\b\d+(?:\.\d+)?\b/g, D.purple],
  ],
  bash: [
    [/#.*/g, D.comment],
    [/"(?:[^"\\]|\\.)*"|'[^']*'/g, D.yellow],
    [/\$\{?[\w]+\}?/g, D.purple],
    [/--?[\w][\w-]*/g, D.cyan],
    [/\b(pip|pip3|python|python3|uvicorn|gunicorn|celery|sentry-logger|docker|curl|wget|cat|echo)\b/g, D.green],
    [/\b\d+\b/g, D.purple],
  ],
  yaml: [
    [/#.*/g, D.comment],
    [/"(?:[^"\\]|\\.)*"|'[^']*'/g, D.yellow],
    [/\b(true|false|null|yes|no)\b/g, D.purple],
    [/\$\{[\w]+\}/g, D.purple],
    [/^[ \t]*[\w-]+(?=\s*:)/gm, D.cyan],
    [/\b\d+(?:\.\d+)?\b/g, D.purple],
  ],
  dockerfile: [
    [/#.*/g, D.comment],
    [/"(?:[^"\\]|\\.)*"/g, D.yellow],
    [/\$\{?[\w]+\}?/g, D.purple],
    [/^(FROM|RUN|COPY|CMD|ENV|EXPOSE|WORKDIR|ARG|LABEL|USER|VOLUME|ADD|ENTRYPOINT|HEALTHCHECK|STOPSIGNAL|ONBUILD|SHELL)\b/gm, D.pink],
  ],
  env: [
    [/#.*/g, D.comment],
    [/^[\w]+(?==)/gm, D.cyan],
    [/(?<==).+/gm, D.yellow],
  ],
}

function highlight(code: string, lang: string): React.ReactNode {
  const rules = LANG_RULES[lang]
  if (!rules) return <>{code}</>

  type Span = { s: number; e: number; color: string }
  const spans: Span[] = []
  const used = new Uint8Array(code.length)

  for (const [re, color] of rules) {
    const gr = new RegExp(re.source, re.flags.replace(/[^gm]/g, "") + (re.flags.includes("g") ? "" : "g") + (re.flags.includes("m") ? "" : "m"))
    let m: RegExpExecArray | null
    gr.lastIndex = 0
    while ((m = gr.exec(code)) !== null) {
      const s = m.index, e = s + m[0].length
      if (e <= s) { gr.lastIndex++; continue }
      let ok = true
      for (let i = s; i < e; i++) if (used[i]) { ok = false; break }
      if (ok) {
        spans.push({ s, e, color })
        for (let i = s; i < e; i++) used[i] = 1
      }
    }
  }

  spans.sort((a, b) => a.s - b.s)

  const parts: React.ReactNode[] = []
  let pos = 0
  for (const { s, e, color } of spans) {
    if (s > pos) parts.push(<span key={`t${pos}`} style={{ color: D.fg }}>{code.slice(pos, s)}</span>)
    parts.push(<span key={`h${s}`} style={{ color }}>{code.slice(s, e)}</span>)
    pos = e
  }
  if (pos < code.length) parts.push(<span key={`t${pos}`} style={{ color: D.fg }}>{code.slice(pos)}</span>)
  return <>{parts}</>
}

// ─── Code Block ─────────────────────────────────────────────
const LANG_LABEL: Record<string, string> = {
  bash: "bash", python: "python", yaml: "yaml", dockerfile: "dockerfile", env: ".env",
}

// Traffic-light dot colors (macOS style)
const DOTS = ["#ff5f57", "#febc2e", "#28c840"]

function CodeBlock({
  code,
  language = "bash",
  filename,
  primary,
}: {
  code: string
  language?: string
  filename?: string
  primary?: boolean
}) {
  const label = LANG_LABEL[language] ?? language
  return (
    <div
      className={cn("rounded-xl overflow-hidden", primary ? "ring-1 ring-white/10" : "")}
      style={{ border: `1px solid ${primary ? "#6272a4" : D.border}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ background: D.header, borderBottom: `1px solid ${D.border}` }}
      >
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            {DOTS.map((c, i) => (
              <span key={i} className="size-3 rounded-full inline-block" style={{ background: c }} />
            ))}
          </div>
          {filename && (
            <span className="text-xs font-mono font-medium" style={{ color: "#cdd6f4" }}>{filename}</span>
          )}
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded tracking-wide uppercase"
            style={{ background: "#44475a", color: D.comment }}
          >
            {label}
          </span>
        </div>
        <CopyButton text={code} />
      </div>
      {/* Code */}
      <pre
        className="px-5 py-4 text-sm font-mono overflow-x-auto leading-relaxed whitespace-pre"
        style={{ background: D.bg, color: D.fg }}
      >
        {highlight(code, language)}
      </pre>
    </div>
  )
}

// ─── Inline code ─────────────────────────────────────────────
function IC({ children }: { children: React.ReactNode }) {
  return (
    <code className="text-[13px] font-mono text-sky-300 bg-sky-950/50 border border-sky-800/30 px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}

// ─── Info / Warning callout ──────────────────────────────────
function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "tip"
  children: React.ReactNode
}) {
  const styles = {
    info: {
      border: "border-blue-500/40",
      bg: "bg-blue-950/60",
      left: "bg-blue-500",
      icon: <IconInfoCircle className="size-4 text-blue-300 shrink-0 mt-px" />,
      text: "text-zinc-200",
    },
    warning: {
      border: "border-yellow-500/40",
      bg: "bg-yellow-950/50",
      left: "bg-yellow-400",
      icon: <IconAlertTriangle className="size-4 text-yellow-300 shrink-0 mt-px" />,
      text: "text-zinc-200",
    },
    tip: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-950/50",
      left: "bg-emerald-400",
      icon: <IconBolt className="size-4 text-emerald-300 shrink-0 mt-px" />,
      text: "text-zinc-200",
    },
  }
  const s = styles[type]
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3 relative overflow-hidden", s.border, s.bg)}>
      <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", s.left)} />
      {s.icon}
      <p className={cn("text-sm leading-relaxed", s.text)}>{children}</p>
    </div>
  )
}

// ─── Step ────────────────────────────────────────────────────
function Step({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="relative flex gap-5">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center size-9 rounded-full bg-blue-600/20 border-2 border-blue-500/50 text-sm font-bold text-blue-200 shrink-0 z-10 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
          {number}
        </div>
        <div className="w-px flex-1 bg-zinc-700 mt-2" />
      </div>
      {/* Content */}
      <div className="pb-8 flex-1 min-w-0">
        <h3 className="text-base font-bold text-white mb-3 mt-1 leading-tight">{title}</h3>
        <div className="space-y-3">{children}</div>
      </div>
    </div>
  )
}

// ─── Tab definitions ─────────────────────────────────────────
type TabId = "cli" | "docker" | "env" | "frameworks"
const TABS: { id: TabId; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
  { id: "cli", label: "CLI Setup", icon: IconTerminal2, badge: "Recommended" },
  { id: "docker", label: "Docker", icon: IconBrandDocker },
  { id: "env", label: "Environment", icon: IconFileText },
  { id: "frameworks", label: "Frameworks", icon: IconBrandPython },
]

// ─── Framework sub-tabs ───────────────────────────────────────
type FrameworkId = "fastapi" | "flask" | "django" | "script"
const FRAMEWORKS: { id: FrameworkId; label: string }[] = [
  { id: "fastapi", label: "FastAPI" },
  { id: "flask", label: "Flask" },
  { id: "django", label: "Django" },
  { id: "script", label: "Script / CLI" },
]

// ─── Tab content ─────────────────────────────────────────────
function CliTab() {
  const router = useRouter()
  return (
    <div className="space-y-0">
      <Step number={1} title="Install the SDK">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Add the Sentry Logger package to your Python project. Works with any WSGI/ASGI app or plain script — FastAPI, Flask, Django, Celery, anything that uses Python's standard logging module.
        </p>
        <CodeBlock code="pip install sentry-logger" language="bash" primary />
        <Callout type="tip">
          Using a virtualenv or conda? Activate it first. For Docker, see the Docker tab.
        </Callout>
      </Step>

      <Step number={2} title="Link your app via CLI (one-time)">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Run the init command once from your terminal. It opens a browser sign-in, registers your app, and saves credentials to{" "}
          <IC>~/.sentry_logger/config.json</IC> automatically.
        </p>
        <CodeBlock code={`sentry-logger init --app-name "my-service"`} language="bash" primary />
        <CodeBlock code="sentry-logger status" language="bash" />
        <Callout type="info">
          Credentials are saved per-machine. In CI/CD or Docker environments, use an API key via env variable instead — see the Environment tab.
        </Callout>
      </Step>

      <Step number={3} title="Add one line to your entry point">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Drop <IC>init()</IC> at the top of your app. It reads saved credentials automatically. All{" "}
          <IC>logging.*</IC> calls anywhere in your app will flow to your dashboard.
        </p>
        <CodeBlock
          code={`from sentry_logger import init
init()  # reads credentials saved by the CLI

import logging
logging.info("User signed in")
logging.warning("Payment retry attempt")
logging.error("DB connection failed")`}
          language="python"
          filename="main.py"
          primary
        />
        <Callout type="tip">
          Call <IC>init()</IC> before importing FastAPI, Flask, or any other framework so their internal loggers are hooked correctly.
        </Callout>
      </Step>

      {/* Manual fallback */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-700 bg-zinc-900">
          <IconBrandPython className="size-4 text-blue-400 shrink-0" />
          <h3 className="text-sm font-semibold text-zinc-100">Skip the CLI — register manually</h3>
          <Badge variant="secondary" className="ml-auto text-xs">Alternative</Badge>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-zinc-300">
            Register your app on the dashboard, copy your API key, and pass it directly to <IC>init()</IC>.
          </p>
          <CodeBlock
            code={`from sentry_logger import init\n\ninit(api_key="sk_your-api-key-here")`}
            language="python"
          />
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Register an app to get your key
            <IconArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function DockerTab() {
  return (
    <div className="space-y-0">
      <Step number={1} title="Add SDK to your requirements">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Add <IC>sentry-logger</IC> to your <IC>requirements.txt</IC>, then install it in your Dockerfile.
        </p>
        <CodeBlock code="sentry-logger" language="bash" filename="requirements.txt" primary />
        <CodeBlock
          code={`FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["python", "main.py"]`}
          language="dockerfile"
          filename="Dockerfile"
        />
      </Step>

      <Step number={2} title="Pass credentials via environment variables">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Use <IC>SENTRY_API_KEY</IC> and <IC>SENTRY_INGEST_URL</IC> environment variables.
          The SDK reads these automatically — no code changes needed.
        </p>
        <CodeBlock
          code={`version: "3.9"
services:
  myapp:
    build: .
    environment:
      - SENTRY_API_KEY=\${SENTRY_API_KEY}
      - SENTRY_INGEST_URL=http://sentry-backend:8002
    depends_on:
      - sentry-backend

  sentry-backend:
    image: python:3.11-slim
    ports:
      - "8002:8002"`}
          language="yaml"
          filename="docker-compose.yml"
          primary
        />
        <Callout type="info">
          Store your real API key in a <IC>.env</IC> file next to docker-compose.yml and add it to .gitignore. Docker Compose loads it automatically.
        </Callout>
        <CodeBlock
          code={`# .env (never commit this)
SENTRY_API_KEY=sk_your-api-key-here`}
          language="env"
          filename=".env"
        />
      </Step>

      <Step number={3} title="Initialize in your app">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Call <IC>init()</IC> with no arguments — it reads env vars automatically. Or be explicit if you prefer.
        </p>
        <CodeBlock
          code={`from sentry_logger import init

# Auto-reads SENTRY_API_KEY + SENTRY_INGEST_URL from environment
init()

import logging
logging.info("Container started")`}
          language="python"
          filename="main.py"
          primary
        />
        <Callout type="tip">
          For multi-container setups, set <IC>SENTRY_INGEST_URL</IC> to the internal Docker service name (e.g. <IC>http://sentry-backend:8002</IC>) so containers communicate directly.
        </Callout>
      </Step>

      {/* Full example */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-700 bg-zinc-900">
          <IconBrandDocker className="size-4 text-cyan-400 shrink-0" />
          <h3 className="text-sm font-semibold text-zinc-100">Full example: app + Sentry backend together</h3>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-zinc-300">
            A complete docker-compose setup that runs your app alongside the Sentry backend with a healthcheck.
          </p>
          <CodeBlock
            code={`version: "3.9"
services:
  myapp:
    build: .
    restart: unless-stopped
    environment:
      - SENTRY_API_KEY=\${SENTRY_API_KEY}
      - PYTHONUNBUFFERED=1
      - SENTRY_INGEST_URL=http://backend:8002
    depends_on:
      backend:
        condition: service_healthy

  backend:
    image: sentry-backend:latest
    ports:
      - "8002:8002"
    environment:
      - DATABASE_URL=\${DATABASE_URL}
      - SUPABASE_URL=\${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=\${SUPABASE_SERVICE_ROLE_KEY}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8002/health"]
      interval: 30s
      timeout: 10s
      retries: 5`}
            language="yaml"
            filename="docker-compose.yml"
          />
        </div>
      </div>
    </div>
  )
}

function EnvTab() {
  return (
    <div className="space-y-6">
      {/* Reference table */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-700 bg-zinc-900 flex items-center gap-2">
          <IconSettings className="size-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Environment Variable Reference</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left px-5 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider">Variable</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider">Default</th>
                <th className="text-left px-5 py-3 text-xs font-bold text-zinc-300 uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {[
                {
                  name: "SENTRY_API_KEY",
                  default: "—",
                  desc: "Your app API key (sk_…). Required if not using CLI credentials.",
                  required: true,
                },
                {
                  name: "SENTRY_INGEST_URL",
                  default: "https://…/ingest",
                  desc: "Backend ingest URL. Override for self-hosted or local development.",
                  required: false,
                },
                {
                  name: "SENTRY_BATCH_SIZE",
                  default: "50",
                  desc: "Number of log entries to buffer before sending.",
                  required: false,
                },
                {
                  name: "SENTRY_FLUSH_INTERVAL",
                  default: "5.0",
                  desc: "Seconds between auto-flush attempts.",
                  required: false,
                },
                {
                  name: "SENTRY_REDIRECT_PRINT",
                  default: "true",
                  desc: "Capture print() / stdout / stderr output.",
                  required: false,
                },
                {
                  name: "SENTRY_CAPTURE_EXCEPTIONS",
                  default: "true",
                  desc: "Log unhandled exceptions as CRITICAL.",
                  required: false,
                },
              ].map((row) => (
                <tr key={row.name} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-semibold text-sky-300 bg-sky-950/40 border border-sky-800/30 px-1.5 py-0.5 rounded">{row.name}</code>
                      {row.required && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-bold">required</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <code className="text-xs font-mono text-zinc-400">{row.default}</code>
                  </td>
                  <td className="px-5 py-3 text-xs text-zinc-300">{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* .env setup */}
      <div className="space-y-0">
        <Step number={1} title="Create your .env file">
          <p className="text-sm text-zinc-300">
            Create a <IC>.env</IC> file in your project root and add it to <IC>.gitignore</IC> immediately.
          </p>
          <CodeBlock
            code={`# .env
SENTRY_API_KEY=sk_your_api_key_here
SENTRY_INGEST_URL=http://localhost:8002
SENTRY_DEBUG=1

# Optional tuning
SENTRY_BATCH_SIZE=50
SENTRY_FLUSH_INTERVAL=5.0
SENTRY_REDIRECT_PRINT=true
SENTRY_CAPTURE_EXCEPTIONS=true`}
            language="env"
            filename=".env"
            primary
          />
          <Callout type="warning">
            Never commit your .env file to version control. Add it to .gitignore immediately.
          </Callout>
        </Step>

        <Step number={2} title="Load env vars in Python">
          <p className="text-sm text-zinc-300">
            The SDK reads env vars automatically. Optionally use <IC>python-dotenv</IC> to load your .env file in development.
          </p>
          <CodeBlock code="pip install python-dotenv" language="bash" />
          <CodeBlock
            code={`from dotenv import load_dotenv
load_dotenv()  # loads .env before sentry_logger reads env vars

from sentry_logger import init
init()  # reads SENTRY_API_KEY and SENTRY_INGEST_URL automatically`}
            language="python"
            filename="main.py"
            primary
          />
          <Callout type="info">
            In production (Docker, Kubernetes, Railway, etc.) env vars are usually injected directly — you don't need python-dotenv.
          </Callout>
        </Step>

        <Step number={3} title="Or pass values explicitly">
          <p className="text-sm text-zinc-300">
            Prefer full control? Pass everything directly to <IC>init()</IC>.
          </p>
          <CodeBlock
            code={`import os
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_INGEST_URL", "http://localhost:8002"),
    api_key=os.getenv("SENTRY_API_KEY"),
    debug=True
)`}
            language="python"
            filename="main.py"
          />
        </Step>
      </div>
    </div>
  )
}

function FrameworksTab() {
  const [active, setActive] = useState<FrameworkId>("fastapi")

  const content: Record<FrameworkId, React.ReactNode> = {
    fastapi: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Call <IC>init()</IC> <strong className="text-white">before</strong> importing FastAPI so Uvicorn's internal loggers are hooked. You get request logs, errors, and unhandled exceptions — zero route changes.
        </p>
        <CodeBlock
          code={`from sentry_logger import init
init()  # ← must be before FastAPI import

from fastapi import FastAPI
import logging

app = FastAPI()
logger = logging.getLogger("api")

@app.get("/")
def root():
    logger.info("Root endpoint hit")
    return {"status": "ok"}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id < 0:
        logger.error("Invalid item_id: %d", item_id)
        raise ValueError("item_id must be positive")
    return {"item_id": item_id}`}
          language="python"
          filename="main.py"
        />
        <Callout type="tip">
          Uvicorn access logs (GET /items/1 200 0ms) appear under the <strong>uvicorn.access</strong> service group in your dashboard automatically.
        </Callout>
        <CodeBlock
          code={`# Start with uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload`}
          language="bash"
        />
        <CodeBlock
          code={`# Or with gunicorn + uvicorn workers (production)
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker`}
          language="bash"
        />
      </div>
    ),
    flask: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Call <IC>init()</IC> before creating your Flask app. Flask uses Python's standard logging, so all built-in request logs and your own logger calls are captured.
        </p>
        <CodeBlock
          code={`from sentry_logger import init
init()  # ← before Flask import

from flask import Flask
import logging

app = Flask(__name__)
logger = logging.getLogger("flask-app")

@app.route("/")
def index():
    logger.info("Home page accessed")
    return "Hello, World!"

@app.route("/error")
def trigger_error():
    logger.warning("About to raise an error")
    raise RuntimeError("Something went wrong")

if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)`}
          language="python"
          filename="app.py"
        />
        <Callout type="info">
          Flask{"\u2019"}s built-in error handler logs unhandled exceptions. With Sentry Logger, those also appear as CRITICAL in your dashboard.
        </Callout>
      </div>
    ),
    django: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          For Django, add the init call in <IC>manage.py</IC> or your WSGI/ASGI entry point. You can also use Django's LOGGING config to route logs.
        </p>
        <CodeBlock
          code={`# Option A — simplest: init in manage.py
#!/usr/bin/env python
import os
import sys

def main():
    from sentry_logger import init
    init()  # before Django setup

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)

if __name__ == "__main__":
    main()`}
          language="python"
          filename="manage.py"
        />
        <CodeBlock
          code={`# Option B — wsgi.py / asgi.py (for production servers)
import os
from sentry_logger import init
init()

from django.core.wsgi import get_wsgi_application
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
application = get_wsgi_application()`}
          language="python"
          filename="wsgi.py"
        />
        <CodeBlock
          code={`# Option C — via Django LOGGING settings (advanced)
# settings.py
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}
# Then in your app startup:
# from sentry_logger import init; init()`}
          language="python"
          filename="settings.py"
        />
        <Callout type="tip">
          Use named loggers per Django app to group logs by service in your dashboard:{" "}
          <IC>logging.getLogger("myapp.views")</IC>
        </Callout>
      </div>
    ),
    script: (
      <div className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed">
          Works perfectly for standalone scripts, Celery workers, cron jobs, or any long-running Python process.
        </p>
        <CodeBlock
          code={`from sentry_logger import init
import logging
import time

init()

logger = logging.getLogger("data-processor")

def process_batch(batch_id: int):
    logger.info("Starting batch %d", batch_id)
    try:
        # ... your processing logic ...
        logger.info("Batch %d completed successfully", batch_id)
    except Exception as e:
        logger.error("Batch %d failed: %s", batch_id, e, exc_info=True)
        raise

if __name__ == "__main__":
    while True:
        for i in range(10):
            process_batch(i)
        logger.info("All batches done, sleeping 60s")
        time.sleep(60)`}
          language="python"
          filename="worker.py"
        />
        <Callout type="info">
          For Celery, call <IC>init()</IC> in your <IC>celery.py</IC> app config file, before tasks are imported. Each worker process will initialize independently.
        </Callout>
        <CodeBlock
          code={`# celery.py
from sentry_logger import init
init()

from celery import Celery
app = Celery("myproject")
app.config_from_object("django.conf:settings", namespace="CELERY")`}
          language="python"
          filename="celery.py"
        />
      </div>
    ),
  }

  return (
    <div className="space-y-5">
      {/* Framework picker */}
      <div className="flex flex-wrap gap-2">
        {FRAMEWORKS.map((fw) => (
          <button
            key={fw.id}
            type="button"
            onClick={() => setActive(fw.id)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border transition-all",
              active === fw.id
                ? "border-blue-500/50 bg-blue-600/15 text-blue-300"
                : "border-zinc-700 bg-zinc-900/50 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
            )}
          >
            {fw.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-5">
        {content[active]}
      </div>

      {/* Service grouping */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-700 bg-zinc-900">
          <IconCode className="size-4 text-blue-400 shrink-0" />
          <h3 className="text-sm font-bold text-white">Service Grouping</h3>
          <Badge variant="secondary" className="ml-auto text-xs">All frameworks</Badge>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-zinc-300">
            Name your loggers after services to group them on the dashboard. Each unique logger name becomes a service tab.
          </p>
          <CodeBlock
            code={`import logging

# These appear as separate service groups on your dashboard:
payment_logger = logging.getLogger("PaymentService")
auth_logger    = logging.getLogger("AuthService")
db_logger      = logging.getLogger("DatabaseLayer")

payment_logger.warning("Retry attempt 2 for order #4821")
auth_logger.error("Invalid token from IP 1.2.3.4")
db_logger.critical("Connection pool exhausted")`}
            language="python"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────
export default function SetupPage() {
  const [activeTab, setActiveTab] = useState<TabId>("cli")

  const tabContent: Record<TabId, React.ReactNode> = {
    cli: <CliTab />,
    docker: <DockerTab />,
    env: <EnvTab />,
    frameworks: <FrameworksTab />,
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* ── Header ──────────────────────────────────── */}
      <div className="px-4 pt-6 pb-5 lg:px-8 border-b border-zinc-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Setup Guide</h1>
            <p className="mt-1.5 text-sm text-zinc-400 max-w-xl">
              Get logs flowing from your Python app to your dashboard in under 3 minutes.{" "}
              <span className="text-zinc-300">Choose your setup method below.</span>
            </p>
          </div>
          <Badge className="hidden sm:flex shrink-0 mt-1 gap-1.5 bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
            <IconCheck className="size-3.5" />
            Python 3.8+
          </Badge>
        </div>

        {/* ── Tabs ──────────────────────────────────── */}
        <div className="flex gap-0.5 mt-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap rounded-t-lg",
                activeTab === tab.id
                  ? "text-white bg-zinc-800 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-blue-400 after:rounded-t"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
              )}
            >
              <tab.icon className={cn("size-4 shrink-0", activeTab === tab.id ? "text-blue-400" : "")} />
              {tab.label}
              {tab.badge && (
                <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────── */}
      <div className="px-4 py-7 lg:px-8 max-w-3xl">
        {tabContent[activeTab]}
      </div>
    </div>
  )
}
