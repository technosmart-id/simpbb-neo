"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  "crud-example": "Books CRUD Example",
  notifications: "Notifications",
  settings: "Account Settings",
  ar: "AR Unit",
}

function isId(segment: string) {
  // Simple heuristic for internal IDs: 
  // - purely numeric
  // - uuid pattern
  // - very long hash-like strings (e.g. better-auth ids are often long random strings)
  return (
    /^\d+$/.test(segment) || 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
    segment.length > 20
  )
}

function formatLabel(segment: string) {
  if (routeLabels[segment]) return routeLabels[segment]
  
  // Fallback: Capitalize and replace hyphens
  return segment
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname()
  
  // Split path and filter out empty segments and IDs
  const segments = pathname
    .split("/")
    .filter(segment => segment !== "" && !isId(segment))

  // If we are just at the root (shouldn't really happen with (app) group, but still)
  if (segments.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`
          const isLast = index === segments.length - 1
          const label = formatLabel(segment)

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
