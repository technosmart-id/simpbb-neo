import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { spop, datSubjekPajak, datOpAnggota, datOpInduk, kelasBumi, datOpBangunan } from "@/lib/db/schema"
import { eq, and, or, like, sql, desc, lte, gte } from "drizzle-orm"
import { nopWhere } from "@/lib/db/schema/_columns"

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
  // ── Search NOP or Name ──
  search: os
    .input(z.object({
      query: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(10),
    }))
    .handler(async ({ input }) => {
      const conditions = []
      if (input.query) {
        const q = input.query.replace(/[^a-zA-Z0-9]/g, "")
        conditions.push(
          or(
            like(datSubjekPajak.nmWp, `%${input.query}%`),
            sql`CONCAT(${spop.kdPropinsi}, ${spop.kdDati2}, ${spop.kdKecamatan}, ${spop.kdKelurahan}, ${spop.kdBlok}, ${spop.noUrut}, ${spop.kdJnsOp}) LIKE ${`%${q}%`}`
          )
        )
      }

      const rows = await db
        .select({
          kdPropinsi: spop.kdPropinsi,
          kdDati2: spop.kdDati2,
          kdKecamatan: spop.kdKecamatan,
          kdKelurahan: spop.kdKelurahan,
          kdBlok: spop.kdBlok,
          noUrut: spop.noUrut,
          kdJnsOp: spop.kdJnsOp,
          nmWp: datSubjekPajak.nmWp,
          jalanOp: spop.jalanOp,
        })
        .from(spop)
        .leftJoin(datSubjekPajak, eq(spop.subjekPajakId, datSubjekPajak.subjekPajakId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(spop.tglPendataanOp))
        .limit(input.limit)

      return rows
    }),

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

  // ── SPOP List with Building Details ──
  listDetails: os
    .input(z.object({
      limit: z.number().int().min(1).max(500).default(20),
      offset: z.number().int().min(0).default(0),
      kdPropinsi: z.string().optional(),
      kdDati2: z.string().optional(),
      kdKecamatan: z.string().optional(),
      kdKelurahan: z.string().optional(),
      search: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const conditions = []
      if (input.kdPropinsi) conditions.push(eq(spop.kdPropinsi, input.kdPropinsi))
      if (input.kdDati2) conditions.push(eq(spop.kdDati2, input.kdDati2))
      if (input.kdKecamatan) conditions.push(eq(spop.kdKecamatan, input.kdKecamatan))
      if (input.kdKelurahan) conditions.push(eq(spop.kdKelurahan, input.kdKelurahan))

      if (input.search) {
        const q = input.search.replace(/[^a-zA-Z0-9]/g, "")
        conditions.push(
          or(
            like(datSubjekPajak.nmWp, `%${input.search}%`),
            sql`CONCAT(${spop.kdPropinsi}, ${spop.kdDati2}, ${spop.kdKecamatan}, ${spop.kdKelurahan}, ${spop.kdBlok}, ${spop.noUrut}, ${spop.kdJnsOp}) LIKE ${`%${q}%`}`
          )
        )
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const rows = await db
        .select({
          kdPropinsi: spop.kdPropinsi,
          kdDati2: spop.kdDati2,
          kdKecamatan: spop.kdKecamatan,
          kdKelurahan: spop.kdKelurahan,
          kdBlok: spop.kdBlok,
          noUrut: spop.noUrut,
          kdJnsOp: spop.kdJnsOp,
          nmWp: datSubjekPajak.nmWp,
          jalanOp: spop.jalanOp,
          luasBumi: spop.luasBumi,
          njopBumi: spop.nilaiSistemBumi,
          totalLuasBng: sql<number>`COALESCE(SUM(${datOpBangunan.luasBng}), 0)`,
          totalNilaiBng: sql<number>`COALESCE(SUM(${datOpBangunan.nilaiSistemBng}), 0)`,
        })
        .from(spop)
        .leftJoin(datSubjekPajak, eq(spop.subjekPajakId, datSubjekPajak.subjekPajakId))
        .leftJoin(datOpBangunan, nopWhere(datOpBangunan, spop))
        .where(where)
        .groupBy(
          spop.kdPropinsi,
          spop.kdDati2,
          spop.kdKecamatan,
          spop.kdKelurahan,
          spop.kdBlok,
          spop.noUrut,
          spop.kdJnsOp,
          datSubjekPajak.nmWp,
          spop.jalanOp,
          spop.luasBumi,
          spop.nilaiSistemBumi
        )
        .orderBy(desc(spop.tglPendataanOp))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: sql<number>`count(DISTINCT CONCAT(${spop.kdPropinsi}, ${spop.kdDati2}, ${spop.kdKecamatan}, ${spop.kdKelurahan}, ${spop.kdBlok}, ${spop.noUrut}, ${spop.kdJnsOp}))` })
        .from(spop)
        .leftJoin(datSubjekPajak, eq(spop.subjekPajakId, datSubjekPajak.subjekPajakId))
        .where(where)

      return { rows, total: totalResult?.count ?? 0 }
    }),

  getByNop: os
    .input(nopInput)
    .handler(async ({ input }) => {
      // 1. Get SPOP joined with Subjek Pajak
      const [row] = await db
        .select()
        .from(spop)
        .leftJoin(datSubjekPajak, eq(spop.subjekPajakId, datSubjekPajak.subjekPajakId))
        .where(nopWhere(spop, input))

      if (!row) return null

      // 2. Check if this is an OP Anggota (Member of a joint property)
      const [anggota] = await db
        .select()
        .from(datOpAnggota)
        .where(nopWhere(datOpAnggota, input))

      // 3. Check if this is an OP Induk (Parent of a joint property)
      const [induk] = await db
        .select()
        .from(datOpInduk)
        .where(nopWhere(datOpInduk, input))

      return {
        ...row.spop,
        subjekPajak: row.dat_subjek_pajak,
        anggota: anggota ?? null,
        induk: induk ?? null,
      }
    }),

  // ── Get land class and NJOP based on unit value ──
  getKelasBumi: os
    .input(z.object({ nilai: z.number() }))
    .handler(async ({ input }) => {
      const [row] = await db
        .select()
        .from(kelasBumi)
        .where(and(
          lte(kelasBumi.nilaiMinimum, String(input.nilai)),
          gte(kelasBumi.nilaiMaksimum, String(input.nilai))
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

  // ── Unified Save (Upsert) SPOP + Subjek Pajak ──
  save: os
    .input(z.object({
      spop: z.object({
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
        nipPemeriksaOp: z.string().optional(),
        nmPemeriksaanOp: z.string().optional(),
        tglPendataanOp: z.date().optional(),
        tglPemeriksaanOp: z.date().optional(),
        noPersil: z.string().optional(),
      }),
      subjekPajak: z.object({
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
      }),
      anggota: z.object({
        kdPropinsiInduk: z.string(),
        kdDati2Induk: z.string(),
        kdKecamatanInduk: z.string(),
        kdKelurahanInduk: z.string(),
        kdBlokInduk: z.string(),
        noUrutInduk: z.string(),
        kdJnsOpInduk: z.string(),
        luasBumiBeban: z.number().optional(),
        luasBngBeban: z.number().optional(),
      }).optional(),
    }))
    .handler(async ({ input }) => {
      const { spop: spopData, subjekPajak: wpData, anggota: anggotaData } = input
      const now = new Date()

      return await db.transaction(async (tx) => {
        // 1. Upsert Subjek Pajak
        const [existingWp] = await tx
          .select()
          .from(datSubjekPajak)
          .where(eq(datSubjekPajak.subjekPajakId, wpData.subjekPajakId))

        if (existingWp) {
          await tx.update(datSubjekPajak).set(wpData).where(eq(datSubjekPajak.subjekPajakId, wpData.subjekPajakId))
        } else {
          await tx.insert(datSubjekPajak).values(wpData)
        }

        // 2. Upsert SPOP
        const [existingSpop] = await tx
          .select()
          .from(spop)
          .where(nopWhere(spop, spopData))

        const spopValues = {
          ...spopData,
          tglPendataanOp: spopData.tglPendataanOp ?? now,
          tglPemeriksaanOp: spopData.tglPemeriksaanOp ?? now,
        }

        if (existingSpop) {
          await tx.update(spop).set(spopValues).where(nopWhere(spop, spopData))
        } else {
          await tx.insert(spop).values(spopValues)
        }

        // 3. Handle OP Anggota (Member of joint property)
        if (anggotaData) {
          const [existingAnggota] = await tx
            .select()
            .from(datOpAnggota)
            .where(nopWhere(datOpAnggota, spopData))

          if (existingAnggota) {
            await tx.update(datOpAnggota).set(anggotaData).where(nopWhere(datOpAnggota, spopData))
          } else {
            await tx.insert(datOpAnggota).values({ ...spopData, ...anggotaData })
          }
        } else {
          // If not anggota, ensure record is removed if it was there
          await tx.delete(datOpAnggota).where(nopWhere(datOpAnggota, spopData))
        }

        return { success: true }
      })
    }),
})
