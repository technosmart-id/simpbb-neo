import { mysqlTable, varchar, text, datetime, boolean, index } from "drizzle-orm/mysql-core";
import { user } from "./auth";
import { relations, sql } from "drizzle-orm";

export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    type: varchar("type", { length: 50 }).default("info").notNull(), // info, success, warning, error
    link: text("link"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => [
    index("notifications_userId_idx").on(table.userId),
    index("notifications_createdAt_idx").on(table.createdAt),
  ]
);

export const notificationRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));
