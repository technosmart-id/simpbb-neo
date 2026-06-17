import {
  mysqlTable,
  varchar,
  char,
  int,
  tinyint,
  primaryKey,
} from "drizzle-orm/mysql-core";
import { longblob } from "./_columns";

// ─── login ─────────────────────────────────────────────────
export const pbbUserProfile = mysqlTable("login", {
  id: int("ID").notNull().primaryKey().autoincrement(),
  username: varchar("USERNAME", { length: 20 }).notNull(),
  password: char("PASSWORD", { length: 32 }).notNull().default("d41d8cd98f00b204e9800998ecf8427e"),
  hakAkses: varchar("HAK_AKSES", { length: 20 }).notNull(),
  nip: varchar("NIP", { length: 30 }).default("-"),
  nama: varchar("NAMA", { length: 200 }).default("-"),
  jabatan: varchar("JABATAN", { length: 200 }).default("-"),
  penanggungJawabCetak: tinyint("PENANGGUNG_JAWAB_CETAK").default(1),
  tandaTangan: longblob("TANDA_TANGAN"),
  userId: varchar("USER_ID", { length: 36 }),
}, (table) => [
]);

// ─── group_akses ─────────────────────────────────────────────────
export const groupAkses = mysqlTable("group_akses", {
  hakAkses: varchar("HAK_AKSES", { length: 30 }).notNull(),
  akses: varchar("AKSES", { length: 50 }).notNull(),
}, (table) => [
  primaryKey({ name: "pk_group_akses", columns: [table.hakAkses, table.akses] }),
]);

// ─── akses ─────────────────────────────────────────────────
export const akses = mysqlTable("akses", {
  akses: varchar("AKSES", { length: 50 }).notNull().primaryKey(),
  aktif: tinyint("AKTIF").default(0),
}, (table) => [
]);
