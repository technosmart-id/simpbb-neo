import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { pembayaranSppt, sppt } from "@/lib/db/schema"
import { eq, and, sql, desc } from "drizzle-orm"

const nopInput = z.object({
  kdPropinsi: z.string().length(2),
  kdDati2: z.string().length(2),
  kdKecamatan: z.string().length(3),
  kdKelurahan: z.string().length(3),
  kdBlok: z.string().length(3),
  noUrut: z.string().length(4),
  kdJnsOp: z.string().length(1),
})

export const pembayaranRouter = os.router({
  // List payments with filters
  list: os
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
      thnPajak: z.number().optional(),
      kdPropinsi: z.string().optional(),
      kdDati2: z.string().optional(),
      kdKecamatan: z.string().optional(),
      kdKelurahan: z.string().optional(),
      search: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const conditions = []
      if (input.thnPajak) conditions.push(eq(pembayaranSppt.thnPajakSppt, input.thnPajak))
      if (input.kdPropinsi) conditions.push(eq(pembayaranSppt.kdPropinsi, input.kdPropinsi))
      if (input.kdDati2) conditions.push(eq(pembayaranSppt.kdDati2, input.kdDati2))
      if (input.kdKecamatan) conditions.push(eq(pembayaranSppt.kdKecamatan, input.kdKecamatan))
      if (input.kdKelurahan) conditions.push(eq(pembayaranSppt.kdKelurahan, input.kdKelurahan))
      if (input.search) {
        conditions.push(sql`${pembayaranSppt.namaBayar} LIKE ${`%${input.search}%`}`)
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const rows = await db.select().from(pembayaranSppt).where(where)
        .orderBy(desc(pembayaranSppt.tglPembayaranSppt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(pembayaranSppt).where(where)

      return { rows, total: totalResult?.count ?? 0 }
    }),

  // List payments for a specific SPPT
  listBySppt: os
    .input(nopInput.extend({ thnPajakSppt: z.number() }))
    .handler(async ({ input }) => {
      return db.select().from(pembayaranSppt).where(and(
        eq(pembayaranSppt.kdPropinsi, input.kdPropinsi),
        eq(pembayaranSppt.kdDati2, input.kdDati2),
        eq(pembayaranSppt.kdKecamatan, input.kdKecamatan),
        eq(pembayaranSppt.kdKelurahan, input.kdKelurahan),
        eq(pembayaranSppt.kdBlok, input.kdBlok),
        eq(pembayaranSppt.noUrut, input.noUrut),
        eq(pembayaranSppt.kdJnsOp, input.kdJnsOp),
        eq(pembayaranSppt.thnPajakSppt, input.thnPajakSppt),
      )).orderBy(pembayaranSppt.pembayaranKe)
    }),

  // Record payment
  create: os
    .input(nopInput.extend({
      thnPajakSppt: z.number(),
      tglPembayaranSppt: z.string(),
      jmlSpptYgDibayar: z.string(),
      dendaSppt: z.string(),
      jmlBayar: z.string(),
      namaBayar: z.string().optional(),
      channelPembayaran: z.string().optional(),
      noReferensi: z.string().optional(),
      nipPetugas: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      // Get next pembayaran_ke
      const [result] = await db
        .select({ maxKe: sql<number>`COALESCE(MAX(PEMBAYARAN_KE), 0)` })
        .from(pembayaranSppt)
        .where(and(
          eq(pembayaranSppt.kdPropinsi, input.kdPropinsi),
          eq(pembayaranSppt.kdDati2, input.kdDati2),
          eq(pembayaranSppt.kdKecamatan, input.kdKecamatan),
          eq(pembayaranSppt.kdKelurahan, input.kdKelurahan),
          eq(pembayaranSppt.kdBlok, input.kdBlok),
          eq(pembayaranSppt.noUrut, input.noUrut),
          eq(pembayaranSppt.kdJnsOp, input.kdJnsOp),
          eq(pembayaranSppt.thnPajakSppt, input.thnPajakSppt),
        ))

      const pembayaranKe = (result?.maxKe ?? 0) + 1

      await db.insert(pembayaranSppt).values({
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
        thnPajakSppt: input.thnPajakSppt,
        pembayaranKe,
        tglPembayaranSppt: new Date(input.tglPembayaranSppt),
        jmlSpptYgDibayar: input.jmlSpptYgDibayar,
        dendaSppt: input.dendaSppt,
        jmlBayar: input.jmlBayar,
        namaBayar: input.namaBayar ?? null,
        channelPembayaran: input.channelPembayaran ?? null,
        noReferensi: input.noReferensi ?? null,
        nipPetugas: input.nipPetugas ?? null,
        dibatalkan: 0,
      })

      // Update SPPT payment status
      // Get total paid vs total due
      const [totalPaid] = await db
        .select({ total: sql<string>`COALESCE(SUM(JML_SPPT_YG_DIBAYAR), 0)` })
        .from(pembayaranSppt)
        .where(and(
          eq(pembayaranSppt.kdPropinsi, input.kdPropinsi),
          eq(pembayaranSppt.kdDati2, input.kdDati2),
          eq(pembayaranSppt.kdKecamatan, input.kdKecamatan),
          eq(pembayaranSppt.kdKelurahan, input.kdKelurahan),
          eq(pembayaranSppt.kdBlok, input.kdBlok),
          eq(pembayaranSppt.noUrut, input.noUrut),
          eq(pembayaranSppt.kdJnsOp, input.kdJnsOp),
          eq(pembayaranSppt.thnPajakSppt, input.thnPajakSppt),
          eq(pembayaranSppt.dibatalkan, 0),
        ))

      const [spptRow] = await db
        .select({ pbb: sppt.pbbYgHarusDibayarSppt })
        .from(sppt)
        .where(and(
          eq(sppt.kdPropinsi, input.kdPropinsi),
          eq(sppt.kdDati2, input.kdDati2),
          eq(sppt.kdKecamatan, input.kdKecamatan),
          eq(sppt.kdKelurahan, input.kdKelurahan),
          eq(sppt.kdBlok, input.kdBlok),
          eq(sppt.noUrut, input.noUrut),
          eq(sppt.kdJnsOp, input.kdJnsOp),
          eq(sppt.thnPajakSppt, input.thnPajakSppt),
        ))

      if (spptRow) {
        const paid = parseFloat(totalPaid?.total ?? "0")
        const due = spptRow.pbb
        let status = 0 // belum
        if (paid >= due) status = 1 // lunas
        else if (paid > 0) status = 2 // kurang bayar

        await db.update(sppt)
          .set({ statusPembayaranSppt: status })
          .where(and(
            eq(sppt.kdPropinsi, input.kdPropinsi),
            eq(sppt.kdDati2, input.kdDati2),
            eq(sppt.kdKecamatan, input.kdKecamatan),
            eq(sppt.kdKelurahan, input.kdKelurahan),
            eq(sppt.kdBlok, input.kdBlok),
            eq(sppt.noUrut, input.noUrut),
            eq(sppt.kdJnsOp, input.kdJnsOp),
            eq(sppt.thnPajakSppt, input.thnPajakSppt),
          ))
      }

      return { success: true, pembayaranKe }
    }),

  // Void payment
  void: os
    .input(nopInput.extend({
      thnPajakSppt: z.number(),
      pembayaranKe: z.number(),
      alasanBatal: z.string(),
    }))
    .handler(async ({ input }) => {
      await db.update(pembayaranSppt)
        .set({
          dibatalkan: 1,
          tglBatal: new Date(),
          alasanBatal: input.alasanBatal,
        })
        .where(and(
          eq(pembayaranSppt.kdPropinsi, input.kdPropinsi),
          eq(pembayaranSppt.kdDati2, input.kdDati2),
          eq(pembayaranSppt.kdKecamatan, input.kdKecamatan),
          eq(pembayaranSppt.kdKelurahan, input.kdKelurahan),
          eq(pembayaranSppt.kdBlok, input.kdBlok),
          eq(pembayaranSppt.noUrut, input.noUrut),
          eq(pembayaranSppt.kdJnsOp, input.kdJnsOp),
          eq(pembayaranSppt.thnPajakSppt, input.thnPajakSppt),
          eq(pembayaranSppt.pembayaranKe, input.pembayaranKe),
        ))
      return { success: true }
    }),
})
