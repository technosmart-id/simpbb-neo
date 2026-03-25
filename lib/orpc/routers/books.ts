import { z } from "zod"
import { db } from "@/lib/db"
import { books } from "@/lib/db/schema"
import { eq, desc, asc, sql, and } from "drizzle-orm"
import { StorageService } from "@/lib/services/storage"
import { os, requireAuth } from "../base"

export const booksRouter = os.router({
  list: os
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(10),
      offset: z.number().int().min(0).default(0),
      search: z.string().optional(),
      sortBy: z.enum(['id', 'title', 'author', 'publishedAt', 'createdAt']).default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }))
    .handler(async ({ input, context }) => {
      const { organizationId } = await requireAuth(context, { 
        resource: "books", 
        action: "read", 
        requireOrg: true 
      })

      const orgFilters = eq(books.organizationId, organizationId!)
      const searchFilters = input.search 
        ? sql`(${books.title} LIKE ${`%${input.search}%`} OR ${books.author} LIKE ${`%${input.search}%`})`
        : sql`1=1`

      const [totalResult] = await db.select({ count: sql<number>`count(*)` })
        .from(books)
        .where(and(orgFilters, searchFilters))

      const orderBy = input.sortOrder === 'desc' 
        ? desc(books[input.sortBy])
        : asc(books[input.sortBy])

      const rows = await db.select()
        .from(books)
        .where(and(orgFilters, searchFilters))
        .orderBy(orderBy)
        .limit(input.limit)
        .offset(input.offset)

      return {
        rows,
        total: totalResult?.count ?? 0,
      }
    }),

  get: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => {
      const { organizationId } = await requireAuth(context, { 
        resource: "books", 
        action: "read", 
        requireOrg: true 
      })

      const [book] = await db.select()
        .from(books)
        .where(
          and(
            eq(books.id, input.id),
            eq(books.organizationId, organizationId!),
          ),
        )
      return book ?? null
    }),

  create: os
    .input(z.object({
      title: z.string().min(1),
      author: z.string().min(1),
      publishedAt: z.string().optional().nullable(),
      coverImage: z.string().optional().nullable(),
      attachmentFile: z.string().optional().nullable(),
      galleryImages: z.array(z.string()).optional().nullable(),
      additionalDocuments: z.array(z.string()).optional().nullable(),
    }))
    .handler(async ({ input, context }) => {
      const { session, organizationId } = await requireAuth(context, { 
        resource: "books", 
        action: "create", 
        requireOrg: true 
      })

      // Collect all temp paths to move
      const tempPaths = [
        input.coverImage,
        input.attachmentFile,
        ...(input.galleryImages ?? []),
        ...(input.additionalDocuments ?? []),
      ].filter((p): p is string => !!p && p.startsWith('temp/'))

      if (tempPaths.length > 0) {
        await StorageService.moveToUploads(tempPaths)
        await StorageService.cleanupTemp()
      }

      // Map paths to their final destination
      const mapPath = (p: string | null | undefined) =>
        p?.startsWith('temp/') ? p.replace('temp/', 'files/') : p

      const [result] = await db.insert(books).values({
        title: input.title,
        author: input.author,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        coverImage: mapPath(input.coverImage),
        attachmentFile: mapPath(input.attachmentFile),
        galleryImages: (input.galleryImages?.map(mapPath).filter((p): p is string => !!p) ?? []),
        additionalDocuments: (input.additionalDocuments?.map(mapPath).filter((p): p is string => !!p) ?? []),
        organizationId: organizationId!,
        createdById: session.user.id,
      })
      return { id: (result as { insertId: number }).insertId }
    }),

  update: os
    .input(z.object({
      id: z.number(),
      title: z.string().min(1),
      author: z.string().min(1),
      publishedAt: z.string().optional().nullable(),
      coverImage: z.string().optional().nullable(),
      attachmentFile: z.string().optional().nullable(),
      galleryImages: z.array(z.string()).optional().nullable(),
      additionalDocuments: z.array(z.string()).optional().nullable(),
    }))
    .handler(async ({ input, context }) => {
      const { organizationId } = await requireAuth(context, { 
        resource: "books", 
        action: "update", 
        requireOrg: true 
      })

      // Verify the book belongs to the user's org
      const [book] = await db.select()
        .from(books)
        .where(
          and(
            eq(books.id, input.id),
            eq(books.organizationId, organizationId!),
          ),
        )
        .limit(1)

      if (!book) {
        throw new Error("Book not found")
      }

      // Collect all temp paths to move
      const tempPaths = [
        input.coverImage,
        input.attachmentFile,
        ...(input.galleryImages ?? []),
        ...(input.additionalDocuments ?? []),
      ].filter((p): p is string => !!p && p.startsWith('temp/'))

      if (tempPaths.length > 0) {
        await StorageService.moveToUploads(tempPaths)
        await StorageService.cleanupTemp()
      }

      // Map paths to their final destination
      const mapPath = (p: string | null | undefined) =>
        p?.startsWith('temp/') ? p.replace('temp/', 'files/') : p

      await db.update(books)
        .set({
          title: input.title,
          author: input.author,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
          coverImage: mapPath(input.coverImage),
          attachmentFile: mapPath(input.attachmentFile),
          galleryImages: (input.galleryImages?.map(mapPath).filter((p): p is string => !!p) ?? []),
          additionalDocuments: (input.additionalDocuments?.map(mapPath).filter((p): p is string => !!p) ?? []),
          updatedAt: new Date(),
        })
        .where(eq(books.id, input.id))
      return { success: true }
    }),

  delete: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => {
      const { organizationId } = await requireAuth(context, { 
        resource: "books", 
        action: "delete", 
        requireOrg: true 
      })

      // Verify the book belongs to the user's org
      const [book] = await db.select()
        .from(books)
        .where(
          and(
            eq(books.id, input.id),
            eq(books.organizationId, organizationId!),
          ),
        )
        .limit(1)

      if (!book) {
        throw new Error("Book not found")
      }

      await db.delete(books).where(eq(books.id, input.id))
      return { success: true }
    }),
})
