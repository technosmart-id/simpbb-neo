import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { logAktivitas } from "@/lib/db/schema"
import { eq, desc, sql, and, gte, lte, like } from "drizzle-orm"

export const logRouter = os.router({
  list: os
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        username: z.string().optional(),
        modul: z.string().optional(),
        aksi: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const conditions = []

      if (input.username) {
        conditions.push(like(logAktivitas.username, `%${input.username}%`))
      }
      if (input.modul) {
        conditions.push(eq(logAktivitas.modul, input.modul))
      }
      if (input.aksi) {
        conditions.push(eq(logAktivitas.aksi, input.aksi))
      }
      if (input.dateFrom) {
        conditions.push(gte(logAktivitas.createdAt, new Date(input.dateFrom)))
      }
      if (input.dateTo) {
        conditions.push(lte(logAktivitas.createdAt, new Date(input.dateTo)))
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const rows = await db
        .select()
        .from(logAktivitas)
        .where(where)
        .orderBy(desc(logAktivitas.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(logAktivitas)
        .where(where)

      return {
        rows,
        total: totalResult?.count ?? 0,
      }
    }),
})
