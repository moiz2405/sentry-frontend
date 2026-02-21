"use client"

import { useEffect, useState, Suspense, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { IconChevronLeft, IconLayoutDashboard, IconSettings, IconMessageCircle, IconAlertTriangle } from "@tabler/icons-react"
import { AppScreen } from "@/components/appscreen/AppScreen"
import { AppSettings } from "@/components/appscreen/AppSettings"
import { AnomalyPanel } from "@/components/appscreen/AnomalyPanel"
import { LogChatPanel } from "@/components/appscreen/LogChatPanel"
import { backendAPI, type App } from "@/lib/api/backend-api"

type Tab = "dashboard" | "anomalies" | "ask" | "settings"

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
        <div className="h-6 w-40 rounded bg-zinc-800" />
        <div className="h-10 w-64 rounded bg-zinc-800" />
        <div className="h-8 w-48 rounded bg-zinc-800" />
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

  return (
    <div className="flex flex-col min-h-0">
      {/* ── Tab bar (with back button inline) ────────── */}
      <div className="flex items-center gap-1 px-4 pt-2 lg:px-6 border-b border-zinc-800">
        <Link
          href="/dashboard"
          className="shrink-0 p-1.5 mr-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="All apps"
        >
          <IconChevronLeft className="size-4" />
        </Link>
        <TabButton
          active={tab === "dashboard"}
          onClick={() => setTab("dashboard")}
          icon={<IconLayoutDashboard className="size-4" />}
          label="Dashboard"
        />
        <TabButton
          active={tab === "anomalies"}
          onClick={() => setTab("anomalies")}
          icon={<IconAlertTriangle className="size-4" />}
          label="Anomalies"
        />
        <TabButton
          active={tab === "ask"}
          onClick={() => setTab("ask")}
          icon={<IconMessageCircle className="size-4" />}
          label="Ask"
        />
        <TabButton
          active={tab === "settings"}
          onClick={() => setTab("settings")}
          icon={<IconSettings className="size-4" />}
          label="Settings"
        />
      </div>

      {/* ── Tab content ──────────────────────────────── */}
      <div className={`flex-1 min-h-0 ${tab === "ask" ? "" : "mt-4"} ${tab === "anomalies" || tab === "ask" ? "px-4 lg:px-6" : ""}`}>
        {tab === "dashboard"  && <AppScreen appId={appId} />}
        {tab === "anomalies"  && <AnomalyPanel appId={appId} />}
        {tab === "ask"        && <LogChatPanel appId={appId} />}
        {tab === "settings"   && <AppSettings app={app} />}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
        ${active
          ? "border-blue-500 text-blue-400"
          : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
        }`}
    >
      {icon}
      {label}
    </button>
  )
}

export default function AppDetailPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = use(params)
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-4 p-6 animate-pulse">
          <div className="h-6 w-40 rounded bg-zinc-800" />
          <div className="h-10 w-64 rounded bg-zinc-800" />
        </div>
      }
    >
      <AppDetailContent appId={appId} />
    </Suspense>
  )
}
