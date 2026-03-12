'use client'

import * as React from 'react'
import { AppSidebar } from "@/components/layouts/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookForm } from "@/components/books/book-form"
import { BookActions } from "@/components/books/book-actions"
import {
  Plus,
  Loader2,
  Book,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"

const PAGE_SIZE = 5

type Book = {
  id: number
  title: string
  author: string
  publishedAt: string | Date | null
}

type BooksListResponse = {
  rows: Book[]
  total: number
}

type DeleteVariables = { id: number }

type SortState = {
  column: string
  order: 'asc' | 'desc'
}

// Memoized SortIcon component declared outside render
interface SortIconProps {
  column: string
  sort: SortState
}

const SortIcon = React.memo<SortIconProps>(({ column, sort }) => {
  if (sort.column !== column) return <ArrowUpDown size={14} className="ml-2 opacity-50" />
  return sort.order === 'asc'
    ? <ArrowUp size={14} className="ml-2" />
    : <ArrowDown size={14} className="ml-2" />
})
SortIcon.displayName = 'SortIcon'

export default function CrudExamplePage() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  // UI State
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [editingBook, setEditingBook] = React.useState<Book | null>(null)

  // Query State
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebounceValue(search, 500)
  const [sort, setSort] = React.useState<{ column: string, order: 'asc' | 'desc' }>({
    column: 'createdAt',
    order: 'desc'
  })

  // Data Fetching
  const { data, isLoading } = useQuery(orpc.books.list.queryOptions({
    input: {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      search: debouncedSearch || undefined,
      sortBy: sort.column as 'id' | 'title' | 'author' | 'publishedAt' | 'createdAt',
      sortOrder: sort.order
    }
  }))

  const books = (data as BooksListResponse | undefined)?.rows ?? []
  const total = (data as BooksListResponse | undefined)?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  // Reset page when search changes
  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const deleteMutation = useMutation(orpc.books.delete.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.books.key() })
      toast.success('Book deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete book: ' + error.message)
    }
  }))

  const toggleSort = (column: string) => {
    setSort(prev => ({
      column,
      order: prev.column === column && prev.order === 'asc' ? 'desc' : 'asc'
    }))
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Books CRUD Example</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Books Library</h1>
              <p className="text-muted-foreground">
                Advanced management with server-side search, sort, and pagination.
              </p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus data-icon="inline-start" size={16} />
                  Add New Book
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to add a new book to the library.
                  </DialogDescription>
                </DialogHeader>
                <BookForm onSuccess={() => setIsAddOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or author..."
                className="pl-8 pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearch('')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="rounded-md border bg-card overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="w-[80px] cursor-pointer"
                      onClick={() => toggleSort('id')}
                    >
                      <div className="flex items-center">ID <SortIcon column="id" sort={sort} /></div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort('title')}
                    >
                      <div className="flex items-center">Title <SortIcon column="title" sort={sort} /></div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort('author')}
                    >
                      <div className="flex items-center">Author <SortIcon column="author" sort={sort} /></div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort('publishedAt')}
                    >
                      <div className="flex items-center">Published <SortIcon column="publishedAt" sort={sort} /></div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-56 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="animate-spin" size={24} />
                          <span>Loading books...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : books.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-56 text-center text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Book size={48} className="opacity-10" />
                          <p className="font-medium">No books found.</p>
                          <p className="text-sm">Try adjusting your search or add a new book!</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    books.map((book: Book) => (
                      <TableRow key={book.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{book.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Book size={14} className="text-muted-foreground" />
                            <span className="font-medium">{book.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {book.author}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {book.publishedAt ? new Date(book.publishedAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <BookActions
                            book={book}
                            onEdit={setEditingBook}
                            onDelete={(id) => deleteMutation.mutate({ id })}
                            isDeleting={deleteMutation.isPending && (deleteMutation.variables as DeleteVariables)?.id === book.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="border-t p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) setPage(page - 1)
                        }}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      if (totalPages <= 7 || (p === 1 || p === totalPages || Math.abs(p - page) <= 1)) {
                        return (
                          <PaginationItem key={p}>
                            <PaginationLink
                              href="#"
                              isActive={page === p}
                              onClick={(e) => {
                                e.preventDefault()
                                setPage(p)
                              }}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      }

                      if ((p === 2 && page > 3) || (p === totalPages - 1 && page < totalPages - 2)) {
                        return (
                          <PaginationItem key={p}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }

                      return null
                    })}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < totalPages) setPage(page + 1)
                        }}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
              <DialogDescription>
                Update the details of the selected book.
              </DialogDescription>
            </DialogHeader>
            {editingBook && (
              <BookForm
                book={editingBook}
                onSuccess={() => setEditingBook(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
