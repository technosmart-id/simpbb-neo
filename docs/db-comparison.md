# Database Structure Comparison — Main vs Cloned (Production)

> **Snapshot date:** 2026-06-17
> Comparison of the two MySQL databases defined in `.env.local`.
> Generated from live `information_schema` queries (read-only) — see [Methodology](#methodology).

## Databases compared

| Label | Env var | DSN | Role |
|---|---|---|---|
| **Main** | `DATABASE_URL` | `203.130.255.4:3306/simpbb` | New Next.js / Drizzle app schema |
| **Cloned** | `CLONED_PRODUCTION_DATABASE_URL` | `203.130.255.4:33063/simpbb` | Clone of the legacy VB.NET-era PBB production DB |

## TL;DR

| | Main (`:3306`) | Cloned (`:33063`) |
|---|---|---|
| **Total objects** | 95 (92 tables + 3 views) | 350 (43 per-kelurahan GIS tables + 307 others) |
| **Shared tables** | 72 | 72 |
| **→ identical structure** | 43 | 43 |
| **→ differ** | 29 | 29 |
| **Only in main** | 23 (20 tables + 3 views) | — |
| **Only in cloned** | — | 278 |

The new app DB is a **cleaned-up subset** of the legacy production DB: it dropped ~278 legacy tables, kept the 72 core PBB tables, rewired authentication around Better Auth, and loosened/tightened a handful of columns and indexes on the tables it kept.

Reconciliation check: 43 identical + 29 differ = 72 shared; 72 shared + 23 main-only = 95 main objects. ✓

---

## 1. Tables in BOTH that are structurally IDENTICAL (43)

Column names, types, nullability, keys, and defaults match exactly.

`bangunan_lantai`, `dat_fasilitas_bangunan`, `dat_jpb14`, `dat_legalitas_bumi`, `dat_op_anggota`, `dat_op_induk`, `dat_subjek_pajak`, `dbkb_daya_dukung`, `dbkb_jpb2`, `dbkb_jpb3`, `dbkb_jpb4`, `dbkb_jpb5`, `dbkb_jpb6`, `dbkb_jpb7`, `dbkb_jpb8`, `dbkb_jpb9`, `dbkb_jpb12`, `dbkb_jpb13`, `dbkb_jpb14`, `dbkb_jpb15`, `dbkb_jpb16`, `dbkb_material`, `dbkb_mezanin`, `dbkb_standard`, `fas_dep_min_max`, `fas_non_dep`, `group_akses`, `jenis_sppt`, `konfigurasi`, `log_delete_pelayanan`, `lookup_group`, `lookup_item`, `pelayanan`, `pelayanan_lampiran_kolektif`, `penyusutan`, `range_penyusutan`, `ref_dati2`, `ref_jns_pelayanan`, `ref_kecamatan`, `ref_kelurahan`, `ref_propinsi`, `sppt_op_bersama`, `tipe_bangunan`

---

## 2. Tables in BOTH that DIFFER (29)

Grouped by the nature of the difference. Some tables (`sppt`, `pembayaran_sppt`) appear in more than one group.

### A. Column set differs — main has columns the clone lacks

These are the most consequential differences.

| Table | Cols (main / clone) | Difference |
|---|---|---|
| `user` | 17 / 14 | **Completely different design — not really the same table.** Main = Better Auth (`id varchar(36)`, `email`, `email_verified`, `two_factor_enabled`, `username`, `display_username`, `phone_number`, `role`, `banned`, `ban_reason`, `ban_expires`, `is_anonymous`, …). Cloned = legacy Yii2 (`id int auto_increment`, `auth_key`, `password_hash`, `password_reset_token`, `status`, `role int`, `nama_lengkap`, `nip`, `nomor_hp`, `created_at int`, …). Only the table name matches. |
| `fasilitas` | 6 / 5 | Main adds **`NILAI_FASILITAS decimal(15,2) NOT NULL DEFAULT 0.00`**. |
| `pembayaran_sppt` | 21 / 20 | Main adds **`DIBATALKAN tinyint(1) DEFAULT 0`**. Also PK differs — see B. |
| `sppt` | 46 / 45 | Main adds **`STATUS_PEMBATALAN char(1) NOT NULL DEFAULT '0'`**. Also PK/index/type differ — see B/C. |

### B. Index / primary-key differences (same columns, different keys)

| Table | Difference |
|---|---|
| `pembayaran_sppt` | Legacy PK is a **14-column composite** — the 9 NOP/payment-number columns **plus** `KD_KANWIL_BANK`, `KD_KPPBB_BANK`, `KD_BANK_TUNGGAL`, `KD_BANK_PERSEPSI`, `KD_TP`. Main simplified to a **9-column composite PK**. Legacy also indexes `TGL_PEMBAYARAN_SPPT` (MUL); main does not. |
| `sppt` | Legacy indexes `STATUS_PEMBAYARAN_SPPT` (MUL); main does not. |
| `histori_mutasi` | `id` is the **primary key** in main, but only a non-unique index (MUL) in cloned (the clone has no clean PK on this table). |
| `kelas_bangunan` | `NILAI_MINIMUM` indexed (MUL) in cloned; not in main. |
| `kelas_bumi` | `NILAI_MINIMUM` indexed (MUL) in cloned; not in main. |
| `pemekaran_detail` | `KD_PROPINSI_LAMA` and `KD_PROPINSI_BARU` indexed (MUL) in cloned; not in main. |
| `spop` | `SUBJEK_PAJAK_ID` indexed (MUL) in cloned; not in main. |

### C. Type / display-width differences

| Table | Column | Main | Cloned |
|---|---|---|---|
| `kayu_ulin` | `STATUS_KAYU_ULIN` | `tinyint(1)` | `tinyint(4)` |
| `pelayanan_dokumen` | `dokumen_id` | `smallint(6)` | `smallint(2)` |
| `sppt` | `SIKLUS_SPPT` | `tinyint(1)` | `tinyint(4)` |

All are storage-identical (display-width only) — except `tinyint(1)`, which some MySQL drivers treat as a boolean.

### D. Default-value-only differences (same columns / types / keys)

The new Drizzle schema defines **no defaults** on these legacy columns; the legacy DB does. No structural risk, but `INSERT` behavior differs (legacy back-fills defaults; new app must supply values).

| Table | Column(s) where the clone has a default main lacks |
|---|---|
| `akses` | `AKTIF` = 0 |
| `dat_jpb2`, `dat_jpb3`, `dat_jpb4`, `dat_jpb5`, `dat_jpb6`, `dat_jpb9`, `dat_jpb12`, `dat_jpb16` | class column (`KLS_JPBx`) = '1' |
| `dat_jpb7` | `JNS_JPB7` = '1', `BINTANG_JPB7` = '5' |
| `dat_jpb8` | `TYPE_KONSTRUKSI` = '1' |
| `dat_jpb13` | `KLS_JPB13` = '1' |
| `dat_jpb15` | `LETAK_TANGKI_JPB15` = '1' |
| `dat_op_bangunan` | `THN_DIBANGUN_BNG`=0, `LUAS_BNG`=0, `JML_LANTAI_BNG`=1, `NILAI_SISTEM_BNG`=0, `NILAI_INDIVIDU`=0, `AKTIF`=1 |
| `login` | `PASSWORD` = md5(''), `NIP` / `NAMA` / `JABATAN` = '-', `PENANGGUNG_JAWAB_CETAK` = 1 |
| `pemekaran` | `IS_CANCEL` = 0 |
| `sppt` (additionally) | numeric columns = 0, `THN_AWAL_KLS_TANAH` / `THN_AWAL_KLS_BNG` = 2000, `STATUS_*` flags = 0 |
| `sppt_e` | `TGL_RECORD` = CURRENT_TIMESTAMP |
| `tarif` | `NJKP` = 100 |

---

## 3. Tables in MAIN that DO NOT exist in the cloned DB (23)

| Category | Tables |
|---|---|
| **Better Auth — core** | `account`, `session`, `verification`, `two_factor`, `invitation`, `resource_ownership` |
| **Better Auth — OAuth** | `oauth_access_token`, `oauth_application`, `oauth_consent` |
| **Better Auth — organizations / teams** | `organization`, `org_roles`, `member`, `member_roles`, `team`, `team_member` |
| **App framework** | `casbin_rule` (RBAC), `log_aktivitas`, `notifications`, `notification_preferences` |
| **Demo / scaffold leftover** | `books` |
| **Views (app-defined)** | `v_nop`, `v_realisasi_kelurahan`, `v_tunggakan` |

None of these exist in legacy production — they are all new-app infrastructure. (The legacy DB has rough equivalents under different names, e.g. `social_account`, `users`, `role`, `menu`.)

---

## 4. Tables in CLONED that do not exist in main (278)

For context only — the user did not request this list. The legacy DB carries everything the new app intentionally dropped:

- **Year-partitioned SPPT:** `sppt_1991` … `sppt_2025`, plus `sppt_2024v2`, `sppt_2024_penghapusan`, `sppt_2025_2024`, `sppt_241002`, `sppt_ada_pengurang*`, `sppt_batallunas`, `sppt_khusus*`, `sppt_kompensasi_*`, `sppt_simulasi*`, `sppt_pembatalan`, `sppt_penyalinan`, `sppt_report`, etc.
- **DHKP / reporting:** `dhkp`, `dhkp_baru_report`, `dhkp_penyesuaian_usadi`, `bpk_baru`, `bpk_dhkp`, `bpk_gabungan`, `bpk_nondhkp`, `bpk_pembayaran_rekap`, `bpk_pembayaran_tempo`, `nondhkp`, `nopdhkpbaru`, `rekapitulasi`, `report_builder`.
- **Penghapusan / pengurangan:** `penghapusan`, `penghapusan_denda`, `penghapusan_detail`, `penghapusan_pertama`/`kedua`/`ketiga`/`keempat`, `pengurangan_24`, `pengurangan_perhitungan`, `persen_pengurangan`.
- **Logs:** `log_api`, `log_dat_op_bangunan`, `log_dat_subjek_pajak`, `log_keberatan`, `log_lspop`, `log_nobukti`, `log_pengurangan`, `log_perubahan_jthtempo_sppt`, `log_spop`, `log_spop_backup_ubah_kelas`.
- **Banking / BRI / BPD:** `bank_export`, `bank_pembayaran`, `bank_persepsi`, `bank_tunggal`, `bpd_kalibrasi`, `bri_api_log`, `bri_briva`, `tempat_pembayaran`, `tempat_pembayaran_elektronik`.
- **BPHtb / simulasi / validasi / temp:** `bphtb_*` (10 tables), `simulasi*` (6), `validasi*` (10), `temp_*` (20+), `jatuh_tempo_*`.
- **GIS:** 43 per-kelurahan polygon tables named `5171...` (e.g. `5171010001`), each with `geom multipolygon`.
- **Misc legacy:** `atrbpn`, `berhak_njoptkp`, `catatan_nop`, `cek_data_baru`, `cek_neraca`, `data_valid`, `data_valid_pembayaran`, `dat_material_bangunan`, `dat_nit`, `dat_subjek_pajak_mobile`, `daya_dukung`, `dhr`, `dhrd`, `himbauan`, `inputdatapasar`, `insentif`, `jenis_pelayanan`, `jenis_pemekaran`, `jenis_penghapusan`, `kelas_tanah`, `kelurahan_tertentu`, `login_op`, `lspop`, `lspop_`, `map`, `menu`, `menus`, `menu_group`, `migration`, `nir`, `nop_dusun`, `nop_sebelum_2018`, `pekerjaan`, `pekerjaan_kegiatan`, `pelayanan_copy`, `pelayanan_dokumen_temp`, `pembayaran_sppt_bantu`, `pembayaran_sppt_catatan`, `penalti`, `pencatatan_email`, `peta_nop`, `peta_spop`, `piutang_*`, `profile`, `ref_15_kelurahan_naik_2017`, `ref_dokumen_pelayanan`, `ref_dusun`, `ref_jpb`, `ref_kanwil`, `ref_kategori_bersyarat`, `ref_kategori_material_bangunan`, `ref_kppbb`, `ref_material_bangunan`, `ref_pengurangan`, `ref_pengurangan_detail`, `riwayat_ubah_kelas_bumi`, `riwayat_update_masal`, `role`, `service_perijinan`, `sisa_piutang`, `social_account`, `spop_mobile`, `spop_sebelum_update_masal_2024`, `status_pbb`, `status_pelayanan`, `target_pbb`, `token`, `tower_*`, `user_`, `users`, `validasi`, plus `a`, `b`, `c` scratch tables and `zz_*` archives.

---

## 5. Configuration note

**Env-var naming mismatch:** `.env.local` defines the cloned connection as `CLONED_PRODUCTION_DATABASE_URL`, but `.env.example` documents it as `CLONED_DATABASE_URL`. Any code reading the example's name against a real `.env.local` would resolve to `undefined`. Worth reconciling to a single name.

---

## Methodology

All figures come from read-only `SELECT`s against `information_schema` on each instance — no writes were performed on either database.

1. **Object inventory** — `information_schema.TABLES` (filtered to `TABLE_SCHEMA = 'simpbb'`), excluding the 43 numeric per-kelurahan GIS tables (`TABLE_NAME REGEXP '^[0-9]'`) from the shared-set comparison.
2. **Structural fingerprint** — for every shared table, an MD5 of its column definitions:
   ```sql
   SET SESSION group_concat_max_len = 1048576;
   SELECT TABLE_NAME, MD5(GROUP_CONCAT(
     CONCAT_WS('|', COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY,
                IFNULL(COLUMN_DEFAULT,'∅'), IFNULL(EXTRA,'∅'))
     ORDER BY ORDINAL_POSITION SEPARATOR '##')) AS sig
   FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA='simpbb' AND TABLE_NAME IN ( ...shared tables... )
   GROUP BY TABLE_NAME;
   ```
   Matching signatures ⇒ identical structure; differing signatures ⇒ inspected column-by-column.
3. **Column-level diff** — for the 29 tables whose signatures differed, the full column list (name, type, nullability, key, default, extra) was pulled from each DB and compared.

To re-run, point a `mysql` client at each DSN (ports 3306 and 33063) and execute the queries above.
