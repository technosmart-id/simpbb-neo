"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NopDisplay } from "@/components/nop/nop-display"
import { format } from "date-fns"
import { id as idLocale } from "date-fns/locale"
import { type NopParts, formatNop } from "@/lib/utils/nop"

/**
 * Sortable column header helper
 */
export function SortableHeader({ column, label }: { column: any; label: string }) {
  return (
    <Button
      variant="ghost"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  )
}

/**
 * Format a number as Indonesian Rupiah currency
 */
export function formatRupiah(value: number | string | null | undefined): string {
  if (value == null) return "Rp 0"
  const num = typeof value === "string" ? parseFloat(value) : value
  if (isNaN(num)) return "Rp 0"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Format a date for display
 */
export function formatTanggal(
  value: Date | string | null | undefined,
  formatStr: string = "dd MMM yyyy",
): string {
  if (!value) return "-"
  const date = typeof value === "string" ? new Date(value) : value
  return format(date, formatStr, { locale: idLocale })
}

/**
 * NOP display cell — renders formatted NOP from row data with NOP columns
 */
export function nopCell<T extends NopParts>(): Partial<ColumnDef<T, unknown>> {
  return {
    cell: ({ row }) => {
      const parts: NopParts = {
        kdPropinsi: row.getValue("kdPropinsi") ?? (row.original as any).kdPropinsi,
        kdDati2: row.getValue("kdDati2") ?? (row.original as any).kdDati2,
        kdKecamatan: row.getValue("kdKecamatan") ?? (row.original as any).kdKecamatan,
        kdKelurahan: row.getValue("kdKelurahan") ?? (row.original as any).kdKelurahan,
        kdBlok: row.getValue("kdBlok") ?? (row.original as any).kdBlok,
        noUrut: row.getValue("noUrut") ?? (row.original as any).noUrut,
        kdJnsOp: row.getValue("kdJnsOp") ?? (row.original as any).kdJnsOp,
      }
      return <NopDisplay parts={parts} />
    },
  }
}

/**
 * Currency cell — displays value as Rupiah
 */
export function rupiahCell(accessorKey: string): Partial<ColumnDef<any, unknown>> {
  return {
    cell: ({ row }) => {
      const value = row.getValue(accessorKey) as string | number
      return <span className="font-mono text-sm">{formatRupiah(value)}</span>
    },
  }
}

/**
 * Date cell — displays formatted date
 */
export function tanggalCell(
  accessorKey: string,
  formatStr?: string,
): Partial<ColumnDef<any, unknown>> {
  return {
    cell: ({ row }) => {
      const value = row.getValue(accessorKey) as string | Date
      return <span className="text-sm">{formatTanggal(value, formatStr)}</span>
    },
  }
}
