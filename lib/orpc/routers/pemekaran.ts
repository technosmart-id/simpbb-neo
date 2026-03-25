import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { pemekaran, pemekaranDetail } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"

const nopLama = z.object({
  kdPropinsiLama: z.string().length(2),
  kdDati2Lama: z.string().length(2),
  kdKecamatanLama: z.string().length(3),
  kdKelurahanLama: z.string().length(3),
  kdBlokLama: z.string().length(3),
  noUrutLama: z.string().length(4),
  kdJnsOpLama: z.string().length(1),
})

const nopBaru = z.object({
  kdPropinsiBaru: z.string().length(2),
  kdDati2Baru: z.string().length(2),
  kdKecamatanBaru: z.string().length(3),
  kdKelurahanBaru: z.string().length(3),
  kdBlokBaru: z.string().length(3),
  noUrutBaru: z.string().length(4),
  kdJnsOpBaru: z.string().length(1),
})

export const pemekaranRouter = os.router({
  // List all pemekaran events
  list: os
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
    }))
    .handler(async ({ input }) => {
      const rows = await db
        .select({
          id: pemekaran.id,
          namaPemekaran: pemekaran.namaPemekaran,
          tglBerlaku: pemekaran.tglBerlaku,
          keterangan: pemekaran.keterangan,
          jumlahDetail: sql<number>`(
            SELECT COUNT(*) FROM pemekaran_detail pd WHERE pd.PEMEKARAN_ID = ${pemekaran.id}
          )`,
        })
        .from(pemekaran)
        .orderBy(desc(pemekaran.tglBerlaku))
        .limit(input.limit)
        .offset(input.offset)

      const [total] = await db.select({ count: sql<number>`count(*)` }).from(pemekaran)

      return { rows, total: total?.count ?? 0 }
    }),

  // Get one pemekaran with its details
  get: os
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input }) => {
      const [header] = await db.select().from(pemekaran).where(eq(pemekaran.id, input.id))
      if (!header) return null

      const details = await db
        .select()
        .from(pemekaranDetail)
        .where(eq(pemekaranDetail.pemekaranId, input.id))

      return { ...header, details }
    }),

  // Create a pemekaran event
  create: os
    .input(z.object({
      namaPemekaran: z.string().min(1).max(100),
      tglBerlaku: z.string(), // YYYY-MM-DD
      keterangan: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const [result] = await db.insert(pemekaran).values({
        namaPemekaran: input.namaPemekaran,
        tglBerlaku: new Date(input.tglBerlaku),
        keterangan: input.keterangan ?? null,
      })
      return { id: (result as { insertId: number }).insertId }
    }),

  // Add a detail record (NOP lama → NOP baru)
  addDetail: os
    .input(nopLama.merge(nopBaru).extend({ pemekaranId: z.number().int() }))
    .handler(async ({ input }) => {
      await db.insert(pemekaranDetail).values({
        pemekaranId: input.pemekaranId,
        kdPropinsiLama: input.kdPropinsiLama,
        kdDati2Lama: input.kdDati2Lama,
        kdKecamatanLama: input.kdKecamatanLama,
        kdKelurahanLama: input.kdKelurahanLama,
        kdBlokLama: input.kdBlokLama,
        noUrutLama: input.noUrutLama,
        kdJnsOpLama: input.kdJnsOpLama,
        kdPropinsiBaru: input.kdPropinsiBaru,
        kdDati2Baru: input.kdDati2Baru,
        kdKecamatanBaru: input.kdKecamatanBaru,
        kdKelurahanBaru: input.kdKelurahanBaru,
        kdBlokBaru: input.kdBlokBaru,
        noUrutBaru: input.noUrutBaru,
        kdJnsOpBaru: input.kdJnsOpBaru,
      })
      return { ok: true }
    }),

  // Delete a detail record
  deleteDetail: os
    .input(z.object({ id: z.number().int() }))
    .handler(async ({ input }) => {
      await db.delete(pemekaranDetail).where(eq(pemekaranDetail.id, input.id))
      return { ok: true }
    }),
})
