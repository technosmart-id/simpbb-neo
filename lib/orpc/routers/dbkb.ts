import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { materialBangunan, refKategoriMaterialBangunan } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"

export const dbkbRouter = os.router({
  list: os
    .input(z.object({
      kategori: z.string().optional(),
      thnBerlaku: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const year = input.thnBerlaku ?? new Date().getFullYear().toString()
      const conditions = [eq(materialBangunan.thnBerlaku, year)]
      if (input.kategori) {
        conditions.push(eq(materialBangunan.kategori, input.kategori))
      }
      return db.select().from(materialBangunan)
        .where(and(...conditions))
        .orderBy(materialBangunan.kategori, materialBangunan.kodeMaterial)
    }),

  listKategori: os
    .handler(async () => {
      return db.select().from(refKategoriMaterialBangunan)
        .orderBy(refKategoriMaterialBangunan.kategori)
    }),

  updateNilaiBaru: os
    .input(z.object({
      updates: z.array(z.object({
        id: z.number(),
        nilaiBaru: z.string(),
      })),
    }))
    .handler(async ({ input }) => {
      await Promise.all(
        input.updates.map(({ id, nilaiBaru }) =>
          db.update(materialBangunan)
            .set({ nilaiBaru })
            .where(eq(materialBangunan.id, id))
        )
      )
      return { success: true, updated: input.updates.length }
    }),

  updateMasalBangunan: os
    .input(z.object({
      pctIncrease: z.number().min(0).max(1000),
      thnBerlaku: z.string().length(4),
    }))
    .handler(async ({ input }) => {
      await db.execute(sql`
        UPDATE material_bangunan
        SET NILAI_BARU = NILAI_AWAL * ${1 + input.pctIncrease / 100}
        WHERE THN_BERLAKU = ${input.thnBerlaku}
      `)
      return { success: true }
    }),
})
