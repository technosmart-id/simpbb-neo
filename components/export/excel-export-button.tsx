'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { type ExcelExportOptions } from '@/lib/utils/excel/exporter'

interface Props extends Omit<ExcelExportOptions, 'rows'> {
  getRows: () => Promise<Record<string, unknown>[]> | Record<string, unknown>[]
  label?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function ExcelExportButton({
  getRows,
  label = 'Export Excel',
  variant = 'outline',
  size = 'default',
  ...exportOptions
}: Props) {
  const [loading, setLoading] = React.useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const rows = await getRows()
      const { exportToExcel } = await import('@/lib/utils/excel/exporter')
      await exportToExcel({ ...exportOptions, rows })
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={loading}>
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {label}
    </Button>
  )
}
