"use client"

import { useSession } from "next-auth/react"
import { SectionCards } from "@/components/dashboard/section-cards"
import { IconCirclePlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

export function MainContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="@container/main flex flex-1 flex-col">

        {/* ── Page header ──────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-6 pb-4 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              Hey, {firstName} 👋
            </h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Here are all the apps sending logs to Sentry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-sm"
          >
            <IconCirclePlus className="size-4" />
            Add App
          </button>
        </div>

        {/* ── App cards ────────────────────────────────── */}
        <div className="flex flex-col gap-4 pb-8">
          <SectionCards />
        </div>

      </div>
    </div>
  )
}
