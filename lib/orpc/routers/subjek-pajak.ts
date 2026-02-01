import { count, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { datSubjekPajak } from "@/lib/db/schema/pbb/subjek-pajak";
import { oz } from "../oz";
import {
  getPaginationParams,
  PaginationInputSchema,
} from "../schemas/pagination";
import {
  zCollectionResponse,
  zSingleResourceResponse,
} from "../schemas/response-envelope";
import { protectedProcedure } from "../server";

export const subjekPajakRouter = {
  // list: GET /subjek
  list: protectedProcedure
    .route({
      method: "GET",
      path: "/subjek",
      summary: "List Data Subjek Pajak",
    })
    .input(
      PaginationInputSchema.extend({
        keyword: oz.openapi(z.string().optional(), {
          example: "Budi",
          description: "Search by Name or NIK",
        }),
      })
    )
    .output(zCollectionResponse(z.any())) // TODO: Define precise schema
    .handler(async ({ input }) => {
      const filters = input.keyword
        ? ilike(datSubjekPajak.nmWp, `%${input.keyword}%`)
        : undefined;

      const [countRes] = await db
        .select({ count: count() })
        .from(datSubjekPajak)
        .where(filters);

      const totalCount = countRes?.count || 0;
      const { page, pageSize, offset } = getPaginationParams(input);
      const totalPages = Math.ceil(totalCount / pageSize);

      const items = await db.query.datSubjekPajak.findMany({
        where: filters,
        limit: input.limit,
        offset,
      });

      return {
        data: items,
        pagination: {
          page,
          pageSize: input.limit,
          totalPages,
          totalCount,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    }),

  // find: GET /subjek/{id}
  find: protectedProcedure
    .route({
      method: "GET",
      path: "/subjek/{id}",
      summary: "Get Detail Subjek Pajak",
    })
    .input(z.object({ id: z.string() }))
    .output(zSingleResourceResponse(z.any()))
    .handler(async ({ input }) => {
      const item = await db.query.datSubjekPajak.findFirst({
        where: eq(datSubjekPajak.subjekPajakId, input.id),
      });

      if (!item) {
        // Return null data instead of error for 404 in this context?
        // Or throw specific NotFound error if oRPC supports it
        throw new Error("Subjek Pajak not found");
      }

      return {
        data: item,
      };
    }),

  // create: POST /subjek
  create: protectedProcedure
    .route({
      method: "POST",
      path: "/subjek",
      summary: "Create Data Subjek Pajak",
    })
    .input(
      z.object({
        subjekPajakId: oz.openapi(z.string().max(30), {
          example: "3201010000000001",
          description: "National Identity Number (NIK)",
        }),
        nmWp: oz.openapi(z.string().max(30), { example: "Budi Santoso" }),
        jalanWp: oz.openapi(z.string().max(30), {
          example: "Jl. Merdeka No. 1",
        }),
        blokKavNoWp: z.string().max(15).optional(),
        rwWp: z.string().max(2).optional(),
        rtWp: z.string().max(3).optional(),
        kelurahanWp: z.string().max(30).optional(),
        kotaWp: z.string().max(30).optional(),
        kdPosWp: z.string().max(5).optional(),
        telpWp: z.string().max(20).optional(),
        npwp: z.string().max(16).optional(),
        statusPekerjaanWp: z.string().max(1).default("0"),
      })
    )
    .output(zSingleResourceResponse(z.any()))
    .handler(async ({ input }) => {
      await db.insert(datSubjekPajak).values(input);
      const newItem = await db.query.datSubjekPajak.findFirst({
        where: eq(datSubjekPajak.subjekPajakId, input.subjekPajakId),
      });

      if (!newItem) {
        throw new Error("Failed to create Subjek Pajak");
      }

      return {
        data: newItem,
      };
    }),

  // update: PATCH /subjek/{id}
  update: protectedProcedure
    .route({
      method: "PATCH",
      path: "/subjek/{id}",
      summary: "Update Data Subjek Pajak",
    })
    .input(
      z.object({
        id: z.string(),
        nmWp: z.string().max(30).optional(),
        jalanWp: z.string().max(30).optional(),
        blokKavNoWp: z.string().max(15).optional(),
        rwWp: z.string().max(2).optional(),
        rtWp: z.string().max(3).optional(),
        kelurahanWp: z.string().max(30).optional(),
        kotaWp: z.string().max(30).optional(),
        kdPosWp: z.string().max(5).optional(),
        telpWp: z.string().max(20).optional(),
        npwp: z.string().max(16).optional(),
        statusPekerjaanWp: z.string().max(1).optional(),
      })
    )
    .output(zSingleResourceResponse(z.any()))
    .handler(async ({ input }) => {
      const { id, ...data } = input;
      await db
        .update(datSubjekPajak)
        .set(data)
        .where(eq(datSubjekPajak.subjekPajakId, id));

      const updatedItem = await db.query.datSubjekPajak.findFirst({
        where: eq(datSubjekPajak.subjekPajakId, id),
      });

      if (!updatedItem) {
        throw new Error("Subjek Pajak not found");
      }

      return {
        data: updatedItem,
      };
    }),
};
