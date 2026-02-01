import { z } from "zod";
import { assessmentRouter } from "./routers/assessment";
import { bangunanRouter } from "./routers/bangunan";
import { objekPajakRouter } from "./routers/objek-pajak";
import { pembayaranRouter } from "./routers/pembayaran";
import { referenceRouter } from "./routers/reference";
import { spptRouter } from "./routers/sppt";
import { subjekPajakRouter } from "./routers/subjek-pajak";
import { wilayahRouter } from "./routers/wilayah";
import { protectedProcedure, publicProcedure } from "./server";

export const router = {
  health: publicProcedure
    .output(z.object({ status: z.string(), timestamp: z.string().datetime() }))
    .handler(() => ({
      status: "ok",
      timestamp: new Date().toISOString(),
    })),

  me: protectedProcedure.handler(({ context }) => ({
    id: context.user.id,
    name: context.user.name,
    email: context.user.email,
    image: context.user.image,
  })),

  op: objekPajakRouter,
  sppt: spptRouter,
  pembayaran: pembayaranRouter,
  wilayah: wilayahRouter,
  subjek: subjekPajakRouter,
  bangunan: bangunanRouter,
  assessment: assessmentRouter,
  reference: referenceRouter,
  // biome-ignore lint/suspicious/noExplicitAny: Type matching for custom router structure
} as any;

export type Router = typeof router;
