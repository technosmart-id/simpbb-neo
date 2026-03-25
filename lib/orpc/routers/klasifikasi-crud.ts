import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { kelasBumi, kelasBangunan, tarif, jenisSppt, fasilitas } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const klasifikasiCrudRouter = os.router({
  // ── Kelas Bumi CRUD ──
  createKelasBumi: os
    .input(z.object({
      kelasBumi: z.string().min(1).max(5),
      nilaiMinimum: z.string(),
      nilaiMaksimum: z.string(),
      njopBumi: z.string(),
    }))
    .handler(async ({ input }) => {
      await db.insert(kelasBumi).values(input)
      return { success: true }
    }),

  updateKelasBumi: os
    .input(z.object({
      kelasBumi: z.string(),
      nilaiMinimum: z.string(),
      nilaiMaksimum: z.string(),
      njopBumi: z.string(),
    }))
    .handler(async ({ input }) => {
      await db.update(kelasBumi)
        .set({ nilaiMinimum: input.nilaiMinimum, nilaiMaksimum: input.nilaiMaksimum, njopBumi: input.njopBumi })
        .where(eq(kelasBumi.kelasBumi, input.kelasBumi))
      return { success: true }
    }),

  deleteKelasBumi: os
    .input(z.object({ kelasBumi: z.string() }))
    .handler(async ({ input }) => {
      await db.delete(kelasBumi).where(eq(kelasBumi.kelasBumi, input.kelasBumi))
      return { success: true }
    }),

  // ── Kelas Bangunan CRUD ──
  createKelasBangunan: os
    .input(z.object({
      kelasBangunan: z.string().min(1).max(5),
      nilaiMinimum: z.string(),
      nilaiMaksimum: z.string(),
      njopBangunan: z.string(),
    }))
    .handler(async ({ input }) => {
      await db.insert(kelasBangunan).values(input)
      return { success: true }
    }),

  updateKelasBangunan: os
    .input(z.object({
      kelasBangunan: z.string(),
      nilaiMinimum: z.string(),
      nilaiMaksimum: z.string(),
      njopBangunan: z.string(),
    }))
    .handler(async ({ input }) => {
      await db.update(kelasBangunan)
        .set({ nilaiMinimum: input.nilaiMinimum, nilaiMaksimum: input.nilaiMaksimum, njopBangunan: input.njopBangunan })
        .where(eq(kelasBangunan.kelasBangunan, input.kelasBangunan))
      return { success: true }
    }),

  deleteKelasBangunan: os
    .input(z.object({ kelasBangunan: z.string() }))
    .handler(async ({ input }) => {
      await db.delete(kelasBangunan).where(eq(kelasBangunan.kelasBangunan, input.kelasBangunan))
      return { success: true }
    }),

  // ── Tarif CRUD ──
  createTarif: os
    .input(z.object({
      thnAwal: z.number(),
      thnAkhir: z.number().optional(),
      njopMin: z.string(),
      njopMax: z.string(),
      nilaiTarif: z.string(),
    }))
    .handler(async ({ input }) => {
      await db.insert(tarif).values({
        thnAwal: input.thnAwal,
        thnAkhir: input.thnAkhir ?? null,
        njopMin: input.njopMin,
        njopMax: input.njopMax,
        nilaiTarif: input.nilaiTarif,
      })
      return { success: true }
    }),

  updateTarif: os
    .input(z.object({
      id: z.number(),
      thnAwal: z.number(),
      thnAkhir: z.number().optional(),
      njopMin: z.string(),
      njopMax: z.string(),
      nilaiTarif: z.string(),
    }))
    .handler(async ({ input }) => {
      await db.update(tarif)
        .set({
          thnAwal: input.thnAwal,
          thnAkhir: input.thnAkhir ?? null,
          njopMin: input.njopMin,
          njopMax: input.njopMax,
          nilaiTarif: input.nilaiTarif,
        })
        .where(eq(tarif.id, input.id))
      return { success: true }
    }),

  deleteTarif: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      await db.delete(tarif).where(eq(tarif.id, input.id))
      return { success: true }
    }),

  // ── Jenis SPPT CRUD ──
  createJenisSppt: os
    .input(z.object({
      kode: z.string().min(1).max(10),
      nama: z.string().min(1).max(100),
      tarifKhusus: z.string().optional(),
      aktif: z.number().min(0).max(1).default(1),
    }))
    .handler(async ({ input }) => {
      await db.insert(jenisSppt).values({
        kode: input.kode,
        nama: input.nama,
        tarifKhusus: input.tarifKhusus ?? null,
        aktif: input.aktif,
      })
      return { success: true }
    }),

  updateJenisSppt: os
    .input(z.object({
      id: z.number(),
      kode: z.string().min(1).max(10),
      nama: z.string().min(1).max(100),
      tarifKhusus: z.string().optional(),
      aktif: z.number().min(0).max(1),
    }))
    .handler(async ({ input }) => {
      await db.update(jenisSppt)
        .set({ kode: input.kode, nama: input.nama, tarifKhusus: input.tarifKhusus ?? null, aktif: input.aktif })
        .where(eq(jenisSppt.id, input.id))
      return { success: true }
    }),

  deleteJenisSppt: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      await db.delete(jenisSppt).where(eq(jenisSppt.id, input.id))
      return { success: true }
    }),

  // ── Fasilitas CRUD ──
  createFasilitas: os
    .input(z.object({
      kdFasilitas: z.string().length(2),
      nmFasilitas: z.string().min(1).max(63),
      satuanFasilitas: z.string().min(1).max(10),
      nilaiFasilitas: z.string().default("0"),
      statusFasilitas: z.string().length(1).default("1"),
      ketergantungan: z.string().length(1).default("0"),
    }))
    .handler(async ({ input }) => {
      await db.insert(fasilitas).values(input)
      return { success: true }
    }),

  updateFasilitas: os
    .input(z.object({
      kdFasilitas: z.string().length(2),
      nmFasilitas: z.string().min(1).max(63),
      satuanFasilitas: z.string().min(1).max(10),
      nilaiFasilitas: z.string(),
      statusFasilitas: z.string().length(1),
      ketergantungan: z.string().length(1),
    }))
    .handler(async ({ input }) => {
      await db.update(fasilitas)
        .set({
          nmFasilitas: input.nmFasilitas,
          satuanFasilitas: input.satuanFasilitas,
          nilaiFasilitas: input.nilaiFasilitas,
          statusFasilitas: input.statusFasilitas,
          ketergantungan: input.ketergantungan,
        })
        .where(eq(fasilitas.kdFasilitas, input.kdFasilitas))
      return { success: true }
    }),

  deleteFasilitas: os
    .input(z.object({ kdFasilitas: z.string().length(2) }))
    .handler(async ({ input }) => {
      await db.delete(fasilitas).where(eq(fasilitas.kdFasilitas, input.kdFasilitas))
      return { success: true }
    }),
})
