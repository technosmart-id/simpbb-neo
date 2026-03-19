"use client"

import * as React from "react"

import { NavMain } from "@/components/layouts/nav-main"
import { NavDeveloper } from "@/components/layouts/nav-developer"
import { NavUser } from "@/components/layouts/nav-user"
import { TeamSwitcher } from "@/components/layouts/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon, DatabaseIcon, LayoutDashboardIcon, FileIcon, HardDrive, Archive } from "lucide-react"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "App 1",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Kota ABC",
    },
    {
      name: "App 2",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Kota XXX",
    },
    {
      name: "App 3",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Kota XYZ",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "CRUD Example",
      url: "/crud-example",
      icon: (
        <DatabaseIcon
        />
      ),
    },
    {
      title: "File Manager",
      url: "/file-manager",
      icon: (
        <HardDrive
        />
      ),
    },
    {
      title: "Backups",
      url: "/backups",
      icon: (
        <Archive
        />
      ),
    },
    {
      title: "Menu",
      url: "#",
      icon: (
        <TerminalSquareIcon
        />
      ),
      items: [
        {
          title: "Sub Menu 1",
          url: "#",
        },
        {
          title: "Sub Menu 2",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDeveloper />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
