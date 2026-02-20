"use client"

import {
  IconDotsVertical,
  IconLogout,
} from "@tabler/icons-react"
import {signOut, useSession } from "next-auth/react"
import React from "react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser() {
  const { data: session } = useSession()
  const user = session?.user || {
    name: "Guest",
    email: "",
    image: ""
  }
  const { isMobile } = useSidebar()
  const [imgErrorMain, setImgErrorMain] = React.useState(false)
  const [imgErrorDropdown, setImgErrorDropdown] = React.useState(false)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="w-8 h-8 rounded-lg">
                <AvatarImage 
                  src={user.image && user.image.trim() !== "" && !imgErrorMain ? user.image : undefined} 
                  alt={user.name ?? "User"}
                  onError={() => setImgErrorMain(true)}
                  style={{ display: imgErrorMain ? 'none' : undefined }}
                />
                <AvatarFallback className="rounded-lg">{user.name ? user.name[0].toUpperCase() : "U"}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-sm leading-tight text-left">
                <span className="font-medium truncate">{user.name}</span>
                <span className="text-xs truncate text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="w-8 h-8 rounded-lg">
                  <AvatarImage 
                    src={user.image && user.image.trim() !== "" && !imgErrorDropdown ? user.image : undefined} 
                    alt={user.name ?? "User"}
                    onError={() => setImgErrorDropdown(true)}
                    style={{ display: imgErrorDropdown ? 'none' : undefined }}
                  />
                  <AvatarFallback className="rounded-lg">{user.name ? user.name[0].toUpperCase() : "U"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-medium truncate">{user.name}</span>
                  <span className="text-xs truncate text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
