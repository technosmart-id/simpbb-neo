'use client'

import * as React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { BookForm } from "@/components/books/book-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Loader2 } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'

export default function CrudEditPage() {
  const router = useRouter()
  const params = useParams()
  const orpc = useORPC()
  
  const id = typeof params.id === 'string' ? parseInt(params.id) : null

  const { data: book, isLoading, isError } = useQuery(orpc.books.get.queryOptions({
    input: { id: id ?? 0 },
  }))

  if (id === null || isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-destructive font-medium">Book not found or invalid ID</p>
        <Button variant="outline" onClick={() => router.push('/crud-example')}>
          Back to list
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-fit -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Edit Book</h1>
          <p className="text-muted-foreground">
            Update the details of the selected book.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm min-h-[300px] flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="animate-spin text-muted-foreground" size={32} />
          </div>
        ) : book ? (
          <BookForm 
            book={book} 
            onSuccess={() => router.push('/crud-example')} 
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Book not found
          </div>
        )}
      </div>
    </div>
  )
}
