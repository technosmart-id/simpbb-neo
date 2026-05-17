'use client'

import * as React from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Zap } from 'lucide-react'
import { getQuickActions, getRoleLabel } from '@/lib/dashboard/quick-actions'

export function QuickActionsBar() {
  const orpc = useORPC()
  const meQuery = useQuery(orpc.pengguna.me.queryOptions())

  const hakAkses = meQuery.data?.hakAkses ?? null
  const actions = getQuickActions(hakAkses)
  const roleLabel = getRoleLabel(hakAkses)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Aksi Cepat
        </CardTitle>
        {meQuery.isLoading ? (
          <Skeleton className="h-5 w-28" />
        ) : roleLabel ? (
          <Badge variant="secondary" className="text-xs">
            {roleLabel}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            Profil belum ditautkan
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {meQuery.isLoading ? (
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {actions.map((action) => (
              <Link
                key={action.url + action.title}
                href={action.url}
                className="group flex flex-col gap-1 rounded-md border border-border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-colors p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {action.icon}
                  </span>
                  <span className="text-sm font-medium">{action.title}</span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {action.description}
                </span>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
