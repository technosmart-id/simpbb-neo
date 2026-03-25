"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// 6 pelayanan statuses per REQUIREMENTS.md BRK-34 to 41
const STATUS_CONFIG: Record<number, { label: string; variant: string; className: string }> = {
  1: { label: "Diterima", variant: "outline", className: "border-blue-500/50 text-blue-600 bg-blue-500/10" },
  2: { label: "Masuk Penilai", variant: "outline", className: "border-yellow-500/50 text-yellow-600 bg-yellow-500/10" },
  3: { label: "Masuk Penetapan", variant: "outline", className: "border-orange-500/50 text-orange-600 bg-orange-500/10" },
  4: { label: "Selesai", variant: "outline", className: "border-green-500/50 text-green-600 bg-green-500/10" },
  5: { label: "Terkonfirmasi WP", variant: "outline", className: "border-emerald-500/50 text-emerald-600 bg-emerald-500/10" },
  6: { label: "Ditunda", variant: "outline", className: "border-red-500/50 text-red-600 bg-red-500/10" },
}

interface PelayananBadgeProps {
  status: number
  className?: string
}

export function PelayananBadge({ status, className }: PelayananBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: `Status ${status}`,
    variant: "outline",
    className: "",
  }

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

/** Get all status options (for filter dropdowns) */
export function getPelayananStatuses() {
  return Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value: parseInt(value),
    label: config.label,
  }))
}
