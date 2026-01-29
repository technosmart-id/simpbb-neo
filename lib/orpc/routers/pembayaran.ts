import { z } from "zod";
import { protectedProcedure } from "../server";

export const pembayaranRouter = {
  // create: POST /pembayaran
  create: protectedProcedure
    .route({
      method: "POST",
      path: "/pembayaran",
      summary: "Create Pembayaran",
    })
    .input(
      z.object({
        /* TODO: payment data */
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
      summary: "Void Pembayaran",
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
      summary: "Get History Pembayaran",
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
