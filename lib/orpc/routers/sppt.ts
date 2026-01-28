import { z } from "zod";
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
  // getMany: GET /sppt/get-many (List SPPT)
  getMany: protectedProcedure
    .route({ method: "GET", summary: "Get All SPPT" })
    .input(
      z.object({
        /* TODO: filter params */
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement list logic
      return { message: "TODO: Implement list logic" };
    }),

  // getOne: GET /sppt/get-one (Get SPPT Detail)
  getOne: protectedProcedure
    .route({ method: "GET", summary: "Get SPPT" })
    .input(z.object({ nop: z.string(), tahun: z.string() }))
    .handler(({ input: _input }) => {
      // TODO: Implement detail logic
      return { message: "TODO: Implement detail logic" };
    }),

  // inquiry: POST /sppt/inquiry (Inquiry Tagihan SPPT)
  inquiry: protectedProcedure
    .route({ method: "POST", summary: "Inquiry Tagihan SPPT" })
    .input(z.object({ nop: z.string(), tahun: z.string() }))
    .handler(({ input: _input }) => {
      // TODO: Implement inquiry logic
      return { message: "TODO: Implement inquiry logic" };
    }),

  // printMass: POST /sppt/print-mass (Print Mass SPPT)
  printMass: protectedProcedure
    .route({ method: "POST", summary: "Print Mass SPPT" })
    .input(
      z.object({
        /* TODO: batch criteria */
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement batch print logic
      return { message: "TODO: Implement batch print logic" };
    }),

  // printCopy: GET /sppt/print-copy (Print Salinan SPPT)
  printCopy: protectedProcedure
    .route({ method: "GET", summary: "Print Salinan SPPT" })
    .input(z.object({ nop: z.string(), tahun: z.string() }))
    .handler(({ input: _input }) => {
      // TODO: Implement copy print logic
      return { message: "TODO: Implement copy print logic" };
    }),
};
