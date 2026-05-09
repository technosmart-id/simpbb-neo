import {
  mysqlTable,
  varchar,
  char,
  int,
  tinyint,
  text,
  primaryKey,
} from "drizzle-orm/mysql-core";

// ─── login ─────────────────────────────────────────────────
export const pbbUserProfile = mysqlTable("login", {
  id: int("ID").notNull().primaryKey().autoincrement(),
  username: varchar("USERNAME", { length: 20 }).notNull(),
  password: char("PASSWORD", { length: 32 }).notNull(),
  hakAkses: varchar("HAK_AKSES", { length: 20 }).notNull(),
  nip: varchar("NIP", { length: 30 }),
  nama: varchar("NAMA", { length: 200 }),
  jabatan: varchar("JABATAN", { length: 200 }),
  penanggungJawabCetak: tinyint("PENANGGUNG_JAWAB_CETAK"),
  tandaTangan: text("TANDA_TANGAN"),
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
  aktif: tinyint("AKTIF"),
}, (table) => [
]);
