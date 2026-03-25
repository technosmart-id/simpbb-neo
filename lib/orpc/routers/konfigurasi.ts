import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { konfigurasi } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const konfigurasiRouter = os.router({
  list: os.handler(async () => {
    const rows = await db.select().from(konfigurasi).orderBy(konfigurasi.nama)
    return rows.map((r) => ({
      nama: r.nama,
      nilai: r.nilai ? r.nilai.toString("utf-8") : null,
    }))
  }),

  get: os
    .input(z.object({ nama: z.string() }))
    .handler(async ({ input }) => {
      const [row] = await db
        .select()
        .from(konfigurasi)
        .where(eq(konfigurasi.nama, input.nama))
      if (!row) return null
      return {
        nama: row.nama,
        nilai: row.nilai ? row.nilai.toString("utf-8") : null,
      }
    }),

  set: os
    .input(z.object({ nama: z.string(), nilai: z.string() }))
    .handler(async ({ input }) => {
      const buffer = Buffer.from(input.nilai, "utf-8")
      // Upsert: try update first, insert if not found
      const result = await db
        .update(konfigurasi)
        .set({ nilai: buffer })
        .where(eq(konfigurasi.nama, input.nama))

      if (result[0].affectedRows === 0) {
        await db.insert(konfigurasi).values({
          nama: input.nama,
          nilai: buffer,
        })
      }

      return { success: true }
    }),

  delete: os
    .input(z.object({ nama: z.string() }))
    .handler(async ({ input }) => {
      await db.delete(konfigurasi).where(eq(konfigurasi.nama, input.nama))
      return { success: true }
    }),
})
