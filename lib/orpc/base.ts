import { os as osBase } from "@orpc/server"
import { AuthorizationError, getAuthorizationService } from "@/lib/services/authorization"

export type Context = {
	session: {
		session: {
			id: string
			userId: string
			activeOrganizationId?: string | null
		}
		user: {
			id: string
			name: string
			email: string
		}
	} | null
	organizationId?: string
	userRoles?: any[]
}

export function requireSession(context: Context) {
	if (!context.session?.user) {
		throw new AuthorizationError("Authentication required")
	}
	return context.session as { 
    session: { id: string; userId: string; activeOrganizationId?: string | null }; 
    user: { id: string; name: string; email: string } 
  }
}

export async function requireAuth(
	context: Context,
	options: { resource: string; action: string; requireOrg?: boolean }
) {
	const session = requireSession(context)
	const userId = session.user.id
	const organizationId = session.session.activeOrganizationId

	if (options.requireOrg && !organizationId) {
		throw new AuthorizationError("Organization context required. Please select an organization.")
	}

	const authService = getAuthorizationService()
	const allowed = await authService.can({
		userId,
		action: options.action,
		resource: options.resource,
		organizationId: organizationId || null,
	})

	if (!allowed) {
		const extraInfo = options.requireOrg
			? ` in this organization`
			: organizationId
				? ""
				: " (no organization selected)"
		throw new AuthorizationError(
			`You don't have permission to ${options.action} ${options.resource}${extraInfo}`
		)
	}

	const orgId = organizationId || null
	const userRoles = orgId
		? await authService.getUserRoles(userId, orgId)
		: ["global"]

	return { session, organizationId: orgId, userRoles }
}

export function requireAdmin(context: Context, requireOrg = false) {
	const session = requireSession(context)

	if (!requireOrg) {
		return { session }
	}

	const organizationId = session.session.activeOrganizationId
	if (!organizationId) {
		throw new AuthorizationError("Organization context required")
	}

	return { session, organizationId }
}

export const os = osBase.$context<Context>()
