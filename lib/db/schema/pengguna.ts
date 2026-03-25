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
    password: varchar("PASSWORD", { length: 255 }).notNull(),
    hakAkses: varchar("HAK_AKSES", { length: 20 }).notNull(),
    nip: varchar("NIP", { length: 30 }),
    nama: varchar("NAMA", { length: 200 }),
    jabatan: varchar("JABATAN", { length: 200 }),
    penanggungJawabCetak: tinyint("PENANGGUNG_JAWAB_CETAK").notNull().default(0),
    tandaTangan: longblob("TANDA_TANGAN"),
    statusAktif: tinyint("STATUS_AKTIF").notNull().default(1),
    lastLogin: datetime("LAST_LOGIN"),
    failedAttempts: tinyint("FAILED_ATTEMPTS").notNull().default(0),
    lockedUntil: datetime("LOCKED_UNTIL"),
    createdAt: datetime("CREATED_AT").notNull().default(sql`CURRENT_TIMESTAMP`),
    // Bridge to Better Auth — null for legacy imports
    userId: varchar("USER_ID", { length: 36 }).references(() => user.id),
  },
  (table) => [uniqueIndex("uk_username").on(table.username)],
);

// ─── group_akses ──────────────────────────────────────────────────

export const groupAkses = mysqlTable(
  "group_akses",
  {
    hakAkses: varchar("HAK_AKSES", { length: 20 }).notNull(),
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
