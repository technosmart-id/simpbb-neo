'use client'

import { BookForm } from "@/components/books/book-form"
import { useRouter } from "next/navigation"

export default function NewBookPage() {
  const router = useRouter()
  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Add New Book</h2>
        <p className="text-muted-foreground">
          Fill in the details to add a new book to the library.
        </p>
      </div>
      <div className="max-w-4xl p-8 rounded-xl border bg-card/50 shadow-sm">
        <BookForm onSuccess={() => router.push('/crud-example')} />
      </div>
    </div>
  )
}
