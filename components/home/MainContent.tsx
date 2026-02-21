"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { SectionCards } from "@/components/dashboard/section-cards"
import { IconCirclePlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { backendAPI } from "@/lib/api/backend-api"

export function MainContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const [appCount, setAppCount] = useState<number | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      backendAPI.getApps(session.user.id)
        .then((apps) => setAppCount(apps.length))
        .catch(() => setAppCount(null))
    }
  }, [session?.user?.id])

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="@container/main flex flex-1 flex-col">

        {/* ── Page header ──────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-7 pb-5 lg:px-6">
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-bold text-zinc-100">Your Apps</h1>
            {appCount !== null && appCount > 0 && (
              <span className="text-sm font-medium text-zinc-600">{appCount}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 active:scale-95 transition-all"
          >
            <IconCirclePlus className="size-4" />
            Add App
          </button>
        </div>

        {/* ── App cards ────────────────────────────────── */}
        <div className="pb-8">
          <SectionCards />
        </div>

      </div>
    </div>
  )
}
