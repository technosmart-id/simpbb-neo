'use client'

/**
 * Generic Excel exporter using ExcelJS.
 * Lazy-imported to avoid Turbopack SSR bundling issues.
 */

export interface ExcelColumn {
  header: string
  key: string
  width?: number
  style?: 'currency' | 'number' | 'date' | 'text'
}

export interface ExcelExportOptions {
  filename: string
  sheetName?: string
  title?: string
  subtitle?: string
  columns: ExcelColumn[]
  rows: Record<string, unknown>[]
}

function formatCellValue(value: unknown, style?: ExcelColumn['style']): unknown {
  if (value === null || value === undefined) return ''
  if (style === 'currency' || style === 'number') return Number(value) || 0
  if (style === 'date') {
    if (value instanceof Date) return value
    const d = new Date(String(value))
    return isNaN(d.getTime()) ? String(value) : d
  }
  return String(value)
}

export async function exportToExcel(options: ExcelExportOptions): Promise<void> {
  const ExcelJS = (await import('exceljs')).default

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'SIM-PBB'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(options.sheetName ?? 'Data', {
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  const colCount = options.columns.length
  let rowIdx = 1

  // Title rows
  if (options.title) {
    sheet.mergeCells(rowIdx, 1, rowIdx, colCount)
    const titleCell = sheet.getCell(rowIdx, 1)
    titleCell.value = options.title
    titleCell.font = { bold: true, size: 13 }
    titleCell.alignment = { horizontal: 'center' }
    rowIdx++
  }

  if (options.subtitle) {
    sheet.mergeCells(rowIdx, 1, rowIdx, colCount)
    const subCell = sheet.getCell(rowIdx, 1)
    subCell.value = options.subtitle
    subCell.font = { size: 10, italic: true }
    subCell.alignment = { horizontal: 'center' }
    rowIdx++
  }

  if (options.title || options.subtitle) rowIdx++ // blank row

  // Header row
  const headerRow = sheet.getRow(rowIdx)
  options.columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1)
    cell.value = col.header
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF93C5FD' } },
    }
  })
  headerRow.height = 22
  rowIdx++

  // Data rows
  let rowNum = 0
  for (const row of options.rows) {
    rowNum++
    const dataRow = sheet.getRow(rowIdx)
    options.columns.forEach((col, i) => {
      const raw = row[col.key]
      const val = formatCellValue(raw, col.style)
      const cell = dataRow.getCell(i + 1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell.value = val as any

      if (col.style === 'currency') {
        cell.numFmt = '#,##0'
        cell.alignment = { horizontal: 'right' }
      } else if (col.style === 'number') {
        cell.numFmt = '#,##0.##'
        cell.alignment = { horizontal: 'right' }
      } else if (col.style === 'date') {
        cell.numFmt = 'DD/MM/YYYY'
        cell.alignment = { horizontal: 'center' }
      } else {
        cell.alignment = { horizontal: 'left' }
      }

      // Alternate row background
      if (rowNum % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }
      }
    })
    rowIdx++
  }

  // Column widths
  options.columns.forEach((col, i) => {
    const wsCol = sheet.getColumn(i + 1)
    wsCol.key = col.key
    wsCol.width = col.width ?? 16
  })

  // Generated timestamp footer
  const footerRowIdx = rowIdx + 1
  sheet.mergeCells(footerRowIdx, 1, footerRowIdx, colCount)
  const footerCell = sheet.getCell(footerRowIdx, 1)
  footerCell.value = `Dicetak: ${new Date().toLocaleString('id-ID')}`
  footerCell.font = { italic: true, size: 8, color: { argb: 'FF94A3B8' } }

  // Write to browser download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = options.filename.endsWith('.xlsx') ? options.filename : `${options.filename}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}
