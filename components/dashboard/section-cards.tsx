"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconSettings,
  IconTrash,
  IconFolderCode,
  IconLoader2,
  IconPlus,
  IconExternalLink,
} from "@tabler/icons-react"
import { backendAPI, type App } from "@/lib/api/backend-api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

// ── Palette ───────────────────────────────────────────────────────────────────

const PALETTE = [
  { hex: "#3b82f6", tw: "from-blue-500/20 to-blue-500/5",    text: "text-blue-300",    ring: "ring-blue-500/30"    },
  { hex: "#8b5cf6", tw: "from-violet-500/20 to-violet-500/5", text: "text-violet-300",  ring: "ring-violet-500/30"  },
  { hex: "#10b981", tw: "from-emerald-500/20 to-emerald-500/5",text: "text-emerald-300", ring: "ring-emerald-500/30" },
  { hex: "#f97316", tw: "from-orange-500/20 to-orange-500/5", text: "text-orange-300",  ring: "ring-orange-500/30"  },
  { hex: "#f43f5e", tw: "from-rose-500/20 to-rose-500/5",     text: "text-rose-300",    ring: "ring-rose-500/30"    },
  { hex: "#06b6d4", tw: "from-cyan-500/20 to-cyan-500/5",     text: "text-cyan-300",    ring: "ring-cyan-500/30"    },
  { hex: "#f59e0b", tw: "from-amber-500/20 to-amber-500/5",   text: "text-amber-300",   ring: "ring-amber-500/30"   },
  { hex: "#ec4899", tw: "from-pink-500/20 to-pink-500/5",     text: "text-pink-300",    ring: "ring-pink-500/30"    },
]

function paletteFor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

function timeAgo(dateStr: string) {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (d === 0) return "today"
  if (d === 1) return "yesterday"
  if (d < 30)  return `${d}d ago`
  const m = Math.floor(d / 30)
  return m < 12 ? `${m}mo ago` : `${Math.floor(m / 12)}y ago`
}

// ── AppCard ───────────────────────────────────────────────────────────────────

function AppCard({ app, onDeleted }: { app: App; onDeleted: (id: string) => void }) {
  const { data: session } = useSession()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const p = paletteFor(app.name)
  const initials = app.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "AP"

  async function handleDelete() {
    const userId = session?.user?.id
    if (!userId) return
    setDeleting(true)
    try {
      await backendAPI.deleteApp(app.id, userId)
      onDeleted(app.id)
    } catch { /* ignore */ }
    finally { setDeleting(false); setDeleteOpen(false) }
  }

  return (
    <div className="group relative flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all duration-200 hover:shadow-xl hover:shadow-black/30 overflow-hidden">

      {/* Clickable body */}
      <Link href={`/my-app/${app.id}`} className="flex flex-col p-5 gap-4 flex-1 focus-visible:outline-none">

        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${p.tw} ring-1 ${p.ring} flex items-center justify-center shrink-0`}>
          <span className={`text-sm font-bold ${p.text}`}>{initials}</span>
        </div>

        {/* Name + meta */}
        <div className="min-w-0">
          <h3 className="font-semibold text-zinc-100 text-base leading-snug truncate">
            {app.name}
          </h3>
          {app.description ? (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
              {app.description}
            </p>
          ) : app.url ? (
            <p className="text-xs text-zinc-600 mt-1 truncate">{app.url}</p>
          ) : null}
        </div>

      </Link>

      {/* Footer — always visible */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800/60">
        <span className="text-xs text-zinc-600">{timeAgo(app.created_at)}</span>

        <div className="flex items-center gap-0.5">
          {app.url && (
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open URL"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-zinc-700 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              <IconExternalLink className="size-3.5" />
            </a>
          )}
          <Link
            href={`/my-app/${app.id}?tab=settings`}
            title="Settings"
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-md text-zinc-700 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            <IconSettings className="size-3.5" />
          </Link>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                title="Delete"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md text-zinc-700 hover:text-red-400 hover:bg-red-950/40 transition-colors"
              >
                <IconTrash className="size-3.5" />
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete &ldquo;{app.name}&rdquo;?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the app and all its logs. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><IconLoader2 className="size-3.5 animate-spin mr-1.5" />Deleting…</> : "Delete permanently"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

// ── Add card ──────────────────────────────────────────────────────────────────

function AddAppCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-800 hover:border-zinc-600 bg-transparent hover:bg-zinc-900/40 transition-all duration-200 min-h-[148px] cursor-pointer"
    >
      <div className="w-10 h-10 rounded-xl bg-zinc-800/60 group-hover:bg-zinc-700/60 flex items-center justify-center transition-colors">
        <IconPlus className="size-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
      </div>
      <span className="text-xs font-medium text-zinc-700 group-hover:text-zinc-400 transition-colors">
        New app
      </span>
    </button>
  )
}

// ── SectionCards ──────────────────────────────────────────────────────────────

export function SectionCards() {
  const router = useRouter()
  const { data: session } = useSession()
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      setLoading(true)
      backendAPI
        .getApps(session.user.id)
        .then(setApps)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
        {Array(3).fill(null).map((_, i) => (
          <div key={i} className="h-[148px] rounded-2xl border border-zinc-800/60 bg-zinc-900/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><IconFolderCode /></EmptyMedia>
            <EmptyTitle>No apps yet</EmptyTitle>
            <EmptyDescription>Register your first app to get an API key and start receiving logs.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => router.push("/register")}>Add your first app</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} onDeleted={(id) => setApps((p) => p.filter((a) => a.id !== id))} />
      ))}
      <AddAppCard onClick={() => router.push("/register")} />
    </div>
  )
}
