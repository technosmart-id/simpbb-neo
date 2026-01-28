import { z } from "zod";
import { protectedProcedure } from "../server";

export const wilayahRouter = {
  // getProvinsi: GET /wilayah/get-provinsi
  getProvinsi: protectedProcedure
    .route({ method: "GET", summary: "Get Provinsi" })
    .input(
      z
        .object({
          /* TODO: filter params */
        })
        .optional()
    )
    .handler(({ input: _input }) => {
      // TODO: Implement provinsi list logic
      return { message: "TODO: Implement provinsi list logic" };
    }),

  // getKabupaten: GET /wilayah/get-kabupaten
  getKabupaten: protectedProcedure
    .route({ method: "GET", summary: "Get Kabupaten" })
    .input(
      z
        .object({
          /* TODO: filter params */
        })
        .optional()
    )
    .handler(({ input: _input }) => {
      // TODO: Implement kabupaten list logic
      return { message: "TODO: Implement kabupaten list logic" };
    }),

  // getKecamatan: GET /wilayah/get-kecamatan
  getKecamatan: protectedProcedure
    .route({ method: "GET", summary: "Get Kecamatan" })
    .input(
      z
        .object({
          /* TODO: filter params */
        })
        .optional()
    )
    .handler(({ input: _input }) => {
      // TODO: Implement kecamatan list logic
      return { message: "TODO: Implement kecamatan list logic" };
    }),

  // getKelurahan: GET /wilayah/get-kelurahan
  getKelurahan: protectedProcedure
    .route({ method: "GET", summary: "Get Kelurahan" })
    .input(
      z
        .object({
          /* TODO: filter params */
        })
        .optional()
    )
    .handler(({ input: _input }) => {
      // TODO: Implement kelurahan list logic
      return { message: "TODO: Implement kelurahan list logic" };
    }),
};
