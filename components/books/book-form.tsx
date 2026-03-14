'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useORPC } from '@/lib/orpc/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Check, Image as ImageIcon, FileText } from 'lucide-react'
import { ImageUpload } from '@/components/examples/image-upload'
import { FileUpload } from '@/components/examples/file-upload'

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  publishedAt: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  galleryImages: z.array(z.string()),
  attachmentFile: z.string().optional().nullable(),
  additionalDocuments: z.array(z.string()),
})

type BookFormValues = {
  title: string
  author: string
  publishedAt?: string | null
  coverImage?: string | null
  galleryImages: string[]
  attachmentFile?: string | null
  additionalDocuments: string[]
}

interface BookData {
  id: number
  title: string
  author: string
  publishedAt: string | Date | null
  coverImage?: string | null
  galleryImages?: string[] | any
  attachmentFile?: string | null
  additionalDocuments?: string[] | any
}

interface BookFormProps {
  book?: BookData
  onSuccess?: () => void
}

export function BookForm({ book, onSuccess }: BookFormProps) {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  const { register, handleSubmit, control, formState: { errors } } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: book?.title ?? '',
      author: book?.author ?? '',
      publishedAt: book?.publishedAt ? new Date(book.publishedAt).toISOString().split('T')[0] : '',
      coverImage: book?.coverImage ?? null,
      galleryImages: Array.isArray(book?.galleryImages) ? book.galleryImages : [],
      attachmentFile: book?.attachmentFile ?? null,
      additionalDocuments: Array.isArray(book?.additionalDocuments) ? book.additionalDocuments : [],
    }
  })

  // Mutations
  const createMutation = useMutation(orpc.books.create.mutationOptions({
    onSuccess: () => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      <div className="space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          General Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
        </div>
      </div>

      <div className="space-y-6 border-t pt-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-primary" />
          Media & Gallery
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field>
            <FieldLabel>Cover Image</FieldLabel>
            <FieldDescription>The main thumbnail displayed for this book.</FieldDescription>
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <ImageUpload
                  defaultValue={field.value ?? undefined}
                  onUploadSuccess={(paths) => field.onChange(paths[0] || null)}
                />
              )}
            />
          </Field>

          <Field>
            <FieldLabel>Gallery Images</FieldLabel>
            <FieldDescription>Additional images showcasing chapters or illustrations.</FieldDescription>
            <Controller
              control={control}
              name="galleryImages"
              render={({ field }) => (
                <ImageUpload
                  multiple
                  defaultValue={field.value || []}
                  onUploadSuccess={(paths) => field.onChange(paths)}
                />
              )}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-6 border-t pt-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Documents & Attachments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field>
            <FieldLabel>Main Attachment</FieldLabel>
            <FieldDescription>A primary file, like a PDF sample or full manuscript.</FieldDescription>
            <Controller
              control={control}
              name="attachmentFile"
              render={({ field }) => (
                <FileUpload
                  defaultValue={field.value ?? undefined}
                  onUploadSuccess={(paths) => field.onChange(paths[0] || null)}
                />
              )}
            />
          </Field>

          <Field>
            <FieldLabel>Additional Documents</FieldLabel>
            <FieldDescription>Supplementary resources, notes, or references.</FieldDescription>
            <Controller
              control={control}
              name="additionalDocuments"
              render={({ field }) => (
                <FileUpload
                  multiple
                  defaultValue={field.value || []}
                  onUploadSuccess={(paths) => field.onChange(paths)}
                />
              )}
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end border-t pt-6">
        <Button type="submit" size="lg" disabled={isPending} className="min-w-[150px]">
          {isPending && <Spinner data-icon="inline-start" />}
          {!isPending && book && <Check data-icon="inline-start" size={16} />}
          {book ? 'Update Book' : 'Create Book'}
        </Button>
      </div>
    </form>
  )
}
