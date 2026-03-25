import { mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { longblob } from "./_columns";

// ─── konfigurasi ──────────────────────────────────────────────────

export const konfigurasi = mysqlTable("konfigurasi", {
  nama: varchar("NAMA", { length: 100 }).primaryKey(),
  nilai: longblob("NILAI"),
});
