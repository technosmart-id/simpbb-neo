import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { refPropinsi, refDati2, refKecamatan, refKelurahan, jalan, spop } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"

export const wilayahRouter = os.router({
  listPropinsi: os.handler(async () => {
    return db.select().from(refPropinsi).orderBy(refPropinsi.kdPropinsi)
  }),

  listDati2: os
    .input(z.object({ kdPropinsi: z.string().length(2) }))
    .handler(async ({ input }) => {
      return db
        .select()
        .from(refDati2)
        .where(eq(refDati2.kdPropinsi, input.kdPropinsi))
        .orderBy(refDati2.kdDati2)
    }),

  listKecamatan: os
    .input(
      z.object({
        kdPropinsi: z.string().length(2),
        kdDati2: z.string().length(2),
      }),
    )
    .handler(async ({ input }) => {
      return db
        .select()
        .from(refKecamatan)
        .where(
          and(
            eq(refKecamatan.kdPropinsi, input.kdPropinsi),
            eq(refKecamatan.kdDati2, input.kdDati2),
          ),
        )
        .orderBy(refKecamatan.kdKecamatan)
    }),

  listKelurahan: os
    .input(
      z.object({
        kdPropinsi: z.string().length(2),
        kdDati2: z.string().length(2),
        kdKecamatan: z.string().length(3),
      }),
    )
    .handler(async ({ input }) => {
      return db
        .select()
        .from(refKelurahan)
        .where(
          and(
            eq(refKelurahan.kdPropinsi, input.kdPropinsi),
            eq(refKelurahan.kdDati2, input.kdDati2),
            eq(refKelurahan.kdKecamatan, input.kdKecamatan),
          ),
        )
        .orderBy(refKelurahan.kdKelurahan)
    }),

  listBlok: os
    .input(
      z.object({
        kdPropinsi: z.string().length(2),
        kdDati2: z.string().length(2),
        kdKecamatan: z.string().length(3),
        kdKelurahan: z.string().length(3),
      }),
    )
    .handler(async ({ input }) => {
      const rows = await db
        .select({ kdBlok: spop.kdBlok })
        .from(spop)
        .where(
          and(
            eq(spop.kdPropinsi, input.kdPropinsi),
            eq(spop.kdDati2, input.kdDati2),
            eq(spop.kdKecamatan, input.kdKecamatan),
            eq(spop.kdKelurahan, input.kdKelurahan),
          ),
        )
        .groupBy(spop.kdBlok)
        .orderBy(spop.kdBlok)

      return rows
    }),

  listZnt: os
    .input(
      z.object({
        kdPropinsi: z.string().length(2),
        kdDati2: z.string().length(2),
        kdKecamatan: z.string().length(3),
        kdKelurahan: z.string().length(3),
      }),
    )
    .handler(async ({ input }) => {
      const rows = await db
        .select({ kdZnt: spop.kdZnt })
        .from(spop)
        .where(
          and(
            eq(spop.kdPropinsi, input.kdPropinsi),
            eq(spop.kdDati2, input.kdDati2),
            eq(spop.kdKecamatan, input.kdKecamatan),
            eq(spop.kdKelurahan, input.kdKelurahan),
            sql`${spop.kdZnt} IS NOT NULL`,
          ),
        )
        .groupBy(spop.kdZnt)
        .orderBy(spop.kdZnt)

      return rows
    }),

  listJalan: os
    .input(
      z.object({
        kdPropinsi: z.string().length(2),
        kdDati2: z.string().length(2),
        kdKecamatan: z.string().length(3),
        kdKelurahan: z.string().length(3),
      }),
    )
    .handler(async ({ input }) => {
      return db
        .select()
        .from(jalan)
        .where(
          and(
            eq(jalan.kdPropinsi, input.kdPropinsi),
            eq(jalan.kdDati2, input.kdDati2),
            eq(jalan.kdKecamatan, input.kdKecamatan),
            eq(jalan.kdKelurahan, input.kdKelurahan),
          ),
        )
        .orderBy(jalan.nmJalan)
    }),

  // Get full location label for a NOP's wilayah
  getLocationLabel: os
    .input(
      z.object({
        kdPropinsi: z.string().length(2),
        kdDati2: z.string().length(2),
        kdKecamatan: z.string().length(3),
        kdKelurahan: z.string().length(3),
      }),
    )
    .handler(async ({ input }) => {
      const [prov] = await db
        .select({ nm: refPropinsi.nmPropinsi })
        .from(refPropinsi)
        .where(eq(refPropinsi.kdPropinsi, input.kdPropinsi))

      const [dati2] = await db
        .select({ nm: refDati2.nmDati2 })
        .from(refDati2)
        .where(
          and(
            eq(refDati2.kdPropinsi, input.kdPropinsi),
            eq(refDati2.kdDati2, input.kdDati2),
          ),
        )

      const [kec] = await db
        .select({ nm: refKecamatan.nmKecamatan })
        .from(refKecamatan)
        .where(
          and(
            eq(refKecamatan.kdPropinsi, input.kdPropinsi),
            eq(refKecamatan.kdDati2, input.kdDati2),
            eq(refKecamatan.kdKecamatan, input.kdKecamatan),
          ),
        )

      const [kel] = await db
        .select({ nm: refKelurahan.nmKelurahan })
        .from(refKelurahan)
        .where(
          and(
            eq(refKelurahan.kdPropinsi, input.kdPropinsi),
            eq(refKelurahan.kdDati2, input.kdDati2),
            eq(refKelurahan.kdKecamatan, input.kdKecamatan),
            eq(refKelurahan.kdKelurahan, input.kdKelurahan),
          ),
        )

      return {
        propinsi: prov?.nm ?? "",
        dati2: dati2?.nm ?? "",
        kecamatan: kec?.nm ?? "",
        kelurahan: kel?.nm ?? "",
      }
    }),

  validateWilayah: os
    .input(
      z.object({
        kdPropinsi: z.string().length(2),
        kdDati2: z.string().length(2),
        kdKecamatan: z.string().length(3),
        kdKelurahan: z.string().length(3),
      }),
    )
    .handler(async ({ input }) => {
      const [kel] = await db
        .select({ id: refKelurahan.kdKelurahan })
        .from(refKelurahan)
        .where(
          and(
            eq(refKelurahan.kdPropinsi, input.kdPropinsi),
            eq(refKelurahan.kdDati2, input.kdDati2),
            eq(refKelurahan.kdKecamatan, input.kdKecamatan),
            eq(refKelurahan.kdKelurahan, input.kdKelurahan),
          ),
        )

      return { valid: !!kel }
    }),
})
