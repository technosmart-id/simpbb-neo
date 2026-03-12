'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useORPC } from '@/lib/orpc/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Check } from 'lucide-react'

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publishedAt: z.string().optional().nullable(),
})

type BookFormValues = z.infer<typeof bookSchema>

interface BookFormProps {
  book?: {
    id: number
    title: string
    author: string
    publishedAt: string | Date | null
  }
  onSuccess?: () => void
}

export function BookForm({ book, onSuccess }: BookFormProps) {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book?.title ?? '',
      author: book?.author ?? '',
      publishedAt: book?.publishedAt ? new Date(book.publishedAt).toISOString().split('T')[0] : '',
    }
  })

  // Mutations
  const createMutation = useMutation(orpc.books.create.mutationOptions({
    onSuccess: () => {
      // Use .key() for invalidation as it's more flexible
      queryClient.invalidateQueries({ queryKey: orpc.books.key() })
      toast.success('Book created successfully')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to create book: ' + error.message)
    }
  }))

  const updateMutation = useMutation(orpc.books.update.mutationOptions({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.books.key() })
      toast.success('Book updated successfully')
      onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to update book: ' + error.message)
    }
  }))

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = (values: BookFormValues) => {
    if (book) {
      updateMutation.mutate({ id: book.id, ...values })
    } else {
      createMutation.mutate(values)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input 
            id="title" 
            placeholder="Clean Code" 
            aria-invalid={!!errors.title}
            {...register('title')} 
          />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field data-invalid={!!errors.author}>
          <FieldLabel htmlFor="author">Author</FieldLabel>
          <Input 
            id="author" 
            placeholder="Robert C. Martin" 
            aria-invalid={!!errors.author}
            {...register('author')} 
          />
          <FieldError errors={[errors.author]} />
        </Field>

        <Field data-invalid={!!errors.publishedAt}>
          <FieldLabel htmlFor="publishedAt">Published Date</FieldLabel>
          <Input 
            id="publishedAt" 
            type="date" 
            aria-invalid={!!errors.publishedAt}
            {...register('publishedAt')} 
          />
          <FieldError errors={[errors.publishedAt]} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Spinner data-icon="inline-start" />}
          {!isPending && book && <Check data-icon="inline-start" size={16} />}
          {book ? 'Update Book' : 'Create Book'}
        </Button>
      </div>
    </form>
  )
}
