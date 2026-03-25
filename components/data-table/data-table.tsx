"use client"

import * as React from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Search } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Total count for server-side pagination */
  totalRows?: number
  /** Current page (1-indexed) */
  page?: number
  /** Page size */
  pageSize?: number
  /** Called when page changes (server-side pagination) */
  onPageChange?: (page: number) => void
  /** Enable client-side filtering */
  searchColumn?: string
  searchPlaceholder?: string
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Empty state icon */
  emptyIcon?: React.ReactNode
  /** Action buttons (top-right) */
  actions?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalRows,
  page = 1,
  pageSize = 20,
  onPageChange,
  searchColumn,
  searchPlaceholder = "Cari...",
  isLoading,
  emptyMessage = "Tidak ada data.",
  emptyIcon,
  actions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const isServerPaginated = !!onPageChange
  const totalPages = isServerPaginated
    ? Math.ceil((totalRows ?? 0) / pageSize)
    : undefined

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerPaginated
      ? { manualPagination: true, pageCount: totalPages }
      : { getPaginationRowModel: getPaginationRowModel() }),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(isServerPaginated ? { pagination: { pageIndex: page - 1, pageSize } } : {}),
    },
  })

  const currentPage = isServerPaginated ? page : table.getState().pagination.pageIndex + 1
  const computedTotalPages = isServerPaginated
    ? totalPages!
    : table.getPageCount()
  const total = isServerPaginated ? (totalRows ?? 0) : table.getFilteredRowModel().rows.length

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(searchColumn || actions) && (
        <div className="flex items-center justify-between gap-2">
          {searchColumn && (
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                onChange={(e) =>
                  table.getColumn(searchColumn)?.setFilterValue(e.target.value)
                }
                className="pl-8"
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {emptyIcon}
                    <p>{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {computedTotalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(currentPage - 1) * pageSize + 1} -{" "}
            {Math.min(currentPage * pageSize, total)} dari {total} data
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                isServerPaginated ? onPageChange!(1) : table.setPageIndex(0)
              }
              disabled={currentPage <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                isServerPaginated
                  ? onPageChange!(page - 1)
                  : table.previousPage()
              }
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              {currentPage} / {computedTotalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                isServerPaginated
                  ? onPageChange!(page + 1)
                  : table.nextPage()
              }
              disabled={currentPage >= computedTotalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                isServerPaginated
                  ? onPageChange!(computedTotalPages)
                  : table.setPageIndex(computedTotalPages - 1)
              }
              disabled={currentPage >= computedTotalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
