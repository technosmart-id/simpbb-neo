'use client'

import * as React from 'react'
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
} from "@/components/ui/dialog"
import { BookActions } from "@/components/books/book-actions"
import {
  Plus,
  Loader2,
  Book as BookIcon,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Bell,
  Pencil,
  Image as ImageIcon,
  FileText,
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
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation'
import { type Book } from '@/lib/db/schema/books'

const PAGE_SIZE = 5


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
  const [showBook, setShowBook] = React.useState<Book | null>(null)

  // Test Notification Mutation
  const testNotification = useMutation(orpc.notifications.test.mutationOptions({
    onError: (error: Error) => {
      toast.error("Failed to trigger test: " + error.message)
    }
  }))

  // Query State
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState('')
  const debouncedSearch = useDebounceValue(search, 500)
  const [sort, setSort] = React.useState<SortState>({
    column: 'createdAt',
    order: 'desc'
  })

  // Data Fetching
  const listQuery = useQuery(orpc.books.list.queryOptions({
    input: {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      search: debouncedSearch || undefined,
      sortBy: sort.column as 'id' | 'title' | 'author' | 'publishedAt' | 'createdAt',
      sortOrder: sort.order
    }
  }))

  const books = listQuery.data?.rows ?? []
  const total = listQuery.data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const isLoading = listQuery.isLoading

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Books Library</h1>
          <p className="text-muted-foreground">
            Advanced management with server-side search, sort, and pagination.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => testNotification.mutate({})}
            disabled={testNotification.isPending}
          >
            {testNotification.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Bell size={16} />
            )}
            Test Notification
          </Button>
          <Button asChild>
            <Link href="/crud-example/new">
              <Plus />
              Add New Book
            </Link>
          </Button>
        </div>
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
                      <BookIcon size={48} className="opacity-10" />
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
                        <BookIcon size={14} className="text-muted-foreground" />
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
                        onShow={setShowBook}
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

      {/* Show Detail Dialog */}
      <Dialog open={!!showBook} onOpenChange={(open) => !open && setShowBook(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book Details</DialogTitle>
            <DialogDescription>
              Detailed information including media and attachments.
            </DialogDescription>
          </DialogHeader>
          
          {showBook && (
            <div className="space-y-6 py-4">
              {/* Cover Image & Metadata */}
              <div className="flex flex-col sm:flex-row gap-8">
                {showBook.coverImage ? (
                  <div className="w-full sm:w-64 aspect-[3/4] rounded-lg border bg-muted overflow-hidden shrink-0 shadow-md">
                    <img 
                      src={`/api/files/${showBook.coverImage}`} 
                      alt={showBook.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full sm:w-64 aspect-[3/4] rounded-lg border bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground shrink-0">
                    <ImageIcon size={48} />
                    <span className="text-sm">No Cover</span>
                  </div>
                )}
                
                <div className="grid grid-cols-[100px_1fr] gap-x-6 gap-y-4 text-sm flex-1">
                  <span className="text-muted-foreground font-medium">ID</span>
                  <span className="font-mono text-xs">#{showBook.id}</span>
                  
                  <span className="text-muted-foreground font-medium">Title</span>
                  <span className="text-lg font-bold text-primary leading-tight">{showBook.title}</span>
                  
                  <span className="text-muted-foreground font-medium">Author</span>
                  <span className="text-base font-medium">{showBook.author}</span>
                  
                  <span className="text-muted-foreground font-medium">Published</span>
                  <span>
                    {showBook.publishedAt 
                      ? new Date(showBook.publishedAt).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) 
                      : 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Gallery */}
              {Array.isArray(showBook.galleryImages) && showBook.galleryImages.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-base font-semibold flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Gallery
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {showBook.galleryImages.map((path: string, i: number) => (
                      <div key={i} className="size-24 sm:size-28 lg:size-[120px] rounded-md border bg-muted overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img 
                          src={`/api/files/${path}`} 
                          alt={`Gallery ${i}`} 
                          className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" 
                          onClick={() => window.open(`/api/files/${path}`, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              {(showBook.attachmentFile || (Array.isArray(showBook.additionalDocuments) && showBook.additionalDocuments.length > 0)) && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-base font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Attachments
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showBook.attachmentFile && (
                      <a 
                        href={`/api/files/${showBook.attachmentFile}`}
                        target="_blank"
                        className="flex items-center gap-4 p-4 rounded-xl border bg-accent/5 hover:bg-accent/10 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">Main Attachment</p>
                          <p className="text-xs text-muted-foreground">{showBook.attachmentFile.split('/').pop()}</p>
                        </div>
                      </a>
                    )}
                    
                    {Array.isArray(showBook.additionalDocuments) && showBook.additionalDocuments.map((path: string, i: number) => (
                      <a 
                        key={i}
                        href={`/api/files/${path}`}
                        target="_blank"
                        className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-all group"
                      >
                        <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">Document {i + 1}</p>
                          <p className="text-xs text-muted-foreground">{path.split('/').pop()}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button variant="outline" onClick={() => setShowBook(null)}>Close</Button>
            <Button asChild>
              <Link href={showBook ? `/crud-example/${showBook.id}/edit` : '#'}>
                <Pencil size={14} className="mr-2" />
                Edit Book
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
