import { objekPajakRouter } from "./routers/objek-pajak";
import { spptRouter } from "./routers/sppt";
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

  objekPajak: objekPajakRouter,
  sppt: spptRouter,
};

export type Router = typeof router;
