import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { refKategori, refJnsPelayanan } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const referensiRouter = os.router({
  // List all categories for a given kategori type
  listKategori: os
    .input(z.object({ kategori: z.string() }))
    .handler(async ({ input }) => {
      return db
        .select()
        .from(refKategori)
        .where(eq(refKategori.kategori, input.kategori))
        .orderBy(refKategori.kode)
    }),

  // List all kategori types (distinct)
  listKategoriTypes: os.handler(async () => {
    const rows = await db
      .selectDistinct({ kategori: refKategori.kategori })
      .from(refKategori)
      .orderBy(refKategori.kategori)
    return rows.map((r) => r.kategori)
  }),

  // Jenis Pelayanan
  listJnsPelayanan: os.handler(async () => {
    return db.select().from(refJnsPelayanan).orderBy(refJnsPelayanan.kdJnsPelayanan)
  }),
})
