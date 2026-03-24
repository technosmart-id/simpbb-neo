/**
 * Member Roles Junction Schema
 *
 * This table implements many-to-many relationship between members and roles.
 * A member can have multiple roles (both system roles like owner/user and custom roles).
 *
 * System roles: owner, user (role_id = 'owner' | 'user', role_type = 'system')
 * Custom roles: references org_roles.id (role_type = 'custom')
 */

import { relations } from "drizzle-orm";
import {
	mysqlTable,
	varchar,
	timestamp,
	index,
	unique,
} from "drizzle-orm/mysql-core";
import { member } from "./auth";
import { user } from "./auth";

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
	createdAt: timestamp("created_at").defaultNow().notNull(),
	createdBy: varchar("created_by", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
}, (table) => [
	// Ensure a member can't have the same role + type combination twice
	index("member_roles_member_id_idx").on(table.memberId),
	index("member_roles_role_id_idx").on(table.roleId),
	unique("unique_member_role").on(table.memberId, table.roleId, table.roleType),
]);

export const memberRolesRelations = relations(memberRoles, ({ one }) => ({
	member: one(member, {
		fields: [memberRoles.memberId],
		references: [member.id],
	}),
}));

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
