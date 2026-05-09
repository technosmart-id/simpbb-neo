import {
  mysqlTable,
  varchar,
  int,
  tinyint,
  datetime,
  primaryKey,
  uniqueIndex,
  foreignKey,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { longblob } from "./_columns";
import { user } from "./auth";

// ─── akses ────────────────────────────────────────────────────────

export const akses = mysqlTable("akses", {
  akses: varchar("AKSES", { length: 50 }).primaryKey(),
  aktif: tinyint("AKTIF").notNull().default(1),
});

// ─── login → exported as pbbUserProfile ───────────────────────────
// Table name stays "login" for legacy data compatibility.
// USER_ID is the bridge to Better Auth's user table.

export const pbbUserProfile = mysqlTable(
  "login",
  {
    id: int("ID").autoincrement().primaryKey(),
    username: varchar("USERNAME", { length: 20 }).notNull(),
    password: varchar("PASSWORD", { length: 255 }).notNull().default("d41d8cd98f00b204e9800998ecf8427e"),
    hakAkses: varchar("HAK_AKSES", { length: 30 }).notNull(),
    nip: varchar("NIP", { length: 30 }).default("-"),
    nama: varchar("NAMA", { length: 200 }).default("-"),
    jabatan: varchar("JABATAN", { length: 200 }).default("-"),
    penanggungJawabCetak: tinyint("PENANGGUNG_JAWAB_CETAK").default(1),
    tandaTangan: longblob("TANDA_TANGAN"),
    // Bridge to Better Auth — null for legacy imports
    userId: varchar("USER_ID", { length: 36 }).references(() => user.id),
  },
  (table) => [uniqueIndex("uk_username").on(table.username)],
);

// ─── group_akses ──────────────────────────────────────────────────

export const groupAkses = mysqlTable(
  "group_akses",
  {
    hakAkses: varchar("HAK_AKSES", { length: 30 }).notNull(),
    akses: varchar("AKSES", { length: 50 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.hakAkses, table.akses] }),
    foreignKey({
      name: "fk_group_akses_akses",
      columns: [table.akses],
      foreignColumns: [akses.akses],
    }),
  ],
);
