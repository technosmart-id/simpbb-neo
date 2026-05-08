import { mysqlTable, char, varchar, primaryKey, foreignKey } from "drizzle-orm/mysql-core";

export const lookupGroup = mysqlTable("lookup_group", {
  kdLookupGroup: char("KD_LOOKUP_GROUP", { length: 2 }).primaryKey(),
  nmLookupGroup: varchar("NM_LOOKUP_GROUP", { length: 50 }),
});

export const lookupItem = mysqlTable(
  "lookup_item",
  {
    kdLookupGroup: char("KD_LOOKUP_GROUP", { length: 2 }).notNull(),
    kdLookupItem: char("KD_LOOKUP_ITEM", { length: 1 }).notNull(),
    nmLookupItem: varchar("NM_LOOKUP_ITEM", { length: 225 }),
  },
  (table) => [
    primaryKey({
      name: "pk_lookup_item",
      columns: [table.kdLookupGroup, table.kdLookupItem],
    }),
    foreignKey({
      name: "fk_lookup_item_group",
      columns: [table.kdLookupGroup],
      foreignColumns: [lookupGroup.kdLookupGroup],
    }),
  ],
);
