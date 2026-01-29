import { and, count, eq, ilike, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { datObjekPajak } from "@/lib/db/schema/pbb/objek-pajak";
import { sppt } from "@/lib/db/schema/pbb/sppt";
import { datSubjekPajak } from "@/lib/db/schema/pbb/subjek-pajak";
import {
  zCollectionResponse,
  zSingleResourceResponse,
} from "../schemas/response-envelope";
import { protectedProcedure } from "../server";

// Helper to parse 18-digit NOP string into components
// Format: PP.DD.KKK.KEL.BLK.URUT.J (dots optional)
const parseNop = (nop: string) => {
  const clean = nop.replace(/[^0-9]/g, "");
  if (clean.length !== 18) {
    throw new Error("Invalid NOP format: length must be 18 digits");
  }

  return {
    kdPropinsi: clean.substring(0, 2),
    kdDati2: clean.substring(2, 4),
    kdKecamatan: clean.substring(4, 7),
    kdKelurahan: clean.substring(7, 10),
    kdBlok: clean.substring(10, 13),
    noUrut: clean.substring(13, 17),
    kdJnsOp: clean.substring(17, 18),
  };
};

// Simplified Objek Pajak Schema for responses
const ObjekPajakSchema = z.object({
  nop: z.string(),
  namaWP: z.string(),
  alamatOP: z.string(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  luasTanah: z.number(),
  luasBangunan: z.number(),
  njop: z.number(),
  njopBumi: z.number(),
  njopBangunan: z.number(),
  statusBayar: z.enum(["lunas", "belum"]), // TODO: Calculate this from payment data
  pbbTerutang: z.number(), // TODO: Calculate this
});

export const objekPajakRouter = {
  // list: GET /op
  list: protectedProcedure
    .route({ method: "GET", path: "/op", summary: "List Objek Pajak" })
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.coerce.number().min(1).max(100).optional(),
        // Filter by Subjek Pajak (Owner)
        subjekPajakId: z
          .string()
          .optional()
          .describe("Filter by Owner ID (NIK/KTP)"),
        nama: z.string().optional(),
      })
    )
    .output(zCollectionResponse(ObjekPajakSchema))
    .handler(async ({ input }) => {
      const page = Number(input?.cursor) || 1;
      const pageSize = input?.limit || 10;
      const offset = (page - 1) * pageSize;
      const currentYear = new Date().getFullYear().toString();

      // Build conditions
      const conditions: SQL[] = [];
      if (input?.subjekPajakId) {
        conditions.push(eq(datObjekPajak.subjekPajakId, input.subjekPajakId));
      }
      if (input?.nama) {
        conditions.push(ilike(datSubjekPajak.nmWp, `%${input.nama}%`));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Count total queries
      const [countRes] = await db
        .select({ count: count() })
        .from(datObjekPajak)
        .leftJoin(
          datSubjekPajak,
          eq(datObjekPajak.subjekPajakId, datSubjekPajak.subjekPajakId)
        )
        .where(whereClause);

      const totalCount = countRes?.count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Data query
      const results = await db
        .select({
          p: datObjekPajak,
          s: datSubjekPajak,
          sp: sppt,
        })
        .from(datObjekPajak)
        .leftJoin(
          datSubjekPajak,
          eq(datObjekPajak.subjekPajakId, datSubjekPajak.subjekPajakId)
        )
        .leftJoin(
          sppt,
          and(
            eq(sppt.kdPropinsi, datObjekPajak.kdPropinsi),
            eq(sppt.kdDati2, datObjekPajak.kdDati2),
            eq(sppt.kdKecamatan, datObjekPajak.kdKecamatan),
            eq(sppt.kdKelurahan, datObjekPajak.kdKelurahan),
            eq(sppt.kdBlok, datObjekPajak.kdBlok),
            eq(sppt.noUrut, datObjekPajak.noUrut),
            eq(sppt.kdJnsOp, datObjekPajak.kdJnsOp),
            eq(sppt.thnPajakSppt, currentYear)
          )
        )
        .where(whereClause)
        .limit(pageSize)
        .offset(offset);

      const data = results.map(({ p, s, sp }) => {
        const nop = `${p.kdPropinsi}.${p.kdDati2}.${p.kdKecamatan}.${p.kdKelurahan}.${p.kdBlok}.${p.noUrut}.${p.kdJnsOp}`;
        // Calculate NJOP (simplified) - assuming stored values are correct
        const njop = Number(p.njopBumi) + Number(p.njopBng);
        // Determine status bayar from SPPT
        const statusBayar = (
          sp?.statusPembayaranSppt === "1" ? "lunas" : "belum"
        ) as "lunas" | "belum";

        return {
          nop,
          namaWP: s?.nmWp || "N/A",
          alamatOP: p.jalanOp,
          kelurahan: s?.kelurahanWp || undefined,
          kecamatan: s?.kotaWp || undefined, // Mapping limitation: schema doesn't have kec/kel names stored, only codes. linking to ref tables needed for real names.
          luasTanah: Number(p.totalLuasBumi),
          luasBangunan: Number(p.totalLuasBng),
          njop,
          njopBumi: Number(p.njopBumi),
          njopBangunan: Number(p.njopBng),
          statusBayar,
          pbbTerutang: Number(sp?.pbbYgHarusDibayarSppt || 0),
        };
      });

      return {
        data,
        pagination: {
          page,
          pageSize,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
        meta: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };
    }),

  // create: POST /op
  create: protectedProcedure
    .route({ method: "POST", path: "/op", summary: "Create Objek Pajak" })
    .input(
      z.object({
        /* TODO: registration data */
      })
    )
    .output(zSingleResourceResponse(z.any()))
    .handler(({ input: _input }) => {
      // TODO: Implement registration logic
      return {
        data: { message: "TODO: Implement registration logic" },
        meta: {
          requestId: "req_placeholder",
          timestamp: new Date().toISOString(),
        },
      };
    }),

  // find: GET /op/{nop}
  find: protectedProcedure
    .route({ method: "GET", path: "/op/{nop}", summary: "Get Objek Pajak" })
    .input(z.object({ nop: z.string() }))
    .output(zSingleResourceResponse(ObjekPajakSchema))
    .handler(async ({ input }) => {
      const { nop } = input;

      let parsed: ReturnType<typeof parseNop>;
      try {
        parsed = parseNop(nop);
      } catch (_e) {
        // Return 404-like response or error if NOP is invalid (since we can't find it)
        // For now let's just let it throw or return null? Handler expects return.
        // Throwing error is better.
        throw new Error(`Invalid NOP: ${nop}`);
      }

      const currentYear = new Date().getFullYear().toString();
      const result = await db
        .select({
          p: datObjekPajak,
          s: datSubjekPajak,
          sp: sppt,
        })
        .from(datObjekPajak)
        .leftJoin(
          datSubjekPajak,
          eq(datObjekPajak.subjekPajakId, datSubjekPajak.subjekPajakId)
        )
        .leftJoin(
          sppt,
          and(
            eq(sppt.kdPropinsi, datObjekPajak.kdPropinsi),
            eq(sppt.kdDati2, datObjekPajak.kdDati2),
            eq(sppt.kdKecamatan, datObjekPajak.kdKecamatan),
            eq(sppt.kdKelurahan, datObjekPajak.kdKelurahan),
            eq(sppt.kdBlok, datObjekPajak.kdBlok),
            eq(sppt.noUrut, datObjekPajak.noUrut),
            eq(sppt.kdJnsOp, datObjekPajak.kdJnsOp),
            eq(sppt.thnPajakSppt, currentYear)
          )
        )
        .where(
          and(
            eq(datObjekPajak.kdPropinsi, parsed.kdPropinsi),
            eq(datObjekPajak.kdDati2, parsed.kdDati2),
            eq(datObjekPajak.kdKecamatan, parsed.kdKecamatan),
            eq(datObjekPajak.kdKelurahan, parsed.kdKelurahan),
            eq(datObjekPajak.kdBlok, parsed.kdBlok),
            eq(datObjekPajak.noUrut, parsed.noUrut),
            eq(datObjekPajak.kdJnsOp, parsed.kdJnsOp)
          )
        )
        .limit(1);

      if (result.length === 0) {
        throw new Error("Objek Pajak not found");
      }

      const { p, s, sp } = result[0];
      const njop = Number(p.njopBumi) + Number(p.njopBng);
      const statusBayar = (
        sp?.statusPembayaranSppt === "1" ? "lunas" : "belum"
      ) as "lunas" | "belum";

      const data = {
        nop,
        namaWP: s?.nmWp || "N/A",
        alamatOP: p.jalanOp,
        kelurahan: s?.kelurahanWp || undefined,
        kecamatan: s?.kotaWp || undefined,
        luasTanah: Number(p.totalLuasBumi),
        luasBangunan: Number(p.totalLuasBng),
        njop,
        njopBumi: Number(p.njopBumi),
        njopBangunan: Number(p.njopBng),
        statusBayar,
        pbbTerutang: Number(sp?.pbbYgHarusDibayarSppt || 0),
      };

      return {
        data,
        meta: {
          requestId: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };
    }),

  // update: PATCH /op/{nop}
  update: protectedProcedure
    .route({
      method: "PATCH",
      path: "/op/{nop}",
      summary: "Update Data Objek Pajak",
    })
    .input(z.object({ nop: z.string() /* TODO: update data */ }))
    .output(zSingleResourceResponse(z.any()))
    .handler(({ input: _input }) => {
      // TODO: Implement mutation logic
      return {
        data: { message: "TODO: Implement mutation logic" },
        meta: {
          requestId: "req_placeholder",
          timestamp: new Date().toISOString(),
        },
      };
    }),

  // updateSubjek: PATCH /op/{nop}/subjek
  updateSubjek: protectedProcedure
    .route({
      method: "PATCH",
      path: "/op/{nop}/subjek",
      summary: "Update Subjek Pajak",
    })
    .input(z.object({ nop: z.string() /* TODO: subject data */ }))
    .output(zSingleResourceResponse(z.any()))
    .handler(({ input: _input }) => {
      // TODO: Implement subject mutation logic
      return {
        data: { message: "TODO: Implement subject mutation logic" },
        meta: {
          requestId: "req_placeholder",
          timestamp: new Date().toISOString(),
        },
      };
    }),

  // history: GET /op/{nop}/history
  history: protectedProcedure
    .route({
      method: "GET",
      path: "/op/{nop}/history",
      summary: "Get History Objek Pajak",
    })
    .input(z.object({ nop: z.string() }))
    .output(zCollectionResponse(z.any()))
    .handler(({ input: _input }) => {
      // TODO: Implement history logic
      return {
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 0,
          totalCount: 0,
          hasNext: false,
          hasPrevious: false,
        },
        meta: {
          requestId: "req_placeholder",
          timestamp: new Date().toISOString(),
        },
      };
    }),
};
