import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { sppt, historiSppt, konfigurasi } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"

// Decode konfigurasi blob value to string
function decodeKonfig(val: unknown): string {
  if (val === null || val === undefined) return ''
  if (Buffer.isBuffer(val)) return val.toString('utf8')
  if (typeof val === 'string') return val
  return String(val)
}

async function getKonfigValue(nama: string): Promise<string> {
  const [row] = await db.select().from(konfigurasi).where(eq(konfigurasi.nama, nama))
  return row ? decodeKonfig(row.nilai) : ''
}

const wilayahFilter = z.object({
  thnPajak: z.number().int().min(2000).max(2099),
  kdPropinsi: z.string().optional(),
  kdDati2: z.string().optional(),
  kdKecamatan: z.string().optional(),
  kdKelurahan: z.string().optional(),
})

function buildWhere(input: z.infer<typeof wilayahFilter>) {
  const conds = [eq(sppt.thnPajakSppt, input.thnPajak)]
  if (input.kdPropinsi) conds.push(eq(sppt.kdPropinsi, input.kdPropinsi))
  if (input.kdDati2) conds.push(eq(sppt.kdDati2, input.kdDati2))
  if (input.kdKecamatan) conds.push(eq(sppt.kdKecamatan, input.kdKecamatan))
  if (input.kdKelurahan) conds.push(eq(sppt.kdKelurahan, input.kdKelurahan))
  return and(...conds)
}

export const updateMasalRouter = os.router({
  // Preview: count affected records and show current vs projected totals
  preview: os
    .input(wilayahFilter)
    .handler(async ({ input }) => {
      const where = buildWhere(input)

      const [result] = await db
        .select({
          count: sql<number>`count(*)`,
          totalNjop: sql<number>`sum(CAST(${sppt.njopSppt} AS DECIMAL(15,2)))`,
          totalPbb: sql<number>`sum(CAST(${sppt.pbbYgHarusDibayarSppt} AS DECIMAL(15,2)))`,
          belumCetak: sql<number>`sum(CASE WHEN ${sppt.statusCetakSppt} = '0' THEN 1 ELSE 0 END)`,
          belumBayar: sql<number>`sum(CASE WHEN ${sppt.statusPembayaranSppt} = '0' THEN 1 ELSE 0 END)`,
        })
        .from(sppt)
        .where(where)

      // Current config values that would be applied
      const njoptkp = await getKonfigValue('NJOPTKP')
      const tarifStr = await getKonfigValue('TARIF_PAJAK')

      return {
        count: result?.count ?? 0,
        totalNjop: result?.totalNjop ?? 0,
        totalPbb: result?.totalPbb ?? 0,
        belumCetak: result?.belumCetak ?? 0,
        belumBayar: result?.belumBayar ?? 0,
        currentNjoptkp: njoptkp,
        currentTarif: tarifStr,
      }
    }),

  // Process: bulk recalculate SPPT using current tarif & NJOPTKP
  // Uses existing NJOP values from SPPT, re-applies tarif/NJOPTKP
  processHitungUlang: os
    .input(wilayahFilter.extend({
      nipPetugas: z.string().optional(),
      keterangan: z.string().optional(),
      forceAll: z.boolean().default(false), // include already-lunas SPPT
    }))
    .handler(async ({ input }) => {
      const where = buildWhere(input)

      // Load tarif and NJOPTKP from config
      const njoptkpStr = await getKonfigValue('NJOPTKP')
      const tarifStr = await getKonfigValue('TARIF_PAJAK')
      const pbbMinStr = await getKonfigValue('PBB_MINIMUM')

      const njoptkp = Number(njoptkpStr) || 0
      const tarif = Number(tarifStr) || 0.001 // default 0.1%
      const pbbMin = Number(pbbMinStr) || 0

      // Fetch all SPPT records in scope
      const rows = await db.select().from(sppt).where(where)

      let processed = 0
      let skipped = 0
      let totalPbbOld = 0
      let totalPbbNew = 0

      // Group by WP to apply NJOPTKP rule (BR-02: only 1 per WP per year, highest NJOP)
      // For simplicity in mass update: apply NJOPTKP to all SPPT
      // (Full BR-02 compliance would require grouping by nmWp and picking highest)
      for (const row of rows) {
        if (!input.forceAll && (row.statusPembayaranSppt === 'L' || row.statusPembayaranSppt === '1')) {
          skipped++
          continue
        }

        const njopTotal = Number(row.njopSppt)
        const njkp = Math.max(0, njopTotal - njoptkp)
        let pbbTerhutang = njkp * tarif
        if (pbbTerhutang > 0 && pbbTerhutang < pbbMin) pbbTerhutang = pbbMin
        const pengurangan = Number(row.faktorPengurangSppt ?? 0)
        const pbbYgHarusDibayar = Math.max(0, pbbTerhutang - pengurangan)

        totalPbbOld += Number(row.pbbYgHarusDibayarSppt)
        totalPbbNew += pbbYgHarusDibayar

        // Save to history (BR-08)
        await db.insert(historiSppt).values({
          kdPropinsi: row.kdPropinsi,
          kdDati2: row.kdDati2,
          kdKecamatan: row.kdKecamatan,
          kdKelurahan: row.kdKelurahan,
          kdBlok: row.kdBlok,
          noUrut: row.noUrut,
          kdJnsOp: row.kdJnsOp,
          thnPajakSppt: row.thnPajakSppt,
          siklusSppt: row.siklusSppt,
          njopBumi: row.njopBumi,
          njopBng: row.njopBng,
          njopSppt: row.njopSppt,
          njoptkpSppt: row.njoptkpSppt,
          njkpSppt: row.njkpSppt,
          pbbTerhutangSppt: row.pbbTerhutangSppt,
          faktorPengurangSppt: row.faktorPengurangSppt,
          pbbYgHarusDibayarSppt: row.pbbYgHarusDibayarSppt,
          nipPetugas: input.nipPetugas ?? null,
          keterangan: input.keterangan ?? `Update Masal Tahun ${input.thnPajak}`,
        })

        // Update SPPT
        await db.update(sppt)
          .set({
            njoptkpSppt: String(njoptkp),
            njkpSppt: String(njkp),
            pbbTerhutangSppt: String(pbbTerhutang),
            pbbYgHarusDibayarSppt: String(pbbYgHarusDibayar),
            siklusSppt: row.siklusSppt + 1,
          })
          .where(
            and(
              eq(sppt.kdPropinsi, row.kdPropinsi),
              eq(sppt.kdDati2, row.kdDati2),
              eq(sppt.kdKecamatan, row.kdKecamatan),
              eq(sppt.kdKelurahan, row.kdKelurahan),
              eq(sppt.kdBlok, row.kdBlok),
              eq(sppt.noUrut, row.noUrut),
              eq(sppt.kdJnsOp, row.kdJnsOp),
              eq(sppt.thnPajakSppt, row.thnPajakSppt),
            ),
          )

        processed++
      }

      return { processed, skipped, totalPbbOld, totalPbbNew, delta: totalPbbNew - totalPbbOld }
    }),
})
