"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"

import { NavMain } from "@/components/layouts/nav-main"
import { NavDeveloper } from "@/components/layouts/nav-developer"
import { NavUser } from "@/components/layouts/nav-user"
import { OrganizationSwitcher } from "@/components/layouts/organization-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, DatabaseIcon, LayoutDashboardIcon, FileIcon, HardDrive, Archive, Building2, Shield } from "lucide-react"

interface SessionUser {
  name: string
  email: string
  avatar: string | null
  role?: string | null
}

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  items?: {
    title: string
    url: string
  }[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<SessionUser>({
    name: "Loading...",
    email: "",
    avatar: null,
  })
  const [navMain, setNavMain] = useState<NavItem[]>([
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "CRUD Example",
      url: "/crud-example",
      icon: <DatabaseIcon />,
    },
    {
      title: "File Manager",
      url: "/file-manager",
      icon: <HardDrive />,
    },
    {
      title: "Backups",
      url: "/backups",
      icon: <Archive />,
    },
  ])

  useEffect(() => {
    // Fetch session data on mount
    authClient.getSession({
      fetchOptions: {
        onSuccess: (ctx) => {
          const sessionUser = ctx.data?.user
          if (sessionUser) {
            setUser({
              name: sessionUser.name,
              email: sessionUser.email,
              avatar: sessionUser.image,
              role: sessionUser.role,
            })
          }
        },
      },
    })
  }, [])

  const orgSettings = [
    {
      title: "Organizations",
      url: "/settings/organizations",
      icon: <Building2 />,
    },
    {
      title: "Roles",
      url: "/settings/roles",
      icon: <Shield />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDeveloper />
        <div className="mt-4">
          <NavMain items={orgSettings} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
