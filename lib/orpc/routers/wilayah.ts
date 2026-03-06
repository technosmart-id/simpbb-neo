import { z } from "zod";
import { protectedProcedure } from "../server";

export const wilayahRouter = {
  // listProvinsi: GET /wilayah/provinsi
  listProvinsi: protectedProcedure
    .route({
      method: "GET",
      path: "/wilayah/provinsi",
      summary: "List Provinsi",
    })
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

  // listKabupaten: GET /wilayah/kabupaten
  listKabupaten: protectedProcedure
    .route({
      method: "GET",
      path: "/wilayah/kabupaten",
      summary: "List Kabupaten",
    })
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

  // listKecamatan: GET /wilayah/kecamatan
  listKecamatan: protectedProcedure
    .route({
      method: "GET",
      path: "/wilayah/kecamatan",
      summary: "List Kecamatan",
    })
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

  // listKelurahan: GET /wilayah/kelurahan
  listKelurahan: protectedProcedure
    .route({
      method: "GET",
      path: "/wilayah/kelurahan",
      summary: "List Kelurahan",
    })
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
