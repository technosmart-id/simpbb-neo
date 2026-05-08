'use client'

import React from 'react'
import { BookForm } from "@/components/books/book-form"
import { useRouter, useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { Loader2 } from "lucide-react"

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const id = parseInt(params.id as string)
  const orpc = useORPC()

  const { data: book, isLoading } = useQuery(orpc.books.get.queryOptions({
    input: { id }
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h2 className="text-2xl font-bold">Book not found</h2>
        <p className="text-muted-foreground">The book you are looking for does not exist or you don't have access.</p>
        <button onClick={() => router.push('/crud-example')} className="text-primary hover:underline">
          Go back to library
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Edit Book</h2>
        <p className="text-muted-foreground">
          Modify the details for <strong>{book.title}</strong>.
        </p>
      </div>
      <div className="max-w-4xl p-8 rounded-xl border bg-card/50 shadow-sm">
        <BookForm 
          book={book} 
          onSuccess={() => router.push('/crud-example')} 
        />
      </div>
    </div>
  )
}
