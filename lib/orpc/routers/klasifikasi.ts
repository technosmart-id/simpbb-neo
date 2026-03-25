import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { kelasBumi, kelasBangunan, tarif, jenisSppt, fasilitas } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const klasifikasiRouter = os.router({
  // Kelas Bumi
  listKelasBumi: os.handler(async () => {
    return db.select().from(kelasBumi).orderBy(kelasBumi.kelasBumi)
  }),

  getKelasBumi: os
    .input(z.object({ kelasBumi: z.string() }))
    .handler(async ({ input }) => {
      const [row] = await db
        .select()
        .from(kelasBumi)
        .where(eq(kelasBumi.kelasBumi, input.kelasBumi))
      return row ?? null
    }),

  // Kelas Bangunan
  listKelasBangunan: os.handler(async () => {
    return db.select().from(kelasBangunan).orderBy(kelasBangunan.kelasBangunan)
  }),

  getKelasBangunan: os
    .input(z.object({ kelasBangunan: z.string() }))
    .handler(async ({ input }) => {
      const [row] = await db
        .select()
        .from(kelasBangunan)
        .where(eq(kelasBangunan.kelasBangunan, input.kelasBangunan))
      return row ?? null
    }),

  // Tarif
  listTarif: os.handler(async () => {
    return db.select().from(tarif).orderBy(tarif.thnAwal)
  }),

  // Jenis SPPT
  listJenisSppt: os.handler(async () => {
    return db.select().from(jenisSppt).orderBy(jenisSppt.kode)
  }),

  // Fasilitas
  listFasilitas: os.handler(async () => {
    return db.select().from(fasilitas).orderBy(fasilitas.kdFasilitas)
  }),

  getFasilitas: os
    .input(z.object({ kdFasilitas: z.string().length(2) }))
    .handler(async ({ input }) => {
      const [row] = await db
        .select()
        .from(fasilitas)
        .where(eq(fasilitas.kdFasilitas, input.kdFasilitas))
      return row ?? null
    }),
})
