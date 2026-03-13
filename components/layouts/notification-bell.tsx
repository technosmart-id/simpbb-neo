"use client"

import * as React from "react"
import { Bell, Check, Loader2, Trash2, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { authClient } from "@/lib/auth/client"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export function NotificationBell() {
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = React.useState(false)

  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  // Unread Count Query
  const { data: countData } = useQuery(orpc.notifications.unreadCount.queryOptions())
  const unreadCount = countData?.count ?? 0

  // Notifications List Query
  const { data: listData, isLoading, refetch } = useQuery(
    orpc.notifications.list.queryOptions({
      input: { limit: 20 },
      enabled: isOpen, // Only fetch when open
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

  // SSE Real-time logic
  React.useEffect(() => {
    if (!userId) return

    const eventSource = new EventSource("/api/notifications/events")

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      // Show toast if not suppressed
      if (!data.suppressToast) {
        toast(data.title, {
          description: data.message,
          action: data.link ? {
            label: "View",
            onClick: () => window.location.href = data.link
          } : undefined
        })
      }

      // Invalidate count
      queryClient.invalidateQueries({ queryKey: orpc.notifications.unreadCount.key() })

      // If popover is open, refetch the list
      if (isOpen) {
        refetch()
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [userId, queryClient, isOpen, refetch, orpc.notifications.unreadCount])

  const handleMarkAllRead = () => {
    markReadMutation.mutate({})
  }


  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-[10px] animate-in zoom-in bg-[#ff4500] hover:bg-[#ff4500] border-none text-white font-bold"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground font-medium cursor-pointer"
              onClick={handleMarkAllRead}
              disabled={markReadMutation.isPending}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !listData?.rows.length ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <Bell className="size-10 text-muted-foreground/20 mb-2" />
              <p className="text-base text-muted-foreground font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No new notifications for you right now.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {listData.rows.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex flex-col gap-1 p-4 transition-colors relative group hover:bg-muted/50",
                    n.link && "cursor-pointer"
                  )}
                >
                  <div className="flex gap-2 items-start relative z-10">
                    <div className="flex-1 space-y-1">
                      <h5 className={cn(
                        "text-xs leading-none transition-colors w-fit",
                        !n.isRead ? "font-bold text-foreground" : "font-normal text-foreground/70 border-b border-foreground/20 pb-0.5"
                      )}>
                        {n.title}
                      </h5>
                      <p className="text-xs text-foreground/90 line-clamp-2">
                        {n.message}
                      </p>
                      <p className="text-xs tabular-nums text-foreground/50">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-green-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            markReadMutation.mutate({ id: n.id })
                          }}
                        >
                          <Check className="size-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMutation.mutate({ id: n.id })
                        }}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
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
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Button variant="ghost" className="w-full text-xs justify-center text-muted-foreground" size="sm" asChild onClick={() => setIsOpen(false)}>
            <Link href="/notifications">
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
