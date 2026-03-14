'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { BookForm } from "@/components/books/book-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function CrudNewPage() {
  const router = useRouter()

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
          <h1 className="text-2xl font-bold tracking-tight">Add New Book</h1>
          <p className="text-muted-foreground">
            Fill in the details below to add a new book to the library.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <BookForm onSuccess={() => router.push('/crud-example')} />
      </div>
    </div>
  )
}
