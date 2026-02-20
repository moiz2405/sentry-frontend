"use client"

import { IconCirclePlusFilled } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"

export function NavMain() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-6 px-0 pb-2 mt-2 border shadow-xl rounded-2xl backdrop-blur-md border-zinc-800/60 bg-[oklch(0.205_0_0)]">
        <div className="px-6 pt-4 pb-2">
          <h2 className="text-xl font-bold tracking-tight text-white/90 drop-shadow-sm">
            Manage your apps
          </h2>
        </div>

        <SidebarMenu className="px-2 space-y-3">
          {/* Dashboard */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/")}
              className={`
                relative flex items-center gap-3 px-5 py-3 font-semibold transition-all duration-200 border border-transparent group rounded-xl
                ${isActive("/") 
                  ? "bg-gradient-to-r from-blue-600/90 to-blue-500/80 text-white shadow-lg border-blue-400/60" 
                  : "bg-zinc-900/60 text-zinc-200 hover:bg-blue-900/40 hover:text-white hover:shadow-md hover:border-blue-400/30"
                } backdrop-blur-xl
              `}
            >
              <IconCirclePlusFilled className={`mr-1.5 transition-transform duration-200 ${isActive("/") ? "scale-110" : "group-hover:scale-105"} text-white/80`} />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Add App */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/register")}
              className={`
                relative flex items-center gap-3 px-5 py-3 font-semibold transition-all duration-200 border border-transparent group rounded-xl
                ${isActive("/register") 
                  ? "bg-gradient-to-r from-violet-600/90 to-purple-500/80 text-white shadow-lg border-violet-400/60"
                  : "bg-zinc-900/60 text-zinc-200 hover:bg-violet-900/40 hover:text-white hover:shadow-md hover:border-violet-400/30"
                } backdrop-blur-xl
              `}
            >
              <IconCirclePlusFilled className={`mr-1.5 transition-transform duration-200 ${isActive("/register") ? "scale-110" : "group-hover:scale-105"} text-white/80`} />
              <span>Add App</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
