/**
 * Authorization Schema
 *
 * Consolidated authorization and access control tables:
 * - Casbin policy storage (casbin_rule)
 * - Member roles junction (member_roles)
 * - Organization custom roles (org_roles)
 * - Resource ownership for ABAC (resource_ownership)
 */

import { sql } from "drizzle-orm";
import {
	mysqlTable,
	varchar,
	text,
	datetime,
	boolean,
	index,
	unique,
	uniqueIndex,
} from "drizzle-orm/mysql-core";
import { member } from "./auth";
import { user } from "./auth";
import { organization } from "./auth";

// ============================================================================
// CASBIN POLICY STORAGE
// ============================================================================

/**
 * Casbin policy storage table
 *
 * This table stores Casbin policies in a generic format:
 * - ptype: Policy type (p for policy, g for grouping/role assignment)
 * - v0: Subject (user ID or role name)
 * - v1: Resource (object being accessed)
 * - v2: Action (create, read, update, delete, *)
 * - v3: Domain (organization ID)
 * - v4: Effect (allow, deny)
 * - v5: Additional data for future use
 *
 * Policy examples:
 * - p, owner, *, *, org123, allow       (owners can do anything in org123)
 * - p, admin, books, *, org123, allow   (admins can do any book operation in org123)
 * - p, member, books, read, org123, allow (members can read books in org123)
 * - g, user123, admin, org123           (user123 has admin role in org123)
 */
export const casbinRule = mysqlTable("casbin_rule", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	ptype: varchar("ptype", { length: 255 }).notNull(),
	v0: varchar("v0", { length: 255 }), // subject
	v1: varchar("v1", { length: 255 }), // resource
	v2: varchar("v2", { length: 255 }), // action
	v3: varchar("v3", { length: 255 }), // domain (orgId)
	v4: varchar("v4", { length: 255 }), // effect
	v5: text("v5"), // additional
});

export type CasbinRule = typeof casbinRule.$inferSelect;
export type NewCasbinRule = typeof casbinRule.$inferInsert;

// ============================================================================
// MEMBER ROLES JUNCTION
// ============================================================================

/**
 * Member Roles Junction Schema
 *
 * This table implements many-to-many relationship between members and roles.
 * A member can have multiple roles (both system roles like owner/user and custom roles).
 *
 * System roles: owner, user (role_id = 'owner' | 'user', role_type = 'system')
 * Custom roles: references org_roles.id (role_type = 'custom')
 */
export const memberRoles = mysqlTable("member_roles", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	memberId: varchar("member_id", { length: 36 })
		.notNull()
		.references(() => member.id, { onDelete: "cascade" }),
	/**
	 * For system roles: 'owner' or 'user'
	 * For custom roles: UUID from org_roles table
	 */
	roleId: varchar("role_id", { length: 36 }).notNull(),
	/**
	 * 'system' for owner/user roles
	 * 'custom' for roles from org_roles table
	 */
	roleType: varchar("role_type", { length: 20 })
		.notNull()
		.$type<"system" | "custom">(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdBy: varchar("created_by", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
}, (table) => [
	// Ensure a member can't have the same role + type combination twice
	index("member_roles_member_id_idx").on(table.memberId),
	index("member_roles_role_id_idx").on(table.roleId),
	unique("unique_member_role").on(table.memberId, table.roleId, table.roleType),
]);

export type MemberRole = typeof memberRoles.$inferSelect;
export type NewMemberRole = typeof memberRoles.$inferInsert;

/**
 * Role assignment data structure
 */
export interface RoleAssignment {
	roleId: string;
	roleType: "system" | "custom";
}

/**
 * Enriched member role with metadata
 */
export interface EnrichedMemberRole extends RoleAssignment {
	id: string;
	memberId: string;
	createdAt: Date;
	createdBy: string;
	// For custom roles - populated via join
	customRoleName?: string;
	customRoleSlug?: string;
}

// ============================================================================
// ORGANIZATION ROLES
// ============================================================================

/**
 * Organization Roles Schema
 *
 * Custom roles defined at the organization level.
 * Each organization can create unlimited custom roles.
 *
 * Permissions are stored in Casbin (casbin_rule table), NOT here.
 * This table only stores metadata: name, description, slug, etc.
 *
 * System roles (owner, user) are NOT stored here - they're hardcoded.
 */
export const orgRoles = mysqlTable("org_roles", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	organizationId: varchar("organization_id", { length: 36 })
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	name: varchar("name", { length: 100 }).notNull(),
	slug: varchar("slug", { length: 100 }).notNull(),
	description: text("description"),
	isDefaultRole: boolean("is_default_role").notNull().default(false),
	// Permissions are now stored in Casbin, not here!
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	createdBy: varchar("created_by", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
}, (table) => [
	index("org_roles_org_idx").on(table.organizationId),
	index("org_roles_created_by_idx").on(table.createdBy),
	uniqueIndex("org_roles_org_slug_idx").on(table.organizationId, table.slug),
]);

export type OrgRole = typeof orgRoles.$inferSelect;
export type NewOrgRole = typeof orgRoles.$inferInsert;

/**
 * Permission structure for CRUD-based permissions
 * This is still used for type safety and UI, but stored in Casbin
 */
export interface CrudPermissions {
	[key: string]: {
		create?: boolean;
		read?: boolean;
		update?: boolean;
		delete?: boolean;
	};
}

// ============================================================================
// RESOURCE OWNERSHIP (ABAC)
// ============================================================================

/**
 * Resource Ownership Schema
 *
 * Generic resource ownership tracking for ABAC (Attribute-Based Access Control).
 * This table tracks ownership of any resource type for fine-grained access control.
 *
 * For resources with built-in ownership columns (like books.createdById),
 * use those directly. This table is for resources that don't have built-in
 * ownership tracking or for additional ownership relationships.
 */
export const resourceOwnership = mysqlTable("resource_ownership", {
	id: varchar("id", { length: 36 })
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	resourceType: varchar("resource_type", { length: 100 }).notNull(),
	resourceId: varchar("resource_id", { length: 36 }).notNull(),
	ownerId: varchar("owner_id", { length: 36 }).notNull(),
	organizationId: varchar("organization_id", { length: 36 })
		.notNull()
		.references(() => organization.id, { onDelete: "cascade" }),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("resource_ownership_resource_idx").on(table.resourceType, table.resourceId),
	index("resource_ownership_owner_idx").on(table.ownerId),
	index("resource_ownership_org_idx").on(table.organizationId),
	uniqueIndex("resource_ownership_unique_idx").on(
		table.resourceType,
		table.resourceId,
		table.ownerId,
	),
]);

export type ResourceOwnership = typeof resourceOwnership.$inferSelect;
export type NewResourceOwnership = typeof resourceOwnership.$inferInsert;
