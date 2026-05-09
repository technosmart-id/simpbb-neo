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
          jenisPemekaran: pemekaran.jenisPemekaran,
          tglEntry: pemekaran.tglEntry,
          userEntry: pemekaran.userEntry,
          isCancel: pemekaran.isCancel,
          jumlahDetail: sql<number>`(
            SELECT COUNT(*) FROM pemekaran_detail pd WHERE pd.PEMEKARAN_ID = ${pemekaran.id}
          )`,
        })
        .from(pemekaran)
        .orderBy(desc(pemekaran.tglEntry))
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
      jenisPemekaran: z.number().int(),
      kdPropinsiLama: z.string().length(2),
      kdDati2Lama: z.string().length(2),
      kdKecamatanLama: z.string().length(3),
      kdKelurahanLama: z.string().length(3),
      kdBlokAwal: z.string().length(3),
      noUrutAwal: z.string().length(4),
      noUrutAkhir: z.string().length(4),
      kdBlokAkhir: z.string().length(3),
      kdPropinsiBaru: z.string().length(2),
      kdDati2Baru: z.string().length(2),
      kdKecamatanBaru: z.string().length(3),
      kdKelurahanBaru: z.string().length(3),
      kdBlokBaru: z.string().length(3),
    }))
    .handler(async ({ input }) => {
      await db.insert(pemekaran).values({
        jenisPemekaran: input.jenisPemekaran,
        kdPropinsiLama: input.kdPropinsiLama,
        kdDati2Lama: input.kdDati2Lama,
        kdKecamatanLama: input.kdKecamatanLama,
        kdKelurahanLama: input.kdKelurahanLama,
        kdBlokAwal: input.kdBlokAwal,
        noUrutAwal: input.noUrutAwal,
        noUrutAkhir: input.noUrutAkhir,
        kdBlokAkhir: input.kdBlokAkhir,
        kdPropinsiBaru: input.kdPropinsiBaru,
        kdDati2Baru: input.kdDati2Baru,
        kdKecamatanBaru: input.kdKecamatanBaru,
        kdKelurahanBaru: input.kdKelurahanBaru,
        kdBlokBaru: input.kdBlokBaru,
        tglEntry: new Date(),
        userEntry: 'system',
        isCancel: 0,
      } as any)
      return { ok: true }
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
