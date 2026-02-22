"use client"

import {
  IconLayoutDashboard,
  IconCirclePlus,
  IconRocket,
} from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"

export function NavMain() {
  const router = useRouter()
  const pathname = usePathname()

  function isActive(path: string) {
    return pathname === path
  }

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: IconLayoutDashboard, accent: "blue" },
    { label: "Add App", path: "/register", icon: IconCirclePlus, accent: "violet" },
    { label: "Setup Guide", path: "/setup", icon: IconRocket, accent: "emerald" },
  ] as const

  const accentClasses: Record<string, { active: string; hover: string }> = {
    blue: { active: "bg-blue-600/20 text-blue-300 border border-blue-500/30", hover: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60" },
    violet: { active: "bg-violet-600/20 text-violet-300 border border-violet-500/30", hover: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60" },
    emerald: { active: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30", hover: "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60" },
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Navigation
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {navItems.map(({ label, path, icon: Icon, accent }) => {
            const active = isActive(path)
            const classes = accentClasses[accent]
            return (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton
                  onClick={() => router.push(path)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-150
                    ${active ? classes.active : classes.hover}`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
