import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { spop, datSubjekPajak } from "@/lib/db/schema"
import { eq, and, like, sql, desc } from "drizzle-orm"

const nopInput = z.object({
  kdPropinsi: z.string().length(2),
  kdDati2: z.string().length(2),
  kdKecamatan: z.string().length(3),
  kdKelurahan: z.string().length(3),
  kdBlok: z.string().length(3),
  noUrut: z.string().length(4),
  kdJnsOp: z.string().length(1),
})

export const objekPajakRouter = os.router({
  // ── SPOP List + Search ──
  list: os
    .input(z.object({
      limit: z.number().int().min(1).max(100).default(20),
      offset: z.number().int().min(0).default(0),
      kdPropinsi: z.string().optional(),
      kdDati2: z.string().optional(),
      kdKecamatan: z.string().optional(),
      kdKelurahan: z.string().optional(),
      kdBlok: z.string().optional(),
      kdZnt: z.string().optional(),
      search: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const conditions = []
      if (input.kdPropinsi) conditions.push(eq(spop.kdPropinsi, input.kdPropinsi))
      if (input.kdDati2) conditions.push(eq(spop.kdDati2, input.kdDati2))
      if (input.kdKecamatan) conditions.push(eq(spop.kdKecamatan, input.kdKecamatan))
      if (input.kdKelurahan) conditions.push(eq(spop.kdKelurahan, input.kdKelurahan))
      if (input.kdBlok) conditions.push(eq(spop.kdBlok, input.kdBlok))
      if (input.kdZnt) conditions.push(eq(spop.kdZnt, input.kdZnt))
      if (input.search) {
        conditions.push(
          sql`(${spop.jalanOp} LIKE ${`%${input.search}%`} OR ${spop.noUrut} LIKE ${`%${input.search}%`})`,
        )
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const rows = await db.select().from(spop).where(where)
        .orderBy(spop.kdPropinsi, spop.kdDati2, spop.kdKecamatan, spop.kdKelurahan, spop.kdBlok, spop.noUrut)
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db.select({ count: sql<number>`count(*)` }).from(spop).where(where)

      return { rows, total: totalResult?.count ?? 0 }
    }),

  // ── Get single SPOP by NOP ──
  getByNop: os
    .input(nopInput)
    .handler(async ({ input }) => {
      const [row] = await db.select().from(spop).where(and(
        eq(spop.kdPropinsi, input.kdPropinsi),
        eq(spop.kdDati2, input.kdDati2),
        eq(spop.kdKecamatan, input.kdKecamatan),
        eq(spop.kdKelurahan, input.kdKelurahan),
        eq(spop.kdBlok, input.kdBlok),
        eq(spop.noUrut, input.noUrut),
        eq(spop.kdJnsOp, input.kdJnsOp),
      ))
      return row ?? null
    }),

  // ── Create SPOP ──
  create: os
    .input(z.object({
      ...nopInput.shape,
      subjekPajakId: z.string(),
      noFormulirSpop: z.string().optional(),
      jnsTransaksiOp: z.string().length(1),
      jalanOp: z.string(),
      blokKavNoOp: z.string().optional(),
      rtOp: z.string().optional(),
      rwOp: z.string().optional(),
      kelurahanOp: z.string().optional(),
      kdStatusWp: z.string().length(1),
      luasBumi: z.number(),
      kdZnt: z.string().optional(),
      jnsBumi: z.string().length(1),
      nilaiSistemBumi: z.number(),
      nipPendata: z.string().optional(),
      nmPendataanOp: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const now = new Date()
      await db.insert(spop).values({
        ...input,
        noFormulirSpop: input.noFormulirSpop ?? null,
        blokKavNoOp: input.blokKavNoOp ?? null,
        rtOp: input.rtOp ?? null,
        rwOp: input.rwOp ?? null,
        kelurahanOp: input.kelurahanOp ?? null,
        kdZnt: input.kdZnt ?? null,
        nipPendata: input.nipPendata ?? null,
        nmPendataanOp: input.nmPendataanOp ?? null,
        nipPemeriksaOp: null,
        nmPemeriksaanOp: null,
        tglPendataanOp: now,
        tglPemeriksaanOp: now,
      })
      return { success: true }
    }),

  // ── Update SPOP ──
  update: os
    .input(z.object({
      ...nopInput.shape,
      subjekPajakId: z.string().optional(),
      jalanOp: z.string().optional(),
      blokKavNoOp: z.string().optional(),
      rtOp: z.string().optional(),
      rwOp: z.string().optional(),
      kelurahanOp: z.string().optional(),
      kdStatusWp: z.string().optional(),
      luasBumi: z.number().optional(),
      kdZnt: z.string().optional(),
      jnsBumi: z.string().optional(),
      nilaiSistemBumi: z.number().optional(),
    }))
    .handler(async ({ input }) => {
      const { kdPropinsi, kdDati2, kdKecamatan, kdKelurahan, kdBlok, noUrut, kdJnsOp, ...updates } = input
      const setValues: Record<string, any> = {}
      for (const [k, v] of Object.entries(updates)) {
        if (v !== undefined) setValues[k] = v
      }
      if (Object.keys(setValues).length === 0) return { success: true }

      await db.update(spop).set(setValues).where(and(
        eq(spop.kdPropinsi, kdPropinsi),
        eq(spop.kdDati2, kdDati2),
        eq(spop.kdKecamatan, kdKecamatan),
        eq(spop.kdKelurahan, kdKelurahan),
        eq(spop.kdBlok, kdBlok),
        eq(spop.noUrut, noUrut),
        eq(spop.kdJnsOp, kdJnsOp),
      ))
      return { success: true }
    }),

  // ── Subjek Pajak CRUD ──
  listSubjekPajak: os
    .input(z.object({
      search: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    }))
    .handler(async ({ input }) => {
      const where = input.search
        ? sql`(${datSubjekPajak.nmWp} LIKE ${`%${input.search}%`} OR ${datSubjekPajak.subjekPajakId} LIKE ${`%${input.search}%`})`
        : undefined

      return db.select().from(datSubjekPajak).where(where).limit(input.limit)
    }),

  getSubjekPajak: os
    .input(z.object({ subjekPajakId: z.string() }))
    .handler(async ({ input }) => {
      const [row] = await db.select().from(datSubjekPajak).where(eq(datSubjekPajak.subjekPajakId, input.subjekPajakId))
      return row ?? null
    }),

  createSubjekPajak: os
    .input(z.object({
      subjekPajakId: z.string().max(30),
      nmWp: z.string().max(30),
      jalanWp: z.string().max(100),
      blokKavNoWp: z.string().optional(),
      rwWp: z.string().optional(),
      rtWp: z.string().optional(),
      kelurahanWp: z.string().optional(),
      kotaWp: z.string().optional(),
      kdPosWp: z.string().optional(),
      telpWp: z.string().optional(),
      npwp: z.string().optional(),
      emailWp: z.string().optional(),
      statusPekerjaanWp: z.string().length(1),
    }))
    .handler(async ({ input }) => {
      await db.insert(datSubjekPajak).values({
        ...input,
        blokKavNoWp: input.blokKavNoWp ?? null,
        rwWp: input.rwWp ?? null,
        rtWp: input.rtWp ?? null,
        kelurahanWp: input.kelurahanWp ?? null,
        kotaWp: input.kotaWp ?? null,
        kdPosWp: input.kdPosWp ?? null,
        telpWp: input.telpWp ?? null,
        npwp: input.npwp ?? null,
        emailWp: input.emailWp ?? null,
      })
      return { success: true }
    }),

  // ── Next available NO_URUT for a blok ──
  getNextNoUrut: os
    .input(z.object({
      kdPropinsi: z.string().length(2),
      kdDati2: z.string().length(2),
      kdKecamatan: z.string().length(3),
      kdKelurahan: z.string().length(3),
      kdBlok: z.string().length(3),
    }))
    .handler(async ({ input }) => {
      const [result] = await db
        .select({ maxUrut: sql<string>`MAX(NO_URUT)` })
        .from(spop)
        .where(and(
          eq(spop.kdPropinsi, input.kdPropinsi),
          eq(spop.kdDati2, input.kdDati2),
          eq(spop.kdKecamatan, input.kdKecamatan),
          eq(spop.kdKelurahan, input.kdKelurahan),
          eq(spop.kdBlok, input.kdBlok),
        ))

      const maxUrut = result?.maxUrut ? parseInt(result.maxUrut, 10) : 0
      return { nextNoUrut: String(maxUrut + 1).padStart(4, "0") }
    }),

  // ── Next available NO_FORMULIR_SPOP for current year ──
  getNextNoFormulir: os
    .handler(async () => {
      const year = new Date().getFullYear().toString()
      const [result] = await db
        .select({ maxForm: sql<string>`MAX(NO_FORMULIR_SPOP)` })
        .from(spop)
        .where(like(spop.noFormulirSpop, `${year}%`))

      let bundle = 1
      let seq = 1
      
      if (result?.maxForm && result.maxForm.length === 11) {
        const currentBundle = parseInt(result.maxForm.slice(4, 8), 10)
        const currentSeq = parseInt(result.maxForm.slice(8), 10)
        
        if (!isNaN(currentBundle) && !isNaN(currentSeq)) {
          if (currentSeq >= 999) {
            bundle = currentBundle + 1
            seq = 1
          } else {
            bundle = currentBundle
            seq = currentSeq + 1
          }
        }
      }

      const formatted = `${year}${String(bundle).padStart(4, "0")}${String(seq).padStart(3, "0")}`
      return { nextNoFormulir: formatted }
    }),
})
