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

import { mysqlTable, varchar, text, timestamp, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { organization } from "./auth";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
