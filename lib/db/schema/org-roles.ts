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

import { mysqlTable, varchar, text, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { organization } from "./auth";
import { user } from "./auth";

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
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
