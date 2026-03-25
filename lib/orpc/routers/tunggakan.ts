import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { sppt } from "@/lib/db/schema"
import { eq, and, sql, lt, desc } from "drizzle-orm"

export const tunggakanRouter = os.router({
  // List arrears (SPPT with status != lunas for past years)
  list: os
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
      thnPajakMax: z.number(),
      kdPropinsi: z.string().optional(),
      kdDati2: z.string().optional(),
      kdKecamatan: z.string().optional(),
      kdKelurahan: z.string().optional(),
      search: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const conditions = [
        sql`${sppt.statusPembayaranSppt} != '1'`,
        sql`${sppt.thnPajakSppt} <= ${input.thnPajakMax}`,
      ]
      if (input.kdPropinsi) conditions.push(eq(sppt.kdPropinsi, input.kdPropinsi))
      if (input.kdDati2) conditions.push(eq(sppt.kdDati2, input.kdDati2))
      if (input.kdKecamatan) conditions.push(eq(sppt.kdKecamatan, input.kdKecamatan))
      if (input.kdKelurahan) conditions.push(eq(sppt.kdKelurahan, input.kdKelurahan))
      if (input.search) {
        conditions.push(sql`(${sppt.nmWp} LIKE ${`%${input.search}%`} OR ${sppt.noUrut} LIKE ${`%${input.search}%`})`)
      }

      const where = and(...conditions)

      const rows = await db.select().from(sppt).where(where)
        .orderBy(sppt.thnPajakSppt, sppt.kdKecamatan, sppt.kdKelurahan, sppt.noUrut)
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(sppt).where(where)

      const [totalAmount] = await db
        .select({ total: sql<string>`COALESCE(SUM(PBB_YG_HARUS_DIBAYAR_SPPT), 0)` })
        .from(sppt)
        .where(where)

      return {
        rows,
        total: totalResult?.count ?? 0,
        totalTunggakan: totalAmount?.total ?? "0",
      }
    }),

  // Summary per year
  summaryPerYear: os
    .input(z.object({
      kdPropinsi: z.string().optional(),
      kdDati2: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const conditions = [sql`${sppt.statusPembayaranSppt} != '1'`]
      if (input.kdPropinsi) conditions.push(eq(sppt.kdPropinsi, input.kdPropinsi))
      if (input.kdDati2) conditions.push(eq(sppt.kdDati2, input.kdDati2))

      return db
        .select({
          thnPajak: sppt.thnPajakSppt,
          jumlahSppt: sql<number>`count(*)`,
          totalTunggakan: sql<string>`COALESCE(SUM(PBB_YG_HARUS_DIBAYAR_SPPT), 0)`,
        })
        .from(sppt)
        .where(and(...conditions))
        .groupBy(sppt.thnPajakSppt)
        .orderBy(desc(sppt.thnPajakSppt))
    }),
})
