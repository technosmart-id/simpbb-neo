import { mysqlTable, varchar, boolean, timestamp, index } from "drizzle-orm/mysql-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    
    // Delivery Channels
    inAppEnabled: boolean("in_app_enabled").default(true).notNull(),
    toastsEnabled: boolean("toasts_enabled").default(true).notNull(),
    
    // Notification Types
    successEnabled: boolean("success_enabled").default(true).notNull(),
    warningEnabled: boolean("warning_enabled").default(true).notNull(),
    errorEnabled: boolean("error_enabled").default(true).notNull(),
    infoEnabled: boolean("info_enabled").default(true).notNull(),
    
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("notification_preferences_userId_idx").on(table.userId),
  ]
);

export const notificationPreferenceRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(user, {
    fields: [notificationPreferences.userId],
    references: [user.id],
  }),
}));
