"use client"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Code2Icon, BookOpenIcon, DatabaseIcon, ExternalLinkIcon } from "lucide-react"

const developerLinks = [
  {
    name: "Auth API",
    url: "/api/auth/reference",
    icon: <BookOpenIcon className="h-4 w-4" />,
  },
  {
    name: "App API",
    url: "/api/reference",
    icon: <Code2Icon className="h-4 w-4" />,
  },
  {
    name: "Database",
    url: "https://local.drizzle.studio/",
    icon: <DatabaseIcon className="h-4 w-4" />,
  },
]

export function NavDeveloper() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Developer</SidebarGroupLabel>
      <SidebarMenu>
        {developerLinks.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.icon}
                <span>{item.name}</span>
                <ExternalLinkIcon className="ml-auto h-4 w-4 text-muted-foreground" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
