import { z } from "zod";
import { oz } from "../oz";
import { protectedProcedure } from "../server";

export const pembayaranRouter = {
  // create: POST /pembayaran
  create: protectedProcedure
    .route({
      method: "POST",
      path: "/pembayaran",
      summary: "Create Data Pembayaran",
    })
    .input(
      z.object({
        nop: oz.openapi(z.string(), { example: "00010100100100010" }),
        tahun: oz.openapi(z.string(), { example: "2024" }),
        amount: oz.openapi(z.number().min(0), { example: 150_000 }),
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement payment logic
      return { message: "TODO: Implement payment logic" };
    }),

  // void: POST /pembayaran/void
  void: protectedProcedure
    .route({
      method: "POST",
      path: "/pembayaran/void",
      summary: "Cancel Pembayaran",
    })
    .input(
      z.object({
        /* TODO: reversal data */
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement reversal logic
      return { message: "TODO: Implement reversal logic" };
    }),

  // history: GET /pembayaran/history
  history: protectedProcedure
    .route({
      method: "GET",
      path: "/pembayaran/history",
      summary: "List Riwayat Pembayaran",
    })
    .input(
      z.object({
        /* TODO: filter params */
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement payment history logic
      return { message: "TODO: Implement payment history logic" };
    }),
};
