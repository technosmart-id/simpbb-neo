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
      if (input.thnPajak) conditions.push(eq(pembayaranSppt.thnPajakSppt, String(input.thnPajak)))
      if (input.kdPropinsi) conditions.push(eq(pembayaranSppt.kdPropinsi, input.kdPropinsi))
      if (input.kdDati2) conditions.push(eq(pembayaranSppt.kdDati2, input.kdDati2))
      if (input.kdKecamatan) conditions.push(eq(pembayaranSppt.kdKecamatan, input.kdKecamatan))
      if (input.kdKelurahan) conditions.push(eq(pembayaranSppt.kdKelurahan, input.kdKelurahan))
      // Note: namaBayar doesn't exist in schema, search by NOP or noBukti instead
      if (input.search) {
        conditions.push(sql`(${pembayaranSppt.noUrut} LIKE ${`%${input.search}%`} OR ${pembayaranSppt.noBukti} LIKE ${`%${input.search}%`})`)
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
    .input(nopInput.extend({ thnPajakSppt: z.string() }))
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
      )).orderBy(pembayaranSppt.pembayaranSpptKe)
    }),

  // Record payment
  create: os
    .input(nopInput.extend({
      thnPajakSppt: z.string(),
      tglPembayaranSppt: z.string(),
      jmlSpptYgDibayar: z.string(),
      dendaSppt: z.string(),
      // Optional fields that will be stored in noBukti if needed
      noBukti: z.string().optional(),
      nipRekamByrSppt: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const thnPajak = input.thnPajakSppt

      // Get next pembayaran_sppt_ke
      const [result] = await db
        .select({ maxKe: sql<number>`COALESCE(MAX(PEMBAYARAN_SPPT_KE), 0)` })
        .from(pembayaranSppt)
        .where(and(
          eq(pembayaranSppt.kdPropinsi, input.kdPropinsi),
          eq(pembayaranSppt.kdDati2, input.kdDati2),
          eq(pembayaranSppt.kdKecamatan, input.kdKecamatan),
          eq(pembayaranSppt.kdKelurahan, input.kdKelurahan),
          eq(pembayaranSppt.kdBlok, input.kdBlok),
          eq(pembayaranSppt.noUrut, input.noUrut),
          eq(pembayaranSppt.kdJnsOp, input.kdJnsOp),
          eq(pembayaranSppt.thnPajakSppt, thnPajak),
        ))

      const pembayaranSpptKe = (result?.maxKe ?? 0) + 1

      await db.insert(pembayaranSppt).values({
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
        thnPajakSppt: thnPajak,
        pembayaranSpptKe,
        // Bank codes - using defaults
        kdKanwilBank: "01",
        kdKppbbBank: "01",
        kdBankTunggal: "01",
        kdBankPersepsi: "01",
        kdTp: "01",
        // Payment details
        dendaSppt: BigInt(parseInt(input.dendaSppt) || 0),
        jmlSpptYgDibayar: BigInt(parseInt(input.jmlSpptYgDibayar) || 0),
        tglPembayaranSppt: new Date(input.tglPembayaranSppt),
        tglRekamByrSppt: new Date(),
        nipRekamByrSppt: input.nipRekamByrSppt ?? "SYSTEM",
        noBukti: input.noBukti ?? null,
      } as any)

      // Update SPPT payment status
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
          eq(pembayaranSppt.thnPajakSppt, thnPajak),
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
          eq(sppt.thnPajakSppt, thnPajak),
        ))

      if (spptRow) {
        const paid = parseFloat(totalPaid?.total ?? "0")
        const due = Number(spptRow.pbb)
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
            eq(sppt.thnPajakSppt, thnPajak),
          ))
      }

      return { success: true, pembayaranKe: pembayaranSpptKe }
    }),
})
