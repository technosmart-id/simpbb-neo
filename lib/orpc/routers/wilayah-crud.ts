import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { refPropinsi, refDati2, refKecamatan, refKelurahan, jalan } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

// CRUD mutations for wilayah reference data — merged into wilayah router

export const wilayahCrudRouter = os.router({
  // ── Propinsi CRUD ──
  createPropinsi: os
    .input(z.object({ kdPropinsi: z.string().length(2), nmPropinsi: z.string().min(1).max(30) }))
    .handler(async ({ input }) => {
      await db.insert(refPropinsi).values(input)
      return { success: true }
    }),

  updatePropinsi: os
    .input(z.object({ kdPropinsi: z.string().length(2), nmPropinsi: z.string().min(1).max(30) }))
    .handler(async ({ input }) => {
      await db.update(refPropinsi).set({ nmPropinsi: input.nmPropinsi }).where(eq(refPropinsi.kdPropinsi, input.kdPropinsi))
      return { success: true }
    }),

  deletePropinsi: os
    .input(z.object({ kdPropinsi: z.string().length(2) }))
    .handler(async ({ input }) => {
      await db.delete(refPropinsi).where(eq(refPropinsi.kdPropinsi, input.kdPropinsi))
      return { success: true }
    }),

  // ── Dati2 CRUD ──
  createDati2: os
    .input(z.object({ kdPropinsi: z.string().length(2), kdDati2: z.string().length(2), nmDati2: z.string().min(1).max(30) }))
    .handler(async ({ input }) => {
      await db.insert(refDati2).values(input)
      return { success: true }
    }),

  updateDati2: os
    .input(z.object({ kdPropinsi: z.string().length(2), kdDati2: z.string().length(2), nmDati2: z.string().min(1).max(30) }))
    .handler(async ({ input }) => {
      await db.update(refDati2).set({ nmDati2: input.nmDati2 }).where(and(eq(refDati2.kdPropinsi, input.kdPropinsi), eq(refDati2.kdDati2, input.kdDati2)))
      return { success: true }
    }),

  deleteDati2: os
    .input(z.object({ kdPropinsi: z.string().length(2), kdDati2: z.string().length(2) }))
    .handler(async ({ input }) => {
      await db.delete(refDati2).where(and(eq(refDati2.kdPropinsi, input.kdPropinsi), eq(refDati2.kdDati2, input.kdDati2)))
      return { success: true }
    }),

  // ── Kecamatan CRUD ──
  createKecamatan: os
    .input(z.object({
      kdPropinsi: z.string().length(2),
      kdDati2: z.string().length(2),
      kdKecamatan: z.string().length(3),
      nmKecamatanOnly: z.string().min(1).max(30),
    }))
    .handler(async ({ input }) => {
      await db.insert(refKecamatan).values({
        ...input,
        nmKecamatan: `${input.kdKecamatan} - ${input.nmKecamatanOnly}`,
      })
      return { success: true }
    }),

  updateKecamatan: os
    .input(z.object({
      kdPropinsi: z.string().length(2),
      kdDati2: z.string().length(2),
      kdKecamatan: z.string().length(3),
      nmKecamatanOnly: z.string().min(1).max(30),
    }))
    .handler(async ({ input }) => {
      await db.update(refKecamatan)
        .set({
          nmKecamatanOnly: input.nmKecamatanOnly,
          nmKecamatan: `${input.kdKecamatan} - ${input.nmKecamatanOnly}`,
        })
        .where(and(
          eq(refKecamatan.kdPropinsi, input.kdPropinsi),
          eq(refKecamatan.kdDati2, input.kdDati2),
          eq(refKecamatan.kdKecamatan, input.kdKecamatan),
        ))
      return { success: true }
    }),

  deleteKecamatan: os
    .input(z.object({ kdPropinsi: z.string().length(2), kdDati2: z.string().length(2), kdKecamatan: z.string().length(3) }))
    .handler(async ({ input }) => {
      await db.delete(refKecamatan).where(and(
        eq(refKecamatan.kdPropinsi, input.kdPropinsi),
        eq(refKecamatan.kdDati2, input.kdDati2),
        eq(refKecamatan.kdKecamatan, input.kdKecamatan),
      ))
      return { success: true }
    }),

  // ── Kelurahan CRUD ──
  createKelurahan: os
    .input(z.object({
      kdPropinsi: z.string().length(2),
      kdDati2: z.string().length(2),
      kdKecamatan: z.string().length(3),
      kdKelurahan: z.string().length(3),
      kdSektor: z.string().length(2).default("00"),
      nmKelurahanOnly: z.string().min(1).max(30),
      noKelurahan: z.number().optional(),
      kdPosKelurahan: z.string().max(5).optional(),
    }))
    .handler(async ({ input }) => {
      await db.insert(refKelurahan).values({
        ...input,
        nmKelurahan: `${input.kdKelurahan} - ${input.nmKelurahanOnly}`,
        noKelurahan: input.noKelurahan ?? null,
        kdPosKelurahan: input.kdPosKelurahan ?? null,
      })
      return { success: true }
    }),

  updateKelurahan: os
    .input(z.object({
      kdPropinsi: z.string().length(2),
      kdDati2: z.string().length(2),
      kdKecamatan: z.string().length(3),
      kdKelurahan: z.string().length(3),
      kdSektor: z.string().length(2),
      nmKelurahanOnly: z.string().min(1).max(30),
      noKelurahan: z.number().optional(),
      kdPosKelurahan: z.string().max(5).optional(),
    }))
    .handler(async ({ input }) => {
      await db.update(refKelurahan)
        .set({
          nmKelurahanOnly: input.nmKelurahanOnly,
          nmKelurahan: `${input.kdKelurahan} - ${input.nmKelurahanOnly}`,
          noKelurahan: input.noKelurahan ?? null,
          kdPosKelurahan: input.kdPosKelurahan ?? null,
        })
        .where(and(
          eq(refKelurahan.kdPropinsi, input.kdPropinsi),
          eq(refKelurahan.kdDati2, input.kdDati2),
          eq(refKelurahan.kdKecamatan, input.kdKecamatan),
          eq(refKelurahan.kdKelurahan, input.kdKelurahan),
          eq(refKelurahan.kdSektor, input.kdSektor),
        ))
      return { success: true }
    }),

  deleteKelurahan: os
    .input(z.object({
      kdPropinsi: z.string().length(2),
      kdDati2: z.string().length(2),
      kdKecamatan: z.string().length(3),
      kdKelurahan: z.string().length(3),
      kdSektor: z.string().length(2),
    }))
    .handler(async ({ input }) => {
      await db.delete(refKelurahan).where(and(
        eq(refKelurahan.kdPropinsi, input.kdPropinsi),
        eq(refKelurahan.kdDati2, input.kdDati2),
        eq(refKelurahan.kdKecamatan, input.kdKecamatan),
        eq(refKelurahan.kdKelurahan, input.kdKelurahan),
        eq(refKelurahan.kdSektor, input.kdSektor),
      ))
      return { success: true }
    }),

  // ── Jalan CRUD ──
  createJalan: os
    .input(z.object({
      kdPropinsi: z.string().length(2),
      kdDati2: z.string().length(2),
      kdKecamatan: z.string().length(3),
      kdKelurahan: z.string().length(3),
      nmJalan: z.string().min(1).max(100),
    }))
    .handler(async ({ input }) => {
      await db.insert(jalan).values(input)
      return { success: true }
    }),

  updateJalan: os
    .input(z.object({ id: z.number(), nmJalan: z.string().min(1).max(100) }))
    .handler(async ({ input }) => {
      await db.update(jalan).set({ nmJalan: input.nmJalan }).where(eq(jalan.id, input.id))
      return { success: true }
    }),

  deleteJalan: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      await db.delete(jalan).where(eq(jalan.id, input.id))
      return { success: true }
    }),
})
