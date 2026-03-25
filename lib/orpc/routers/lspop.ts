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

async function calculateNilaiSistemBng(input: {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  noBng: number
  kdJpb?: string | null
  luasBng: number
  jmlLantaiBng: number
}): Promise<number> {
  try {
    // Step 1: sync cav_sismiop internal state
    await db.execute(sql`
      CALL cav_sismiop.\`insert\`(
        ${input.kdPropinsi}, ${input.kdDati2}, ${input.kdKecamatan},
        ${input.kdKelurahan}, ${input.kdBlok}, ${input.noUrut},
        ${input.kdJnsOp}, ${input.noBng}
      )
    `)
    // Step 2: calculate building value
    const result = await db.execute(sql`
      SELECT cav_sismiop.HITUNG_BNG(
        ${input.kdPropinsi}, ${input.kdDati2}, ${input.kdKecamatan},
        ${input.kdKelurahan}, ${input.kdBlok}, ${input.noUrut},
        ${input.kdJnsOp}, ${input.noBng},
        ${input.kdJpb ?? '01'}, ${input.luasBng}, ${input.jmlLantaiBng},
        YEAR(NOW())
      ) AS nilai
    `)
    return Number((result[0] as unknown as Array<{ nilai: unknown }>)[0]?.nilai ?? 0)
  } catch {
    // If proc doesn't exist in this environment, return 0 gracefully
    return 0
  }
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
      nilaiIndividu: z.number().default(0),
      // JPB-specific fields
      tingKolomJpb3: z.number().optional(),
      lbrBentJpb3: z.number().optional(),
      dayaDukungLantaiJpb3: z.number().optional(),
      kelilingDindingJpb3: z.number().optional(),
      luasMezzanineJpb3: z.number().optional(),
      klsJpb2: z.number().optional(),
      klsJpb4: z.number().optional(),
      klsJpb5: z.number().optional(),
      klsJpb6: z.number().optional(),
      jnsJpb7: z.string().optional(),
      bintangJpb7: z.number().optional(),
      jmlKmrJpb7: z.number().optional(),
      luasKmrJpb7DgnAcSent: z.string().optional(),
      luasKmrLainJpb7DgnAcSent: z.string().optional(),
      klsJpb13: z.number().optional(),
      klsJpb16: z.number().optional(),
    }))
    .handler(async ({ input }) => {
      await db.insert(datOpBangunan).values({
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
        noBng: input.noBng,
        kdJpb: input.kdJpb ?? null,
        luasBng: input.luasBng,
        jmlLantaiBng: input.jmlLantaiBng,
        thnDibangunBng: input.thnDibangunBng ?? null,
        thnRenovasiBng: input.thnRenovasiBng ?? null,
        kondisiBng: input.kondisiBng ?? null,
        jnsKonstruksiBng: input.jnsKonstruksiBng ?? null,
        jnsAtapBng: input.jnsAtapBng ?? null,
        kdDinding: input.kdDinding ?? null,
        kdLantai: input.kdLantai ?? null,
        kdLangitLangit: input.kdLangitLangit ?? null,
        nilaiSistemBng: 0,
        nilaiIndividu: input.nilaiIndividu,
        tingKolomJpb3: input.tingKolomJpb3 ?? null,
        lbrBentJpb3: input.lbrBentJpb3 ?? null,
        dayaDukungLantaiJpb3: input.dayaDukungLantaiJpb3 ?? null,
        kelilingDindingJpb3: input.kelilingDindingJpb3 ?? null,
        luasMezzanineJpb3: input.luasMezzanineJpb3 ?? null,
        klsJpb2: input.klsJpb2 ?? null,
        klsJpb4: input.klsJpb4 ?? null,
        klsJpb5: input.klsJpb5 ?? null,
        klsJpb6: input.klsJpb6 ?? null,
        jnsJpb7: input.jnsJpb7 ?? null,
        bintangJpb7: input.bintangJpb7 ?? null,
        jmlKmrJpb7: input.jmlKmrJpb7 ?? null,
        luasKmrJpb7DgnAcSent: input.luasKmrJpb7DgnAcSent ?? null,
        luasKmrLainJpb7DgnAcSent: input.luasKmrLainJpb7DgnAcSent ?? null,
        klsJpb13: input.klsJpb13 ?? null,
        klsJpb16: input.klsJpb16 ?? null,
        aktif: 1,
      })

      // Wire HITUNG_BNG — only if nilaiIndividu is not set
      if (!input.nilaiIndividu) {
        const nilaiSistemBng = await calculateNilaiSistemBng({
          kdPropinsi: input.kdPropinsi,
          kdDati2: input.kdDati2,
          kdKecamatan: input.kdKecamatan,
          kdKelurahan: input.kdKelurahan,
          kdBlok: input.kdBlok,
          noUrut: input.noUrut,
          kdJnsOp: input.kdJnsOp,
          noBng: input.noBng,
          kdJpb: input.kdJpb,
          luasBng: input.luasBng,
          jmlLantaiBng: input.jmlLantaiBng,
        })
        if (nilaiSistemBng > 0) {
          await db.update(datOpBangunan)
            .set({ nilaiSistemBng })
            .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, input.noBng)))
        }
      }

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
      // nilaiSistemBng intentionally omitted — controlled exclusively by HITUNG_BNG
      nilaiIndividu: z.number().optional(),
      tingKolomJpb3: z.number().optional(),
      lbrBentJpb3: z.number().optional(),
      dayaDukungLantaiJpb3: z.number().optional(),
      kelilingDindingJpb3: z.number().optional(),
      luasMezzanineJpb3: z.number().optional(),
      klsJpb2: z.number().optional(),
      klsJpb4: z.number().optional(),
      klsJpb5: z.number().optional(),
      klsJpb6: z.number().optional(),
      jnsJpb7: z.string().optional(),
      bintangJpb7: z.number().optional(),
      jmlKmrJpb7: z.number().optional(),
      luasKmrJpb7DgnAcSent: z.string().optional(),
      luasKmrLainJpb7DgnAcSent: z.string().optional(),
      klsJpb13: z.number().optional(),
      klsJpb16: z.number().optional(),
    }))
    .handler(async ({ input }) => {
      const { noBng, ...rest } = input
      const nopParts = {
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
      }

      // Build set object explicitly — pick only defined keys
      const setValues: Partial<typeof datOpBangunan.$inferInsert> = {}
      const mappable = ['kdJpb','luasBng','jmlLantaiBng','thnDibangunBng','thnRenovasiBng',
        'kondisiBng','jnsKonstruksiBng','jnsAtapBng','kdDinding','kdLantai','kdLangitLangit',
        'nilaiIndividu','tingKolomJpb3','lbrBentJpb3','dayaDukungLantaiJpb3',
        'kelilingDindingJpb3','luasMezzanineJpb3','klsJpb2','klsJpb4','klsJpb5','klsJpb6',
        'jnsJpb7','bintangJpb7','jmlKmrJpb7','luasKmrJpb7DgnAcSent','luasKmrLainJpb7DgnAcSent',
        'klsJpb13','klsJpb16'] as const
      for (const key of mappable) {
        if (key in rest && (rest as Record<string, unknown>)[key] !== undefined) {
          (setValues as Record<string, unknown>)[key] = (rest as Record<string, unknown>)[key]
        }
      }

      if (Object.keys(setValues).length > 0) {
        await db.update(datOpBangunan)
          .set(setValues)
          .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)))
      }

      // Re-calculate HITUNG_BNG unless nilaiIndividu is overriding
      const [current] = await db.select({
        nilaiIndividu: datOpBangunan.nilaiIndividu,
        luasBng: datOpBangunan.luasBng,
        jmlLantaiBng: datOpBangunan.jmlLantaiBng,
        kdJpb: datOpBangunan.kdJpb,
      }).from(datOpBangunan)
        .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)))

      if (current && !current.nilaiIndividu) {
        const nilaiSistemBng = await calculateNilaiSistemBng({
          ...nopParts,
          noBng,
          kdJpb: current.kdJpb,
          luasBng: current.luasBng,
          jmlLantaiBng: current.jmlLantaiBng,
        })
        if (nilaiSistemBng > 0) {
          await db.update(datOpBangunan)
            .set({ nilaiSistemBng })
            .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)))
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

      return { nextNoBng: (result?.maxBng ?? 0) + 1 }
    }),
})
