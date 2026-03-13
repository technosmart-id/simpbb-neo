import { os as osBase } from "@orpc/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { books, notifications } from "@/lib/db/schema"
import { eq, desc, asc, sql, like, or } from "drizzle-orm"
import { auth } from "@/lib/auth"

import { createNotification } from "@/lib/services/notifications"

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
      }))
      .handler(async ({ input }) => {
        const [result] = await db.insert(books).values({
          title: input.title,
          author: input.author,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        })
        return { id: (result as { insertId: number }).insertId }
      }),

    update: os
      .input(z.object({
        id: z.number(),
        title: z.string().min(1),
        author: z.string().min(1),
        publishedAt: z.string().optional().nullable(),
      }))
      .handler(async ({ input }) => {
        await db.update(books)
          .set({
            title: input.title,
            author: input.author,
            publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
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
})

export type AppRouter = typeof router
