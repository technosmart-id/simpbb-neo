import { and, count, eq, ilike, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  datObjekPajak,
  datOpAnggota,
  datOpBumi,
  datOpInduk,
} from "@/lib/db/schema/pbb/objek-pajak";
import { sppt } from "@/lib/db/schema/pbb/sppt";
import { datSubjekPajak } from "@/lib/db/schema/pbb/subjek-pajak";
import { oz } from "../oz";
import {
  getPaginationParams,
  PaginationInputSchema,
} from "../schemas/pagination";
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
    .route({ method: "GET", path: "/op", summary: "List Data Objek Pajak" })
    .input(
      PaginationInputSchema.extend({
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
      const { page, pageSize, offset } = getPaginationParams(input);
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
      };
    }),

  // create: POST /op
  create: protectedProcedure
    .route({ method: "POST", path: "/op", summary: "Create Data Objek Pajak" })
    .input(
      z.object({
        nop: oz.openapi(z.string().length(18), {
          example: "00010100100100010",
          description: "Nomor Objek Pajak (18 digits)",
        }),
        subjekPajakId: z.string().max(30),
        noFormulirSpop: z.string().length(11),
        // Location
        jalanOp: z.string().max(30),
        blokKavNoOp: z.string().max(15).optional(),
        rwOp: z.string().max(2).optional(),
        rtOp: z.string().max(3).optional(),
        // Metadata
        kdStatusCabang: z.number().default(0),
        kdStatusWp: z.string().default("0"),
        jnsTransaksiOp: z.string().default("1"),
        tglPendataanOp: z.coerce.date().default(() => new Date()),
        nipPendata: z.string().default("SYSTEM"),
        tglPemeriksaanOp: z.coerce.date().default(() => new Date()),
        nipPemeriksaOp: z.string().default("SYSTEM"),
        tglPerekamanOp: z.coerce.date().default(() => new Date()),
        nipPerekamOp: z.string().default("SYSTEM"),

        // Bumi Initial Data
        luasBumi: z.number().min(0),
        kodeZnt: z.string().length(2),
        jnsBumi: z.string().length(1).default("1"),
        nilaiSistemBumi: z.number().min(0).default(0),
        njopBumi: z.number().min(0).default(0),
      })
    )
    .output(zSingleResourceResponse(z.any()))
    .handler(async ({ input }) => {
      let parsed: ReturnType<typeof parseNop>;
      try {
        parsed = parseNop(input.nop);
      } catch (e) {
        throw new Error(`Invalid NOP: ${input.nop}`);
      }

      await db.transaction(async (tx) => {
        // 1. Insert Objek Pajak
        await tx.insert(datObjekPajak).values({
          ...parsed,
          subjekPajakId: input.subjekPajakId,
          noFormulirSpop: input.noFormulirSpop,
          jalanOp: input.jalanOp,
          blokKavNoOp: input.blokKavNoOp,
          rwOp: input.rwOp,
          rtOp: input.rtOp,
          kdStatusCabang: input.kdStatusCabang,
          kdStatusWp: input.kdStatusWp,
          jnsTransaksiOp: input.jnsTransaksiOp,
          tglPendataanOp: input.tglPendataanOp,
          nipPendata: input.nipPendata,
          tglPemeriksaanOp: input.tglPemeriksaanOp,
          nipPemeriksaOp: input.nipPemeriksaOp,
          tglPerekamanOp: input.tglPerekamanOp,
          nipPerekamOp: input.nipPerekamOp,
          totalLuasBumi: input.luasBumi,
          totalLuasBng: 0,
          njopBumi: input.njopBumi,
          njopBng: 0,
        });

        // 2. Insert Op Bumi (Default No 1)
        await tx.insert(datOpBumi).values({
          ...parsed,
          noBumi: 1,
          kdZnt: input.kodeZnt,
          luasBumi: input.luasBumi,
          jnsBumi: input.jnsBumi,
          nilaiSistemBumi: input.nilaiSistemBumi,
        });
      });

      return {
        data: { nop: input.nop, message: "Objek Pajak created successfully" },
      };
    }),

  // find: GET /op/{nop}
  find: protectedProcedure
    .route({
      method: "GET",
      path: "/op/{nop}",
      summary: "Get Detail Objek Pajak",
    })
    .input(
      z.object({
        nop: oz.openapi(z.string(), {
          example: "00010100100100010",
        }),
      })
    )
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
      };
    }),

  // history: GET /op/{nop}/history
  history: protectedProcedure
    .route({
      method: "GET",
      path: "/op/{nop}/history",
      summary: "List Riwayat Objek Pajak",
    })
    .input(
      z.object({
        nop: oz.openapi(z.string(), {
          example: "00010100100100010",
        }),
      })
    )
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
      };
    }),

  // listBumi: GET /op/{nop}/bumi
  listBumi: protectedProcedure
    .route({
      method: "GET",
      path: "/op/{nop}/bumi",
      summary: "List Data Bumi",
    })
    .input(
      z.object({
        nop: oz.openapi(z.string(), {
          example: "00010100100100010",
        }),
      })
    )
    .output(zCollectionResponse(z.any()))
    .handler(async ({ input }) => {
      let parsed: ReturnType<typeof parseNop>;
      try {
        parsed = parseNop(input.nop);
      } catch (e) {
        throw new Error(`Invalid NOP: ${input.nop}`);
      }

      const items = await db
        .select()
        .from(datOpBumi)
        .where(
          and(
            eq(datOpBumi.kdPropinsi, parsed.kdPropinsi),
            eq(datOpBumi.kdDati2, parsed.kdDati2),
            eq(datOpBumi.kdKecamatan, parsed.kdKecamatan),
            eq(datOpBumi.kdKelurahan, parsed.kdKelurahan),
            eq(datOpBumi.kdBlok, parsed.kdBlok),
            eq(datOpBumi.noUrut, parsed.noUrut),
            eq(datOpBumi.kdJnsOp, parsed.kdJnsOp)
          )
        );

      return {
        data: items,
        pagination: {
          page: 1,
          pageSize: items.length || 10,
          totalPages: 1,
          totalCount: items.length,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }),

  // updateBumi: PUT /op/{nop}/bumi
  updateBumi: protectedProcedure
    .route({
      method: "PUT",
      path: "/op/{nop}/bumi",
      summary: "Update Data Bumi",
    })
    .input(
      z.object({
        nop: z.string(),
        luasBumi: z.number().min(0),
        kodeZnt: z.string().length(2),
        jnsBumi: z.string().length(1),
        nilaiSistemBumi: z.number().min(0),
      })
    )
    .output(zSingleResourceResponse(z.any()))
    .handler(async ({ input }) => {
      let parsed: ReturnType<typeof parseNop>;
      try {
        parsed = parseNop(input.nop);
      } catch (e) {
        throw new Error(`Invalid NOP: ${input.nop}`);
      }

      await db.transaction(async (tx) => {
        // Update Bumi (assuming noBumi=1)
        await tx
          .update(datOpBumi)
          .set({
            luasBumi: input.luasBumi,
            kdZnt: input.kodeZnt,
            jnsBumi: input.jnsBumi,
            nilaiSistemBumi: input.nilaiSistemBumi,
          })
          .where(
            and(
              eq(datOpBumi.kdPropinsi, parsed.kdPropinsi),
              eq(datOpBumi.kdDati2, parsed.kdDati2),
              eq(datOpBumi.kdKecamatan, parsed.kdKecamatan),
              eq(datOpBumi.kdKelurahan, parsed.kdKelurahan),
              eq(datOpBumi.kdBlok, parsed.kdBlok),
              eq(datOpBumi.noUrut, parsed.noUrut),
              eq(datOpBumi.kdJnsOp, parsed.kdJnsOp),
              eq(datOpBumi.noBumi, 1)
            )
          );

        // Sync Objek Pajak Total Luas
        // In a real scenario, we might sum ALL noBumi, but here assuming 1-to-1 sync for simple cases
        // Or calculating sum(). For now: direct update.
        await tx
          .update(datObjekPajak)
          .set({
            totalLuasBumi: input.luasBumi,
            // Trigger storage procedure or recalculation logic here if needed
          })
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
          );
      });

      return {
        data: { message: "Bumi updated successfully" },
      };
    }),

  // createInduk: POST /op/induk
  createInduk: protectedProcedure
    .route({
      method: "POST",
      path: "/op/induk",
      summary: "Create Data Objek Pajak Induk",
    })
    .input(
      z.object({
        nop: oz.openapi(z.string().length(18), {
          example: "320101000100100010",
        }),
      })
    )
    .output(zSingleResourceResponse(z.any()))
    .handler(async ({ input }) => {
      let parsed: ReturnType<typeof parseNop>;
      try {
        parsed = parseNop(input.nop);
      } catch (e) {
        throw new Error(`Invalid NOP: ${input.nop}`);
      }

      await db.insert(datOpInduk).values(parsed);

      return {
        data: { message: "Parent OP registered successfully" },
      };
    }),

  // createAnggota: POST /op/anggota
  createAnggota: protectedProcedure
    .route({
      method: "POST",
      path: "/op/anggota",
      summary: "Create Data Objek Pajak Anggota",
    })
    .input(
      z.object({
        parentNop: oz.openapi(z.string().length(18), {
          description: "NOP of the Parent Object",
          example: "320101000100100010",
        }),
        childNop: oz.openapi(z.string().length(18), {
          description: "NOP of the Member Object",
          example: "320101000100100020",
        }),
        luasBumiBeban: z.number().optional(),
        luasBngBeban: z.number().optional(),
        njopBumiBeban: z.number().optional(),
        njopBngBeban: z.number().optional(),
      })
    )
    .output(zSingleResourceResponse(z.any()))
    .handler(async ({ input }) => {
      let parentParsed: ReturnType<typeof parseNop>;
      let childParsed: ReturnType<typeof parseNop>;
      try {
        parentParsed = parseNop(input.parentNop);
        childParsed = parseNop(input.childNop);
      } catch (e) {
        throw new Error("Invalid NOP format");
      }

      await db.insert(datOpAnggota).values({
        // Parent Key
        kdPropinsiInduk: parentParsed.kdPropinsi,
        kdDati2Induk: parentParsed.kdDati2,
        kdKecamatanInduk: parentParsed.kdKecamatan,
        kdKelurahanInduk: parentParsed.kdKelurahan,
        kdBlokInduk: parentParsed.kdBlok,
        noUrutInduk: parentParsed.noUrut,
        kdJnsOpInduk: parentParsed.kdJnsOp,
        // Child Key
        kdPropinsi: childParsed.kdPropinsi,
        kdDati2: childParsed.kdDati2,
        kdKecamatan: childParsed.kdKecamatan,
        kdKelurahan: childParsed.kdKelurahan,
        kdBlok: childParsed.kdBlok,
        noUrut: childParsed.noUrut,
        kdJnsOp: childParsed.kdJnsOp,
        // Burdens
        luasBumiBeban: input.luasBumiBeban,
        luasBngBeban: input.luasBngBeban,
        njopBumiBeban: input.njopBumiBeban,
        njopBngBeban: input.njopBngBeban,
      });

      return {
        data: { message: "Member OP linked successfully" },
      };
    }),
};
