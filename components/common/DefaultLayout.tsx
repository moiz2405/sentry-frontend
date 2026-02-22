"use client";
import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { SiteHeader } from "@/components/dashboard/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { backendAPI } from "@/lib/api/backend-api"

export default function DefaultLayout({ children }: { children?: React.ReactNode }) {
  const { data: session, update } = useSession()

  // Belt-and-suspenders: ensure the user row exists in our DB every time
  // a session is established. The server-side auth callback does this too,
  // but silently swallows errors — this client-side call is the fallback.
  //
  // If the backend returns a different canonical id (stale UUID session),
  // patch the JWT via update() so subsequent API calls use the correct id.
  useEffect(() => {
    const u = session?.user
    // If we have a session but no user id the JWT is corrupt/stale — force re-auth
    if (session && !u?.id) {
      signOut({ callbackUrl: "/" })
      return
    }
    if (u?.id && u?.email) {
      backendAPI.syncUser({
        id: u.id,
        email: u.email,
        name: u.name ?? null,
        image: u.image ?? null,
      }).then((result) => {
        if (result?.id && result.id !== u.id) {
          update({ canonicalId: result.id })
        }
      }).catch(() => { })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 52)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
