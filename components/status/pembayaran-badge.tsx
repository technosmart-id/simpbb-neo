"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Payment status based on STATUS_PEMBAYARAN_SPPT field
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  "0": { label: "Belum Bayar", className: "border-red-500/50 text-red-600 bg-red-500/10" },
  "1": { label: "Lunas", className: "border-green-500/50 text-green-600 bg-green-500/10" },
  "2": { label: "Kurang Bayar", className: "border-yellow-500/50 text-yellow-600 bg-yellow-500/10" },
  "3": { label: "Lebih Bayar", className: "border-blue-500/50 text-blue-600 bg-blue-500/10" },
}

interface PembayaranBadgeProps {
  status: string | number
  className?: string
}

export function PembayaranBadge({ status, className }: PembayaranBadgeProps) {
  const config = STATUS_CONFIG[String(status)] ?? {
    label: `Status ${status}`,
    className: "",
  }

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}

/** Get all payment status options (for filter dropdowns) */
export function getPembayaranStatuses() {
  return Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value,
    label: config.label,
  }))
}
