import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import {
  datPenghapusan,
  datPenghapusanSppt,
  sppt,
  spop,
  pbbUserProfile,
} from "@/lib/db/schema"
import { eq, and, lt, sql } from "drizzle-orm"
import { ORPCError } from "@orpc/server"

const nopInput = z.object({
  kdPropinsi: z.string().length(2),
  kdDati2: z.string().length(2),
  kdKecamatan: z.string().length(3),
  kdKelurahan: z.string().length(3),
  kdBlok: z.string().length(3),
  noUrut: z.string().length(4),
  kdJnsOp: z.string().length(1),
})

async function assertSupervisor(context: {
  session: { user: { id: string } } | null
}) {
  if (!context.session?.user) throw new ORPCError("UNAUTHORIZED")
  const profile = await db.query.pbbUserProfile.findFirst({
    where: eq(pbbUserProfile.userId, context.session.user.id),
  })
  // 'OPR' is the HAK_AKSES value for basic operators — only supervisors can approve
  if (!profile || profile.hakAkses === "OPR") {
    throw new ORPCError("FORBIDDEN", {
      message: "Hanya supervisor yang dapat menyetujui penghapusan",
    })
  }
}

export const penghapusanRouter = os.router({
  list: os
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(100).default(20),
      }),
    )
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit
      const conditions = []
      if (input.status) conditions.push(eq(datPenghapusan.status, input.status))

      const rows = await db
        .select()
        .from(datPenghapusan)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(datPenghapusan.tglPengajuan)
        .limit(input.limit)
        .offset(offset)

      const [{ total }] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(datPenghapusan)
        .where(conditions.length ? and(...conditions) : undefined)

      return { rows, total }
    }),

  getDetail: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      const [header] = await db
        .select()
        .from(datPenghapusan)
        .where(eq(datPenghapusan.id, input.id))
      if (!header) return null

      const spptRows = await db
        .select()
        .from(datPenghapusanSppt)
        .where(eq(datPenghapusanSppt.idPenghapusan, input.id))

      return { header, spptRows }
    }),

  create: os
    .input(
      nopInput.extend({
        jenisPenghapusan: z.number().int().min(1).max(6),
        alasan: z.string().min(10),
      }),
    )
    .handler(async ({ input, context }) => {
      if (!context.session?.user) throw new ORPCError("UNAUTHORIZED")

      // Validate NOP exists
      const [existing] = await db
        .select()
        .from(spop)
        .where(
          and(
            eq(spop.kdPropinsi, input.kdPropinsi),
            eq(spop.kdDati2, input.kdDati2),
            eq(spop.kdKecamatan, input.kdKecamatan),
            eq(spop.kdKelurahan, input.kdKelurahan),
            eq(spop.kdBlok, input.kdBlok),
            eq(spop.noUrut, input.noUrut),
            eq(spop.kdJnsOp, input.kdJnsOp),
          ),
        )
      if (!existing)
        throw new ORPCError("NOT_FOUND", { message: "NOP tidak ditemukan" })

      // Uniqueness guard — no duplicate pending for same NOP
      const [dupCheck] = await db
        .select({ id: datPenghapusan.id })
        .from(datPenghapusan)
        .where(
          and(
            eq(datPenghapusan.kdPropinsi, input.kdPropinsi),
            eq(datPenghapusan.kdDati2, input.kdDati2),
            eq(datPenghapusan.kdKecamatan, input.kdKecamatan),
            eq(datPenghapusan.kdKelurahan, input.kdKelurahan),
            eq(datPenghapusan.kdBlok, input.kdBlok),
            eq(datPenghapusan.noUrut, input.noUrut),
            eq(datPenghapusan.kdJnsOp, input.kdJnsOp),
            eq(datPenghapusan.status, "pending"),
          ),
        )
      if (dupCheck)
        throw new ORPCError("CONFLICT", {
          message:
            "Sudah ada pengajuan penghapusan yang menunggu persetujuan untuk NOP ini",
        })

      // Snapshot SPPT rows (unpaid only)
      const currentYear = new Date().getFullYear()
      const spptConditions = [
        eq(sppt.kdPropinsi, input.kdPropinsi),
        eq(sppt.kdDati2, input.kdDati2),
        eq(sppt.kdKecamatan, input.kdKecamatan),
        eq(sppt.kdKelurahan, input.kdKelurahan),
        eq(sppt.kdBlok, input.kdBlok),
        eq(sppt.noUrut, input.noUrut),
        eq(sppt.kdJnsOp, input.kdJnsOp),
        eq(sppt.statusPembayaranSppt, "0"),
      ]
      if (input.jenisPenghapusan === 6) {
        // Kadaluarsa: only SPPT older than 5 years
        spptConditions.push(lt(sppt.thnPajakSppt, currentYear - 5))
      }

      const spptRows = await db
        .select()
        .from(sppt)
        .where(and(...spptConditions))

      // Insert penghapusan header
      const [result] = await db.insert(datPenghapusan).values({
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
        jenisPenghapusan: input.jenisPenghapusan,
        alasan: input.alasan,
        status: "pending",
        userPengaju: context.session.user.id,
        tglPengajuan: new Date(),
      })

      const insertId = (result as { insertId: number }).insertId

      // Snapshot SPPT rows into dat_penghapusan_sppt
      if (spptRows.length > 0) {
        await db.insert(datPenghapusanSppt).values(
          spptRows.map((s) => ({
            idPenghapusan: insertId,
            kdPropinsi: s.kdPropinsi,
            kdDati2: s.kdDati2,
            kdKecamatan: s.kdKecamatan,
            kdKelurahan: s.kdKelurahan,
            kdBlok: s.kdBlok,
            noUrut: s.noUrut,
            kdJnsOp: s.kdJnsOp,
            thnPajakSppt: String(s.thnPajakSppt),
            namaWp: s.nmWp ?? null,
            njopBumiSppt: s.njopBumi !== null ? Number(s.njopBumi) : null,
            njopBngSppt: s.njopBng !== null ? Number(s.njopBng) : null,
            pbbYgHarusDibayarSppt:
              s.pbbYgHarusDibayarSppt !== null
                ? Number(s.pbbYgHarusDibayarSppt)
                : null,
          })),
        )
      }

      return { success: true, id: insertId }
    }),

  approve: os
    .input(z.object({ id: z.number(), catatan: z.string().optional() }))
    .handler(async ({ input, context }) => {
      await assertSupervisor(
        context as { session: { user: { id: string } } | null },
      )

      const [request] = await db
        .select()
        .from(datPenghapusan)
        .where(eq(datPenghapusan.id, input.id))
      if (!request) throw new ORPCError("NOT_FOUND")
      if (request.status !== "pending")
        throw new ORPCError("CONFLICT", { message: "Pengajuan sudah diproses" })

      const nopWhere = and(
        eq(spop.kdPropinsi, request.kdPropinsi),
        eq(spop.kdDati2, request.kdDati2),
        eq(spop.kdKecamatan, request.kdKecamatan),
        eq(spop.kdKelurahan, request.kdKelurahan),
        eq(spop.kdBlok, request.kdBlok),
        eq(spop.noUrut, request.noUrut),
        eq(spop.kdJnsOp, request.kdJnsOp),
      )
      const spptWhere = and(
        eq(sppt.kdPropinsi, request.kdPropinsi),
        eq(sppt.kdDati2, request.kdDati2),
        eq(sppt.kdKecamatan, request.kdKecamatan),
        eq(sppt.kdKelurahan, request.kdKelurahan),
        eq(sppt.kdBlok, request.kdBlok),
        eq(sppt.noUrut, request.noUrut),
        eq(sppt.kdJnsOp, request.kdJnsOp),
        eq(sppt.statusPembayaranSppt, "0"),
      )

      // Execute deletion based on jenis
      if (request.jenisPenghapusan === 1) {
        // Fasum: set JNS_BUMI='4', delete unpaid SPPT
        await db.update(spop).set({ jnsBumi: "4" }).where(nopWhere)
        await db.delete(sppt).where(spptWhere)
      } else if (request.jenisPenghapusan === 6) {
        // Kadaluarsa: delete only unpaid SPPT older than 5 years
        const currentYear = new Date().getFullYear()
        await db.delete(sppt).where(
          and(spptWhere, lt(sppt.thnPajakSppt, currentYear - 5)),
        )
      } else {
        // Others (2–5): set JNS_TRANSAKSI_OP='3', delete unpaid SPPT
        await db.update(spop).set({ jnsTransaksiOp: "3" }).where(nopWhere)
        await db.delete(sppt).where(spptWhere)
      }

      // Update request status to approved
      await db
        .update(datPenghapusan)
        .set({
          status: "approved",
          userApprover: context.session!.user.id,
          tglApproval: new Date(),
          catatanApprover: input.catatan ?? null,
        })
        .where(eq(datPenghapusan.id, input.id))

      return { success: true }
    }),

  reject: os
    .input(z.object({ id: z.number(), catatan: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      await assertSupervisor(
        context as { session: { user: { id: string } } | null },
      )

      const [request] = await db
        .select()
        .from(datPenghapusan)
        .where(eq(datPenghapusan.id, input.id))
      if (!request) throw new ORPCError("NOT_FOUND")
      if (request.status !== "pending")
        throw new ORPCError("CONFLICT", { message: "Pengajuan sudah diproses" })

      await db
        .update(datPenghapusan)
        .set({
          status: "rejected",
          userApprover: context.session!.user.id,
          tglApproval: new Date(),
          catatanApprover: input.catatan,
        })
        .where(eq(datPenghapusan.id, input.id))

      return { success: true }
    }),
})
