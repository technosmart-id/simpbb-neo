import { os as osBase } from "@orpc/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { books, notifications, notificationPreferences, member, organization, session, user, orgRoles } from "@/lib/db/schema"
import { eq, desc, asc, sql, like, or, and, inArray } from "drizzle-orm"
import { auth } from "@/lib/auth"

import { createNotification } from "@/lib/services/notifications"
import { StorageService } from "@/lib/services/storage"
import {
	performBackup,
	listBackups,
	generateBackupFilename,
} from "@/lib/services/backup"
import { initializeOrgPolicies, getAuthorizationService } from "@/lib/services/authorization"
import { AuthorizationError } from "@/lib/services/authorization"
import * as fs from "fs/promises"
import * as path from "path"

// Helper functions for inline auth checks (replacing broken middleware pattern)

type Context = {
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
	userRoles?: string[]
}

function requireSession(context: Context) {
	if (!context.session?.user) {
		throw new AuthorizationError("Authentication required")
	}
	return context.session as { session: { id: string; userId: string; activeOrganizationId?: string | null }; user: { id: string; name: string; email: string } }
}

async function requireAuth(
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

function requireAdmin(context: Context, requireOrg = false) {
	const session = requireSession(context)

	if (!requireOrg) {
		return { session }
	}

	const organizationId = session.session.activeOrganizationId
	if (!organizationId) {
		throw new AuthorizationError("Organization context required")
	}

	// For now, just having an active org is sufficient for system-level admin routes
	// You can add additional role checks here if needed
	return { session, organizationId }
}

export const os = osBase.$context<{
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
  userRoles?: string[]
}>()

export const router = os.router({
  hello: os
    .input(z.object({ name: z.string().optional() }))
    .handler(async ({ input }) => {
      return {
        message: `Hello ${input.name ?? 'Ariefan'}! oRPC v1.x is officially alive.`,
      }
    }),

  // Organizations router
  organizations: os.router({
    list: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          throw new Error("Authentication required")
        }
        const userId = context.session.user.id

        // Get all organizations the user is a member of with a join
        const userOrgs = await db
          .select({
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            logo: organization.logo,
            autoJoin: organization.autoJoin,
            role: member.role,
          })
          .from(member)
          .innerJoin(organization, eq(member.organizationId, organization.id))
          .where(eq(member.userId, userId))

        return {
          organizations: userOrgs,
          activeOrganizationId: context.session?.session?.activeOrganizationId ?? null,
        }
      }),

    setActive: os
      .input(z.object({ organizationId: z.string() }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Authentication required")
        }
        const userId = context.session.user.id

        // Verify user is a member of this org
        const [membership] = await db
          .select()
          .from(member)
          .where(
            and(
              eq(member.organizationId, input.organizationId),
              eq(member.userId, userId),
            ),
          )
          .limit(1)

        if (!membership) {
          throw new Error("You are not a member of this organization")
        }

        // Update the session's active organization
        await db
          .update(session)
          .set({ activeOrganizationId: input.organizationId })
          .where(eq(session.userId, userId))

        return { success: true, organizationId: input.organizationId }
      }),

    clearActive: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          throw new Error("Authentication required")
        }
        const userId = context.session.user.id

        await db
          .update(session)
          .set({ activeOrganizationId: null })
          .where(eq(session.userId, userId))

        return { success: true }
      }),

    // List members of an organization
    listMembers: os
      .input(z.object({ organizationId: z.string() }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Authentication required")
        }

        // Verify user is a member of this org
        const [membership] = await db
          .select()
          .from(member)
          .where(
            and(
              eq(member.organizationId, input.organizationId),
              eq(member.userId, context.session.user.id),
            ),
          )
          .limit(1)

        if (!membership) {
          throw new Error("You are not a member of this organization")
        }

        // Get all members with user info
        const orgMembers = await db
          .select({
            id: member.id,
            role: member.role,
            userId: member.userId,
            userName: user.name,
            userEmail: user.email,
            globalRole: user.role,
          })
          .from(member)
          .innerJoin(user, eq(member.userId, user.id))
          .where(eq(member.organizationId, input.organizationId))
          
        const { getMemberRoles } = await import('@/lib/services/role-assignment')

        return await Promise.all(orgMembers.map(async (m) => {
          const organizationRoles = await getMemberRoles(m.id)
          return {
            id: m.id,
            role: m.role, // Kept for backwards compatibility
            globalRole: m.globalRole || "user",
            user: {
              name: m.userName,
              email: m.userEmail,
            },
            organizationRoles,
          }
        }))
      }),

    // List all available custom roles in an organization
    listAvailableRoles: os
      .input(z.object({ organizationId: z.string() }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) throw new Error("Authentication required")
        const roles = await db.select().from(orgRoles).where(eq(orgRoles.organizationId, input.organizationId))
        return roles
      }),

    // Manage a member's multiple organization roles
    manageMemberRoles: os
      .input(z.object({
        organizationId: z.string(),
        memberId: z.string(),
        roles: z.array(z.object({
          roleId: z.string(),
          roleType: z.enum(["system", "custom"])
        }))
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) throw new Error("Authentication required")
        
        // Verify user is an owner
        const [membership] = await db.select().from(member)
          .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, context.session.user.id)))
          .limit(1)

        if (!membership || membership.role !== "owner") {
          throw new Error("Only owners can modify roles")
        }

        // Identify the highest structural system role to sync back to the base member table
        const systemRoles = input.roles.filter(r => r.roleType === "system").map(r => r.roleId)
        const highestSystemRole = systemRoles.includes("owner") ? "owner" : systemRoles.includes("admin") ? "admin" : "member"
        
        // Synchronize structural role back to member table for Better Auth compatibility
        await db.update(member).set({ role: highestSystemRole }).where(eq(member.id, input.memberId))

        const { setMemberRoles } = await import('@/lib/services/role-assignment')
        await setMemberRoles({
           memberId: input.memberId,
           roles: input.roles,
           assignedBy: context.session.user.id
        })
        
        return { success: true }
      }),

    // Add a member to the organization
    addMember: os
      .input(z.object({
        organizationId: z.string(),
        email: z.string().email(),
        role: z.enum(["member", "admin", "owner"]).default("member"),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Authentication required")
        }

        // Verify user is a member of this org
        const [membership] = await db
          .select()
          .from(member)
          .where(
            and(
              eq(member.organizationId, input.organizationId),
              eq(member.userId, context.session.user.id),
            ),
          )
          .limit(1)

        if (!membership || membership.role !== "owner") {
          throw new Error("Only owners can add members")
        }

        // Find the user by email
        const [targetUser] = await db
          .select()
          .from(user)
          .where(eq(user.email, input.email))
          .limit(1)

        if (!targetUser) {
          throw new Error("User not found")
        }

        // Check if already a member
        const [existing] = await db
          .select()
          .from(member)
          .where(
            and(
              eq(member.organizationId, input.organizationId),
              eq(member.userId, targetUser.id),
            ),
          )
          .limit(1)

        if (existing) {
          throw new Error("User is already a member")
        }

        // Add the member
        await db.insert(member).values({
          id: crypto.randomUUID(),
          organizationId: input.organizationId,
          userId: targetUser.id,
          role: input.role,
          createdAt: new Date(),
        })

        return { success: true }
      }),

    // Remove a member from the organization
    removeMember: os
      .input(z.object({
        organizationId: z.string(),
        memberId: z.string(),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Authentication required")
        }

        // Get the member to remove
        const [targetMember] = await db
          .select()
          .from(member)
          .where(eq(member.id, input.memberId))
          .limit(1)

        if (!targetMember) {
          throw new Error("Member not found")
        }

        // Check if user is an owner
        const [requesterMembership] = await db
          .select()
          .from(member)
          .where(
            and(
              eq(member.organizationId, input.organizationId),
              eq(member.userId, context.session.user.id),
            ),
          )
          .limit(1)

        if (!requesterMembership || requesterMembership.role !== "owner") {
          throw new Error("Only owners can remove members")
        }

        // Can't remove yourself
        if (targetMember.userId === context.session.user.id) {
          throw new Error("You cannot remove yourself")
        }

        await db.delete(member).where(eq(member.id, input.memberId))

        return { success: true }
      }),

    // Update member role
    updateMemberRole: os
      .input(z.object({
        organizationId: z.string(),
        memberId: z.string(),
        role: z.enum(["member", "admin", "owner"]),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Authentication required")
        }

        // Get the member to update
        const [targetMember] = await db
          .select()
          .from(member)
          .where(eq(member.id, input.memberId))
          .limit(1)

        if (!targetMember) {
          throw new Error("Member not found")
        }

        // Check if user is an owner
        const [requesterMembership] = await db
          .select()
          .from(member)
          .where(
            and(
              eq(member.organizationId, input.organizationId),
              eq(member.userId, context.session.user.id),
            ),
          )
          .limit(1)

        if (!requesterMembership || requesterMembership.role !== "owner") {
          throw new Error("Only owners can update roles")
        }

        await db
          .update(member)
          .set({ role: input.role })
          .where(eq(member.id, input.memberId))

        return { success: true }
      }),

    // Update organization settings
    updateSettings: os
      .input(z.object({
        organizationId: z.string(),
        autoJoin: z.boolean().optional(),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) throw new Error("Authentication required")
        
        // Verify user is an owner
        const [membership] = await db.select().from(member)
          .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, context.session.user.id)))
          .limit(1)

        if (!membership || membership.role !== "owner") {
          throw new Error("Only owners can update organization settings")
        }

        const updateData: any = {}
        if (input.autoJoin !== undefined) updateData.autoJoin = input.autoJoin

        await db.update(organization).set(updateData).where(eq(organization.id, input.organizationId))

        return { success: true }
      }),
  }),

  // Initialize authorization for an organization (called when org is created)
  initializeOrgAuth: os
    .input(z.object({ organizationId: z.string() }))
    .handler(async ({ input, context }) => {
      const sessionData = requireSession(context)
      const userId = sessionData.user.id

      // Verify user is a member of this org
      const [membership] = await db.select()
        .from(member)
        .where(
          and(
            eq(member.organizationId, input.organizationId),
            eq(member.userId, userId),
          ),
        )
        .limit(1)

      if (!membership) {
        throw new Error("You are not a member of this organization")
      }

      // Initialize default policies
      await initializeOrgPolicies(input.organizationId)

      return { success: true }
    }),

  notifications: os.router({
    list: os
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }))
      .handler(async ({ input, context }) => {
        const sessionData = requireSession(context)
        const userId = sessionData.user.id

        const rows = await db.select()
          .from(notifications)
          .where(eq(notifications.userId, userId))
          .orderBy(desc(notifications.createdAt))
          .limit(input.limit)
          .offset(input.offset)

        const [totalResult] = await db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(eq(notifications.userId, userId))

        return {
          rows,
          total: totalResult?.count ?? 0,
        }
      }),

    unreadCount: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          return { count: 0 }
        }

        const [result] = await db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(
            sql`${notifications.userId} = ${context.session.user.id} AND ${notifications.isRead} = false`
          )

        return { count: result?.count ?? 0 }
      }),

    markAsRead: os
      .input(z.object({ id: z.string().optional() })) // if empty, mark all as read
      .handler(async ({ input, context }) => {
        const sessionData = requireSession(context)
        const userId = sessionData.user.id

        if (input.id) {
          await db.update(notifications)
            .set({ isRead: true })
            .where(
              sql`${notifications.id} = ${input.id} AND ${notifications.userId} = ${userId}`
            )
        } else {
          await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId))
        }

        return { success: true }
      }),

    delete: os
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        const sessionData = requireSession(context)
        const userId = sessionData.user.id

        await db.delete(notifications)
          .where(
            sql`${notifications.id} = ${input.id} AND ${notifications.userId} = ${userId}`
          )

        return { success: true }
      }),

    test: os
      .handler(async ({ context }) => {
        const sessionData = requireSession(context)
        const userId = sessionData.user.id

        return await createNotification({
          userId,
          title: "Real-time Test Alert",
          message: "This successful test notification was triggered via oRPC! SSE is working beautifully using native Next.js 16 WebStreams.",
          type: "success",
        })
      }),

    getPreferences: os
      .handler(async ({ context }) => {
        const sessionData = requireSession(context)
        const userId = sessionData.user.id

        let [prefs] = await db.select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, userId))

        if (!prefs) {
          // Create default preferences
          const id = crypto.randomUUID()
          await db.insert(notificationPreferences).values({
            id,
            userId,
            inAppEnabled: true,
            toastsEnabled: true,
            successEnabled: true,
            warningEnabled: true,
            errorEnabled: true,
            infoEnabled: true,
          })

          const [newPrefs] = await db.select()
            .from(notificationPreferences)
            .where(eq(notificationPreferences.id, id))
          prefs = newPrefs
        }

        return prefs
      }),

    updatePreferences: os
      .input(z.object({
        inAppEnabled: z.boolean().optional(),
        toastsEnabled: z.boolean().optional(),
        successEnabled: z.boolean().optional(),
        warningEnabled: z.boolean().optional(),
        errorEnabled: z.boolean().optional(),
        infoEnabled: z.boolean().optional(),
      }))
      .handler(async ({ input, context }) => {
        const sessionData = requireSession(context)
        const userId = sessionData.user.id

        await db.update(notificationPreferences)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.userId, userId))

        return { success: true }
      }),
  }),

  books: os.router({
    list: os
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(10),
        offset: z.number().int().min(0).default(0),
        search: z.string().optional(),
        sortBy: z.enum(['id', 'title', 'author', 'publishedAt', 'createdAt']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }))
      .handler(async ({ input, context }) => {
        const { organizationId } = await requireAuth(context, { resource: "books", action: "read", requireOrg: true })

        const filters = input.search
          ? or(
              like(books.title, `%${input.search}%`),
              like(books.author, `%${input.search}%`)
            )
          : undefined

        // Always filter by organization
        const orgFilters = filters
          ? and(filters, eq(books.organizationId, organizationId!))
          : eq(books.organizationId, organizationId!)

        const [totalResult] = await db.select({ count: sql<number>`count(*)` })
          .from(books)
          .where(orgFilters)

        const orderBy = input.sortOrder === 'desc'
          ? desc(books[input.sortBy])
          : asc(books[input.sortBy])

        const rows = await db.select()
          .from(books)
          .where(orgFilters)
          .orderBy(orderBy)
          .limit(input.limit)
          .offset(input.offset)

        return {
          rows,
          total: totalResult?.count ?? 0,
        }
      }),

    get: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input, context }) => {
        const { organizationId } = await requireAuth(context, { resource: "books", action: "read", requireOrg: true })

        const [book] = await db.select()
          .from(books)
          .where(
            and(
              eq(books.id, input.id),
              eq(books.organizationId, organizationId!),
            ),
          )
        return book ?? null
      }),

    create: os
      .input(z.object({
        title: z.string().min(1),
        author: z.string().min(1),
        publishedAt: z.string().optional().nullable(),
        coverImage: z.string().optional().nullable(),
        attachmentFile: z.string().optional().nullable(),
        galleryImages: z.array(z.string()).optional().nullable(),
        additionalDocuments: z.array(z.string()).optional().nullable(),
      }))
      .handler(async ({ input, context }) => {
        const { session, organizationId } = await requireAuth(context, { resource: "books", action: "create", requireOrg: true })

        // Collect all temp paths to move
        const tempPaths = [
          input.coverImage,
          input.attachmentFile,
          ...(input.galleryImages ?? []),
          ...(input.additionalDocuments ?? []),
        ].filter((p): p is string => !!p && p.startsWith('temp/'))

        if (tempPaths.length > 0) {
          await StorageService.moveToUploads(tempPaths)
          await StorageService.cleanupTemp()
        }

        // Map paths to their final destination
        const mapPath = (p: string | null | undefined) =>
          p?.startsWith('temp/') ? p.replace('temp/', 'files/') : p

        const [result] = await db.insert(books).values({
          title: input.title,
          author: input.author,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
          coverImage: mapPath(input.coverImage),
          attachmentFile: mapPath(input.attachmentFile),
          galleryImages: (input.galleryImages?.map(mapPath).filter((p): p is string => !!p) ?? []),
          additionalDocuments: (input.additionalDocuments?.map(mapPath).filter((p): p is string => !!p) ?? []),
          organizationId: organizationId!,
          createdById: session.user.id,
        })
        return { id: (result as { insertId: number }).insertId }
      }),

    update: os
      .input(z.object({
        id: z.number(),
        title: z.string().min(1),
        author: z.string().min(1),
        publishedAt: z.string().optional().nullable(),
        coverImage: z.string().optional().nullable(),
        attachmentFile: z.string().optional().nullable(),
        galleryImages: z.array(z.string()).optional().nullable(),
        additionalDocuments: z.array(z.string()).optional().nullable(),
      }))
      .handler(async ({ input, context }) => {
        const { organizationId } = await requireAuth(context, { resource: "books", action: "update", requireOrg: true })

        // Verify the book belongs to the user's org
        const [book] = await db.select()
          .from(books)
          .where(
            and(
              eq(books.id, input.id),
              eq(books.organizationId, organizationId!),
            ),
          )
          .limit(1)

        if (!book) {
          throw new Error("Book not found")
        }

        // Collect all temp paths to move
        const tempPaths = [
          input.coverImage,
          input.attachmentFile,
          ...(input.galleryImages ?? []),
          ...(input.additionalDocuments ?? []),
        ].filter((p): p is string => !!p && p.startsWith('temp/'))

        if (tempPaths.length > 0) {
          await StorageService.moveToUploads(tempPaths)
          await StorageService.cleanupTemp()
        }

        // Map paths to their final destination
        const mapPath = (p: string | null | undefined) =>
          p?.startsWith('temp/') ? p.replace('temp/', 'files/') : p

        await db.update(books)
          .set({
            title: input.title,
            author: input.author,
            publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
            coverImage: mapPath(input.coverImage),
            attachmentFile: mapPath(input.attachmentFile),
            galleryImages: (input.galleryImages?.map(mapPath).filter((p): p is string => !!p) ?? []),
            additionalDocuments: (input.additionalDocuments?.map(mapPath).filter((p): p is string => !!p) ?? []),
            updatedAt: new Date(),
          })
          .where(eq(books.id, input.id))
        return { success: true }
      }),

    delete: os
      .input(z.object({ id: z.number() }))
      .handler(async ({ input, context }) => {
        const { organizationId } = await requireAuth(context, { resource: "books", action: "delete", requireOrg: true })

        // Verify the book belongs to the user's org
        const [book] = await db.select()
          .from(books)
          .where(
            and(
              eq(books.id, input.id),
              eq(books.organizationId, organizationId!),
            ),
          )
          .limit(1)

        if (!book) {
          throw new Error("Book not found")
        }

        await db.delete(books).where(eq(books.id, input.id))
        return { success: true }
      }),
  }),

  files: os.router({
    list: os
      .input(z.object({
        path: z.string().optional().default(""),
      }).optional())
      .handler(async ({ input }) => {
        console.log(`[ORPC] files.list: path="${input?.path}"`)
        return await StorageService.listFiles(input?.path ?? "")
      }),

    createFolder: os
      .input(z.object({
        parentPath: z.string(),
        name: z.string().min(1),
      }))
      .handler(async ({ input }) => {
        await StorageService.createFolder(input.parentPath, input.name)
        return { success: true }
      }),

    delete: os
      .input(z.object({
        path: z.string(),
      }))
      .handler(async ({ input }) => {
        await StorageService.deleteFile(input.path)
        return { success: true }
      }),

    stats: os
      .handler(async () => {
        return await StorageService.getStorageStats()
      }),

    submit: os
      .input(z.object({
        tempPaths: z.array(z.string()),
      }))
      .handler(async ({ input }) => {
        const movedPaths = await StorageService.moveToUploads(input.tempPaths)
        await StorageService.cleanupTemp()
        return { movedPaths }
      }),
  }),

  backups: os.router({
    getConfig: os
      .handler(async ({ context }) => {
        requireAdmin(context, false)

        return {
          enabled: process.env.BACKUP_ENABLED !== "false",
          retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || "30", 10),
          schedule: process.env.BACKUP_SCHEDULE || "0 2 * * *",
          runOnStart: process.env.BACKUP_RUN_ON_START === "true",
          backupDir: process.env.BACKUP_DIR || path.join(process.cwd(), "backups"),
        }
      }),

    list: os
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }))
      .handler(async ({ input, context }) => {
        requireAdmin(context, false)

        const allBackups = await listBackups()
        const total = allBackups.length
        const rows = allBackups.slice(input.offset, input.offset + input.limit)

        return {
          rows,
          total,
        }
      }),

    create: os
      .handler(async ({ context }) => {
        requireAdmin(context, false)

        const result = await performBackup({
          onProgress: () => {},
        })

        if (!result.success) {
          throw new Error(result.error ?? "Backup failed")
        }

        return {
          success: true,
          backupPath: result.backupPath,
          size: result.size,
          duration: result.duration,
        }
      }),

    delete: os
      .input(z.object({ filename: z.string() }))
      .handler(async ({ input, context }) => {
        requireAdmin(context, false)

        const backupDir = process.env.BACKUP_DIR || path.join(process.cwd(), "backups")
        const filePath = path.join(backupDir, input.filename)

        // Security check: ensure filename is just a filename, not a path
        if (input.filename.includes("..") || input.filename.includes("/") || input.filename.includes("\\")) {
          throw new Error("Invalid filename")
        }

        try {
          await fs.unlink(filePath)
        } catch (e) {
          throw new Error("Failed to delete backup")
        }

        return { success: true }
      }),
  }),
})

export type AppRouter = typeof router
