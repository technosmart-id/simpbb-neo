import { JSON_SCHEMA_REGISTRY } from "@orpc/zod/zod4";
import type { ZodTypeAny } from "zod";

/**
 * Custom oz helper for Zod 4 compatibility.
 * This directly registers metadata into the registry used by ZodToJsonSchemaConverter.
 */
export const oz = {
  openapi: <T extends ZodTypeAny>(
    schema: T,
    metadata: Record<string, any>
  ): T => {
    // biome-ignore lint/suspicious/noExplicitAny: library type workaround
    (JSON_SCHEMA_REGISTRY as any).add(schema, metadata);
    return schema;
  },
};
