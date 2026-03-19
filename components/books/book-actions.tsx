'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

import { type Book } from '@/lib/db/schema/books'

interface BookActionsProps {
  book: Book
  onShow: (book: Book) => void
  onDelete: (id: number) => void
  isDeleting?: boolean
}

export function BookActions({ book, onShow, onDelete, isDeleting }: BookActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const router = useRouter()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal size={14} />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onShow(book)}>
            <ExternalLink size={14} className="mr-2" />
            Show Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/crud-example/${book.id}/edit`)}>
            <Pencil size={14} className="mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 size={14} className="mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{book.title}</strong> by {book.author}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              variant="destructive"
              onClick={() => {
                onDelete(book.id)
                setShowDeleteDialog(false)
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
