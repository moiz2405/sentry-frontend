"use client"

import { useEffect, useState, Suspense, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  IconChevronLeft,
  IconLayoutDashboard,
  IconSettings,
  IconMessageCircle,
  IconAlertTriangle,
  IconNetwork,
  IconFolderCode,
  IconDeviceDesktop,
  IconSparkles,
  IconClock,
  IconLock,
} from "@tabler/icons-react"
import { AppScreen } from "@/components/appscreen/AppScreen"
import { AppSettings } from "@/components/appscreen/AppSettings"
import { AnomalyPanel } from "@/components/appscreen/AnomalyPanel"
import { LogChatPanel } from "@/components/appscreen/LogChatPanel"
import { TracesUI } from "@/components/appscreen/TracesUI"
import { TopologyMap } from "@/components/appscreen/TopologyMap"
import { backendAPI, type App } from "@/lib/api/backend-api"

type Tab = "dashboard" | "anomalies" | "ask" | "traces" | "topology" | "settings"

// Tab definitions with purpose descriptions
const TABS: {
  id: Tab
  label: string
  shortDescription: string
  icon: React.ElementType
}[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      shortDescription: "Live service health & error rates",
      icon: IconLayoutDashboard,
    },
    {
      id: "anomalies",
      label: "Anomalies",
      shortDescription: "AI-detected issues that need attention",
      icon: IconAlertTriangle,
    },
    {
      id: "ask",
      label: "AI Assistant",
      shortDescription: "Ask anything about your logs in plain English",
      icon: IconSparkles,
    },
    {
      id: "traces",
      label: "Traces",
      shortDescription: "End-to-end request lifecycle across services",
      icon: IconNetwork,
    },
    {
      id: "topology",
      label: "Service Map",
      shortDescription: "Visual dependency map of your infrastructure",
      icon: IconFolderCode,
    },
    {
      id: "settings",
      label: "Settings",
      shortDescription: "API keys, integrations & app config",
      icon: IconSettings,
    },
  ]

function AppDetailContent({ appId }: { appId: string }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [app, setApp] = useState<App | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const tab: Tab = (searchParams.get("tab") as Tab) ?? "dashboard"

  function setTab(t: Tab) {
    const params = new URLSearchParams(searchParams.toString())
    if (t === "dashboard") {
      params.delete("tab")
    } else {
      params.set("tab", t)
    }
    const qs = params.toString()
    router.replace(`/my-app/${appId}${qs ? `?${qs}` : ""}`)
  }

  useEffect(() => {
    if (status === "loading") return
    const userId = session?.user?.id
    if (!userId) return

    setLoading(true)
    backendAPI
      .getApp(appId, userId)
      .then(setApp)
      .catch(() => setError("App not found"))
      .finally(() => setLoading(false))
  }, [appId, session?.user?.id, status])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6 animate-pulse">
        <div className="h-5 w-32 rounded bg-zinc-800" />
        <div className="h-8 w-48 rounded bg-zinc-800" />
        <div className="h-8 w-full rounded bg-zinc-800" />
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400 mb-4">{error || "App not found"}</p>
        <Link href="/dashboard" className="text-sm text-blue-400 hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const activeTabMeta = TABS.find(t => t.id === tab)

  return (
    <div className="flex flex-col min-h-0">

      {/* ── App header ────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 lg:px-6 border-b border-zinc-800/50">
        <Link
          href="/dashboard"
          className="shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="All apps"
        >
          <IconChevronLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[15px] font-bold text-zinc-100 truncate tracking-tight">{app.name}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          {activeTabMeta && (
            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{activeTabMeta.shortDescription}</p>
          )}
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-4 lg:px-6 border-b border-zinc-800 overflow-x-auto hide-scrollbar">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              title={t.shortDescription}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium border-b-2 transition-all whitespace-nowrap -mb-px
                ${active
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-zinc-600"
                }`}
            >
              <Icon className="size-3.5" />
              {t.label}
            </button>
          )
        })}

        {/* Coming Soon: Replay */}
        <div
          title="Session Replay is coming soon"
          className="flex items-center gap-1.5 px-3.5 py-2.5 text-[12px] font-medium border-b-2 border-transparent text-zinc-600 cursor-not-allowed whitespace-nowrap -mb-px select-none"
        >
          <IconDeviceDesktop className="size-3.5" />
          Replay
          <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">
            <IconLock className="size-2.5" />
            Soon
          </span>
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────── */}
      <div className={`flex-1 min-h-0 ${tab === "ask" ? "" : "mt-4"} ${tab === "anomalies" || tab === "ask" || tab === "traces" || tab === "topology" ? "px-4 lg:px-6" : ""}`}>
        {tab === "dashboard" && <AppScreen appId={appId} />}
        {tab === "anomalies" && <AnomalyPanel appId={appId} />}
        {tab === "ask" && <LogChatPanel appId={appId} />}
        {tab === "traces" && <TracesUI appId={appId} />}
        {tab === "topology" && <TopologyMap appId={appId} />}
        {tab === "settings" && <AppSettings app={app} />}
      </div>
    </div>
  )
}

export default function AppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = use(params)
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-6 animate-pulse">
          <div className="h-5 w-32 rounded bg-zinc-800" />
          <div className="h-10 w-64 rounded bg-zinc-800" />
        </div>
      }
    >
      <AppDetailContent appId={appId} />
    </Suspense>
  )
}
