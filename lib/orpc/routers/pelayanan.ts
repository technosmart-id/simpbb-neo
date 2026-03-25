import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { pelayanan, pelayananDokumen, pelayananLampiranKolektif, historiMutasi } from "@/lib/db/schema"
import { eq, and, sql, desc, gte, lte } from "drizzle-orm"

export const pelayananRouter = os.router({
  // List with filters
  list: os
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
      statusPelayanan: z.number().optional(),
      kdJnsPelayanan: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      search: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const conditions = []
      if (input.statusPelayanan) conditions.push(eq(pelayanan.statusPelayanan, input.statusPelayanan))
      if (input.kdJnsPelayanan) conditions.push(eq(pelayanan.kdJnsPelayanan, input.kdJnsPelayanan))
      if (input.dateFrom) conditions.push(gte(pelayanan.tanggalPelayanan, new Date(input.dateFrom)))
      if (input.dateTo) conditions.push(lte(pelayanan.tanggalPelayanan, new Date(input.dateTo)))
      if (input.search) {
        conditions.push(sql`(${pelayanan.noPelayanan} LIKE ${`%${input.search}%`} OR ${pelayanan.namaPemohon} LIKE ${`%${input.search}%`})`)
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const rows = await db.select().from(pelayanan).where(where)
        .orderBy(desc(pelayanan.tanggalPelayanan))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(pelayanan).where(where)

      return { rows, total: totalResult?.count ?? 0 }
    }),

  // Status summary counts
  statusSummary: os.handler(async () => {
    const rows = await db
      .select({
        status: pelayanan.statusPelayanan,
        count: sql<number>`count(*)`,
      })
      .from(pelayanan)
      .groupBy(pelayanan.statusPelayanan)

    return rows
  }),

  // Get single berkas
  getByNo: os
    .input(z.object({ noPelayanan: z.string() }))
    .handler(async ({ input }) => {
      const [row] = await db.select().from(pelayanan).where(eq(pelayanan.noPelayanan, input.noPelayanan))
      if (!row) return null

      const dokumen = await db.select().from(pelayananDokumen).where(eq(pelayananDokumen.noPelayanan, input.noPelayanan))
      const lampiran = await db.select().from(pelayananLampiranKolektif).where(eq(pelayananLampiranKolektif.noPelayanan, input.noPelayanan))
      const mutasi = await db.select().from(historiMutasi).where(eq(historiMutasi.noPelayanan, input.noPelayanan)).orderBy(desc(historiMutasi.tglMutasi))

      return { ...row, dokumen, lampiran, mutasi }
    }),

  // Create berkas
  create: os
    .input(z.object({
      noPelayanan: z.string(),
      kdPropinsi: z.string().optional(),
      kdDati2: z.string().optional(),
      kdKecamatan: z.string().optional(),
      kdKelurahan: z.string().optional(),
      kdBlok: z.string().optional(),
      noUrut: z.string().optional(),
      kdJnsOp: z.string().optional(),
      kdJnsPelayanan: z.string().length(2),
      tanggalPelayanan: z.string(),
      namaPemohon: z.string().optional(),
      alamatPemohon: z.string().optional(),
      letakOp: z.string().optional(),
      catatan: z.string().optional(),
      nipPetugasPenerima: z.string().optional(),
      namaPetugasPenerima: z.string().optional(),
      isKolektif: z.number().min(0).max(1).default(0),
      dokumenIds: z.array(z.number()).optional(),
    }))
    .handler(async ({ input }) => {
      const { dokumenIds, ...data } = input

      await db.insert(pelayanan).values({
        noPelayanan: data.noPelayanan,
        kdJnsPelayanan: data.kdJnsPelayanan,
        tanggalPelayanan: new Date(data.tanggalPelayanan),
        isKolektif: data.isKolektif,
        kdPropinsi: data.kdPropinsi ?? null,
        kdDati2: data.kdDati2 ?? null,
        kdKecamatan: data.kdKecamatan ?? null,
        kdKelurahan: data.kdKelurahan ?? null,
        kdBlok: data.kdBlok ?? null,
        noUrut: data.noUrut ?? null,
        kdJnsOp: data.kdJnsOp ?? null,
        namaPemohon: data.namaPemohon ?? null,
        alamatPemohon: data.alamatPemohon ?? null,
        letakOp: data.letakOp ?? null,
        catatan: data.catatan ?? null,
        nipPetugasPenerima: data.nipPetugasPenerima ?? null,
        namaPetugasPenerima: data.namaPetugasPenerima ?? null,
        statusPelayanan: 1,
      })

      // Insert dokumen checklist
      if (dokumenIds && dokumenIds.length > 0) {
        await db.insert(pelayananDokumen).values(
          dokumenIds.map((id) => ({ noPelayanan: input.noPelayanan, dokumenId: id })),
        )
      }

      return { success: true }
    }),

  // Status transition (BRK-34 to 41)
  updateStatus: os
    .input(z.object({
      noPelayanan: z.string(),
      newStatus: z.number().min(1).max(6),
      nipPetugas: z.string().optional(),
      catatan: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const updates: Record<string, any> = {
        statusPelayanan: input.newStatus,
      }
      const now = new Date().toISOString().slice(0, 10)

      switch (input.newStatus) {
        case 2: // Masuk Penilai
          updates.tglMasukPenilai = now
          updates.nipMasukPenilai = input.nipPetugas ?? null
          break
        case 3: // Masuk Penetapan
          updates.tglMasukPenetapan = now
          updates.nipMasukPenetapan = input.nipPetugas ?? null
          break
        case 4: // Selesai
          updates.tglSelesai = now
          updates.nipSelesai = input.nipPetugas ?? null
          break
        case 5: // Terkonfirmasi WP
          updates.tglTerkonfirmasiWp = now
          updates.nipTerkonfirmasiWp = input.nipPetugas ?? null
          break
        case 6: // Ditunda
          updates.tglBerkasDitunda = now
          updates.alasanDitunda = input.catatan ?? null
          break
      }

      await db.update(pelayanan).set(updates).where(eq(pelayanan.noPelayanan, input.noPelayanan))

      return { success: true }
    }),

  // Add lampiran kolektif
  addLampiran: os
    .input(z.object({
      noPelayanan: z.string(),
      nop: z.string().optional(),
      nama: z.string().optional(),
      alamat: z.string().optional(),
      lt: z.string().optional(),
      lb: z.string().optional(),
      keterangan: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      await db.insert(pelayananLampiranKolektif).values({
        noPelayanan: input.noPelayanan,
        nop: input.nop ?? null,
        nama: input.nama ?? null,
        alamat: input.alamat ?? null,
        lt: input.lt ?? null,
        lb: input.lb ?? null,
        keterangan: input.keterangan ?? null,
      })
      return { success: true }
    }),

  // Delete lampiran
  deleteLampiran: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      await db.delete(pelayananLampiranKolektif).where(eq(pelayananLampiranKolektif.id, input.id))
      return { success: true }
    }),

  // Generate next NO_PELAYANAN
  nextNoPelayanan: os
    .input(z.object({ prefix: z.string() }))
    .handler(async ({ input }) => {
      const [result] = await db
        .select({ maxNo: sql<string>`MAX(NO_PELAYANAN)` })
        .from(pelayanan)
        .where(sql`NO_PELAYANAN LIKE ${`${input.prefix}%`}`)

      if (!result?.maxNo) {
        return { nextNo: `${input.prefix}0001` }
      }

      const numPart = result.maxNo.replace(input.prefix, "")
      const next = parseInt(numPart, 10) + 1
      return { nextNo: `${input.prefix}${String(next).padStart(4, "0")}` }
    }),
})
