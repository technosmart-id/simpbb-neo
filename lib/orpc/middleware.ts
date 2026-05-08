/**
 * ORPC Authorization Middleware
 *
 * Provides authorization middleware for ORPC routes using Casbin.
 * Integrates with Better Auth sessions for user and organization context.
 */

import { AuthorizationError, getAuthorizationService } from "@/lib/services/authorization"

import { Context } from "./base"

// oRPC middleware signature - next is a function that takes optional input
type MiddlewareNext = (input?: unknown) => Promise<unknown>

type MiddlewareFn = (opts: { context: Context; input?: unknown }, next: MiddlewareNext) => Promise<unknown>

/**
 * Authorization options for middleware
 */
export interface AuthzOptions {
  /** Resource type (e.g., "books", "files") */
  resource: string
  /** Action type (e.g., "create", "read", "update", "delete") */
  action: string
  /** Whether organization context is required */
  requireOrg?: boolean
  /** Whether to check resource ownership in addition to role permissions */
  checkOwnership?: boolean
  /** Custom function to extract resource ID from input */
  resourceIdExtractor?: (input: unknown) => string | number | undefined
}

// Removed redundant AuthzContext in favor of base.ts Context

/**
 * Create authorization middleware for ORPC routes
 *
 * @example
 * ```ts
 * books: os.router({
 *   list: os
 *     .use(withAuth({ resource: "books", action: "read", requireOrg: true }))
 *     .handler(async ({ input, context }) => {
 *       // context.organizationId is guaranteed to be set here
 *       return { books: [] };
 *     }),
 * })
 * ```
 */
export function withAuth(options: AuthzOptions): MiddlewareFn {
  return async (opts, next) => {
    const { resource, action, requireOrg = false } = options

    // 1. Check authentication
    if (!opts.context?.session?.user) {
      throw new AuthorizationError("Authentication required")
    }

    const userId = opts.context.session.user.id
    const organizationId = opts.context.session.session.activeOrganizationId

    // 2. Check organization context (only if requireOrg is true)
    if (requireOrg && !organizationId) {
      throw new AuthorizationError("Organization context required. Please select an organization.")
    }

    const orgId = organizationId || null

    // 3. Check authorization via Casbin
    const authService = getAuthorizationService()
    const allowed = await authService.can({
      userId,
      action,
      resource,
      organizationId: orgId,
    })

    if (!allowed) {
      const extraInfo = requireOrg
        ? ` in this organization`
        : organizationId
          ? ""
          : " (no organization selected)"
      throw new AuthorizationError(
        `You don't have permission to ${action} ${resource}${extraInfo}`,
      )
    }

    // 4. Add authorization metadata to context
    const userRoles = orgId
      ? await authService.getUserRoles(userId, orgId)
      : [{ id: "global", roleId: "global", roleType: "system", name: "Global" }]
    
    opts.context.organizationId = orgId ?? undefined
    opts.context.userRoles = userRoles

    return next()
  }
}

/**
 * Middleware that only checks authentication (no authorization)
 */
export function withSession(): MiddlewareFn {
  return async (opts, next) => {
    if (!opts.context?.session?.user) {
      throw new AuthorizationError("Authentication required")
    }
    return next()
  }
}

/**
 * Middleware for admin-only routes
 * @param requireOrg - Whether organization context is required (default: false for system admin routes)
 */
export function withAdmin(requireOrg = false): MiddlewareFn {
  return async (opts, next) => {
    if (!opts.context?.session?.user) {
      throw new AuthorizationError("Authentication required")
    }

    // For system-level admin routes (no org required), just check authentication
    // You can add additional system admin checks here if needed
    if (!requireOrg) {
      return next()
    }

    const organizationId = opts.context.session.session.activeOrganizationId
    if (!organizationId) {
      throw new AuthorizationError("Organization context required")
    }

    const authService = getAuthorizationService()
    const userRoles = await authService.getUserRoles(
      opts.context.session.user.id,
      organizationId,
    )

    const isAdmin = userRoles.some((r) => {
      const roleId = typeof r === "string" ? r : r.roleId
      return roleId === "owner" || roleId === "admin"
    })

    if (!isAdmin) {
      throw new AuthorizationError("Admin access required")
    }
    
    opts.context.organizationId = organizationId
    opts.context.userRoles = userRoles

    return next()
  }
}

/**
 * Helper to extract book ID from input
 */
export function extractBookId(input: unknown): string | number | undefined {
  if (typeof input === "object" && input !== null) {
    if ("id" in input) return input.id as string | number
  }
  return undefined
}

/**
 * Helper to extract file ID from input
 */
export function extractFileId(input: unknown): string | number | undefined {
  if (typeof input === "object" && input !== null) {
    if ("id" in input) return input.id as string | number
    if ("fileId" in input) return input.fileId as string | number
  }
  return undefined
}
