"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  IconSettings,
  IconTrash,
  IconLayoutDashboard,
  IconFolderCode,
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function AppCard({
  app,
  onDeleted,
}: {
  app: App
  onDeleted: (id: string) => void
}) {
  const { data: session } = useSession()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    const userId = session?.user?.id
    if (!userId) return
    setDeleting(true)
    try {
      await backendAPI.deleteApp(app.id, userId)
      onDeleted(app.id)
    } catch {
      // silently ignore — toast handled elsewhere
    } finally {
      setDeleting(false)
      setDeleteOpen(false)
    }
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-150 overflow-hidden">
      {/* Main clickable area → Dashboard */}
      <Link
        href={`/my-app/${app.id}`}
        className="flex flex-col gap-2 p-5 flex-1 focus:outline-none"
      >
        {/* App name */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-zinc-100 leading-tight truncate">
            {app.name}
          </h3>
        </div>

        {/* Description */}
        {app.description ? (
          <p className="text-sm text-zinc-400 line-clamp-2 leading-snug">
            {app.description}
          </p>
        ) : (
          <p className="text-sm text-zinc-600 italic">No description</p>
        )}

        {/* Meta row */}
        <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-zinc-500 border-t border-zinc-800">
          <span>Created {timeAgo(app.created_at)}</span>
          <span className="ml-auto flex items-center gap-1 text-zinc-600">
            <IconLayoutDashboard className="size-3.5" />
            Dashboard
          </span>
        </div>
      </Link>

      {/* Action strip — visible on hover */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-zinc-800 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link
          href={`/my-app/${app.id}?tab=settings`}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <IconSettings className="size-3.5" />
          Settings
        </Link>

        <div className="ml-auto">
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
              >
                <IconTrash className="size-3.5" />
                Delete
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
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting…" : "Delete permanently"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}

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
        .then((apps) => {
          setApps(apps)
        })
        .catch((err) => console.error("Failed to load apps:", err))
        .finally(() => setLoading(false))
    }
  }, [session?.user?.id])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 lg:px-6">
        {Array(3)
          .fill(null)
          .map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse"
            />
          ))}
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconFolderCode />
            </EmptyMedia>
            <EmptyTitle>No apps yet</EmptyTitle>
            <EmptyDescription>
              Register your first app to get an API key and start receiving logs.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => router.push("/register")}>Add your first app</Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3 lg:px-6">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          onDeleted={(id) => setApps((prev) => prev.filter((a) => a.id !== id))}
        />
      ))}
    </div>
  )
}
