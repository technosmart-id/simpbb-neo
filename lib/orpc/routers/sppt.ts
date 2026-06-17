import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { sppt, historiSppt, pembayaranSppt } from "@/lib/db/schema"
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

function nopWhere(table: typeof sppt, input: z.infer<typeof nopInput>) {
  return and(
    eq(table.kdPropinsi, input.kdPropinsi),
    eq(table.kdDati2, input.kdDati2),
    eq(table.kdKecamatan, input.kdKecamatan),
    eq(table.kdKelurahan, input.kdKelurahan),
    eq(table.kdBlok, input.kdBlok),
    eq(table.noUrut, input.noUrut),
    eq(table.kdJnsOp, input.kdJnsOp),
  )
}

export const spptRouter = os.router({
  // List SPPT for a NOP (all years)
  listByNop: os
    .input(nopInput)
    .handler(async ({ input }) => {
      return db.select().from(sppt)
        .where(nopWhere(sppt, input))
        .orderBy(desc(sppt.thnPajakSppt))
    }),

  // Get single SPPT
  get: os
    .input(nopInput.extend({ thnPajakSppt: z.string() }))
    .handler(async ({ input }) => {
      const [row] = await db.select().from(sppt)
        .where(and(nopWhere(sppt, input), eq(sppt.thnPajakSppt, input.thnPajakSppt)))
      return row ?? null
    }),

  // List SPPT with filters (for cetak, reports, etc.)
  list: os
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
      thnPajak: z.number().optional(),
      kdPropinsi: z.string().optional(),
      kdDati2: z.string().optional(),
      kdKecamatan: z.string().optional(),
      kdKelurahan: z.string().optional(),
      statusPembayaran: z.string().optional(),
      statusCetak: z.string().optional(),
      search: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const conditions = []
      if (input.thnPajak) conditions.push(eq(sppt.thnPajakSppt, String(input.thnPajak)))
      if (input.kdPropinsi) conditions.push(eq(sppt.kdPropinsi, input.kdPropinsi))
      if (input.kdDati2) conditions.push(eq(sppt.kdDati2, input.kdDati2))
      if (input.kdKecamatan) conditions.push(eq(sppt.kdKecamatan, input.kdKecamatan))
      if (input.kdKelurahan) conditions.push(eq(sppt.kdKelurahan, input.kdKelurahan))
      if (input.statusPembayaran) conditions.push(eq(sppt.statusPembayaranSppt, Number(input.statusPembayaran)))
      if (input.statusCetak) conditions.push(eq(sppt.statusCetakSppt, Number(input.statusCetak)))
      if (input.search) {
        conditions.push(sql`(${sppt.nmWpSppt} LIKE ${`%${input.search}%`} OR ${sppt.noUrut} LIKE ${`%${input.search}%`})`)
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const rows = await db.select().from(sppt).where(where)
        .orderBy(desc(sppt.thnPajakSppt), sppt.kdPropinsi, sppt.kdDati2, sppt.kdKecamatan, sppt.kdKelurahan, sppt.kdBlok, sppt.noUrut)
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(sppt).where(where)

      return { rows, total: totalResult?.count ?? 0 }
    }),

  // Create/generate SPPT
  create: os
    .input(nopInput.extend({
      thnPajakSppt: z.string(),
      kdKlsTanah: z.string().optional(),
      kdKlsBng: z.string().optional(),
      tglJatuhTempoSppt: z.string().optional(),
      tglTerbitSppt: z.string().optional(),
      luasBumiSppt: z.string(),
      luasBngSppt: z.string(),
      njopBumiSppt: z.string(),
      njopBngSppt: z.string(),
      njopSppt: z.string(),
      njoptkpSppt: z.string(),
      pbbTerhutangSppt: z.string(),
      faktorPengurangSppt: z.string(),
      pbbYgHarusDibayarSppt: z.string(),
      nipPencetakSppt: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const thnPajak = input.thnPajakSppt

      // Check if SPPT already exists
      const [existing] = await db.select().from(sppt)
        .where(and(nopWhere(sppt, input), eq(sppt.thnPajakSppt, thnPajak)))

      if (existing) {
        throw new Error("SPPT already exists for this NOP and year")
      }

      await db.insert(sppt).values({
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
        thnPajakSppt: thnPajak,
        siklusSppt: 1,
        kdKanwilBank: "01",
        kdKppbbBank: "01",
        kdBankTunggal: "01",
        kdBankPersepsi: "01",
        kdTp: "01",
        nmWpSppt: "",
        jlnWpSppt: "",
        blokKavNoWpSppt: "",
        rwWpSppt: "",
        rtWpSppt: "",
        kelurahanWpSppt: "",
        kotaWpSppt: "",
        kdPosWpSppt: "",
        npwpSppt: "",
        noPersilSppt: "",
        kdKlsTanah: input.kdKlsTanah ?? "",
        thnAwalKlsTanah: thnPajak,
        kdKlsBng: input.kdKlsBng ?? "",
        thnAwalKlsBng: thnPajak,
        tglJatuhTempoSppt: input.tglJatuhTempoSppt ? new Date(input.tglJatuhTempoSppt) : null,
        luasBumiSppt: BigInt(parseInt(input.luasBumiSppt) || 0),
        luasBngSppt: BigInt(parseInt(input.luasBngSppt) || 0),
        njopBumiSppt: BigInt(parseInt(input.njopBumiSppt) || 0),
        njopBngSppt: BigInt(parseInt(input.njopBngSppt) || 0),
        njopSppt: BigInt(parseInt(input.njopSppt) || 0),
        njoptkpSppt: parseInt(input.njoptkpSppt) || 0,
        njkpSppt: BigInt(0),
        pbbTerhutangSppt: BigInt(parseInt(input.pbbTerhutangSppt) || 0),
        faktorPengurangSppt: BigInt(parseInt(input.faktorPengurangSppt) || 0),
        pbbYgHarusDibayarSppt: BigInt(parseInt(input.pbbYgHarusDibayarSppt) || 0),
        statusPembayaranSppt: 0,
        statusTagihanSppt: 0,
        statusCetakSppt: 0,
        tglTerbitSppt: input.tglTerbitSppt ? new Date(input.tglTerbitSppt) : null,
        nipPencetakSppt: input.nipPencetakSppt ?? null,
      } as any)

      return { success: true }
    }),

  // Delete SPPT (only if no payments)
  delete: os
    .input(nopInput.extend({ thnPajakSppt: z.string() }))
    .handler(async ({ input }) => {
      const thnPajak = input.thnPajakSppt

      // Check for existing payments
      const [payments] = await db.select({ count: sql<number>`count(*)` })
        .from(pembayaranSppt)
        .where(and(
          nopWhere(pembayaranSppt as any, input as any),
          eq(pembayaranSppt.thnPajakSppt, thnPajak),
        ))

      if (payments && payments.count > 0) {
        throw new Error("Cannot delete SPPT with existing payments")
      }

      await db.delete(sppt)
        .where(and(nopWhere(sppt, input), eq(sppt.thnPajakSppt, thnPajak)))

      return { success: true }
    }),
})
