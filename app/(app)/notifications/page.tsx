"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { Bell, Check, Trash2, Info, CheckCircle2, AlertTriangle, AlertCircle, Loader2, MoreVertical, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/client"

export default function NotificationsPage() {
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const [page, setPage] = React.useState(0)
  const limit = 20

  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  // Unread Count Query
  const { data: countData } = useQuery(orpc.notifications.unreadCount.queryOptions())
  const unreadCount = countData?.count ?? 0

  // Notifications List Query
  const { data: listData, isLoading, refetch } = useQuery(
    orpc.notifications.list.queryOptions({
      input: {
        limit,
        offset: page * limit
      },
    })
  )

  // Mutations
  const markReadMutation = useMutation(orpc.notifications.markAsRead.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.notifications.unreadCount.key() })
      refetch()
    },
  }))

  const deleteMutation = useMutation(orpc.notifications.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.notifications.unreadCount.key() })
      refetch()
    },
  }))


  const handleMarkAllRead = () => {
    markReadMutation.mutate({})
  }

  const totalPages = Math.ceil((listData?.total ?? 0) / limit)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            Manage your alerts and stay updated with everything happening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markReadMutation.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Alerts</CardTitle>
            <Badge className="bg-[#ff4500] hover:bg-[#ff4500] border-none text-white font-bold">{unreadCount} unread</Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : !listData?.rows.length ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
              <Bell className="size-16 text-muted-foreground/20 mb-4" />
              <h3 className="text-xl font-semibold">Nothing to see here</h3>
              <p className="text-muted-foreground text-sm max-w-sm mt-2">
                We&apos;ll let you know when something important happens. In the meantime, enjoy the silence.
              </p>
            </div>
          ) : (
            <div className="divide-y text-sm">
              {listData.rows.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex flex-col md:flex-row gap-4 p-6 transition-colors relative group hover:bg-muted/30",
                    n.link && "cursor-pointer"
                  )}
                >
                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={cn(
                        "text-base transition-colors w-fit",
                        !n.isRead ? "font-bold text-foreground" : "font-normal text-foreground/70 border-b border-foreground/20 pb-0.5"
                      )}>
                        {n.title}
                      </h4>
                      <span className="text-xs text-foreground/50 whitespace-nowrap ml-4">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3">
                      {n.message}
                    </p>
                    {n.link && (
                      <div className="mt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 font-medium"
                          asChild
                        >
                          <Link href={n.link}>View Details</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 flex md:flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-green-500"
                        title="Mark as read"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          markReadMutation.mutate({ id: n.id })
                        }}
                        disabled={markReadMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Delete notification"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        deleteMutation.mutate({ id: n.id })
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {n.link && (
                    <Link
                      href={n.link}
                      className="absolute inset-0 z-0"
                      onClick={() => !n.isRead && markReadMutation.mutate({ id: n.id })}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
        {totalPages > 1 && (
          <CardFooter className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {page * limit + 1} - {Math.min((page + 1) * limit, listData?.total ?? 0)} of {listData?.total} notifications
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
