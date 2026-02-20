"use client"

import { useSession } from "next-auth/react"
import React, { useState } from "react"
import { backendAPI } from "@/lib/api/backend-api"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Spinner } from "@/components/ui/spinner"
import { IconCopy } from "@tabler/icons-react"

export function AddAppContent() {
  const { data: session } = useSession()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdApp, setCreatedApp] = useState<{ id: string; name: string; api_key: string } | null>(null)
  const [error, setError] = useState("")

  const isFormValid = name.trim() !== ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)
    setCreatedApp(null)
    
    if (!session?.user?.id) {
      setError("You must be logged in to create an app")
      setLoading(false)
      return
    }
    
    try {
      const data: any = await backendAPI.createApp({
        user_id: session.user.id,
        name: name.trim(),
        description: description.trim() || undefined,
      })
      setSuccess(true)
      setCreatedApp({ id: data.id, name: data.name, api_key: data.api_key })
      setName("")
      setDescription("")
      toast.success("App registered successfully! Copy your API key below.")
    } catch (err: any) {
      setError(err.message)
      toast.error(`${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  function copyApiKey() {
    if (createdApp?.api_key) {
      navigator.clipboard.writeText(createdApp.api_key)
      toast.success("API key copied to clipboard")
    }
  }

  const ingestBase = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8001"

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 bg-gradient-to-b from-black via-zinc-950 to-black">
      <div
        className="w-full max-w-2xl p-8 rounded-2xl border border-zinc-800/60 
        bg-gradient-to-t from-primary/5 to-zinc-900/80 
        shadow-[0_0_20px_-4px_rgba(0,0,0,0.4)] backdrop-blur-xl
        transition-all duration-300 hover:shadow-[0_0_35px_-8px_rgba(59,130,246,0.3)]"
      >
        <div className="flex flex-col items-center gap-3 mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
            Register Your App
          </h2>
        </div>
        {loading ? (
          <div className="flex flex-col w-full max-w-xs gap-4 mx-auto">
            <Item variant="muted">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">Registering app...</ItemTitle>
              </ItemContent>
            </Item>
          </div>
        ) : createdApp ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-700">
              <p className="mb-2 text-sm font-medium text-zinc-400">Your API Key (save it - shown once)</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 text-sm font-mono break-all rounded-lg bg-zinc-800 text-zinc-100">
                  {createdApp.api_key}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyApiKey}
                  className="shrink-0"
                >
                  <IconCopy className="size-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-700">
              <p className="mb-2 text-sm font-medium text-zinc-400">Install the SDK in your FastAPI app</p>
              <pre className="p-3 text-xs font-mono overflow-x-auto rounded-lg bg-zinc-950 text-zinc-300">
{`pip install sentry-logger
# Or from repo: pip install ./sdk/python

# In your FastAPI app (e.g. main.py):
from sentry_logger import init
init(api_key="${createdApp.api_key}", dsn="${ingestBase}")
`}
              </pre>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreatedApp(null)}
              className="w-full"
            >
              Add another app
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <FieldGroup>
              <FieldSet>
                <FieldLegend className="text-lg font-semibold text-zinc-200">
                  Application Details
                </FieldLegend>
                <FieldDescription className="mb-4 text-sm text-zinc-400">
                  Create an app to get an API key. Install the SDK in your backend to send logs to your dashboard.
                </FieldDescription>

                <FieldGroup className="space-y-5">
                  <Field>
                    <FieldLabel htmlFor="app-name">App Name</FieldLabel>
                    <Input
                      id="app-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter app name"
                      required
                      autoComplete="off"
                      className="transition-all bg-zinc-800/70 text-zinc-100 border-zinc-700 placeholder-zinc-500 focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="app-desc">Description (optional)</FieldLabel>
                    <Textarea
                      id="app-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Brief description"
                      className="transition-all resize-none bg-zinc-800/70 text-zinc-100 border-zinc-700 placeholder-zinc-500 focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
                      rows={3}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <FieldSeparator />

              <Field className="flex-row items-center gap-4 mt-4">
                <Button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className={`w-full py-2 rounded-xl bg-primary text-primary-foreground font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/40 ${isFormValid ? '' : 'pointer-events-none'}`}
                >
                  Register App
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}
      </div>
    </div>
  )
}
