import { mysqlTable, varchar, text } from "drizzle-orm/mysql-core";

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
