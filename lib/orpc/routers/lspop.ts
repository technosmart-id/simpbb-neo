import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { datOpBangunan, datFasilitasBangunan } from "@/lib/db/schema"
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

function nopWhere(table: typeof datOpBangunan, input: z.infer<typeof nopInput>) {
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

export const lspopRouter = os.router({
  // List buildings for a NOP
  listByNop: os
    .input(nopInput)
    .handler(async ({ input }) => {
      return db.select().from(datOpBangunan)
        .where(nopWhere(datOpBangunan, input))
        .orderBy(datOpBangunan.noBng)
    }),

  // Get single building
  getBuilding: os
    .input(nopInput.extend({ noBng: z.number() }))
    .handler(async ({ input }) => {
      const [row] = await db.select().from(datOpBangunan)
        .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, input.noBng)))
      return row ?? null
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
    }))
    .handler(async ({ input }) => {
      await db.insert(datOpBangunan).values({
        ...input,
        kdJpb: input.kdJpb ?? null,
        thnDibangunBng: input.thnDibangunBng ?? null,
        thnRenovasiBng: input.thnRenovasiBng ?? null,
        kondisiBng: input.kondisiBng ?? null,
        jnsKonstruksiBng: input.jnsKonstruksiBng ?? null,
        jnsAtapBng: input.jnsAtapBng ?? null,
        kdDinding: input.kdDinding ?? null,
        kdLantai: input.kdLantai ?? null,
        kdLangitLangit: input.kdLangitLangit ?? null,
        aktif: 1,
      })
      return { success: true }
    }),

  // Update building
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
    }))
    .handler(async ({ input }) => {
      const { kdPropinsi, kdDati2, kdKecamatan, kdKelurahan, kdBlok, noUrut, kdJnsOp, noBng, ...updates } = input
      const setValues: Record<string, any> = {}
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) setValues[k] = v
      }
      if (Object.keys(setValues).length === 0) return { success: true }

      await db.update(datOpBangunan).set(setValues).where(
        and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)),
      )
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

      return { nextNoBng: (result?.maxBng ?? 0) + 1 }
    }),
})
