import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { spop, sppt, pembayaranSppt, pelayanan } from "@/lib/db/schema"
import { eq, sql, and } from "drizzle-orm"

export const dashboardRouter = os.router({
  // Summary counts
  summary: os
    .input(z.object({ thnPajak: z.number() }))
    .handler(async ({ input }) => {
      const thnPajakStr = String(input.thnPajak)
      const [totalOp] = await db.select({ count: sql<number>`count(*)` }).from(spop)

      const [totalSppt] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sppt)
        .where(eq(sppt.thnPajakSppt, thnPajakStr))

      const [ketetapan] = await db
        .select({ total: sql<string>`COALESCE(SUM(PBB_YG_HARUS_DIBAYAR_SPPT), 0)` })
        .from(sppt)
        .where(eq(sppt.thnPajakSppt, thnPajakStr))

      const [realisasi] = await db
        .select({ total: sql<string>`COALESCE(SUM(JML_SPPT_YG_DIBAYAR), 0)` })
        .from(pembayaranSppt)
        .where(and(
          eq(pembayaranSppt.thnPajakSppt, thnPajakStr),
          eq(pembayaranSppt.dibatalkan, 0),
        ))

      const [lunas] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sppt)
        .where(and(
          eq(sppt.thnPajakSppt, thnPajakStr),
          eq(sppt.statusPembayaranSppt, 1),
        ))

      const [belumBayar] = await db
        .select({ count: sql<number>`count(*)` })
        .from(sppt)
        .where(and(
          eq(sppt.thnPajakSppt, thnPajakStr),
          eq(sppt.statusPembayaranSppt, 0),
        ))

      const [pelayananAktif] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pelayanan)
        .where(sql`${pelayanan.statusPelayanan} < 4`)

      return {
        totalOp: totalOp?.count ?? 0,
        totalSppt: totalSppt?.count ?? 0,
        ketetapan: ketetapan?.total ?? "0",
        realisasi: realisasi?.total ?? "0",
        lunas: lunas?.count ?? 0,
        belumBayar: belumBayar?.count ?? 0,
        pelayananAktif: pelayananAktif?.count ?? 0,
      }
    }),

  // Realisasi per kecamatan
  realisasiPerKecamatan: os
    .input(z.object({ thnPajak: z.number() }))
    .handler(async ({ input }) => {
      const thnPajakStr = String(input.thnPajak)
      return db
        .select({
          kdKecamatan: sppt.kdKecamatan,
          totalKetetapan: sql<string>`COALESCE(SUM(PBB_YG_HARUS_DIBAYAR_SPPT), 0)`,
          totalSppt: sql<number>`count(*)`,
        })
        .from(sppt)
        .where(eq(sppt.thnPajakSppt, thnPajakStr))
        .groupBy(sppt.kdKecamatan)
        .orderBy(sppt.kdKecamatan)
    }),

  // Payment status distribution
  paymentDistribution: os
    .input(z.object({ thnPajak: z.number() }))
    .handler(async ({ input }) => {
      const thnPajakStr = String(input.thnPajak)
      return db
        .select({
          status: sppt.statusPembayaranSppt,
          count: sql<number>`count(*)`,
          total: sql<string>`COALESCE(SUM(PBB_YG_HARUS_DIBAYAR_SPPT), 0)`,
        })
        .from(sppt)
        .where(eq(sppt.thnPajakSppt, thnPajakStr))
        .groupBy(sppt.statusPembayaranSppt)
    }),
})
