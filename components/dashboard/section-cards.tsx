import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import type { App } from "@/lib/api/backend-api"
import Link from "next/link"
import { IconExternalLink, IconTrash } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { backendAPI } from "@/lib/api/backend-api"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Button } from "@/components/ui/button"
import { IconFolderCode } from "@tabler/icons-react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { usePathname, useRouter } from "next/navigation"

export function SectionCards() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      setLoading(true)
      backendAPI
        .getApps(session.user.id)
        .then((data) => setApps(data))
        .catch((error) => console.error("Failed to load apps:", error))
        .finally(() => setLoading(false))
    }
  }, [session?.user?.id])

  const handleDelete = async (appId: string) => {
    const userId = session?.user?.id
    if (!userId) return
    setDeletingId(appId)
    try {
      await backendAPI.deleteApp(appId, userId)
      setApps((prev) => prev.filter((app) => app.id !== appId))
    } catch (err) {
      console.error('Failed to delete app:', err)
      // Optionally show a toast error
    } finally {
      setDeletingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    if (!confirmId) return
    await handleDelete(confirmId)
    setConfirmId(null)
  }

  // Show 4 loading cards as placeholders
  const loadingCards = Array(4).fill(null)

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {loading ? (
        loadingCards.map((_, idx) => (
          <Card className="@container/card animate-pulse" key={idx}>
            <CardHeader>
              <CardDescription className="w-2/3 h-4 mb-2 rounded bg-zinc-800/40" />
              <CardTitle className="w-1/2 h-8 rounded bg-zinc-800/60" />
              <CardAction>
                <Badge variant="outline" className="w-20 h-6 bg-zinc-800/30" />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="w-1/2 h-4 mb-1 rounded bg-zinc-800/30" />
              <div className="w-1/3 h-3 rounded bg-zinc-800/20" />
            </CardFooter>
          </Card>
        ))
      ) : apps.length === 0 ? (
        <div className="flex items-center justify-center py-12 col-span-full">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconFolderCode />
              </EmptyMedia>
              <EmptyTitle>No Apps Registered Yet</EmptyTitle>
              <EmptyDescription>
                You haven't registered any apps yet. Get started by creating your first app.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button 
                 onClick={() => router.push("/register")}>Add App</Button>
              </div>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        apps.map((app, idx) => (
          <Link
            href={`/my-app/${app.id}`}
            key={app.id}
            className="relative block group focus:outline-none"
            tabIndex={0}
            aria-label={`View details for ${app.name}`}
            onClick={e => {
              // Prevent navigation if the delete dialog is open
              if (confirmId === app.id) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <Card className="@container/card relative pointer-events-auto">
              <CardHeader>
                <CardDescription>
                  {app.description?.trim()
                    ? app.description
                    : `${session?.user?.name || "User"}'s ${idx + 1} app`}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {app.name}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="flex gap-2 font-medium line-clamp-1">
                  {/* You can add more info here if needed */}
                </div>
                {app.url && (
                  <Badge
                    variant="outline"
                    className="relative z-30 mt-1"
                    onClick={e => e.stopPropagation()}
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      className="flex items-center gap-1 cursor-pointer text-violet-400 hover:underline"
                      onClick={e => {
                        e.stopPropagation();
                        window.open(app.url, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      Live Link <IconExternalLink className="size-4" />
                    </span>
                  </Badge>
                )}
                <div className="text-muted-foreground">
                  {/* Optionally show more metadata */}
                </div>
              </CardFooter>
              {/* Delete button, opens confirmation dialog */}
              <Dialog open={confirmId === app.id} onOpenChange={(open) => !open && setConfirmId(null)}>
                <DialogTrigger asChild>
                  <button
                    className="absolute z-40 p-2 transition-opacity rounded-full shadow-lg opacity-0 top-3 right-3 group-hover:opacity-100 bg-zinc-900/80 text-zinc-400 hover:text-red-500"
                    title="Delete app"
                    disabled={deletingId === app.id}
                    onClick={e => { e.stopPropagation(); e.preventDefault(); setConfirmId(app.id); }}
                  >
                    <IconTrash className="size-5" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Delete App</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this app? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmDelete}
                      disabled={deletingId === app.id}
                    >
                      {deletingId === app.id ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Card>
          </Link>
        ))
      )}
    </div>
  )
}
