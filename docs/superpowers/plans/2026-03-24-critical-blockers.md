# Critical Blockers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 4 critical production blockers: DBKB module, LSPOP enhancements (HITUNG_BNG + JPB conditional fields + fasilitas sub-form), Penghapusan 2-level approval workflow, and Berita Acara PDF generation.

**Architecture:** Each sub-project is independent and can be deployed separately. Sub-projects 1–3 require Drizzle schema changes and migrations. Sub-project 4 is UI-only. All oRPC routers follow the existing pattern in `lib/orpc/routers/`. All PDF generators are `'use client'` using jsPDF.

**Tech Stack:** Next.js 16 App Router, TypeScript, MySQL via Drizzle ORM, oRPC v1.x + React Query, shadcn/ui, jsPDF + jspdf-autotable

**Spec:** `docs/superpowers/specs/2026-03-24-critical-blockers-design.md`

---

## File Map

### Sub-project 1: DBKB Module
| File | Action |
|---|---|
| `lib/db/schema/dbkb.ts` | CREATE — Drizzle schema for `material_bangunan` + `ref_kategori_material_bangunan` |
| `lib/db/schema/index.ts` | MODIFY — add DBKB exports |
| `lib/orpc/routers/dbkb.ts` | CREATE — list, listKategori, updateNilaiBaru, updateMasalBangunan |
| `lib/orpc/server.ts` | MODIFY — register `dbkb` router |
| `app/(app)/pengaturan/dbkb/page.tsx` | CREATE — 4-tab editable DataTable page |
| `components/layouts/app-sidebar.tsx` | MODIFY — add DBKB nav link under Pengaturan |

### Sub-project 2: LSPOP Enhancements
| File | Action |
|---|---|
| `lib/orpc/routers/lspop.ts` | MODIFY — wire HITUNG_BNG after create+update, add JPB-specific fields to input schema |
| `app/(app)/lspop/[nop]/[noBng]/page.tsx` | MODIFY — JPB conditional fields + fasilitas sub-form card |

### Sub-project 3: Penghapusan Workflow
| File | Action |
|---|---|
| `lib/db/schema/penghapusan.ts` | CREATE — Drizzle schema for `dat_penghapusan` + `dat_penghapusan_sppt` |
| `lib/db/schema/index.ts` | MODIFY — add Penghapusan exports |
| `lib/orpc/routers/penghapusan.ts` | CREATE — list, getDetail, create, approve, reject |
| `lib/orpc/server.ts` | MODIFY — register `penghapusan` router |
| `app/(app)/penghapusan/page.tsx` | CREATE — list view with approve/reject actions |
| `app/(app)/penghapusan/baru/page.tsx` | CREATE — submission form with SPPT preview |
| `components/layouts/app-sidebar.tsx` | MODIFY — add Penghapusan nav link |

### Sub-project 4: Berita Acara PDF
| File | Action |
|---|---|
| `lib/utils/pdf/berita-acara-generator.ts` | CREATE — jsPDF generator for BA standard + BA Detail |
| `app/(app)/pelayanan/[no]/berita-acara/page.tsx` | CREATE — Cetak BA page with download buttons |
| `app/(app)/pelayanan/[no]/page.tsx` | MODIFY — add "Berita Acara" button |
| `lib/orpc/routers/pelayanan.ts` | MODIFY — add `getDokumen` endpoint if missing |

---

## Sub-project 1: DBKB Module

### Task 1: DBKB Drizzle Schema

**Files:**
- Create: `lib/db/schema/dbkb.ts`
- Modify: `lib/db/schema/index.ts`

- [ ] **Step 1.1: Create `lib/db/schema/dbkb.ts`**

```typescript
import {
  mysqlTable,
  int,
  char,
  varchar,
  decimal,
  index,
} from "drizzle-orm/mysql-core";

export const materialBangunan = mysqlTable(
  "material_bangunan",
  {
    id: int("ID").autoincrement().primaryKey(),
    kategori: char("KATEGORI", { length: 2 }).notNull(),
    kodeMaterial: varchar("KODE_MATERIAL", { length: 10 }).notNull(),
    namaMaterial: varchar("NAMA_MATERIAL", { length: 100 }).notNull(),
    nilaiAwal: decimal("NILAI_AWAL", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    nilaiBaru: decimal("NILAI_BARU", { precision: 15, scale: 2 })
      .notNull()
      .default("0"),
    thnBerlaku: char("THN_BERLAKU", { length: 4 }).notNull(),
  },
  (table) => [
    index("idx_mat_bng_kategori").on(table.kategori),
    index("idx_mat_bng_thn").on(table.thnBerlaku),
  ],
);

export const refKategoriMaterialBangunan = mysqlTable(
  "ref_kategori_material_bangunan",
  {
    kategori: char("KATEGORI", { length: 2 }).primaryKey(),
    namaKategori: varchar("NAMA_KATEGORI", { length: 100 }).notNull(),
    bobot: decimal("BOBOT", { precision: 5, scale: 2 }).notNull(),
  },
);
```

- [ ] **Step 1.2: Add exports to `lib/db/schema/index.ts`**

Add after existing exports:
```typescript
export * from "./dbkb";
```

- [ ] **Step 1.3: Generate and run migration**

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Expected: new migration file created, tables created in DB.

- [ ] **Step 1.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 1.5: Commit**

```bash
git add lib/db/schema/dbkb.ts lib/db/schema/index.ts
git add drizzle/  # migration files
git commit -m "feat(dbkb): add material_bangunan schema and migration"
```

---

### Task 2: DBKB oRPC Router

**Files:**
- Create: `lib/orpc/routers/dbkb.ts`
- Modify: `lib/orpc/server.ts`

- [ ] **Step 2.1: Create `lib/orpc/routers/dbkb.ts`**

```typescript
import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { materialBangunan, refKategoriMaterialBangunan } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const dbkbRouter = os.router({
  list: os
    .input(z.object({
      kategori: z.string().optional(),
      thnBerlaku: z.string().optional(),
    }))
    .handler(async ({ input }) => {
      const year = input.thnBerlaku ?? new Date().getFullYear().toString()
      const conditions = [eq(materialBangunan.thnBerlaku, year)]
      if (input.kategori) {
        conditions.push(eq(materialBangunan.kategori, input.kategori))
      }
      return db.select().from(materialBangunan)
        .where(and(...conditions))
        .orderBy(materialBangunan.kategori, materialBangunan.kodeMaterial)
    }),

  listKategori: os
    .handler(async () => {
      return db.select().from(refKategoriMaterialBangunan)
        .orderBy(refKategoriMaterialBangunan.kategori)
    }),

  updateNilaiBaru: os
    .input(z.object({
      updates: z.array(z.object({
        id: z.number(),
        nilaiBaru: z.string(),
      })),
    }))
    .handler(async ({ input }) => {
      for (const { id, nilaiBaru } of input.updates) {
        await db.update(materialBangunan)
          .set({ nilaiBaru })
          .where(eq(materialBangunan.id, id))
      }
      return { success: true, updated: input.updates.length }
    }),

  updateMasalBangunan: os
    .input(z.object({
      pctIncrease: z.number().min(0).max(1000),
      thnBerlaku: z.string().length(4),
    }))
    .handler(async ({ input }) => {
      await db.execute(sql`
        UPDATE material_bangunan
        SET NILAI_BARU = NILAI_AWAL * ${1 + input.pctIncrease / 100}
        WHERE THN_BERLAKU = ${input.thnBerlaku}
      `)
      return { success: true }
    }),
})

- [ ] **Step 2.2: Register router in `lib/orpc/server.ts`**

After line `import { pemekaranRouter } from "./routers/pemekaran"`, add:
```typescript
import { dbkbRouter } from "./routers/dbkb"
```

In the `os.router({...})` block, after `pemekaran: pemekaranRouter,`, add:
```typescript
dbkb: dbkbRouter,
```

- [ ] **Step 2.3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2.4: Commit**

```bash
git add lib/orpc/routers/dbkb.ts lib/orpc/server.ts
git commit -m "feat(dbkb): add oRPC router with list, update, and mass-update endpoints"
```

---

### Task 3: DBKB UI Page

**Files:**
- Create: `app/(app)/pengaturan/dbkb/page.tsx`
- Modify: `components/layouts/app-sidebar.tsx`

- [ ] **Step 3.1: Create `app/(app)/pengaturan/dbkb/page.tsx`**

```tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Save, TrendingUp } from 'lucide-react'

const KATEGORI = ['A1', 'A2', 'A3', 'B'] as const

type Row = {
  id: number
  kodeMaterial: string
  namaMaterial: string
  nilaiAwal: string
  nilaiBaru: string
  thnBerlaku: string
}

export default function DbkbPage() {
  const orpc = useORPC()
  const qc = useQueryClient()
  const currentYear = new Date().getFullYear().toString()
  const [year, setYear] = useState(currentYear)
  const [dirtyValues, setDirtyValues] = useState<Record<number, string>>({})
  const [pctIncrease, setPctIncrease] = useState('')

  const { data: rows = [] } = useQuery(
    orpc.dbkb.list.queryOptions({ thnBerlaku: year })
  )

  const saveMutation = useMutation({
    ...orpc.dbkb.updateNilaiBaru.mutationOptions(),
    onSuccess: () => {
      toast.success('Nilai baru berhasil disimpan')
      setDirtyValues({})
      qc.invalidateQueries({ queryKey: orpc.dbkb.list.queryOptions({}).queryKey })
    },
  })

  const massMutation = useMutation({
    ...orpc.dbkb.updateMasalBangunan.mutationOptions(),
    onSuccess: () => {
      toast.success('Update masal berhasil')
      setDirtyValues({})
      qc.invalidateQueries({ queryKey: orpc.dbkb.list.queryOptions({}).queryKey })
    },
  })

  function handleSaveAll() {
    const updates = Object.entries(dirtyValues).map(([id, nilaiBaru]) => ({
      id: Number(id),
      nilaiBaru,
    }))
    if (updates.length === 0) return toast.info('Tidak ada perubahan')
    saveMutation.mutate({ updates })
  }

  function getRowsByKategori(k: string): Row[] {
    return (rows as Row[]).filter((r) => r.kategori === k)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">DBKB — Daftar Biaya Komponen Bangunan</h1>
          <p className="text-sm text-muted-foreground">Referensi biaya komponen untuk kalkulasi NJOP bangunan</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="w-24"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Tahun"
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                Kenaikan %
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Update Masal Kenaikan</AlertDialogTitle>
                <AlertDialogDescription>
                  NILAI_BARU = NILAI_AWAL × (1 + n%). Berlaku untuk semua baris tahun {year}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <Input
                type="number"
                min={0}
                max={1000}
                value={pctIncrease}
                onChange={(e) => setPctIncrease(e.target.value)}
                placeholder="Persentase kenaikan (%)"
              />
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    massMutation.mutate({
                      pctIncrease: Number(pctIncrease),
                      thnBerlaku: year,
                    })
                  }
                >
                  Terapkan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleSaveAll} disabled={saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Simpan Semua
          </Button>
        </div>
      </div>

      <Tabs defaultValue="A1">
        <TabsList>
          {KATEGORI.map((k) => (
            <TabsTrigger key={k} value={k}>
              Kategori {k}
            </TabsTrigger>
          ))}
        </TabsList>
        {KATEGORI.map((k) => (
          <TabsContent key={k} value={k}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Kode</TableHead>
                  <TableHead>Nama Komponen</TableHead>
                  <TableHead className="w-40 text-right">Nilai Awal (Rp)</TableHead>
                  <TableHead className="w-48 text-right">Nilai Baru (Rp)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getRowsByKategori(k).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono">{row.kodeMaterial}</TableCell>
                    <TableCell>{row.namaMaterial}</TableCell>
                    <TableCell className="text-right font-mono">
                      {Number(row.nilaiAwal).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="text-right font-mono"
                        value={dirtyValues[row.id] ?? row.nilaiBaru}
                        onChange={(e) =>
                          setDirtyValues((prev) => ({ ...prev, [row.id]: e.target.value }))
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 3.2: Add DBKB to sidebar in `components/layouts/app-sidebar.tsx`**

Find the Pengaturan section in `navMain` (look for items with url starting with `/pengaturan/`). Add DBKB as a sub-item:

```typescript
// Add to the Pengaturan group's items array:
{
  title: "DBKB",
  url: "/pengaturan/dbkb",
  icon: <Building2 />,
},
```

- [ ] **Step 3.3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3.4: Test manually**
  - Start dev server: `npm run dev`
  - Navigate to `/pengaturan/dbkb`
  - Verify 4 tabs render (even if empty — tables may have no data yet)
  - Verify save and kenaikan buttons don't throw errors

- [ ] **Step 3.5: Commit**

```bash
git add app/(app)/pengaturan/dbkb/page.tsx components/layouts/app-sidebar.tsx
git commit -m "feat(dbkb): add DBKB management page with 4-tab editable table"
```

---

## Sub-project 2: LSPOP Enhancements

### Task 4: Wire HITUNG_BNG in lspop router

**Files:**
- Modify: `lib/orpc/routers/lspop.ts`

- [ ] **Step 4.1: Add HITUNG_BNG helper function to `lib/orpc/routers/lspop.ts`**

Add at top of file (after imports):
```typescript
import { sql } from "drizzle-orm"
```

Add this helper function before `export const lspopRouter`:

```typescript
async function calculateNilaiSistemBng(input: {
  kdPropinsi: string
  kdDati2: string
  kdKecamatan: string
  kdKelurahan: string
  kdBlok: string
  noUrut: string
  kdJnsOp: string
  noBng: number
  kdJpb?: string | null
  luasBng: number
  jmlLantaiBng: number
}): Promise<number> {
  try {
    // Step 1: sync cav_sismiop internal state
    await db.execute(sql`
      CALL cav_sismiop.\`insert\`(
        ${input.kdPropinsi}, ${input.kdDati2}, ${input.kdKecamatan},
        ${input.kdKelurahan}, ${input.kdBlok}, ${input.noUrut},
        ${input.kdJnsOp}, ${input.noBng}
      )
    `)
    // Step 2: calculate building value
    const result = await db.execute(sql`
      SELECT cav_sismiop.HITUNG_BNG(
        ${input.kdPropinsi}, ${input.kdDati2}, ${input.kdKecamatan},
        ${input.kdKelurahan}, ${input.kdBlok}, ${input.noUrut},
        ${input.kdJnsOp}, ${input.noBng},
        ${input.kdJpb ?? '01'}, ${input.luasBng}, ${input.jmlLantaiBng},
        YEAR(NOW())
      ) AS nilai
    `)
    return Number((result.rows as Array<{ nilai: unknown }>)[0]?.nilai ?? 0)
  } catch {
    // If proc doesn't exist in this environment, return 0 gracefully
    return 0
  }
}
```

- [ ] **Step 4.2: Update `create` handler to call HITUNG_BNG after insert**

Replace the existing `create` handler (lines ~65–80 in `lspop.ts`):

```typescript
create: os
  .input(nopInput.extend({
    noBng: z.number(),
    kdJpb: z.string().optional(),
    luasBng: z.number(),
    jmlLantaiBng: z.number().default(1),
    thnDibangunBng: z.string().optional(),
    thnRenovasiBng: z.string().optional(),
    kondisiBng: z.string().optional(),
    jnsKonstruksiBng: z.string().optional(),
    jnsAtapBng: z.string().optional(),
    kdDinding: z.string().optional(),
    kdLantai: z.string().optional(),
    kdLangitLangit: z.string().optional(),
    nilaiIndividu: z.number().default(0),
    // JPB-specific fields
    tingKolomJpb3: z.number().optional(),
    lbrBentJpb3: z.number().optional(),
    dayaDukungLantaiJpb3: z.number().optional(),
    kelilingDindingJpb3: z.number().optional(),
    luasMezzanineJpb3: z.number().optional(),
    klsJpb2: z.number().optional(),
    klsJpb4: z.number().optional(),
    klsJpb5: z.number().optional(),
    klsJpb6: z.number().optional(),
    jnsJpb7: z.string().optional(),
    bintangJpb7: z.number().optional(),
    jmlKmrJpb7: z.number().optional(),
    luasKmrJpb7DgnAcSent: z.string().optional(),
    luasKmrLainJpb7DgnAcSent: z.string().optional(),
    klsJpb13: z.number().optional(),
    klsJpb16: z.number().optional(),
  }))
  .handler(async ({ input }) => {
    await db.insert(datOpBangunan).values({
      kdPropinsi: input.kdPropinsi,
      kdDati2: input.kdDati2,
      kdKecamatan: input.kdKecamatan,
      kdKelurahan: input.kdKelurahan,
      kdBlok: input.kdBlok,
      noUrut: input.noUrut,
      kdJnsOp: input.kdJnsOp,
      noBng: input.noBng,
      kdJpb: input.kdJpb ?? null,
      luasBng: input.luasBng,
      jmlLantaiBng: input.jmlLantaiBng,
      thnDibangunBng: input.thnDibangunBng ?? null,
      thnRenovasiBng: input.thnRenovasiBng ?? null,
      kondisiBng: input.kondisiBng ?? null,
      jnsKonstruksiBng: input.jnsKonstruksiBng ?? null,
      jnsAtapBng: input.jnsAtapBng ?? null,
      kdDinding: input.kdDinding ?? null,
      kdLantai: input.kdLantai ?? null,
      kdLangitLangit: input.kdLangitLangit ?? null,
      nilaiSistemBng: 0,
      nilaiIndividu: input.nilaiIndividu,
      tingKolomJpb3: input.tingKolomJpb3 ?? null,
      lbrBentJpb3: input.lbrBentJpb3 ?? null,
      dayaDukungLantaiJpb3: input.dayaDukungLantaiJpb3 ?? null,
      kelilingDindingJpb3: input.kelilingDindingJpb3 ?? null,
      luasMezzanineJpb3: input.luasMezzanineJpb3 ?? null,
      klsJpb2: input.klsJpb2 ?? null,
      klsJpb4: input.klsJpb4 ?? null,
      klsJpb5: input.klsJpb5 ?? null,
      klsJpb6: input.klsJpb6 ?? null,
      jnsJpb7: input.jnsJpb7 ?? null,
      bintangJpb7: input.bintangJpb7 ?? null,
      jmlKmrJpb7: input.jmlKmrJpb7 ?? null,
      luasKmrJpb7DgnAcSent: input.luasKmrJpb7DgnAcSent ?? null,
      luasKmrLainJpb7DgnAcSent: input.luasKmrLainJpb7DgnAcSent ?? null,
      klsJpb13: input.klsJpb13 ?? null,
      klsJpb16: input.klsJpb16 ?? null,
      aktif: 1,
    })

    // Wire HITUNG_BNG — only if nilaiIndividu is not set
    if (!input.nilaiIndividu) {
      const nilaiSistemBng = await calculateNilaiSistemBng({
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
        noBng: input.noBng,
        kdJpb: input.kdJpb,
        luasBng: input.luasBng,
        jmlLantaiBng: input.jmlLantaiBng,
      })
      if (nilaiSistemBng > 0) {
        await db.update(datOpBangunan)
          .set({ nilaiSistemBng })
          .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, input.noBng)))
      }
    }

    return { success: true }
  }),
```

- [ ] **Step 4.3: Update `update` handler to call HITUNG_BNG**

Replace the existing `update` handler. Key changes: expand input to include all JPB fields + call HITUNG_BNG after save:

```typescript
update: os
  .input(nopInput.extend({
    noBng: z.number(),
    kdJpb: z.string().optional(),
    luasBng: z.number().optional(),
    jmlLantaiBng: z.number().optional(),
    thnDibangunBng: z.string().optional(),
    thnRenovasiBng: z.string().optional(),
    kondisiBng: z.string().optional(),
    jnsKonstruksiBng: z.string().optional(),
    jnsAtapBng: z.string().optional(),
    kdDinding: z.string().optional(),
    kdLantai: z.string().optional(),
    kdLangitLangit: z.string().optional(),
    // nilaiSistemBng intentionally omitted — controlled exclusively by HITUNG_BNG
    nilaiIndividu: z.number().optional(),
    tingKolomJpb3: z.number().optional(),
    lbrBentJpb3: z.number().optional(),
    dayaDukungLantaiJpb3: z.number().optional(),
    kelilingDindingJpb3: z.number().optional(),
    luasMezzanineJpb3: z.number().optional(),
    klsJpb2: z.number().optional(),
    klsJpb4: z.number().optional(),
    klsJpb5: z.number().optional(),
    klsJpb6: z.number().optional(),
    jnsJpb7: z.string().optional(),
    bintangJpb7: z.number().optional(),
    jmlKmrJpb7: z.number().optional(),
    luasKmrJpb7DgnAcSent: z.string().optional(),
    luasKmrLainJpb7DgnAcSent: z.string().optional(),
    klsJpb13: z.number().optional(),
    klsJpb16: z.number().optional(),
  }))
  .handler(async ({ input }) => {
    const { noBng, ...rest } = input
    const nopParts = {
      kdPropinsi: input.kdPropinsi,
      kdDati2: input.kdDati2,
      kdKecamatan: input.kdKecamatan,
      kdKelurahan: input.kdKelurahan,
      kdBlok: input.kdBlok,
      noUrut: input.noUrut,
      kdJnsOp: input.kdJnsOp,
    }

    // Build set object explicitly — pick only defined keys
    const setValues: Partial<typeof datOpBangunan.$inferInsert> = {}
    const mappable = ['kdJpb','luasBng','jmlLantaiBng','thnDibangunBng','thnRenovasiBng',
      'kondisiBng','jnsKonstruksiBng','jnsAtapBng','kdDinding','kdLantai','kdLangitLangit',
      'nilaiIndividu','tingKolomJpb3','lbrBentJpb3','dayaDukungLantaiJpb3',
      'kelilingDindingJpb3','luasMezzanineJpb3','klsJpb2','klsJpb4','klsJpb5','klsJpb6',
      'jnsJpb7','bintangJpb7','jmlKmrJpb7','luasKmrJpb7DgnAcSent','luasKmrLainJpb7DgnAcSent',
      'klsJpb13','klsJpb16'] as const
    for (const key of mappable) {
      if (key in rest && (rest as Record<string, unknown>)[key] !== undefined) {
        (setValues as Record<string, unknown>)[key] = (rest as Record<string, unknown>)[key]
      }
    }

    if (Object.keys(setValues).length > 0) {
      await db.update(datOpBangunan)
        .set(setValues)
        .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)))
    }

    // Re-calculate HITUNG_BNG unless nilaiIndividu is overriding
    const [current] = await db.select({
      nilaiIndividu: datOpBangunan.nilaiIndividu,
      luasBng: datOpBangunan.luasBng,
      jmlLantaiBng: datOpBangunan.jmlLantaiBng,
      kdJpb: datOpBangunan.kdJpb,
    }).from(datOpBangunan)
      .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)))

    if (current && !current.nilaiIndividu) {
      const nilaiSistemBng = await calculateNilaiSistemBng({
        ...nopParts,
        noBng,
        kdJpb: current.kdJpb,
        luasBng: current.luasBng,
        jmlLantaiBng: current.jmlLantaiBng,
      })
      if (nilaiSistemBng > 0) {
        await db.update(datOpBangunan)
          .set({ nilaiSistemBng })
          .where(and(nopWhere(datOpBangunan, input), eq(datOpBangunan.noBng, noBng)))
      }
    }

    return { success: true }
  }),
```

- [ ] **Step 4.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4.5: Commit**

```bash
git add lib/orpc/routers/lspop.ts
git commit -m "feat(lspop): wire HITUNG_BNG stored proc call on create and update, expand JPB field inputs"
```

---

### Task 5: LSPOP JPB-Conditional Fields + Fasilitas Sub-form (UI)

**Files:**
- Modify: `app/(app)/lspop/[nop]/[noBng]/page.tsx`

- [ ] **Step 5.1: Read the current LSPOP edit page**

Open `app/(app)/lspop/[nop]/[noBng]/page.tsx` and understand its current form structure before making changes. It uses react-hook-form.

- [ ] **Step 5.2: Add JPB-conditional fields section to the form**

After the main LSPOP fields (konstruksi, atap, dinding, lantai, langit-langit), add a conditional section driven by the `kdJpb` watch value:

```tsx
// At top: add watch for kdJpb
const kdJpb = watch('kdJpb')

// In JSX, after the main material fields:
{/* JPB-Specific Parameters */}
{kdJpb === '03' && (
  <Card>
    <CardHeader><CardTitle>Parameter Industri / Gudang (JPB-03)</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <Field>
        <FieldLabel>Tinggi Kolom (cm)</FieldLabel>
        <Input type="number" {...register('tingKolomJpb3', { valueAsNumber: true })} />
      </Field>
      <Field>
        <FieldLabel>Lebar Bentang (cm)</FieldLabel>
        <Input type="number" {...register('lbrBentJpb3', { valueAsNumber: true })} />
      </Field>
      <Field>
        <FieldLabel>Daya Dukung Lantai (kg/m²)</FieldLabel>
        <Input type="number" {...register('dayaDukungLantaiJpb3', { valueAsNumber: true })} />
      </Field>
      <Field>
        <FieldLabel>Keliling Dinding (m)</FieldLabel>
        <Input type="number" {...register('kelilingDindingJpb3', { valueAsNumber: true })} />
      </Field>
      <Field>
        <FieldLabel>Luas Mezzanine (m²)</FieldLabel>
        <Input type="number" {...register('luasMezzanineJpb3', { valueAsNumber: true })} />
      </Field>
    </CardContent>
  </Card>
)}
{(kdJpb === '02' || kdJpb === '09') && (
  <Card>
    <CardHeader><CardTitle>Parameter Komersial / Kantor (JPB-02/09)</CardTitle></CardHeader>
    <CardContent>
      <Field>
        <FieldLabel>Kelas JPB</FieldLabel>
        <Input type="number" {...register('klsJpb2', { valueAsNumber: true })} />
      </Field>
    </CardContent>
  </Card>
)}
{kdJpb === '07' && (
  <Card>
    <CardHeader><CardTitle>Parameter Hotel Berbintang (JPB-07)</CardTitle></CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <Field>
        <FieldLabel>Jenis Hotel</FieldLabel>
        <Input {...register('jnsJpb7')} />
      </Field>
      <Field>
        <FieldLabel>Jumlah Bintang</FieldLabel>
        <Input type="number" {...register('bintangJpb7', { valueAsNumber: true })} />
      </Field>
      <Field>
        <FieldLabel>Jumlah Kamar</FieldLabel>
        <Input type="number" {...register('jmlKmrJpb7', { valueAsNumber: true })} />
      </Field>
      <Field>
        <FieldLabel>Luas Kamar dgn AC Sentral (m²)</FieldLabel>
        <Input type="number" step="0.01" {...register('luasKmrJpb7DgnAcSent')} />
      </Field>
      <Field>
        <FieldLabel>Luas Kamar Lain dgn AC Sentral (m²)</FieldLabel>
        <Input type="number" step="0.01" {...register('luasKmrLainJpb7DgnAcSent')} />
      </Field>
    </CardContent>
  </Card>
)}
{/* Add similar cards for kdJpb === '04', '05', '06', '13', '16' — same pattern */}
```

For JPB 04, 05, 06, 13, 16 — add simple cards with single `kls` input each (same structure as JPB-02/09 above, just different field names and labels).

- [ ] **Step 5.3: Add Fasilitas sub-form card**

After the JPB section, add a fasilitas card. The backend endpoints `lspop.listFasilitas` and `lspop.setFasilitas` already exist.

```tsx
// Add fasilitas state at top of component:
const [fasilitasMap, setFasilitasMap] = useState<Record<string, number>>({})

// Load fasilitas on mount using useQuery:
const { data: fasilitasData } = useQuery(
  orpc.lspop.listFasilitas.queryOptions({ ...nopParts, noBng })
)
const { data: fasilitasMaster } = useQuery(
  orpc.klasifikasi.listFasilitas.queryOptions({})
)

useEffect(() => {
  if (fasilitasData) {
    const map: Record<string, number> = {}
    for (const f of fasilitasData) map[f.kdFasilitas] = f.jmlSatuan
    setFasilitasMap(map)
  }
}, [fasilitasData])

const saveFasilitasMutation = useMutation({
  ...orpc.lspop.setFasilitas.mutationOptions(),
  onSuccess: () => toast.success('Fasilitas berhasil disimpan'),
})

function handleSaveFasilitas() {
  const items = Object.entries(fasilitasMap)
    .filter(([, v]) => v > 0)
    .map(([kdFasilitas, jmlSatuan]) => ({ kdFasilitas, jmlSatuan }))
  saveFasilitasMutation.mutate({ ...nopParts, noBng, fasilitas: items })
}

// In JSX:
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Fasilitas Bangunan</CardTitle>
      <Button size="sm" onClick={handleSaveFasilitas} disabled={saveFasilitasMutation.isPending}>
        Simpan Fasilitas
      </Button>
    </div>
  </CardHeader>
  <CardContent className="grid grid-cols-3 gap-3">
    {(fasilitasMaster ?? []).map((f) => (
      <Field key={f.kdFasilitas}>
        <FieldLabel>{f.namaFasilitas}</FieldLabel>
        <Input
          type="number"
          min={0}
          value={fasilitasMap[f.kdFasilitas] ?? 0}
          onChange={(e) =>
            setFasilitasMap((prev) => ({ ...prev, [f.kdFasilitas]: Number(e.target.value) }))
          }
        />
      </Field>
    ))}
  </CardContent>
</Card>
```

- [ ] **Step 5.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5.5: Test manually**
  - Navigate to a LSPOP edit page
  - Change KD_JPB to '03' — verify JPB-03 fields appear
  - Change KD_JPB to '07' — verify hotel fields appear
  - Verify fasilitas card renders with inputs
  - Save fasilitas — verify network call succeeds

- [ ] **Step 5.6: Commit**

```bash
git add app/(app)/lspop/
git commit -m "feat(lspop): add JPB-conditional parameter fields and fasilitas sub-form"
```

---

## Sub-project 3: Penghapusan Workflow

### Task 6: Penghapusan Drizzle Schema

**Files:**
- Create: `lib/db/schema/penghapusan.ts`
- Modify: `lib/db/schema/index.ts`

- [ ] **Step 6.1: Create `lib/db/schema/penghapusan.ts`**

```typescript
import {
  mysqlTable,
  mysqlEnum,
  int,
  tinyint,
  char,
  varchar,
  text,
  datetime,
  primaryKey,
  foreignKey,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { nopColumns, nopForeignKey } from "./_columns";
import { spop } from "./objek-pajak";

export const datPenghapusan = mysqlTable(
  "dat_penghapusan",
  {
    id: int("ID").autoincrement().primaryKey(),
    ...nopColumns(),
    jenisPenghapusan: tinyint("JENIS_PENGHAPUSAN").notNull(),
    alasan: text("ALASAN").notNull(),
    status: mysqlEnum("STATUS", ["pending", "approved", "rejected"])
      .notNull()
      .default("pending"),
    userPengaju: varchar("USER_PENGAJU", { length: 30 }).notNull(),
    tglPengajuan: datetime("TGL_PENGAJUAN")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    userApprover: varchar("USER_APPROVER", { length: 30 }),
    tglApproval: datetime("TGL_APPROVAL"),
    catatanApprover: text("CATATAN_APPROVER"),
  },
  (table) => [
    nopForeignKey("fk_penghapusan_spop", table, spop),
    index("idx_penghapusan_status").on(table.status),
    index("idx_penghapusan_nop").on(
      table.kdPropinsi, table.kdDati2, table.kdKecamatan,
      table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp,
    ),
  ],
);

export const datPenghapusanSppt = mysqlTable(
  "dat_penghapusan_sppt",
  {
    idPenghapusan: int("ID_PENGHAPUSAN").notNull(),
    ...nopColumns(),
    thnPajakSppt: char("THN_PAJAK_SPPT", { length: 4 }).notNull(),
    namaWp: varchar("NAMA_WP", { length: 100 }),
    njopBumiSppt: int("NJOP_BUMI_SPPT"),
    njopBngSppt: int("NJOP_BNG_SPPT"),
    pbbYgHarusDibayarSppt: int("PBB_YG_HARUS_DIBAYAR_SPPT"),
  },
  (table) => [
    primaryKey({
      columns: [
        table.idPenghapusan,
        table.kdPropinsi, table.kdDati2, table.kdKecamatan,
        table.kdKelurahan, table.kdBlok, table.noUrut, table.kdJnsOp,
        table.thnPajakSppt,
      ],
    }),
    foreignKey({
      name: "fk_penghapusan_sppt_header",
      columns: [table.idPenghapusan],
      foreignColumns: [datPenghapusan.id],
    }),
  ],
);
```

- [ ] **Step 6.2: Add exports to `lib/db/schema/index.ts`**

```typescript
export * from "./penghapusan";
```

- [ ] **Step 6.3: Generate and run migration**

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

- [ ] **Step 6.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 6.5: Commit**

```bash
git add lib/db/schema/penghapusan.ts lib/db/schema/index.ts
git add drizzle/
git commit -m "feat(penghapusan): add dat_penghapusan schema and migration"
```

---

### Task 7: Penghapusan oRPC Router

**Files:**
- Create: `lib/orpc/routers/penghapusan.ts`
- Modify: `lib/orpc/server.ts`

- [ ] **Step 7.1: Create `lib/orpc/routers/penghapusan.ts`**

```typescript
import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import {
  datPenghapusan, datPenghapusanSppt, sppt, spop, pbbUserProfile,
} from "@/lib/db/schema"
import { eq, and, lt, sql } from "drizzle-orm"
import { ORPCError } from "@orpc/server"

const nopInput = z.object({
  kdPropinsi: z.string().length(2),
  kdDati2: z.string().length(2),
  kdKecamatan: z.string().length(3),
  kdKelurahan: z.string().length(3),
  kdBlok: z.string().length(3),
  noUrut: z.string().length(4),
  kdJnsOp: z.string().length(1),
})

async function assertSupervisor(context: { session: { user: { id: string } } | null }) {
  if (!context.session?.user) throw new ORPCError({ code: 'UNAUTHORIZED' })
  const profile = await db.query.pbbUserProfile.findFirst({
    where: eq(pbbUserProfile.userId, context.session.user.id),
  })
  // Adjust 'OPR' to match the actual HAK_AKSES value for basic operators
  if (!profile || profile.hakAkses === 'OPR') {
    throw new ORPCError({
      code: 'FORBIDDEN',
      message: 'Hanya supervisor yang dapat menyetujui penghapusan',
    })
  }
}

export const penghapusanRouter = os.router({
  list: os
    .input(z.object({
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(20),
    }))
    .handler(async ({ input }) => {
      const offset = (input.page - 1) * input.limit
      const conditions = []
      if (input.status) conditions.push(eq(datPenghapusan.status, input.status))

      const rows = await db.select().from(datPenghapusan)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(datPenghapusan.tglPengajuan)
        .limit(input.limit)
        .offset(offset)

      const [{ total }] = await db
        .select({ total: sql<number>`COUNT(*)` })
        .from(datPenghapusan)
        .where(conditions.length ? and(...conditions) : undefined)

      return { rows, total }
    }),

  getDetail: os
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      const [header] = await db.select().from(datPenghapusan)
        .where(eq(datPenghapusan.id, input.id))
      if (!header) return null

      const spptRows = await db.select().from(datPenghapusanSppt)
        .where(eq(datPenghapusanSppt.idPenghapusan, input.id))

      return { header, spptRows }
    }),

  create: os
    .input(nopInput.extend({
      jenisPenghapusan: z.number().int().min(1).max(6),
      alasan: z.string().min(10),
    }))
    .handler(async ({ input, context }) => {
      if (!context.session?.user) throw new ORPCError({ code: 'UNAUTHORIZED' })

      // Validate NOP exists
      const [existing] = await db.select().from(spop)
        .where(and(
          eq(spop.kdPropinsi, input.kdPropinsi),
          eq(spop.kdDati2, input.kdDati2),
          eq(spop.kdKecamatan, input.kdKecamatan),
          eq(spop.kdKelurahan, input.kdKelurahan),
          eq(spop.kdBlok, input.kdBlok),
          eq(spop.noUrut, input.noUrut),
          eq(spop.kdJnsOp, input.kdJnsOp),
        ))
      if (!existing) throw new ORPCError({ code: 'NOT_FOUND', message: 'NOP tidak ditemukan' })

      // Uniqueness guard — no duplicate pending for same NOP
      const [dupCheck] = await db
        .select({ id: datPenghapusan.id })
        .from(datPenghapusan)
        .where(and(
          eq(datPenghapusan.kdPropinsi, input.kdPropinsi),
          eq(datPenghapusan.kdDati2, input.kdDati2),
          eq(datPenghapusan.kdKecamatan, input.kdKecamatan),
          eq(datPenghapusan.kdKelurahan, input.kdKelurahan),
          eq(datPenghapusan.kdBlok, input.kdBlok),
          eq(datPenghapusan.noUrut, input.noUrut),
          eq(datPenghapusan.kdJnsOp, input.kdJnsOp),
          eq(datPenghapusan.status, 'pending'),
        ))
      if (dupCheck) throw new ORPCError({
        code: 'CONFLICT',
        message: 'Sudah ada pengajuan penghapusan yang menunggu persetujuan untuk NOP ini',
      })

      // Snapshot SPPT rows
      const currentYear = new Date().getFullYear()
      const spptConditions = [
        eq(sppt.kdPropinsi, input.kdPropinsi),
        eq(sppt.kdDati2, input.kdDati2),
        eq(sppt.kdKecamatan, input.kdKecamatan),
        eq(sppt.kdKelurahan, input.kdKelurahan),
        eq(sppt.kdBlok, input.kdBlok),
        eq(sppt.noUrut, input.noUrut),
        eq(sppt.kdJnsOp, input.kdJnsOp),
        eq(sppt.statusPembayaranSppt, '0'),  // char(1) column — use string '0'
      ]
      if (input.jenisPenghapusan === 6) {
        spptConditions.push(lt(sppt.thnPajakSppt, String(currentYear - 5)))
      }

      const spptRows = await db.select().from(sppt).where(and(...spptConditions))

      // Insert penghapusan header
      const [{ insertId }] = await db.insert(datPenghapusan).values({
        kdPropinsi: input.kdPropinsi,
        kdDati2: input.kdDati2,
        kdKecamatan: input.kdKecamatan,
        kdKelurahan: input.kdKelurahan,
        kdBlok: input.kdBlok,
        noUrut: input.noUrut,
        kdJnsOp: input.kdJnsOp,
        jenisPenghapusan: input.jenisPenghapusan,
        alasan: input.alasan,
        status: 'pending',
        userPengaju: context.session.user.id,
        tglPengajuan: new Date(),
      })

      // Snapshot SPPT
      if (spptRows.length > 0) {
        await db.insert(datPenghapusanSppt).values(
          spptRows.map((s) => ({
            idPenghapusan: Number(insertId),
            kdPropinsi: s.kdPropinsi,
            kdDati2: s.kdDati2,
            kdKecamatan: s.kdKecamatan,
            kdKelurahan: s.kdKelurahan,
            kdBlok: s.kdBlok,
            noUrut: s.noUrut,
            kdJnsOp: s.kdJnsOp,
            thnPajakSppt: String(s.thnPajakSppt),  // YEAR type → string for char(4) column
            namaWp: s.nmWp ?? null,                  // actual Drizzle field: nmWp
            njopBumiSppt: s.njopBumi ?? null,         // actual Drizzle field: njopBumi
            njopBngSppt: s.njopBng ?? null,           // actual Drizzle field: njopBng
            pbbYgHarusDibayarSppt: s.pbbYgHarusDibayarSppt ?? null,
          })),
        )
      }

      return { success: true, id: Number(insertId) }
    }),

  approve: os
    .input(z.object({ id: z.number(), catatan: z.string().optional() }))
    .handler(async ({ input, context }) => {
      await assertSupervisor(context as { session: { user: { id: string } } | null })

      const [request] = await db.select().from(datPenghapusan)
        .where(eq(datPenghapusan.id, input.id))
      if (!request) throw new ORPCError({ code: 'NOT_FOUND' })
      if (request.status !== 'pending') throw new ORPCError({
        code: 'CONFLICT', message: 'Pengajuan sudah diproses',
      })

      const nopWhere = and(
        eq(spop.kdPropinsi, request.kdPropinsi),
        eq(spop.kdDati2, request.kdDati2),
        eq(spop.kdKecamatan, request.kdKecamatan),
        eq(spop.kdKelurahan, request.kdKelurahan),
        eq(spop.kdBlok, request.kdBlok),
        eq(spop.noUrut, request.noUrut),
        eq(spop.kdJnsOp, request.kdJnsOp),
      )
      const spptWhere = and(
        eq(sppt.kdPropinsi, request.kdPropinsi),
        eq(sppt.kdDati2, request.kdDati2),
        eq(sppt.kdKecamatan, request.kdKecamatan),
        eq(sppt.kdKelurahan, request.kdKelurahan),
        eq(sppt.kdBlok, request.kdBlok),
        eq(sppt.noUrut, request.noUrut),
        eq(sppt.kdJnsOp, request.kdJnsOp),
        eq(sppt.statusPembayaranSppt, '0'),  // char(1) column — use string '0'
      )

      // Execute deletion based on jenis
      if (request.jenisPenghapusan === 1) {
        // Fasum: set JNS_BUMI='4', delete unpaid SPPT
        await db.update(spop).set({ jnsBumi: '4' }).where(nopWhere)
        await db.delete(sppt).where(spptWhere)
      } else if (request.jenisPenghapusan === 6) {
        // Kadaluarsa: delete only SPPT > 5 years old
        const currentYear = new Date().getFullYear()
        await db.delete(sppt).where(and(
          spptWhere,
          lt(sppt.thnPajakSppt, currentYear - 5),  // YEAR type is number
        ))
      } else {
        // Others: set JNS_TRANSAKSI_OP='3', delete unpaid SPPT
        await db.update(spop).set({ jnsTransaksiOp: '3' }).where(nopWhere)
        await db.delete(sppt).where(spptWhere)
      }

      // Update request status
      await db.update(datPenghapusan)
        .set({
          status: 'approved',
          userApprover: context.session!.user.id,
          tglApproval: new Date(),
          catatanApprover: input.catatan ?? null,
        })
        .where(eq(datPenghapusan.id, input.id))

      return { success: true }
    }),

  reject: os
    .input(z.object({ id: z.number(), catatan: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      await assertSupervisor(context as { session: { user: { id: string } } | null })

      await db.update(datPenghapusan)
        .set({
          status: 'rejected',
          userApprover: context.session!.user.id,
          tglApproval: new Date(),
          catatanApprover: input.catatan,
        })
        .where(eq(datPenghapusan.id, input.id))

      return { success: true }
    }),
})
```

> **Note:** The exact column names for `sppt` fields like `statusPembayaranSppt`, `thnPajakSppt`, `nmWpSppt`, `njopBumiSppt`, `njopBngSppt`, `pbbYgHarusDibayarSppt` must match what's in `lib/db/schema/sppt.ts`. The `spop` fields `jnsBumi` and `jnsTransaksiOp` must match `lib/db/schema/objek-pajak.ts`. Verify these before running.

- [ ] **Step 7.2: Register router in `lib/orpc/server.ts`**

```typescript
import { penghapusanRouter } from "./routers/penghapusan"
// ...
penghapusan: penghapusanRouter,
```

- [ ] **Step 7.3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Fix any column name mismatches by checking the actual schema files.

- [ ] **Step 7.4: Commit**

```bash
git add lib/orpc/routers/penghapusan.ts lib/orpc/server.ts
git commit -m "feat(penghapusan): add 2-level approval workflow oRPC router"
```

---

### Task 8: Penghapusan UI Pages

**Files:**
- Create: `app/(app)/penghapusan/page.tsx`
- Create: `app/(app)/penghapusan/baru/page.tsx`
- Modify: `components/layouts/app-sidebar.tsx`

- [ ] **Step 8.1: Create `app/(app)/penghapusan/page.tsx`**

```tsx
'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

const JENIS_PENGHAPUSAN: Record<number, string> = {
  1: 'Fasilitas Umum', 2: 'Pemecahan/Pemisahan', 3: 'Penggabungan',
  4: 'Kesalahan Administrasi', 5: 'Lainnya', 6: 'Piutang Kadaluarsa',
}

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: 'Menunggu', variant: 'secondary' },
  approved: { label: 'Disetujui', variant: 'default' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

export default function PenghapusanPage() {
  const orpc = useORPC()
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>(undefined)
  const [approveId, setApproveId] = useState<number | null>(null)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [catatan, setCatatan] = useState('')

  const { data } = useQuery(
    orpc.penghapusan.list.queryOptions({ status: statusFilter, page: 1, limit: 50 })
  )

  const approveMutation = useMutation({
    ...orpc.penghapusan.approve.mutationOptions(),
    onSuccess: () => {
      toast.success('Penghapusan disetujui')
      setApproveId(null)
      setCatatan('')
      qc.invalidateQueries({ queryKey: orpc.penghapusan.list.queryOptions({}).queryKey })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const rejectMutation = useMutation({
    ...orpc.penghapusan.reject.mutationOptions(),
    onSuccess: () => {
      toast.success('Penghapusan ditolak')
      setRejectId(null)
      setCatatan('')
      qc.invalidateQueries({ queryKey: orpc.penghapusan.list.queryOptions({}).queryKey })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Penghapusan NOP</h1>
        <Button asChild>
          <Link href="/penghapusan/baru">
            <Plus className="mr-2 h-4 w-4" /> Ajukan Penghapusan
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(statusFilter === s ? undefined : s)}
          >
            {STATUS_BADGE[s].label}
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NOP</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Alasan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tgl Pengajuan</TableHead>
            <TableHead>Pengaju</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data?.rows ?? []).map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-sm">
                {`${row.kdPropinsi}.${row.kdDati2}.${row.kdKecamatan}.${row.kdKelurahan}.${row.kdBlok}.${row.noUrut}.${row.kdJnsOp}`}
              </TableCell>
              <TableCell>{JENIS_PENGHAPUSAN[row.jenisPenghapusan]}</TableCell>
              <TableCell className="max-w-48 truncate">{row.alasan}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE[row.status].variant}>
                  {STATUS_BADGE[row.status].label}
                </Badge>
              </TableCell>
              <TableCell>
                {row.tglPengajuan
                  ? format(new Date(row.tglPengajuan), 'dd MMM yyyy', { locale: localeId })
                  : '-'}
              </TableCell>
              <TableCell>{row.userPengaju}</TableCell>
              <TableCell>
                {row.status === 'pending' && (
                  <div className="flex gap-1">
                    <AlertDialog open={approveId === row.id} onOpenChange={(o) => !o && setApproveId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="outline" onClick={() => setApproveId(row.id)}>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Setujui Penghapusan?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus data SPPT dan mengubah status SPOP secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea placeholder="Catatan (opsional)" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate({ id: row.id, catatan: catatan || undefined })}
                          >
                            Setujui
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog open={rejectId === row.id} onOpenChange={(o) => !o && setRejectId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="outline" onClick={() => setRejectId(row.id)}>
                          <XCircle className="h-4 w-4 text-red-600" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tolak Penghapusan?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <Textarea placeholder="Alasan penolakan (wajib)" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => rejectMutation.mutate({ id: row.id, catatan })}
                          >
                            Tolak
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 8.2: Create `app/(app)/penghapusan/baru/page.tsx`**

```tsx
'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Field, FieldLabel, FieldMessage } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { parseNop } from '@/lib/utils/nop'

const schema = z.object({
  nop: z.string().length(18, 'NOP harus 18 karakter'),
  jenisPenghapusan: z.coerce.number().int().min(1).max(6),
  alasan: z.string().min(10, 'Alasan minimal 10 karakter'),
})

const JENIS_OPTIONS = [
  { value: 1, label: 'Fasilitas Umum' },
  { value: 2, label: 'Pemecahan/Pemisahan' },
  { value: 3, label: 'Penggabungan' },
  { value: 4, label: 'Kesalahan Administrasi' },
  { value: 5, label: 'Lainnya' },
  { value: 6, label: 'Piutang Kadaluarsa (> 5 tahun)' },
]

export default function PenghapusanBaruPage() {
  const orpc = useORPC()
  const router = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    ...orpc.penghapusan.create.mutationOptions(),
    onSuccess: () => {
      toast.success('Pengajuan penghapusan berhasil dikirim')
      router.push('/penghapusan')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function onSubmit(data: z.infer<typeof schema>) {
    const nopParts = parseNop(data.nop)  // lib/utils/nop.ts — returns NopParts | null
    if (!nopParts) {
      toast.error('Format NOP tidak valid')
      return
    }
    createMutation.mutate({
      ...nopParts,
      jenisPenghapusan: data.jenisPenghapusan,
      alasan: data.alasan,
    })
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold">Ajukan Penghapusan NOP</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field>
          <FieldLabel>NOP (18 karakter tanpa titik)</FieldLabel>
          <Input
            {...register('nop')}
            placeholder="1234567890123456789"
            maxLength={18}
            className="font-mono"
          />
          <FieldMessage>{errors.nop?.message}</FieldMessage>
        </Field>

        <Field>
          <FieldLabel>Jenis Penghapusan</FieldLabel>
          <Select onValueChange={(v) => setValue('jenisPenghapusan', Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              {JENIS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldMessage>{errors.jenisPenghapusan?.message}</FieldMessage>
        </Field>

        <Field>
          <FieldLabel>Alasan Penghapusan</FieldLabel>
          <Textarea
            {...register('alasan')}
            rows={4}
            placeholder="Jelaskan alasan penghapusan..."
          />
          <FieldMessage>{errors.alasan?.message}</FieldMessage>
        </Field>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            Ajukan Penghapusan
          </Button>
        </div>
      </form>
    </div>
  )
}
```

> **Note:** `parseNop` must exist in `lib/utils/nop.ts`. Check the existing exports — there should be a function that splits an 18-char NOP string into the 7 parts. If it doesn't exist, add it.

- [ ] **Step 8.3: Add Penghapusan to sidebar in `components/layouts/app-sidebar.tsx`**

```typescript
// Add to navMain array (after Pemekaran or in a suitable position):
{
  title: "Penghapusan",
  url: "/penghapusan",
  icon: <Trash2 />,  // import Trash2 from lucide-react
},
```

- [ ] **Step 8.4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 8.5: Test manually**
  - Navigate to `/penghapusan` — list page renders
  - Navigate to `/penghapusan/baru` — form renders
  - Submit an invalid form — verify errors show
  - Submit a valid NOP and alasan — verify request is created

- [ ] **Step 8.6: Commit**

```bash
git add app/(app)/penghapusan/ components/layouts/app-sidebar.tsx
git commit -m "feat(penghapusan): add list page and submission form for 2-level NOP deletion approval"
```

---

## Sub-project 4: Berita Acara PDF

### Task 9: Berita Acara PDF Generator

**Files:**
- Create: `lib/utils/pdf/berita-acara-generator.ts`

- [ ] **Step 9.1: Create `lib/utils/pdf/berita-acara-generator.ts`**

```typescript
'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export interface BeritaAcaraData {
  pelayanan: {
    noPelayanan: string
    namaJenisPelayanan: string
    tanggalPelayanan: string       // YYYY-MM-DD
    namaPemohon: string
    alamatPemohon: string
    letakOp: string
    nop?: string                   // formatted NOP e.g. "12.34.567.890.123.0001.0"
    keterangan: string
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
  mutasi?: {
    ltSebelum: number; lbSebelum: number; pbbSebelum: number
    ltSesudah: number; lbSesudah: number; pbbSesudah: number
  }
}

function fmtRp(v: number) {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(v))
}

function buildBase(data: BeritaAcaraData): jsPDF {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const { pelayanan, dokumen, instansi } = data
  let y = 15

  // Kop surat
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(instansi.nmInstansi, 105, y, { align: 'center' })
  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(instansi.alamatInstansi, 105, y, { align: 'center' })
  y += 4
  doc.setLineWidth(0.5)
  doc.line(15, y, 195, y)
  y += 6

  // Title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BERITA ACARA PELAYANAN', 105, y, { align: 'center' })
  y += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nomor: BA-${pelayanan.noPelayanan}`, 105, y, { align: 'center' })
  y += 8

  // Opening text
  const tglPanjang = format(new Date(pelayanan.tanggalPelayanan), "EEEE, dd MMMM yyyy", { locale: localeId })
  doc.setFontSize(10)
  const opening = `Pada hari ini, ${tglPanjang}, kami yang bertanda tangan di bawah ini telah melakukan pelayanan sebagai berikut:`
  const lines = doc.splitTextToSize(opening, 175)
  doc.text(lines, 15, y)
  y += lines.length * 5 + 4

  // Data pelayanan table
  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      ['No. Berkas', ':', pelayanan.noPelayanan],
      ['Jenis Pelayanan', ':', pelayanan.namaJenisPelayanan],
      ['NOP', ':', pelayanan.nop ?? '-'],
      ['Nama Pemohon', ':', pelayanan.namaPemohon],
      ['Alamat Pemohon', ':', pelayanan.alamatPemohon],
      ['Letak Objek Pajak', ':', pelayanan.letakOp],
    ],
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 1 },
    columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 6 }, 2: { cellWidth: 120 } },
    margin: { left: 15, right: 15 },
  })
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

  // Dokumen checklist
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Dokumen yang Diterima:', 15, y)
  y += 4
  autoTable(doc, {
    startY: y,
    head: [['No', 'Dokumen', 'Keterangan']],
    body: dokumen.map((d, i) => [i + 1, d.namaDokumen, d.ada ? '✓ Ada' : '— Tidak Ada']),
    theme: 'striped',
    headStyles: { fillColor: [220, 220, 220], textColor: 0, fontSize: 9 },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 10 }, 2: { cellWidth: 30 } },
    margin: { left: 15, right: 15 },
  })
  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6

  // Hasil penelitian
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Hasil Penelitian:', 15, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  const hasilLines = doc.splitTextToSize(pelayanan.keterangan || '-', 175)
  doc.text(hasilLines, 15, y)
  y += hasilLines.length * 5 + 8

  // Signature block
  const sigY = Math.max(y, 230)
  doc.setFontSize(9)
  // Col1: Pemohon (left)
  doc.text('Pemohon,', 25, sigY, { align: 'center' })
  doc.text('', 25, sigY + 20, { align: 'center' }) // blank for signature
  doc.text(pelayanan.namaPemohon, 25, sigY + 25, { align: 'center' })

  // Col2: Petugas Penerima (center)
  doc.text(pelayanan.ttdKiriJabatan || 'Petugas Penerima,', 105, sigY, { align: 'center' })
  doc.text(pelayanan.ttdKiriNama || pelayanan.namaPetugasPenerima, 105, sigY + 25, { align: 'center' })
  if (pelayanan.ttdKiriNip || pelayanan.nipPetugasPenerima) {
    doc.text(`NIP. ${pelayanan.ttdKiriNip || pelayanan.nipPetugasPenerima}`, 105, sigY + 30, { align: 'center' })
  }

  // Col3: Kanan (right)
  doc.text(pelayanan.ttdKananJabatan || 'Mengetahui,', 180, sigY, { align: 'center' })
  doc.text(pelayanan.ttdKananNama, 180, sigY + 25, { align: 'center' })
  if (pelayanan.ttdKananNip) {
    doc.text(`NIP. ${pelayanan.ttdKananNip}`, 180, sigY + 30, { align: 'center' })
  }

  return doc
}

export function generateBeritaAcara(data: BeritaAcaraData): void {
  const doc = buildBase(data)
  doc.save(`BA-${data.pelayanan.noPelayanan}.pdf`)
}

export function generateBeritaAcaraDetail(data: BeritaAcaraData): void {
  if (!data.mutasi) return
  const doc = buildBase(data)

  // Add before/after page
  doc.addPage()
  let y = 20

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BERITA ACARA DETAIL — Data Sebelum dan Sesudah', 105, y, { align: 'center' })
  y += 10

  const { mutasi } = data
  autoTable(doc, {
    startY: y,
    head: [['Uraian', 'Sebelum', 'Sesudah']],
    body: [
      ['Luas Tanah (m²)', mutasi.ltSebelum.toLocaleString('id-ID'), mutasi.ltSesudah.toLocaleString('id-ID')],
      ['Luas Bangunan (m²)', mutasi.lbSebelum.toLocaleString('id-ID'), mutasi.lbSesudah.toLocaleString('id-ID')],
      ['PBB Terhutang', fmtRp(mutasi.pbbSebelum), fmtRp(mutasi.pbbSesudah)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontSize: 10 },
    styles: { fontSize: 10 },
    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
    margin: { left: 15, right: 15 },
  })

  doc.save(`BA-Detail-${data.pelayanan.noPelayanan}.pdf`)
}
```

- [ ] **Step 9.2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 9.3: Commit**

```bash
git add lib/utils/pdf/berita-acara-generator.ts
git commit -m "feat(pelayanan): add Berita Acara PDF generator (standard + detail variants)"
```

---

### Task 10: Berita Acara UI Page

**Files:**
- Create: `app/(app)/pelayanan/[no]/berita-acara/page.tsx`
- Modify: `app/(app)/pelayanan/[no]/page.tsx`
- Verify: `lib/orpc/routers/pelayanan.ts` has `getDokumen` endpoint

- [ ] **Step 10.1: Check if `pelayanan.getDokumen` exists in the router**

Open `lib/orpc/routers/pelayanan.ts` and search for `getDokumen`. If missing, add:

```typescript
getDokumen: os
  .input(z.object({ noPelayanan: z.string() }))
  .handler(async ({ input }) => {
    return db.select().from(pelayananDokumen)
      .where(eq(pelayananDokumen.noPelayanan, input.noPelayanan))
      .orderBy(pelayananDokumen.dokumenId)
  }),
```

Also confirm there's a `getMutasi` endpoint. If missing, add:

```typescript
getMutasi: os
  .input(z.object({ noPelayanan: z.string() }))
  .handler(async ({ input }) => {
    const [row] = await db.select().from(historiMutasi)
      .where(eq(historiMutasi.noPelayanan, input.noPelayanan))
      .orderBy(desc(historiMutasi.tglMutasi))
      .limit(1)
    return row ?? null
  }),
```

- [ ] **Step 10.2: Create `app/(app)/pelayanan/[no]/berita-acara/page.tsx`**

```tsx
import React from 'react'
import { BeritaAcaraClient } from './client'
import { db } from '@/lib/db'
import { pelayanan, pelayananDokumen, historiMutasi, konfigurasi as konfigurasiTable } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { formatNop } from '@/lib/utils/nop'
import { notFound } from 'next/navigation'

// Hardcoded dokumen names matching the 15-item legacy checklist
const DOKUMEN_NAMES: Record<number, string> = {
  1: 'Fotokopi KTP Pemohon',
  2: 'Fotokopi SPPT PBB',
  3: 'Fotokopi STTS/Bukti Bayar PBB',
  4: 'Fotokopi Sertifikat/Surat Tanah',
  5: 'Fotokopi IMB',
  6: 'Surat Kuasa (jika dikuasakan)',
  7: 'Fotokopi Akta Jual Beli',
  8: 'Fotokopi Akta Hibah',
  9: 'Fotokopi Akta Waris',
  10: 'Surat Keterangan Ahli Waris',
  11: 'Fotokopi BPHTB',
  12: 'Gambar Situasi/Denah Bangunan',
  13: 'Surat Permohonan',
  14: 'SPOP Terisi',
  15: 'LSPOP Terisi',
}

export default async function BeritaAcaraPage({ params }: { params: { no: string } }) {
  const [pel] = await db.select().from(pelayanan)
    .where(eq(pelayanan.noPelayanan, params.no))
  if (!pel) notFound()

  const dokumenRows = await db.select().from(pelayananDokumen)
    .where(eq(pelayananDokumen.noPelayanan, params.no))

  const dokumen = Object.entries(DOKUMEN_NAMES).map(([id, name]) => ({
    dokumenId: Number(id),
    namaDokumen: name,
    ada: dokumenRows.some((d) => d.dokumenId === Number(id)),
  }))

  const [mutasiRow] = await db.select().from(historiMutasi)
    .where(eq(historiMutasi.noPelayanan, params.no))
    .orderBy(desc(historiMutasi.tglMutasi))
    .limit(1)

  const instansiRows = await db.select()
    .from(konfigurasiTable)
    .where(eq(konfigurasiTable.nama, 'NM_INSTANSI'))
    .limit(1)
  const alamatRows = await db.select()
    .from(konfigurasiTable)
    .where(eq(konfigurasiTable.nama, 'ALAMAT_INSTANSI'))
    .limit(1)

  const nopParts = pel.kdPropinsi ? {
    kdPropinsi: pel.kdPropinsi!, kdDati2: pel.kdDati2!, kdKecamatan: pel.kdKecamatan!,
    kdKelurahan: pel.kdKelurahan!, kdBlok: pel.kdBlok!, noUrut: pel.noUrut!, kdJnsOp: pel.kdJnsOp!,
  } : null

  return (
    <BeritaAcaraClient
      pelayanan={{
        noPelayanan: pel.noPelayanan,
        namaJenisPelayanan: pel.kdJnsPelayanan,  // ideally join to ref_jns_pelayanan for name
        tanggalPelayanan: pel.tanggalPelayanan?.toISOString().slice(0, 10) ?? '',
        namaPemohon: pel.namaPemohon ?? '',
        alamatPemohon: pel.alamatPemohon ?? '',
        letakOp: pel.letakOp ?? '',
        nop: nopParts ? formatNop(nopParts) : undefined,
        keterangan: pel.keterangan ?? '',
        namaPetugasPenerima: pel.namaPetugasPenerima ?? '',
        nipPetugasPenerima: pel.nipPetugasPenerima ?? '',
        ttdKiriJabatan: pel.ttdKiriJabatan ?? '',
        ttdKiriNama: pel.ttdKiriNama ?? '',
        ttdKiriNip: pel.ttdKiriNip ?? '',
        ttdKananJabatan: pel.ttdKananJabatan ?? '',
        ttdKananNama: pel.ttdKananNama ?? '',
        ttdKananNip: pel.ttdKananNip ?? '',
      }}
      dokumen={dokumen}
      instansi={{
        nmInstansi: instansiRows[0]?.nilai?.toString() ?? 'Badan Pendapatan Daerah',  // nilai is longblob → Buffer → toString()
        alamatInstansi: alamatRows[0]?.nilai?.toString() ?? '',
      }}
      mutasi={mutasiRow ? {
        ltSebelum: Number(mutasiRow.ltSebelum ?? 0),
        lbSebelum: Number(mutasiRow.lbSebelum ?? 0),
        pbbSebelum: Number(mutasiRow.pbbSebelum ?? 0),
        ltSesudah: Number(mutasiRow.ltSesudah ?? 0),
        lbSesudah: Number(mutasiRow.lbSesudah ?? 0),
        pbbSesudah: Number(mutasiRow.pbbSesudah ?? 0),
      } : undefined}
    />
  )
}
```

> **Note:** `konfigurasi.nilai` — check the actual column name in `lib/db/schema/konfigurasi.ts`. It may be `nilai` or `value` or `isi`.

- [ ] **Step 10.3: Create `app/(app)/pelayanan/[no]/berita-acara/client.tsx`**

```tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Download } from 'lucide-react'
import {
  generateBeritaAcara,
  generateBeritaAcaraDetail,
  type BeritaAcaraData,
} from '@/lib/utils/pdf/berita-acara-generator'

export function BeritaAcaraClient(data: BeritaAcaraData) {
  return (
    <div className="p-6 max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Berita Acara Pelayanan</h1>
      <p className="text-sm text-muted-foreground">
        No. Berkas: <span className="font-mono font-medium">{data.pelayanan.noPelayanan}</span>
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Berita Acara Standar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Dokumen resmi pelayanan lengkap dengan checklist dan tanda tangan.
            </p>
            <Button onClick={() => generateBeritaAcara(data)} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Cetak BA
            </Button>
          </CardContent>
        </Card>

        {data.mutasi && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Berita Acara Detail</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Termasuk perbandingan data sebelum dan sesudah mutasi.
              </p>
              <Button
                variant="outline"
                onClick={() => generateBeritaAcaraDetail(data)}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" /> Cetak BA Detail
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 10.4: Add "Berita Acara" button to pelayanan detail page**

Open `app/(app)/pelayanan/[no]/page.tsx`, find the existing action buttons (Cetak, Verifikasi, etc.) and add:

```tsx
<Button asChild variant="outline">
  <Link href={`/pelayanan/${params.no}/berita-acara`}>
    <FileText className="mr-2 h-4 w-4" />
    Berita Acara
  </Link>
</Button>
```

- [ ] **Step 10.5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Fix any column name issues from `konfigurasi.ts` (check actual column name for the value field).

- [ ] **Step 10.6: Test manually**
  - Navigate to a pelayanan detail page
  - Click "Berita Acara" button — verify navigation to BA page
  - Click "Cetak BA" — verify PDF downloads
  - If mutasi exists: click "Cetak BA Detail" — verify second page in PDF

- [ ] **Step 10.7: Commit**

```bash
git add app/(app)/pelayanan/[no]/berita-acara/ app/(app)/pelayanan/[no]/page.tsx
git add lib/orpc/routers/pelayanan.ts  # if getDokumen/getMutasi were added
git commit -m "feat(pelayanan): add Berita Acara cetak page with standard and detail PDF variants"
```

---

## Final Verification

- [ ] **Build check**

```bash
npm run build
```

Expected: builds successfully with no TypeScript errors.

- [ ] **Final commit summary**

After all tasks complete, verify the following routes work:
- `/pengaturan/dbkb` — DBKB management ✓
- `/lspop/{nop}/{noBng}` — JPB fields + fasilitas card visible ✓
- After LSPOP save — NILAI_SISTEM_BNG populated in DB ✓
- `/penghapusan` — list with approve/reject buttons ✓
- `/penghapusan/baru` — submission form ✓
- `/pelayanan/{no}/berita-acara` — BA download page ✓
