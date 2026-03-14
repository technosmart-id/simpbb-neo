import { os as osBase } from "@orpc/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { books, notifications, notificationPreferences } from "@/lib/db/schema"
import { eq, desc, asc, sql, like, or } from "drizzle-orm"
import { auth } from "@/lib/auth"

import { createNotification } from "@/lib/services/notifications"
import { StorageService } from "@/lib/services/storage"

export const os = osBase.$context<{ 
  session: typeof auth.$Infer.Session | null 
}>()

export const router = os.router({
  hello: os
    .input(z.object({ name: z.string().optional() }))
    .handler(async ({ input }) => {
      return {
        message: `Hello ${input.name ?? 'Ariefan'}! oRPC v1.x is officially alive.`,
      }
    }),

  notifications: os.router({
    list: os
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        const rows = await db.select()
          .from(notifications)
          .where(eq(notifications.userId, context.session.user.id))
          .orderBy(desc(notifications.createdAt))
          .limit(input.limit)
          .offset(input.offset)

        const [totalResult] = await db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(eq(notifications.userId, context.session.user.id))

        return {
          rows,
          total: totalResult?.count ?? 0,
        }
      }),

    unreadCount: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          return { count: 0 }
        }

        const [result] = await db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(
            sql`${notifications.userId} = ${context.session.user.id} AND ${notifications.isRead} = false`
          )

        return { count: result?.count ?? 0 }
      }),

    markAsRead: os
      .input(z.object({ id: z.string().optional() })) // if empty, mark all as read
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        if (input.id) {
          await db.update(notifications)
            .set({ isRead: true })
            .where(
              sql`${notifications.id} = ${input.id} AND ${notifications.userId} = ${context.session.user.id}`
            )
        } else {
          await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, context.session.user.id))
        }

        return { success: true }
      }),

    delete: os
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        await db.delete(notifications)
          .where(
            sql`${notifications.id} = ${input.id} AND ${notifications.userId} = ${context.session.user.id}`
          )

        return { success: true }
      }),

    test: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        return await createNotification({
          userId: context.session.user.id,
          title: "Real-time Test Alert",
          message: "This successful test notification was triggered via oRPC! SSE is working beautifully using native Next.js 16 WebStreams.",
          type: "success",
        })
      }),

    getPreferences: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        let [prefs] = await db.select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, context.session.user.id))

        if (!prefs) {
          // Create default preferences
          const id = crypto.randomUUID()
          await db.insert(notificationPreferences).values({
            id,
            userId: context.session.user.id,
            inAppEnabled: true,
            toastsEnabled: true,
            successEnabled: true,
            warningEnabled: true,
            errorEnabled: true,
            infoEnabled: true,
          })
          
          const [newPrefs] = await db.select()
            .from(notificationPreferences)
            .where(eq(notificationPreferences.id, id))
          prefs = newPrefs
        }

        return prefs
      }),

    updatePreferences: os
      .input(z.object({
        inAppEnabled: z.boolean().optional(),
        toastsEnabled: z.boolean().optional(),
        successEnabled: z.boolean().optional(),
        warningEnabled: z.boolean().optional(),
        errorEnabled: z.boolean().optional(),
        infoEnabled: z.boolean().optional(),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        await db.update(notificationPreferences)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.userId, context.session.user.id))

        return { success: true }
      }),
  }),

  books: os.router({
    list: os
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
        search: z.string().optional(),
        sortBy: z.enum(['id', 'title', 'author', 'publishedAt', 'createdAt']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .handler(async ({ input }) => {
        const filters = input.search 
          ? or(
              like(books.title, `%${input.search}%`),
              like(books.author, `%${input.search}%`)
            )
          : undefined

        const [totalResult] = await db.select({ count: sql<number>`count(*)` })
          .from(books)
          .where(filters)

        const orderBy = input.sortOrder === 'desc' 
          ? desc(books[input.sortBy]) 
          : asc(books[input.sortBy])

        const rows = await db.select()
          .from(books)
          .where(filters)
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
      .handler(async ({ input }) => {
        const [book] = await db.select().from(books).where(eq(books.id, input.id))
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
      .handler(async ({ input }) => {
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
          galleryImages: input.galleryImages?.map(mapPath) ?? [],
          additionalDocuments: input.additionalDocuments?.map(mapPath) ?? [],
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
      .handler(async ({ input }) => {
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
            galleryImages: input.galleryImages?.map(mapPath) ?? [],
            additionalDocuments: input.additionalDocuments?.map(mapPath) ?? [],
            updatedAt: new Date(),
          })
          .where(eq(books.id, input.id))
        return { success: true }
      }),

    delete: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input }) => {
        await db.delete(books).where(eq(books.id, input.id))
        return { success: true }
      }),
  }),
  
  files: os.router({
    list: os
      .input(z.object({
        path: z.string().optional().default(""),
      }).optional())
      .handler(async ({ input }) => {
        console.log(`[ORPC] files.list: path="${input?.path}"`)
        return await StorageService.listFiles(input?.path ?? "")
      }),

    createFolder: os
      .input(z.object({
        parentPath: z.string(),
        name: z.string().min(1),
      }))
      .handler(async ({ input }) => {
        await StorageService.createFolder(input.parentPath, input.name)
        return { success: true }
      }),

    delete: os
      .input(z.object({
        path: z.string(),
      }))
      .handler(async ({ input }) => {
        await StorageService.deleteFile(input.path)
        return { success: true }
      }),

    stats: os
      .handler(async () => {
        return await StorageService.getStorageStats()
      }),

    submit: os
      .input(z.object({
        tempPaths: z.array(z.string()),
      }))
      .handler(async ({ input }) => {
        const movedPaths = await StorageService.moveToUploads(input.tempPaths)
        await StorageService.cleanupTemp()
        return { movedPaths }
      }),
  }),
})

export type AppRouter = typeof router
