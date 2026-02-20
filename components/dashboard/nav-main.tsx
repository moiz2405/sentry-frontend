"use client"

import { useState } from "react"
import {
  IconLayoutDashboard,
  IconCirclePlus,
  IconTerminal2,
  IconPackage,
  IconCode,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"

const DSN = "https://api.sentrylabs.live"

const SETUP_STEPS = [
  {
    icon: IconPackage,
    label: "Install SDK",
    code: "pip install sentry-logger",
  },
  {
    icon: IconTerminal2,
    label: "Link your app",
    code: `sentry-logger init \\\n  --app-name "my-service" \\\n  --dsn "${DSN}"`,
  },
  {
    icon: IconCode,
    label: "Add to your code",
    code: `from sentry_logger import init\ninit()\n\nimport logging\nlogging.info("Logs flowing to Sentry!")`,
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1 rounded transition-colors text-zinc-500 hover:text-zinc-200"
      title="Copy"
    >
      {copied ? (
        <IconCheck className="size-3.5 text-green-400" />
      ) : (
        <IconCopy className="size-3.5" />
      )}
    </button>
  )
}

export function NavMain() {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path || (path === "/dashboard" && pathname === "/dashboard")

  return (
    <>
      {/* ── Navigation ─────────────────────────────────── */}
      <SidebarGroup>
        <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Navigation
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push("/dashboard")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-150
                  ${isActive("/dashboard")
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                  }`}
              >
                <IconLayoutDashboard className="size-4 shrink-0" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push("/register")}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-150
                  ${isActive("/register")
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                  }`}
              >
                <IconCirclePlus className="size-4 shrink-0" />
                <span>Add App</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* ── Quick Setup Guide ──────────────────────────── */}
      <SidebarGroup className="mt-2">
        <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Quick Setup
        </SidebarGroupLabel>
        <SidebarGroupContent className="px-2">
          <div className="flex flex-col gap-3">
            {SETUP_STEPS.map((step, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 overflow-hidden"
              >
                {/* Step header */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800">
                  <span className="flex items-center justify-center size-5 rounded-full bg-zinc-700 text-[10px] font-bold text-zinc-300 shrink-0">
                    {idx + 1}
                  </span>
                  <step.icon className="size-3.5 text-zinc-400 shrink-0" />
                  <span className="text-xs font-semibold text-zinc-300 truncate">
                    {step.label}
                  </span>
                </div>

                {/* Code block */}
                <div className="relative group">
                  <pre className="px-3 py-2.5 text-[11px] leading-relaxed text-zinc-300 font-mono whitespace-pre-wrap break-all overflow-x-auto scrollbar-none">
                    {step.code}
                  </pre>
                  <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton text={step.code} />
                  </div>
                </div>
              </div>
            ))}

            <p className="px-1 text-[11px] text-zinc-500 leading-relaxed">
              Or{" "}
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                onClick={() => router.push("/register")}
              >
                register manually
              </button>{" "}
              to get an API key from the web UI.
            </p>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}
