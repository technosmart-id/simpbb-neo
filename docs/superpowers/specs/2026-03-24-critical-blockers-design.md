# SIM-PBB Neo — Critical Blockers Design

**Date:** 2026-03-24
**Scope:** 4 production-blocking gaps identified in completeness audit
**Priority:** Option A — fix show-stoppers before any other work

---

## Context

The completeness audit (2026-03-24) identified ~50% overall implementation coverage. This spec covers only the 4 critical blockers that break core tax valuation and official workflow requirements:

1. DBKB Module — building cost reference table (0% implemented)
2. LSPOP Enhancements — HITUNG_BNG wiring + JPB-conditional forms + fasilitas sub-form
3. Penghapusan Workflow — formal NOP deactivation with 2-level approval
4. Berita Acara PDF — legally required pelayanan document

All designs are derived from the legacy VB.NET/WinForms codebase at `legay-codes/SIM-PBB/`.

---

## Architecture Constraints (must follow for all sub-projects)

- oRPC context imported from `"../context"` — never `"../server"` (circular dep)
- Drizzle inserts always list columns explicitly — never spread input objects
- Date fields converted with `new Date(input.dateString)` before Drizzle insert
- New tables use `nopColumns()` helper from `lib/db/schema/_columns.ts` for NOP fields
- New routers are registered in `lib/orpc/server.ts`
- PDF generators are `'use client'` and use `jsPDF` + `jspdf-autotable` — consistent with existing `sppt-generator.ts` and `dhkp-generator.ts`
- Raw SQL/stored proc calls use `db.execute(sql\`...\`)` from drizzle-orm

---

## Sub-project 1: DBKB Module

### Purpose
The `material_bangunan` table is the reference data consumed by `cav_sismiop.HITUNG_BNG()`. Without it, every building's `NILAI_SISTEM_BNG` remains 0, which cascades into incorrect NJOP and PBB calculations.

### New Drizzle Schema: `lib/db/schema/dbkb.ts`

```ts
export const materialBangunan = mysqlTable('material_bangunan', {
  id: int('ID').autoincrement().primaryKey(),
  kategori: char('KATEGORI', { length: 2 }).notNull(),          // A1, A2, A3, B
  kodeMaterial: varchar('KODE_MATERIAL', { length: 10 }).notNull(),
  namaMaterial: varchar('NAMA_MATERIAL', { length: 100 }).notNull(),
  nilaiAwal: decimal('NILAI_AWAL', { precision: 15, scale: 2 }).notNull().default('0'),
  nilaiBaru: decimal('NILAI_BARU', { precision: 15, scale: 2 }).notNull().default('0'),
  thnBerlaku: char('THN_BERLAKU', { length: 4 }).notNull(),
})

export const refKategoriMaterialBangunan = mysqlTable('ref_kategori_material_bangunan', {
  kategori: char('KATEGORI', { length: 2 }).primaryKey(),
  namaKategori: varchar('NAMA_KATEGORI', { length: 100 }).notNull(),
  bobot: decimal('BOBOT', { precision: 5, scale: 2 }).notNull(), // weight %
})
```

Export both from `lib/db/schema/index.ts`.

### oRPC Router: `lib/orpc/routers/dbkb.ts`

- `list({ kategori?, thnBerlaku? })` — returns all `material_bangunan` rows filtered; default `thnBerlaku` = current year
- `listKategori()` — returns all `ref_kategori_material_bangunan` rows (4 rows)
- `updateNilaiBaru(updates: { id: number, nilaiBaru: string }[])` — batch UPDATE per id
- `updateMasalBangunan({ pctIncrease: number, thnBerlaku: string })` — sets `NILAI_BARU = NILAI_AWAL * (1 + pctIncrease/100)` for all rows WHERE `THN_BERLAKU = thnBerlaku`

Register as `dbkb` in `lib/orpc/server.ts`.

### UI: `app/(app)/pengaturan/dbkb/page.tsx`

- 4-tab layout (A1 / A2 / A3 / B) using shadcn `Tabs`
- Year selector (defaults to current year) at page top — changes which `thnBerlaku` rows load
- Each tab: DataTable with inline-editable `NILAI_BARU` column (numeric input)
- "Terapkan Kenaikan %" — numeric input + AlertDialog confirmation → calls `updateMasalBangunan`
- "Simpan Semua" — collects all dirty rows and calls `updateNilaiBaru` mutation

Add sidebar nav link under Pengaturan.

### Migration
Create new Drizzle migration after schema changes: `npx drizzle-kit generate` then apply with `npx drizzle-kit migrate`.

---

## Sub-project 2: LSPOP Enhancements

### 2a — HITUNG_BNG Wiring

**Location:** `lib/orpc/routers/lspop.ts` — existing `update` mutation AND new `create` mutation

**After saving `dat_op_bangunan`** (both create and update), execute:

```ts
// Step 1: sync cav_sismiop internal state
await db.execute(sql`CALL cav_sismiop.\`insert\`(
  ${nop.kdPropinsi}, ${nop.kdDati2}, ${nop.kdKecamatan}, ${nop.kdKelurahan},
  ${nop.kdBlok}, ${nop.noUrut}, ${nop.kdJnsOp}, ${noBng}
)`)

// Step 2: calculate building value
const result = await db.execute(sql`SELECT cav_sismiop.HITUNG_BNG(
  ${nop.kdPropinsi}, ${nop.kdDati2}, ${nop.kdKecamatan}, ${nop.kdKelurahan},
  ${nop.kdBlok}, ${nop.noUrut}, ${nop.kdJnsOp}, ${noBng},
  ${kdJpb}, ${luasBng}, ${jmlLantaiBng}, YEAR(NOW())
) AS nilai`)

// Step 3: extract scalar from result rows
const nilaiSistemBng = Number((result.rows as any[])[0]?.nilai ?? 0)

// Step 4: persist
await db.update(datOpBangunan)
  .set({ nilaiSistemBng })
  .where(/* NOP + noBng */)
```

`NILAI_INDIVIDU > 0` bypasses system value — preserve existing logic.

### 2b — JPB-Conditional Fields

**Location:** `app/(app)/lspop/[nop]/[noBng]/page.tsx`

All JPB-specific columns already exist in `dat_op_bangunan` schema. The form needs a conditional section rendered based on `watch('kdJpb')`:

| KD_JPB | Fields to show |
|---|---|
| `'03'` | tingKolomJpb3, lbrBentJpb3, dayaDukungLantaiJpb3, kelilingDindingJpb3, luasMezzanineJpb3 |
| `'02'`, `'09'` | klsJpb2 |
| `'04'` | klsJpb4 |
| `'05'` | klsJpb5 |
| `'06'` | klsJpb6 |
| `'07'` | jnsJpb7, bintangJpb7, jmlKmrJpb7, luasKmrJpb7DgnAcSent, luasKmrLainJpb7DgnAcSent |
| `'13'` | klsJpb13 |
| `'16'` | klsJpb16 |
| Others | No extra fields |

Use `{kdJpb === '03' && <Fieldset label="Parameter Industri/Gudang">...</FieldSet>}` pattern.

### 2c — Fasilitas Sub-form

**Check first:** The lspop router may already have `listFasilitas` / `setFasilitas` endpoints — verify before adding new ones. If they exist, use them; do not add duplicates.

**UI location:** `app/(app)/lspop/[nop]/[noBng]/page.tsx` — collapsible Card below the main LSPOP form

**Behavior:**
- Load on mount: call `lspop.listFasilitas({ nop, noBng })` → map to a record keyed by `KD_FASILITAS`
- Load fasilitas master: call `klasifikasi.listFasilitas()` (already exists in router)
- Render each fasilitas as a labeled numeric input (0 = not present)
- On save: call `lspop.setFasilitas({ nop, noBng, items: [{kdFasilitas, jmlSatuan}] })` — backend does DELETE then re-INSERT for rows with `jmlSatuan > 0`

If backend endpoints don't exist yet, add them to `lib/orpc/routers/lspop.ts`:
- `listFasilitas({ nop: string, noBng: number })` — query `dat_fasilitas_bangunan`
- `setFasilitas({ nop, noBng, items })` — delete existing rows for this building, re-insert

---

## Sub-project 3: Penghapusan Workflow

### Purpose
Formal 2-level approval flow before a NOP can be deactivated. Operator submits request → supervisor approves or rejects → system executes deletion on approval.

### Jenis Penghapusan (hardcoded enum, no reference table needed)

| ID | Name | Deletion behavior |
|---|---|---|
| 1 | Fasilitas Umum | `UPDATE spop SET JNS_BUMI='4'` + delete unpaid SPPT |
| 2 | Pemecahan/Pemisahan | `UPDATE spop SET JNS_TRANSAKSI_OP='3'` + delete unpaid SPPT |
| 3 | Penggabungan | Same as 2 |
| 4 | Kesalahan Administrasi | Same as 2 |
| 5 | Lainnya | Same as 2 |
| 6 | Piutang Kadaluarsa | Delete only `STATUS_PEMBAYARAN_SPPT=0 AND THN_PAJAK_SPPT < YEAR(NOW())-5` |

### New Drizzle Schema: `lib/db/schema/penghapusan.ts`

```ts
export const datPenghapusan = mysqlTable('dat_penghapusan', {
  id: int('ID').autoincrement().primaryKey(),
  // NOP (7 parts) using nopColumns() helper
  ...nopColumns(),
  jenisPenghapusan: tinyint('JENIS_PENGHAPUSAN').notNull(), // 1–6
  alasan: text('ALASAN').notNull(),
  status: mysqlEnum('STATUS', ['pending', 'approved', 'rejected']).notNull().default('pending'),
  userPengaju: varchar('USER_PENGAJU', { length: 30 }).notNull(),
  tglPengajuan: datetime('TGL_PENGAJUAN').notNull().default(sql`CURRENT_TIMESTAMP`),
  userApprover: varchar('USER_APPROVER', { length: 30 }),
  tglApproval: datetime('TGL_APPROVAL'),
  catatanApprover: text('CATATAN_APPROVER'),
}, (table) => [
  nopForeignKey('fk_penghapusan_spop', table, spop),
  index('idx_penghapusan_status').on(table.status),
])

export const datPenghapusanSppt = mysqlTable('dat_penghapusan_sppt', {
  idPenghapusan: int('ID_PENGHAPUSAN').notNull(),
  // NOP parts
  ...nopColumns(),
  thnPajakSppt: char('THN_PAJAK_SPPT', { length: 4 }).notNull(),
  // Snapshot
  namaWp: varchar('NAMA_WP', { length: 100 }),
  njopBumiSppt: bigint('NJOP_BUMI_SPPT', { mode: 'number' }),
  njopBngSppt: bigint('NJOP_BNG_SPPT', { mode: 'number' }),
  pbbYgHarusDibayarSppt: bigint('PBB_YG_HARUS_DIBAYAR_SPPT', { mode: 'number' }),
}, (table) => [
  primaryKey({ columns: [table.idPenghapusan, table.kdPropinsi, table.kdDati2, table.kdKecamatan,
    table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp, table.thnPajakSppt] }),
  foreignKey({ name: 'fk_penghapusan_sppt_header', columns: [table.idPenghapusan],
    foreignColumns: [datPenghapusan.id] }),
])
```

Export both from `lib/db/schema/index.ts`.

### Supervisor Role Check

The oRPC context provides `context.session` (Better Auth session). For supervisor-only endpoints (`approve`, `reject`), query `pbbUserProfile` to get the current user's `kdGroup`, then check it against the allowed approver groups. Simple guard pattern:

```ts
const profile = await db.query.pbbUserProfile.findFirst({
  where: eq(pbbUserProfile.userId, context.session!.user.id)
})
if (!profile || profile.hakAkses === 'OPR') {
  throw new ORPCError({ code: 'FORBIDDEN', message: 'Hanya supervisor yang dapat menyetujui' })
}
```

Adjust the operator access code (`'OPR'`) to match the actual `HAK_AKSES` value for basic operators in the deployment database (`pbbUserProfile.hakAkses` column in `lib/db/schema/pengguna.ts`).

### oRPC Router: `lib/orpc/routers/penghapusan.ts`

- `list({ status?, page, limit })` — paginated, joins `spop` for NOP details
- `getDetail(id)` — returns request header + SPPT snapshot rows
- `create({ nop, jenisPenghapusan, alasan })`:
  1. Validate NOP exists in `spop`
  2. Check no existing `pending` request for same NOP (uniqueness guard — throw if exists)
  3. Query unpaid SPPT rows matching jenis logic, snapshot into `dat_penghapusan_sppt`
  4. Insert `dat_penghapusan` with status `'pending'`
- `approve({ id, catatan? })` — supervisor only (role check above):
  1. Fetch request; verify status is `'pending'`
  2. Execute deletion SQL per jenis (see table above)
  3. Update request: status=`'approved'`, userApprover, tglApproval, catatanApprover
- `reject({ id, catatan })` — supervisor only: update status=`'rejected'`

Register as `penghapusan` in `lib/orpc/server.ts`.

### UI

**`app/(app)/penghapusan/page.tsx`** — DataTable columns: NOP (formatted), Nama WP, Jenis, Status badge (color-coded), Tgl Pengajuan, Pengaju, actions. Approve/Reject buttons visible only if user's kdGroup ≠ 'OPR'. Clicking approve/reject opens AlertDialog for confirmation + optional catatan.

**`app/(app)/penghapusan/baru/page.tsx`** — Form: NOP picker (reuse existing NopSearch component), jenis dropdown (hardcoded 6 options), alasan textarea. On submit: shows a confirmation step with the SPPT snapshot list, then calls `create` mutation.

---

## Sub-project 4: Berita Acara PDF

### Purpose
Legally required official document generated at the conclusion of a pelayanan service request. Two variants: standard (BA) and detail (BA Detail).

### Data Sources (resolved)

**BA Standard** uses:
- `pelayanan` table fields: `noPelayanan`, `kdJnsPelayanan`, `tanggalPelayanan`, `namaPemohon`, `alamatPemohon`, `letakOp`, `keterangan` (= Hasil Penelitian), `namaPetugasPenerima`, `nipPetugasPenerima`, `ttdKiriJabatan/Nama/Nip`, `ttdKananJabatan/Nama/Nip`
- `pelayananDokumen` rows: checklist of received documents
- Instansi name/address: from `konfigurasi` keys `NM_INSTANSI` and `ALAMAT_INSTANSI`

**BA Detail** uses all the above plus `histori_mutasi` (latest row for this `noPelayanan`):
- Before: `ltSebelum`, `lbSebelum`, `pbbSebelum`
- After: `ltSesudah`, `lbSesudah`, `pbbSesudah`
- Note: NJOP fields are not in `histori_mutasi` — BA Detail shows only LT, LB, PBB comparison. This matches the available data.

### PDF Generator: `lib/utils/pdf/berita-acara-generator.ts`

```ts
'use client'
// Uses jsPDF + jspdf-autotable — consistent with sppt-generator.ts

export interface BeritaAcaraData {
  pelayanan: {
    noPelayanan: string
    kdJnsPelayanan: string
    namaJenisPelayanan: string
    tanggalPelayanan: string    // YYYY-MM-DD
    namaPemohon: string
    alamatPemohon: string
    letakOp: string
    nop?: string               // formatted NOP
    keterangan: string         // Hasil Penelitian
    namaPetugasPenerima: string
    nipPetugasPenerima: string
    ttdKiriJabatan: string
    ttdKiriNama: string
    ttdKiriNip: string
    ttdKananJabatan: string
    ttdKananNama: string
    ttdKananNip: string
  }
  dokumen: { dokumenId: number; namaDokumen: string; ada: boolean }[]
  instansi: { nmInstansi: string; alamatInstansi: string }
  mutasi?: {                   // only for BA Detail
    ltSebelum: number; lbSebelum: number; pbbSebelum: number
    ltSesudah: number; lbSesudah: number; pbbSesudah: number
  }
}

export function generateBeritaAcara(data: BeritaAcaraData): void
// Downloads PDF: "BA-{noPelayanan}.pdf"

export function generateBeritaAcaraDetail(data: BeritaAcaraData): void
// Downloads PDF: "BA-Detail-{noPelayanan}.pdf"
// Only call if data.mutasi is present
```

**PDF layout:**
1. Kop surat (instansi name, address)
2. Title: "BERITA ACARA PELAYANAN" + Nomor: `BA-{noPelayanan}`
3. Body text: "Pada hari ini, {tanggal panjang}..."
4. Data pelayanan table (No. Berkas, Jenis, NOP, Nama WP, Alamat OP)
5. Dokumen checklist table (No | Dokumen | Ada ✓ / Tidak)
6. Hasil Penelitian: `pelayanan.keterangan`
7. 3-column signature block: col1=Pemohon, col2=Petugas Penerima (namaPetugasPenerima/nipPetugasPenerima), col3=ttdKanan (jabatan/nama/nip)
8. (Detail variant only): Before/After table (Uraian | Sebelum | Sesudah) for LT, LB, PBB

### UI Page: `app/(app)/pelayanan/[no]/berita-acara/page.tsx`

- Server component fetches: `pelayanan.getByNo(no)`, `konfigurasi.get(['NM_INSTANSI','ALAMAT_INSTANSI'])`, `pelayanan.getDokumen(no)`, `pelayanan.getMutasi(no)` (for detail variant check)
- Passes data as props to a client component that renders two buttons: "Cetak BA" and "Cetak BA Detail" (second only if mutasi exists)
- Each button calls the respective generator function on click

**Add router endpoint** `pelayanan.getDokumen(noPelayanan)` to `lib/orpc/routers/pelayanan.ts` if not already present — queries `pelayananDokumen` joined to a hardcoded dokumen name lookup.

**Pelayanan detail page** (`app/(app)/pelayanan/[no]/page.tsx`): add "Berita Acara" button linking to `/pelayanan/{no}/berita-acara`.

---

## Out of Scope for This Spec

- Berita Acara numbering sequence (use `BA-{noPelayanan}` as nomor for now)
- Pelayanan per-type verifikasi logic (separate spec)
- Kolektif lampiran sub-form (separate spec)
- Any laporan reports (separate spec)
- Dokumen name master table (use hardcoded 15-item array matching legacy checklist for now)
