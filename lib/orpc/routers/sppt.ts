import { z } from "zod";
import { oz } from "../oz";
import { PaginationInputSchema } from "../schemas/pagination";
import { protectedProcedure } from "../server";

export type SpptData = {
  kabupaten: string;
  provinsi: string;
  tahunPajak: string | number;
  nop: { full: string };
  letakOP: {
    alamat: string;
    rtRw: string;
    kelurahan: string;
    kecamatan: string;
  };
  wajibPajak: {
    nama: string;
    alamat: string;
    kotaKodePos: string;
  };
  objekPajak: {
    luasTanah: number;
    kelasTanah: string;
    njopTanahPerM2: number;
    luasBangunan: number;
    kelasBangunan: string;
    njopBangunanPerM2: number;
  };
  perhitungan: {
    njopTanah: number;
    njopBangunan: number;
    njopTotal: number;
    njoptkp: number;
    njopKenaPajak: number;
    tarif: number;
    pbbTerutang: number;
  };
  jatuhTempo: string;
  tempatPembayaran: string[];
  tanggalTerbit: string;
};

export const spptRouter = {
  // list: GET /sppt
  list: protectedProcedure
    .route({ method: "GET", path: "/sppt", summary: "List Data SPPT" })
    .input(
      PaginationInputSchema.extend({
        nop: oz.openapi(z.string().optional(), {
          example: "00010100100100010",
        }),
        tahun: oz.openapi(z.string().optional(), { example: "2024" }),
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement list logic
      return { message: "TODO: Implement list logic" };
    }),

  // find: GET /sppt/{nop}/{tahun}
  find: protectedProcedure
    .route({
      method: "GET",
      path: "/sppt/{nop}/{tahun}",
      summary: "Get Detail SPPT",
    })
    .input(z.object({ nop: z.string(), tahun: z.string() }))
    .handler(({ input: _input }) => {
      // TODO: Implement detail logic
      return { message: "TODO: Implement detail logic" };
    }),

  // inquiry: POST /sppt/inquiry
  inquiry: protectedProcedure
    .route({
      method: "POST",
      path: "/sppt/inquiry",
      summary: "Inquiry Tagihan SPPT",
    })
    .input(z.object({ nop: z.string(), tahun: z.string() }))
    .handler(({ input: _input }) => {
      // TODO: Implement inquiry logic
      return { message: "TODO: Implement inquiry logic" };
    }),

  // printMass: POST /sppt/print-mass
  printMass: protectedProcedure
    .route({
      method: "POST",
      path: "/sppt/print-mass",
      summary: "Cetak Massal SPPT",
    })
    .input(
      z.object({
        /* TODO: batch criteria */
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement batch print logic
      return { message: "TODO: Implement batch print logic" };
    }),

  // printCopy: GET /sppt/{nop}/{tahun}/copy
  printCopy: protectedProcedure
    .route({
      method: "GET",
      path: "/sppt/{nop}/{tahun}/copy",
      summary: "Cetak Salinan SPPT",
    })
    .input(z.object({ nop: z.string(), tahun: z.string() }))
    .handler(({ input: _input }) => {
      // TODO: Implement copy print logic
      return { message: "TODO: Implement copy print logic" };
    }),
};
