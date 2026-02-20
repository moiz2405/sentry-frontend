"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  IconCopy,
  IconCheck,
  IconRefresh,
  IconEye,
  IconEyeOff,
  IconAlertTriangle,
  IconTrash,
} from "@tabler/icons-react"
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
import { Separator } from "@/components/ui/separator"
import { backendAPI, type App } from "@/lib/api/backend-api"

interface AppSettingsProps {
  app: App
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
    >
      {copied ? <IconCheck className="size-3.5 text-green-400" /> : <IconCopy className="size-3.5" />}
      {copied ? "Copied!" : label}
    </button>
  )
}

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-zinc-100">{title}</h3>
      {description && <p className="mt-0.5 text-sm text-zinc-400">{description}</p>}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-32 shrink-0 text-sm text-zinc-400">{label}</span>
      <div className="flex items-center gap-2 min-w-0">{children}</div>
    </div>
  )
}

export function AppSettings({ app: initialApp }: AppSettingsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [app, setApp] = useState<App>(initialApp)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [rotateOpen, setRotateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const userId = session?.user?.id

  const maskedKey = app.api_key
    ? `${app.api_key.slice(0, 5)}${"•".repeat(28)}`
    : "—"

  const displayedKey = apiKeyVisible ? app.api_key : maskedKey

  async function handleRotate() {
    if (!userId) return
    setRotating(true)
    try {
      const { api_key } = await backendAPI.rotateApiKey(app.id, userId)
      setApp((prev) => ({ ...prev, api_key }))
      setApiKeyVisible(true)
      setRotateOpen(false)
      toast.success("API key rotated. Copy your new key — it won't be shown again.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to rotate key")
    } finally {
      setRotating(false)
    }
  }

  async function handleDelete() {
    if (!userId) return
    setDeleting(true)
    try {
      await backendAPI.deleteApp(app.id, userId)
      toast.success(`"${app.name}" deleted.`)
      router.push("/")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete app")
      setDeleting(false)
    }
  }

  const createdAt = new Date(app.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">

      {/* ── General ──────────────────────────────────── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <SectionHeading title="General" />
        <div className="space-y-4">
          <Row label="App name">
            <span className="text-sm font-medium text-zinc-100">{app.name}</span>
          </Row>
          {app.description && (
            <Row label="Description">
              <span className="text-sm text-zinc-300">{app.description}</span>
            </Row>
          )}
          <Row label="App ID">
            <code className="text-xs font-mono text-zinc-400 truncate max-w-[200px]">{app.id}</code>
            <CopyButton text={app.id} label="Copy ID" />
          </Row>
          <Row label="Created">
            <span className="text-sm text-zinc-300">{createdAt}</span>
          </Row>
        </div>
      </section>

      {/* ── API Key ──────────────────────────────────── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <SectionHeading
          title="API Key"
          description="Used by the SDK to authenticate log ingestion. Keep it secret."
        />

        <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-sm">
          <span className="flex-1 truncate text-zinc-200 select-all">{displayedKey}</span>
          <button
            type="button"
            onClick={() => setApiKeyVisible((v) => !v)}
            className="shrink-0 p-1.5 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
            title={apiKeyVisible ? "Hide key" : "Reveal key"}
          >
            {apiKeyVisible ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
          </button>
          <CopyButton text={app.api_key} label="Copy" />
        </div>

        <p className="mt-3 text-xs text-zinc-500 flex items-start gap-1.5">
          <IconAlertTriangle className="size-3.5 mt-0.5 shrink-0 text-yellow-500" />
          Anyone with this key can send logs to your dashboard. Rotate it immediately if compromised.
        </p>

        <div className="mt-4">
          <Dialog open={rotateOpen} onOpenChange={setRotateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <IconRefresh className="size-4" />
                Rotate Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rotate API key?</DialogTitle>
                <DialogDescription>
                  A new key will be generated and the current key will stop working immediately.
                  Any running instances using the old key will need to be updated.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleRotate}
                  disabled={rotating}
                >
                  {rotating ? "Rotating…" : "Yes, rotate key"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* ── SDK setup snippet ─────────────────────────── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <SectionHeading
          title="SDK Setup"
          description="Add this to your Python app to start sending logs."
        />
        <div className="relative group">
          <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed whitespace-pre">
{`from sentry_logger import init

init(
    api_key="${app.api_key}",
    dsn="${(process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.sentrylabs.live").replace(/\/$/, "")}",
)`}
          </pre>
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton
              text={`from sentry_logger import init\n\ninit(\n    api_key="${app.api_key}",\n    dsn="${(process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://api.sentrylabs.live").replace(/\/$/, "")}",\n)`}
              label="Copy"
            />
          </div>
        </div>
      </section>

      {/* ── Danger zone ──────────────────────────────── */}
      <section className="rounded-xl border border-red-900/40 bg-red-950/10 p-6">
        <SectionHeading
          title="Danger Zone"
          description="Irreversible actions. Proceed with caution."
        />
        <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-zinc-800 bg-zinc-900/40">
          <div>
            <p className="text-sm font-medium text-zinc-200">Delete this app</p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Permanently deletes the app and all its logs. This cannot be undone.
            </p>
          </div>
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2 shrink-0 ml-4">
                <IconTrash className="size-4" />
                Delete App
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete &ldquo;{app.name}&rdquo;?</DialogTitle>
                <DialogDescription>
                  This will permanently delete the app and all its logs and summaries.
                  This action cannot be undone.
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
      </section>

    </div>
  )
}
