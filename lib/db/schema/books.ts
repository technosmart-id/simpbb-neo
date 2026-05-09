import { mysqlTable, varchar, datetime, serial, json, text, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { organization } from "./auth";

export const books = mysqlTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  publishedAt: datetime("published_at"),

  // Ownership & Multi-tenancy
  organizationId: varchar("organization_id", { length: 36 })
    .references(() => organization.id, { onDelete: "cascade" }),
  createdById: varchar("created_by_id", { length: 36 }),

  // Single Uploads
  coverImage: varchar("cover_image", { length: 512 }),
  attachmentFile: varchar("attachment_file", { length: 512 }),

  // Multiple Uploads (using JSON for storage)
  galleryImages: json("gallery_images").$type<string[]>(),
  additionalDocuments: json("additional_documents").$type<string[]>(),

  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdate(() => new Date()).notNull(),
}, (table) => [
  index("books_organization_id_idx").on(table.organizationId),
  index("books_created_by_id_idx").on(table.createdById),
]);

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
