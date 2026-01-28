import { z } from "zod";
import { protectedProcedure } from "../server";

export const pembayaranRouter = {
  // create: POST /pembayaran/create (Create Pembayaran)
  create: protectedProcedure
    .route({ method: "POST", summary: "Create Pembayaran" })
    .input(
      z.object({
        /* TODO: payment data */
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement payment logic
      return { message: "TODO: Implement payment logic" };
    }),

  // void: POST /pembayaran/void (Void Pembayaran)
  void: protectedProcedure
    .route({ method: "POST", summary: "Void Pembayaran" })
    .input(
      z.object({
        /* TODO: reversal data */
      })
    )
    .handler(({ input: _input }) => {
      // TODO: Implement reversal logic
      return { message: "TODO: Implement reversal logic" };
    }),

  // getHistory: GET /pembayaran/get-history (Get History Pembayaran)
  getHistory: protectedProcedure
    .route({ method: "GET", summary: "Get History Pembayaran" })
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
