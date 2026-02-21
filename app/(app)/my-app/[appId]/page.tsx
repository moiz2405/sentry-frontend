"use client"

import { useEffect, useState, Suspense, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { IconChevronLeft, IconLayoutDashboard, IconSettings, IconMessageCircle } from "@tabler/icons-react"
import { AppScreen } from "@/components/appscreen/AppScreen"
import { AppSettings } from "@/components/appscreen/AppSettings"
import { LogChatPanel } from "@/components/appscreen/LogChatPanel"
import { backendAPI, type App } from "@/lib/api/backend-api"

type Tab = "dashboard" | "settings" | "ask"

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
      {/* ── App header ───────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-0 lg:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="All apps"
          >
            <IconChevronLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-zinc-100 truncate">{app.name}</h1>
            {app.description && (
              <p className="text-xs text-zinc-400 truncate">{app.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 mt-4 lg:px-6 border-b border-zinc-800">
        <TabButton
          active={tab === "dashboard"}
          onClick={() => setTab("dashboard")}
          icon={<IconLayoutDashboard className="size-4" />}
          label="Dashboard"
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
      <div className="flex-1 mt-4">
        {tab === "dashboard" && <AppScreen appId={appId} />}
        {tab === "ask" && (
          <div className="px-4 lg:px-6">
            <LogChatPanel appId={appId} />
          </div>
        )}
        {tab === "settings" && <AppSettings app={app} />}
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
