import {
  mysqlTable,
  bigint,
  int,
  varchar,
  text,
  datetime,
  json,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ─── log_aktivitas ────────────────────────────────────────────────

export const logAktivitas = mysqlTable(
  "log_aktivitas",
  {
    id: bigint("ID", { mode: "number" }).autoincrement().primaryKey(),
    username: varchar("USERNAME", { length: 20 }).notNull(),
    aksi: varchar("AKSI", { length: 50 }).notNull(),
    modul: varchar("MODUL", { length: 50 }),
    keterangan: text("KETERANGAN"),
    ipAddress: varchar("IP_ADDRESS", { length: 45 }),
    createdAt: datetime("CREATED_AT").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_log_user").on(table.username),
    index("idx_log_tgl").on(table.createdAt),
  ],
);

// ─── log_delete_pelayanan ─────────────────────────────────────────

export const logDeletePelayanan = mysqlTable("log_delete_pelayanan", {
  id: int("ID").autoincrement().primaryKey(),
  noPelayanan: varchar("NO_PELAYANAN", { length: 30 }).notNull(),
  dataSnapshot: json("DATA_SNAPSHOT"),
  dihapusOleh: varchar("DIHAPUS_OLEH", { length: 20 }),
  tglHapus: datetime("TGL_HAPUS").notNull().default(sql`CURRENT_TIMESTAMP`),
  alasan: text("ALASAN"),
});
