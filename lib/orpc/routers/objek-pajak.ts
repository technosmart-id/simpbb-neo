import { z } from "zod";
import { protectedProcedure } from "../server";

// Zod schemas for objek pajak
const objekPajakSchema = z.object({
  nop: z.string().length(18),
  alamat: z.string(),
  kelurahan: z.string(),
  kecamatan: z.string(),
  luasBumi: z.number(),
  luasBangunan: z.number(),
  njopBumi: z.number(),
  njopBangunan: z.number(),
  njopTotal: z.number(),
});

const searchParamsSchema = z.object({
  search: z.string().optional(),
  kelurahan: z.string().optional(),
  kecamatan: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

// Mock data for demonstration
const mockObjekPajak = [
  {
    nop: "327101000100100010",
    alamat: "Jl. Merdeka No. 1",
    kelurahan: "Sukajadi",
    kecamatan: "Sukajadi",
    luasBumi: 200,
    luasBangunan: 150,
    njopBumi: 1_000_000,
    njopBangunan: 2_000_000,
    njopTotal: 3_000_000,
  },
  {
    nop: "327101000100100020",
    alamat: "Jl. Pahlawan No. 5",
    kelurahan: "Sukamaju",
    kecamatan: "Sukajadi",
    luasBumi: 300,
    luasBangunan: 200,
    njopBumi: 1_500_000,
    njopBangunan: 3_000_000,
    njopTotal: 4_500_000,
  },
];

export const objekPajakRouter = {
  list: protectedProcedure.input(searchParamsSchema).handler(({ input }) => {
    let filtered = mockObjekPajak;

    if (input.search) {
      const search = input.search.toLowerCase();
      filtered = filtered.filter(
        (op) =>
          op.nop.includes(search) || op.alamat.toLowerCase().includes(search)
      );
    }

    if (input.kelurahan) {
      filtered = filtered.filter((op) => op.kelurahan === input.kelurahan);
    }

    if (input.kecamatan) {
      filtered = filtered.filter((op) => op.kecamatan === input.kecamatan);
    }

    const start = (input.page - 1) * input.limit;
    const end = start + input.limit;
    const paginated = filtered.slice(start, end);

    return {
      data: paginated,
      total: filtered.length,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil(filtered.length / input.limit),
    };
  }),

  getByNop: protectedProcedure
    .input(z.object({ nop: z.string().length(18) }))
    .handler(({ input }) => {
      const objekPajak = mockObjekPajak.find((op) => op.nop === input.nop);

      if (!objekPajak) {
        throw new Error("Objek Pajak tidak ditemukan");
      }

      return objekPajak;
    }),

  create: protectedProcedure
    .input(objekPajakSchema)
    .handler(({ input, context }) => {
      // In production, this would insert into the database
      console.log(`User ${context.user.name} creating objek pajak:`, input);
      return { success: true, data: input };
    }),
};

export type ObjekPajakRouter = typeof objekPajakRouter;
