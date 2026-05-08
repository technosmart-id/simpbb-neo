import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import {
  datOpBangunan,
  datFasilitasBangunan,
  datJpb2,
  datJpb3,
  datJpb4,
  datJpb5,
  datJpb6,
  datJpb7,
  datJpb8,
  datJpb9,
  datJpb12,
  datJpb13,
  datJpb14,
  datJpb15,
  datJpb16,
  spop
} from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"

const nopInput = z.object({
  kdPropinsi: z.string().length(2),
  kdDati2: z.string().length(2),
  kdKecamatan: z.string().length(3),
  kdKelurahan: z.string().length(3),
  kdBlok: z.string().length(3),
  noUrut: z.string().length(4),
  kdJnsOp: z.string().length(1),
})

function nopWhere(table: any, input: z.infer<typeof nopInput>) {
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

function baseNop(input: z.infer<typeof nopInput>) {
  return {
    kdPropinsi: input.kdPropinsi,
    kdDati2: input.kdDati2,
    kdKecamatan: input.kdKecamatan,
    kdKelurahan: input.kdKelurahan,
    kdBlok: input.kdBlok,
    noUrut: input.noUrut,
    kdJnsOp: input.kdJnsOp,
  }
}

const jpbTableMap: Record<string, any> = {
  '02': datJpb2,
  '03': datJpb3,
  '04': datJpb4,
  '05': datJpb5,
  '06': datJpb6,
  '07': datJpb7,
  '08': datJpb8,
  '09': datJpb9,
  '12': datJpb12,
  '13': datJpb13,
  '14': datJpb14,
  '15': datJpb15,
  '16': datJpb16,
}

export const lspopRouter = os.router({
  // List buildings for a NOP with JPB details
  listByNop: os
    .input(nopInput)
    .handler(async ({ input }) => {
      const buildings = await db.select().from(datOpBangunan)
        .where(nopWhere(datOpBangunan, input))
        .orderBy(datOpBangunan.noBng)

      // Fetch JPB details for each building
      return Promise.all(buildings.map(async (b) => {
        let jpbDetails = null
        const table = b.kdJpb ? jpbTableMap[b.kdJpb] : null
        if (table) {
          const [jpb] = await db.select().from(table).where(and(nopWhere(table, input), eq(table.noBng, b.noBng)))
          jpbDetails = jpb
        }
        return { ...b, jpbDetails }
      }))
    }),

  // Get single building with its JPB details
  getBuilding: os
    .input(nopInput.extend({ noBng: z.number() }))
    .handler(async ({ input }) => {
      const [row] = await db.select().from(datOpBangunan)
        .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, input.noBng)))
      
      if (!row) return null

      let jpbDetails = null
      const table = row.kdJpb ? jpbTableMap[row.kdJpb] : null
      if (table) {
        const [jpb] = await db.select().from(table).where(and(nopWhere(table, input), eq(table.noBng, input.noBng)))
        jpbDetails = jpb
      }

      return { ...row, jpbDetails }
    }),

  // Create building
  create: os
    .input(nopInput.extend({
      noBng: z.number(),
      kdJpb: z.string().optional(),
      luasBng: z.number(),
      jmlLantaiBng: z.number().default(1),
      thnDibangunBng: z.string().optional(),
      thnRenovasiBng: z.string().optional(),
      kondisiBng: z.string().optional(),
      jnsKonstruksiBng: z.string().optional(),
      jnsAtapBng: z.string().optional(),
      kdDinding: z.string().optional(),
      kdLantai: z.string().optional(),
      kdLangitLangit: z.string().optional(),
      nilaiSistemBng: z.number().default(0),
      jpbDetails: z.any().optional(),
    }))
    .handler(async ({ input }) => {
      const { jpbDetails, ...bngData } = input
      await db.insert(datOpBangunan).values({
        ...bngData,
        kdJpb: input.kdJpb ?? null,
        thnDibangunBng: input.thnDibangunBng ?? '0',
        thnRenovasiBng: input.thnRenovasiBng ?? null,
        kondisiBng: input.kondisiBng ?? null,
        jnsKonstruksiBng: input.jnsKonstruksiBng ?? null,
        jnsAtapBng: input.jnsAtapBng ?? null,
        kdDinding: input.kdDinding ?? null,
        kdLantai: input.kdLantai ?? null,
        kdLangitLangit: input.kdLangitLangit ?? null,
        aktif: 1,
      })

      if (jpbDetails && input.kdJpb) {
        const table = jpbTableMap[input.kdJpb]
        if (table) {
          await db.insert(table).values({ ...baseNop(input), noBng: input.noBng, ...jpbDetails })
        }
      }

      return { success: true }
    }),

  // Update building and JPB details
  update: os
    .input(nopInput.extend({
      noBng: z.number(),
      kdJpb: z.string().optional(),
      luasBng: z.number().optional(),
      jmlLantaiBng: z.number().optional(),
      thnDibangunBng: z.string().optional(),
      thnRenovasiBng: z.string().optional(),
      kondisiBng: z.string().optional(),
      jnsKonstruksiBng: z.string().optional(),
      jnsAtapBng: z.string().optional(),
      kdDinding: z.string().optional(),
      kdLantai: z.string().optional(),
      kdLangitLangit: z.string().optional(),
      nilaiSistemBng: z.number().optional(),
      jpbDetails: z.any().optional(),
    }))
    .handler(async ({ input }) => {
      const { kdPropinsi, kdDati2, kdKecamatan, kdKelurahan, kdBlok, noUrut, kdJnsOp, noBng, jpbDetails, ...updates } = input
      const setValues: Record<string, any> = {}
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) setValues[k] = v
      }
      
      if (Object.keys(setValues).length > 0) {
        await db.update(datOpBangunan).set(setValues).where(
          and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)),
        )
      }

      if (jpbDetails) {
        const [current] = await db.select({ kdJpb: datOpBangunan.kdJpb }).from(datOpBangunan)
          .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)))
          .limit(1)
        
        const oldKdJpb = current?.kdJpb
        const newKdJpb = updates.kdJpb || oldKdJpb

        // If usage changed, cleanup old table
        if (oldKdJpb && newKdJpb && oldKdJpb !== newKdJpb) {
          const oldTable = jpbTableMap[oldKdJpb]
          if (oldTable) {
            await db.delete(oldTable).where(and(nopWhere(oldTable, input), eq(oldTable.noBng, noBng)))
          }
        }

        const table = newKdJpb ? jpbTableMap[newKdJpb] : null
        if (table) {
          await db.insert(table).values({ ...baseNop(input), noBng, ...jpbDetails }).onDuplicateKeyUpdate({ set: jpbDetails })
        }
      }

      return { success: true }
    }),

  // Soft-delete building (BR-12)
  softDelete: os
    .input(nopInput.extend({ noBng: z.number() }))
    .handler(async ({ input }) => {
      await db.update(datOpBangunan)
        .set({ aktif: 0 })
        .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, input.noBng)))
      return { success: true }
    }),

  // ── Fasilitas ──
  listFasilitas: os
    .input(nopInput.extend({ noBng: z.number() }))
    .handler(async ({ input }) => {
      return db.select().from(datFasilitasBangunan)
        .where(and(
          eq(datFasilitasBangunan.kdPropinsi, input.kdPropinsi),
          eq(datFasilitasBangunan.kdDati2, input.kdDati2),
          eq(datFasilitasBangunan.kdKecamatan, input.kdKecamatan),
          eq(datFasilitasBangunan.kdKelurahan, input.kdKelurahan),
          eq(datFasilitasBangunan.kdBlok, input.kdBlok),
          eq(datFasilitasBangunan.noUrut, input.noUrut),
          eq(datFasilitasBangunan.kdJnsOp, input.kdJnsOp),
          eq(datFasilitasBangunan.noBng, input.noBng),
        ))
        .orderBy(datFasilitasBangunan.kdFasilitas)
    }),

  setFasilitas: os
    .input(nopInput.extend({
      noBng: z.number(),
      fasilitas: z.array(z.object({
        kdFasilitas: z.string().length(2),
        jmlSatuan: z.number(),
      })),
    }))
    .handler(async ({ input }) => {
      // Delete existing
      await db.delete(datFasilitasBangunan).where(and(
        eq(datFasilitasBangunan.kdPropinsi, input.kdPropinsi),
        eq(datFasilitasBangunan.kdDati2, input.kdDati2),
        eq(datFasilitasBangunan.kdKecamatan, input.kdKecamatan),
        eq(datFasilitasBangunan.kdKelurahan, input.kdKelurahan),
        eq(datFasilitasBangunan.kdBlok, input.kdBlok),
        eq(datFasilitasBangunan.noUrut, input.noUrut),
        eq(datFasilitasBangunan.kdJnsOp, input.kdJnsOp),
        eq(datFasilitasBangunan.noBng, input.noBng),
      ))

      // Insert new
      if (input.fasilitas.length > 0) {
        await db.insert(datFasilitasBangunan).values(
          input.fasilitas.map((f) => ({
            kdPropinsi: input.kdPropinsi,
            kdDati2: input.kdDati2,
            kdKecamatan: input.kdKecamatan,
            kdKelurahan: input.kdKelurahan,
            kdBlok: input.kdBlok,
            noUrut: input.noUrut,
            kdJnsOp: input.kdJnsOp,
            noBng: input.noBng,
            kdFasilitas: f.kdFasilitas,
            jmlSatuan: f.jmlSatuan,
          })),
        )
      }

      return { success: true }
    }),

  // Next available building number for a NOP
  nextNoBng: os
    .input(nopInput)
    .handler(async ({ input }) => {
      const [result] = await db
        .select({ maxBng: sql<number>`MAX(NO_BNG)` })
        .from(datOpBangunan)
        .where(nopWhere(datOpBangunan, input))

      return { nextNoBng: Number(result?.maxBng ?? 0) + 1 }
    }),
  
  // Get SPOP data for existence check
  getSpop: os
    .input(nopInput)
    .handler(async ({ input }) => {
      const [row] = await db.select().from(spop).where(nopWhere(spop, input))
      return row || null
    }),
})
