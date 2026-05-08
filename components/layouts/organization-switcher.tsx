"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { orpcClient } from "@/lib/orpc/client"
import { authClient } from "@/lib/auth/client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, PlusIcon, Building2Icon, CheckIcon } from "lucide-react"

interface Organization {
  id: string
  name: string
  slug: string
  logo: string | null
  role: string
}

export function OrganizationSwitcher() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [activeOrganizationId, setActiveOrganizationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch session and conditionally fetch organizations
  useEffect(() => {
    authClient.getSession({
      fetchOptions: {
        onSuccess: (ctx) => {
          setActiveOrganizationId(ctx.data?.session?.activeOrganizationId ?? null)
          if (ctx.data?.user) {
            fetchOrganizations()
          } else {
            setIsLoading(false)
          }
        },
        onError: () => setIsLoading(false)
      },
    })
  }, [])

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      const result = await (orpcClient as any).organizations.list()
      setOrganizations(result.organizations)

      // User has no organizations - redirect to create one
      if (result.organizations.length === 0) {
        router.push('/settings/organizations?create=true')
        setIsLoading(false)
        return
      }

      // Use active org from API, or if null, use the first org
      const activeId = result.activeOrganizationId ?? result.organizations[0]?.id ?? null
      setActiveOrganizationId(activeId)

      // Auto-set first org as active if none is set
      if (!result.activeOrganizationId && result.organizations[0]?.id) {
        try {
          await (orpcClient as any).organizations.setActive({ organizationId: result.organizations[0].id })
        } catch {
          // Ignore error, user can set it manually
        }
      }
    } catch (error) {
      console.warn("Failed to fetch organizations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchOrganization = async (orgId: string) => {
    try {
      await (orpcClient as any).organizations.setActive({ organizationId: orgId })
      setActiveOrganizationId(orgId)
      router.refresh()
    } catch (error) {
      console.error("Failed to switch organization:", error)
    }
  }


  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2Icon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // No organizations - show empty state
  if (organizations.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2Icon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">No Organizations</span>
              <span className="truncate text-xs text-muted-foreground">Create one to get started</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const activeOrg = organizations.find((org) => org.id === activeOrganizationId)

  if (organizations.length === 1) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default hover:bg-transparent hover:text-inherit">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2Icon className="size-4 shrink-0" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {activeOrg?.name ?? organizations[0].name}
              </span>
              <span className="truncate text-xs text-muted-foreground capitalize">
                {activeOrg ? activeOrg.role : organizations[0].role}
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Building2Icon className="size-4 shrink-0" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {activeOrg?.name ?? "No Organization"}
                </span>
                <span className="truncate text-xs text-muted-foreground capitalize">
                  {activeOrg ? activeOrg.role : "Select an organization"}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org, index) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleSwitchOrganization(org.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Building2Icon className="size-4 shrink-0" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{org.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {org.role} • {org.slug}
                  </span>
                </div>
                {org.id === activeOrganizationId && (
                  <CheckIcon className="size-4 text-green-500" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
