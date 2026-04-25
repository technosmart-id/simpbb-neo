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
    .input(nopInput.extend({ thnPajakSppt: z.number() }))
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
      if (input.thnPajak) conditions.push(eq(sppt.thnPajakSppt, input.thnPajak))
      if (input.kdPropinsi) conditions.push(eq(sppt.kdPropinsi, input.kdPropinsi))
      if (input.kdDati2) conditions.push(eq(sppt.kdDati2, input.kdDati2))
      if (input.kdKecamatan) conditions.push(eq(sppt.kdKecamatan, input.kdKecamatan))
      if (input.kdKelurahan) conditions.push(eq(sppt.kdKelurahan, input.kdKelurahan))
      if (input.statusPembayaran) conditions.push(eq(sppt.statusPembayaranSppt, Number(input.statusPembayaran)))
      if (input.statusCetak) conditions.push(eq(sppt.statusCetakSppt, Number(input.statusCetak)))
      if (input.search) {
        conditions.push(sql`(${sppt.nmWp} LIKE ${`%${input.search}%`} OR ${sppt.noUrut} LIKE ${`%${input.search}%`})`)
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
      thnPajakSppt: z.number(),
      kdKlsTanah: z.string().optional(),
      kdKlsBng: z.string().optional(),
      tglJatuhTempo: z.string().optional(),
      tglTerbit: z.string().optional(),
      luasBumi: z.string(),
      luasBng: z.string(),
      njopBumi: z.string(),
      njopBng: z.string(),
      njopSppt: z.string(),
      njoptkpSppt: z.string(),
      njkpSppt: z.string(),
      pbbTerhutangSppt: z.string(),
      faktorPengurangSppt: z.string(),
      pbbYgHarusDibayarSppt: z.string(),
      nmWp: z.string().optional(),
      jalanWp: z.string().optional(),
      kdJnsSppt: z.number().optional(),
    }))
    .handler(async ({ input }) => {
      await db.insert(sppt).values({
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
        thnPajakSppt: input.thnPajakSppt,
        luasBumi: Number(input.luasBumi),
        luasBng: Number(input.luasBng),
        njopBumi: Number(input.njopBumi),
        njopBng: Number(input.njopBng),
        njopSppt: Number(input.njopSppt),
        njoptkpSppt: Number(input.njoptkpSppt),
        njkpSppt: Number(input.njkpSppt),
        pbbTerhutangSppt: Number(input.pbbTerhutangSppt),
        faktorPengurangSppt: Number(input.faktorPengurangSppt),
        pbbYgHarusDibayarSppt: Number(input.pbbYgHarusDibayarSppt),
        kdKlsTanah: input.kdKlsTanah ?? null,
        kdKlsBng: input.kdKlsBng ?? null,
        tglJatuhTempo: input.tglJatuhTempo ? new Date(input.tglJatuhTempo) : null,
        tglTerbitSppt: input.tglTerbit ? new Date(input.tglTerbit) : null,
        nmWp: input.nmWp ?? null,
        jalanWp: input.jalanWp ?? null,
        siklusSppt: 1,
        statusPembayaranSppt: 0,
        statusTagihanSppt: 0,
        statusCetakSppt: 0,
      })
      return { success: true }
    }),

  // Recalculate SPPT (BR-08: increment siklus, save history)
  recalculate: os
    .input(nopInput.extend({
      thnPajakSppt: z.number(),
      njopBumi: z.string(),
      njopBng: z.string(),
      njopSppt: z.string(),
      njoptkpSppt: z.string(),
      njkpSppt: z.string(),
      pbbTerhutangSppt: z.string(),
      faktorPengurangSppt: z.string(),
      pbbYgHarusDibayarSppt: z.string(),
      kdKlsTanah: z.string().optional(),
      kdKlsBng: z.string().optional(),
      luasBumi: z.string().optional(),
      luasBng: z.string().optional(),
      keterangan: z.string().optional(),
      nipPetugas: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      // Get current SPPT for history
      const [current] = await db.select().from(sppt).where(
        and(nopWhere(sppt, input), eq(sppt.thnPajakSppt, input.thnPajakSppt)),
      )
      if (!current) throw new Error("SPPT tidak ditemukan")

      // Save to history (BR-08)
      await db.insert(historiSppt).values({
        kdPropinsi: current.kdPropinsi,
        kdDati2: current.kdDati2,
        kdKecamatan: current.kdKecamatan,
        kdKelurahan: current.kdKelurahan,
        kdBlok: current.kdBlok,
        noUrut: current.noUrut,
        kdJnsOp: current.kdJnsOp,
        thnPajakSppt: current.thnPajakSppt,
        siklusSppt: current.siklusSppt ?? 0,
        njopBumi: String(current.njopBumi),
        njopBng: String(current.njopBng),
        njopSppt: String(current.njopSppt),
        njoptkpSppt: String(current.njoptkpSppt),
        njkpSppt: String(current.njkpSppt),
        pbbTerhutangSppt: String(current.pbbTerhutangSppt),
        faktorPengurangSppt: String(current.faktorPengurangSppt),
        pbbYgHarusDibayarSppt: String(current.pbbYgHarusDibayarSppt),
        nipPetugas: input.nipPetugas ?? null,
        keterangan: input.keterangan ?? null,
      })

      // Update SPPT with new values and increment siklus
      await db.update(sppt).set({
        njopBumi: Number(input.njopBumi),
        njopBng: Number(input.njopBng),
        njopSppt: Number(input.njopSppt),
        njoptkpSppt: Number(input.njoptkpSppt),
        njkpSppt: Number(input.njkpSppt),
        pbbTerhutangSppt: Number(input.pbbTerhutangSppt),
        faktorPengurangSppt: Number(input.faktorPengurangSppt),
        pbbYgHarusDibayarSppt: Number(input.pbbYgHarusDibayarSppt),
        ...(input.kdKlsTanah && { kdKlsTanah: input.kdKlsTanah }),
        ...(input.kdKlsBng && { kdKlsBng: input.kdKlsBng }),
        ...(input.luasBumi && { luasBumi: Number(input.luasBumi) }),
        ...(input.luasBng && { luasBng: Number(input.luasBng) }),
        siklusSppt: (current.siklusSppt ?? 0) + 1,
      }).where(and(nopWhere(sppt, input), eq(sppt.thnPajakSppt, input.thnPajakSppt)))

      return { success: true, newSiklus: (current.siklusSppt ?? 0) + 1 }
    }),

  // Update print status
  markPrinted: os
    .input(nopInput.extend({ thnPajakSppt: z.number() }))
    .handler(async ({ input }) => {
      await db.update(sppt)
        .set({ statusCetakSppt: 1, tglCetakSppt: new Date() })
        .where(and(nopWhere(sppt, input), eq(sppt.thnPajakSppt, input.thnPajakSppt)))
      return { success: true }
    }),

  // Check if SPPT has payments (BR-11)
  hasPayments: os
    .input(nopInput.extend({ thnPajakSppt: z.number() }))
    .handler(async ({ input }) => {
      const [result] = await db.select({ count: sql<number>`count(*)` })
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
      return { hasPayments: (result?.count ?? 0) > 0 }
    }),

  // Get SPPT history
  getHistory: os
    .input(nopInput.extend({ thnPajakSppt: z.number() }))
    .handler(async ({ input }) => {
      return db.select().from(historiSppt)
        .where(and(
          eq(historiSppt.kdPropinsi, input.kdPropinsi),
          eq(historiSppt.kdDati2, input.kdDati2),
          eq(historiSppt.kdKecamatan, input.kdKecamatan),
          eq(historiSppt.kdKelurahan, input.kdKelurahan),
          eq(historiSppt.kdBlok, input.kdBlok),
          eq(historiSppt.noUrut, input.noUrut),
          eq(historiSppt.kdJnsOp, input.kdJnsOp),
          eq(historiSppt.thnPajakSppt, input.thnPajakSppt),
        ))
        .orderBy(desc(historiSppt.tglPerubahan))
    }),
})
