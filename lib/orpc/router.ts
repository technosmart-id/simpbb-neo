import { objekPajakRouter } from "./routers/objek-pajak";
import { pembayaranRouter } from "./routers/pembayaran";
import { spptRouter } from "./routers/sppt";
import { wilayahRouter } from "./routers/wilayah";
import { protectedProcedure, publicProcedure } from "./server";

export const router = {
  health: publicProcedure.handler(() => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  })),

  me: protectedProcedure.handler(({ context }) => ({
    id: context.user.id,
    name: context.user.name,
    email: context.user.email,
    image: context.user.image,
  })),

  "objek-pajak": objekPajakRouter,
  sppt: spptRouter,
  pembayaran: pembayaranRouter,
  wilayah: wilayahRouter,
};

export type Router = typeof router;
