import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { datZnt } from "@/lib/db/schema/pbb/objek-pajak";
import { oz } from "../oz";
import { zCollectionResponse } from "../schemas/response-envelope";
import { protectedProcedure } from "../server";

export const referenceRouter = {
  // listZnt: GET /ref/znt
  listZnt: protectedProcedure
    .route({
      method: "GET",
      path: "/ref/znt",
      summary: "List Zona Nilai Tanah (ZNT)",
    })
    .input(
      z.object({
        kdPropinsi: oz.openapi(z.string().length(2), { example: "32" }),
        kdDati2: oz.openapi(z.string().length(2), { example: "01" }),
        kdKecamatan: oz.openapi(z.string().length(3), { example: "001" }),
        kdKelurahan: oz.openapi(z.string().length(3), { example: "001" }),
      })
    )
    .output(zCollectionResponse(z.any()))
    .handler(async ({ input }) => {
      const items = await db
        .select()
        .from(datZnt)
        .where(
          and(
            eq(datZnt.kdPropinsi, input.kdPropinsi),
            eq(datZnt.kdDati2, input.kdDati2),
            eq(datZnt.kdKecamatan, input.kdKecamatan),
            eq(datZnt.kdKelurahan, input.kdKelurahan)
          )
        );

      return {
        data: items,
        pagination: {
          page: 1,
          pageSize: items.length,
          totalPages: 1,
          totalCount: items.length,
          hasNext: false,
          hasPrevious: false,
        },
      };
    }),
};
