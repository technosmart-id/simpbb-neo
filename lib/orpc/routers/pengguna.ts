import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { pbbUserProfile, groupAkses, akses } from "@/lib/db/schema"
import { eq, like, sql, and, desc } from "drizzle-orm"

export const penggunaRouter = os.router({
  list: os
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        search: z.string().optional(),
        hakAkses: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const conditions = []
      if (input.search) {
        conditions.push(
          sql`(${pbbUserProfile.username} LIKE ${`%${input.search}%`} OR ${pbbUserProfile.nama} LIKE ${`%${input.search}%`})`,
        )
      }
      if (input.hakAkses) {
        conditions.push(eq(pbbUserProfile.hakAkses, input.hakAkses))
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined

      const rows = await db
        .select({
          id: pbbUserProfile.id,
          username: pbbUserProfile.username,
          hakAkses: pbbUserProfile.hakAkses,
          nip: pbbUserProfile.nip,
          nama: pbbUserProfile.nama,
          jabatan: pbbUserProfile.jabatan,
          statusAktif: pbbUserProfile.statusAktif,
          lastLogin: pbbUserProfile.lastLogin,
          userId: pbbUserProfile.userId,
          createdAt: pbbUserProfile.createdAt,
        })
        .from(pbbUserProfile)
        .where(where)
        .orderBy(desc(pbbUserProfile.createdAt))
        .limit(input.limit)
        .offset(input.offset)

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)` })
        .from(pbbUserProfile)
        .where(where)

      return { rows, total: totalResult?.count ?? 0 }
    }),

  getById: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      const [row] = await db
        .select()
        .from(pbbUserProfile)
        .where(eq(pbbUserProfile.id, input.id))
      return row ?? null
    }),

  create: os
    .input(
      z.object({
        username: z.string().min(3).max(20),
        password: z.string().min(6),
        hakAkses: z.string(),
        nip: z.string().optional(),
        nama: z.string().optional(),
        jabatan: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      // Check username uniqueness
      const [existing] = await db
        .select({ id: pbbUserProfile.id })
        .from(pbbUserProfile)
        .where(eq(pbbUserProfile.username, input.username))
      if (existing) {
        throw new Error("Username sudah digunakan")
      }

      const result = await db.insert(pbbUserProfile).values({
        username: input.username,
        password: input.password, // TODO: hash password
        hakAkses: input.hakAkses,
        nip: input.nip ?? null,
        nama: input.nama ?? null,
        jabatan: input.jabatan ?? null,
        statusAktif: 1,
      })

      return { success: true, id: result[0].insertId }
    }),

  update: os
    .input(
      z.object({
        id: z.number(),
        hakAkses: z.string().optional(),
        nip: z.string().optional(),
        nama: z.string().optional(),
        jabatan: z.string().optional(),
        statusAktif: z.number().min(0).max(1).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { id, ...updates } = input
      const setValues: Record<string, any> = {}
      if (updates.hakAkses !== undefined) setValues.hakAkses = updates.hakAkses
      if (updates.nip !== undefined) setValues.nip = updates.nip
      if (updates.nama !== undefined) setValues.nama = updates.nama
      if (updates.jabatan !== undefined) setValues.jabatan = updates.jabatan
      if (updates.statusAktif !== undefined) setValues.statusAktif = updates.statusAktif

      if (Object.keys(setValues).length === 0) {
        return { success: true }
      }

      await db.update(pbbUserProfile).set(setValues).where(eq(pbbUserProfile.id, id))
      return { success: true }
    }),

  linkToAuth: os
    .input(z.object({ pbbUserId: z.number(), authUserId: z.string() }))
    .handler(async ({ input }) => {
      await db
        .update(pbbUserProfile)
        .set({ userId: input.authUserId })
        .where(eq(pbbUserProfile.id, input.pbbUserId))
      return { success: true }
    }),

  unlinkAuth: os
    .input(z.object({ pbbUserId: z.number() }))
    .handler(async ({ input }) => {
      await db
        .update(pbbUserProfile)
        .set({ userId: null })
        .where(eq(pbbUserProfile.id, input.pbbUserId))
      return { success: true }
    }),

  resetPassword: os
    .input(z.object({ id: z.number(), newPassword: z.string().min(6) }))
    .handler(async ({ input }) => {
      // TODO: hash password
      await db
        .update(pbbUserProfile)
        .set({ password: input.newPassword, failedAttempts: 0, lockedUntil: null })
        .where(eq(pbbUserProfile.id, input.id))
      return { success: true }
    }),
})
