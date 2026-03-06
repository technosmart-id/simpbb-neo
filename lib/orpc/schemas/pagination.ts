import { z } from "zod";
import { oz } from "../oz";

const pageSchema = z.coerce.number().min(1).default(1);
const limitSchema = z.coerce.number().min(1).max(100).default(10);

// Standard Pagination Input
export const PaginationInputSchema = z.object({
  page: oz.openapi(pageSchema, {
    example: 1,
    description: "Page number (1-based)",
  }),
  limit: oz.openapi(limitSchema, {
    example: 10,
    description: "Items per page",
  }),
});

export type PaginationInput = z.infer<typeof PaginationInputSchema>;

// Helper to calculate offset
export function getPaginationParams(input: PaginationInput) {
  const page = input.page;
  const pageSize = input.limit;
  const offset = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    offset,
  };
}
