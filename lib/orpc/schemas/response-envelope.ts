import { z } from "zod";

// ============================================================================
// RESPONSE METADATA
// ============================================================================

export const ResponseMetaSchema = z.object({
  requestId: z
    .string()
    .describe("Unique request identifier for tracking and debugging"),
  timestamp: z
    .string()
    .datetime()
    .describe("Timestamp when the response was generated"),
  apiVersion: z
    .string()
    .optional()
    .describe("API version used for this request"),
  tenantId: z
    .string()
    .optional()
    .describe("Tenant/organization ID for multi-tenant requests"),
  tenantName: z
    .string()
    .optional()
    .describe("Tenant/organization name for multi-tenant requests"),
  durationMs: z
    .number()
    .int()
    .optional()
    .describe("Processing time in milliseconds"),
});

// ============================================================================
// WARNINGS
// ============================================================================

export const WarningSchema = z.object({
  code: z
    .string()
    .describe("Warning code (e.g., endpointDeprecated, pageSizeCapped)"),
  message: z.string().describe("Human-readable warning message"),
  documentationUrl: z
    .string()
    .url()
    .optional()
    .describe("URL to documentation about this warning"),
});

// ============================================================================
// PAGINATION
// ============================================================================

export const PaginationLinksSchema = z.object({
  first: z.string().nullable().describe("URL for the first page"),
  previous: z.string().nullable().describe("URL for the previous page"),
  next: z.string().nullable().describe("URL for the next page"),
  last: z.string().nullable().describe("URL for the last page"),
});

export const PaginationSchema = z.object({
  page: z.number().int().min(1).describe("Current page number (1-indexed)"),
  pageSize: z.number().int().min(1).describe("Number of items per page"),
  totalPages: z.number().int().min(0).describe("Total number of pages"),
  totalCount: z
    .number()
    .int()
    .min(0)
    .describe("Total number of items across all pages"),
  hasNext: z.boolean().describe("Whether there is a next page"),
  hasPrevious: z.boolean().describe("Whether there is a previous page"),
  links: PaginationLinksSchema.optional().describe(
    "Navigation links for pagination"
  ),
  requestedPageSize: z
    .number()
    .int()
    .optional()
    .describe("Original requested page size"),
});

export const CursorPaginationSchema = z.object({
  limit: z.number().int().min(1).describe("Maximum items returned per page"),
  hasNext: z.boolean().describe("Whether there is a next page"),
  nextCursor: z
    .string()
    .nullable()
    .describe("Cursor for fetching the next page"),
  previousCursor: z
    .string()
    .nullable()
    .describe("Cursor for fetching the previous page"),
});

// ============================================================================
// GENERIC RESPONSE FACTORIES
// ============================================================================

/**
 * Creates a standard response schema for a single resource.
 */
export function zSingleResourceResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: itemSchema,
    warnings: z.array(WarningSchema).optional(),
  });
}

/**
 * Creates a standard response schema for a collection of resources (page-based).
 */
export function zCollectionResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    pagination: PaginationSchema,
    warnings: z.array(WarningSchema).optional(),
  });
}

/**
 * Creates a standard response schema for a collection of resources (cursor-based).
 */
export function zCursorCollectionResponse<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return z.object({
    data: z.array(itemSchema),
    pagination: CursorPaginationSchema,
    warnings: z.array(WarningSchema).optional(),
  });
}

// ============================================================================
// ASYNC JOBS
// ============================================================================

export const AsyncJobResponseSchema = z.object({
  jobId: z.string().describe("Unique job identifier"),
  status: z
    .enum(["pending", "processing", "completed", "failed"])
    .describe("Current job status"),
  statusUrl: z.string().url().describe("URL to check job status"),
  estimatedCompletion: z
    .string()
    .datetime()
    .optional()
    .describe("Estimated completion time"),
  meta: ResponseMetaSchema,
});

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

export const BatchSummarySchema = z.object({
  total: z.number().int(),
  successful: z.number().int(),
  failed: z.number().int(),
  skipped: z.number().int(),
});

export function zBatchResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    results: z.array(
      z.object({
        index: z.number().int(),
        status: z.enum(["success", "error", "skipped"]),
        data: itemSchema.optional(),
        error: z
          .object({
            code: z.string(),
            message: z.string(),
          })
          .optional(),
        input: z.record(z.string(), z.unknown()).optional(),
      })
    ),
    summary: BatchSummarySchema,
  });
}

// ============================================================================
// ERROR ENVELOPES
// ============================================================================

export const ErrorCode = {
  validationError: "validationError",
  notFound: "notFound",
  unauthorized: "unauthorized",
  forbidden: "forbidden",
  conflict: "conflict",
  duplicate: "duplicate",
  unprocessableEntity: "unprocessableEntity",
  rateLimitExceeded: "rateLimitExceeded",
  internalError: "internalError",
  badRequest: "badRequest",
  tenantNotFound: "tenantNotFound",
  missingTenant: "missingTenant",
  fileTooLarge: "fileTooLarge",
  invalidFileType: "invalidFileType",
  virusDetected: "virusDetected",
  uploadNotFound: "uploadNotFound",
  storageQuotaExceeded: "storageQuotaExceeded",
  tokenExpired: "tokenExpired",
  tokenInvalid: "tokenInvalid",
  tokenRevoked: "tokenRevoked",
  missingToken: "missingToken",
  insufficientPermissions: "insufficientPermissions",
  notAMember: "notAMember",
  tenantMismatch: "tenantMismatch",
  roleInUse: "roleInUse",
  systemRoleImmutable: "systemRoleImmutable",
  jobNotFound: "jobNotFound",
  jobNotCancellable: "jobNotCancellable",
  webhookNotFound: "webhookNotFound",
  webhookDeliveryFailed: "webhookDeliveryFailed",
  webhookUrlInsecure: "webhookUrlInsecure",
  webhookInvalidEventType: "webhookInvalidEventType",
  serviceUnavailable: "serviceUnavailable",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const ErrorDetailSchema = z.object({
  field: z.string().describe("The field that caused the error"),
  code: z.string().describe("Specific error code for this detail"),
  message: z.string().describe("Human-readable error message"),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Additional metadata about the error"),
});

export const ErrorSchema = z.object({
  code: z.string().describe("Machine-readable error code"),
  message: z.string().describe("Human-readable error message"),
  details: z
    .array(ErrorDetailSchema)
    .optional()
    .describe("Array of detailed error information"),
  requestId: z.string().describe("Request ID for tracking and debugging"),
  documentationUrl: z
    .string()
    .url()
    .optional()
    .describe("URL to documentation about this error"),
});

export const ErrorResponseSchema = z.object({
  error: ErrorSchema,
});
