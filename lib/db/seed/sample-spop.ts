/**
 * Dynamic Sample SPOP data seeder using Falso factories
 * Seeds 100 sample SPOP records with all related tables.
 *
 * Run: npx tsx lib/db/seed/sample-spop.ts
 */

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import {
  refPropinsi,
  refDati2,
  refKecamatan,
  refKelurahan,
  datSubjekPajak,
  spop,
  datOpBangunan,
  datFasilitasBangunan,
  sppt,
  pembayaranSppt,
  fasilitas,
} from "@/lib/db/schema";

import { getBaseWilayahData, getRandomRegion } from "./factories/wilayah";
import { createSubjekPajak } from "./factories/subjek-pajak";
import { createSpop } from "./factories/spop";
import { createDatOpBangunan, createFasilitasBangunan } from "./factories/bangunan";
import { createSppt } from "./factories/sppt";
import { createPembayaranSppt } from "./factories/pembayaran";

export async function seedSampleSpop() {
  console.log("📋 Seeding dynamic sample SPOP data using Falso...\n");

  // 1. Wilayah reference data
  console.log("  🗺️  Seeding wilayah reference data...");
  const { propinsis, dati2s, kecamatans, kelurahans } = getBaseWilayahData();
  
  await db.insert(refPropinsi).values(propinsis).onDuplicateKeyUpdate({ set: { nmPropinsi: sql`VALUES(NM_PROPINSI)` } });
  await db.insert(refDati2).values(dati2s).onDuplicateKeyUpdate({ set: { nmDati2: sql`VALUES(NM_DATI2)` } });
  await db.insert(refKecamatan).values(kecamatans).onDuplicateKeyUpdate({ set: { nmKecamatanOnly: sql`VALUES(NM_KECAMATAN_ONLY)` } });
  await db.insert(refKelurahan).values(kelurahans).onDuplicateKeyUpdate({ set: { nmKelurahanOnly: sql`VALUES(NM_KELURAHAN_ONLY)` } });

  // 2. Master Fasilitas
  console.log("  🔧 Seeding master fasilitas...");
  const sampleFasilitas = [
    { kdFasilitas: "01", nmFasilitas: "AC SENTRAL", satuanFasilitas: "M2", nilaiFasilitas: 500000 },
    { kdFasilitas: "02", nmFasilitas: "LIFT PENUMPANG", satuanFasilitas: "UNIT", nilaiFasilitas: 150000000 },
    { kdFasilitas: "03", nmFasilitas: "ESKALATOR", satuanFasilitas: "UNIT", nilaiFasilitas: 120000000 },
    { kdFasilitas: "04", nmFasilitas: "PAGAR", satuanFasilitas: "M", nilaiFasilitas: 200000 },
    { kdFasilitas: "05", nmFasilitas: "LAPANGAN TENIS", satuanFasilitas: "M2", nilaiFasilitas: 300000 },
  ];
  await db.insert(fasilitas).values(sampleFasilitas).onDuplicateKeyUpdate({ set: { nmFasilitas: sql`VALUES(NM_FASILITAS)` } });

  // 3. Generate Core Data
  console.log("  🚀 Generating 100 SPOP records and relations...");
  
  const subjekPajaks: any[] = [];
  const spops: any[] = [];
  const bangunans: any[] = [];
  const fasBangunans: any[] = [];
  const sppts: any[] = [];
  const pembayarans: any[] = [];

  for (let i = 0; i < 100; i++) {
    const subjek = createSubjekPajak();
    subjekPajaks.push(subjek);

    const region = getRandomRegion();
    const s = createSpop(subjek.subjekPajakId!, region, i + 1);
    spops.push(s);

    // 50% chance of having a building
    if (Math.random() > 0.5) {
      const bng = createDatOpBangunan(s, 1);
      bangunans.push(bng);

      // 30% chance of having a facility
      if (Math.random() > 0.7) {
        fasBangunans.push(createFasilitasBangunan(s, 1, "04")); // Pagar
      }
    }

    // Generate 3 years of SPPT
    const years = ["2023", "2024", "2025"];
    for (const year of years) {
      const sp = createSppt(s, year, s.luasBumi!, bangunans.find(b => b.noUrut === s.noUrut)?.luasBng || 0);
      sppts.push(sp);

      // If status is paid (1 or 2), create payment
      if (sp.statusPembayaranSppt === "1" || sp.statusPembayaranSppt === "2") {
        pembayarans.push(createPembayaranSppt(sp));
      }
    }
  }

  // 4. Batch Insert
  console.log(`  👤 Inserting ${subjekPajaks.length} Subjek Pajak...`);
  await db.insert(datSubjekPajak).values(subjekPajaks).onDuplicateKeyUpdate({ set: { nmWp: sql`VALUES(NM_WP)` } });

  console.log(`  📋 Inserting ${spops.length} SPOP...`);
  await db.insert(spop).values(spops).onDuplicateKeyUpdate({ set: { jalanOp: sql`VALUES(JALAN_OP)` } });

  if (bangunans.length > 0) {
    console.log(`  🏗️  Inserting ${bangunans.length} Bangunan...`);
    await db.insert(datOpBangunan).values(bangunans).onDuplicateKeyUpdate({ set: { luasBng: sql`VALUES(LUAS_BNG)` } });
  }

  if (fasBangunans.length > 0) {
    console.log(`  🏠 Inserting ${fasBangunans.length} Fasilitas Bangunan...`);
    await db.insert(datFasilitasBangunan).values(fasBangunans).onDuplicateKeyUpdate({ set: { jmlSatuan: sql`VALUES(JML_SATUAN)` } });
  }

  if (sppts.length > 0) {
    console.log(`  📊 Inserting ${sppts.length} SPPT...`);
    // Chunking to avoid large packet size
    for (let i = 0; i < sppts.length; i += 200) {
      await db.insert(sppt).values(sppts.slice(i, i + 200)).onDuplicateKeyUpdate({ set: { pbbYgHarusDibayarSppt: sql`VALUES(PBB_YG_HARUS_DIBAYAR_SPPT)` } });
    }
  }

  if (pembayarans.length > 0) {
    console.log(`  💰 Inserting ${pembayarans.length} Pembayaran...`);
    for (let i = 0; i < pembayarans.length; i += 200) {
      await db.insert(pembayaranSppt).values(pembayarans.slice(i, i + 200)).onDuplicateKeyUpdate({ set: { tglPembayaranSppt: sql`VALUES(TGL_PEMBAYARAN_SPPT)` } });
    }
  }

  console.log("\n  ✅ Dynamic Sample SPOP data seeded successfully!");
}

// Allow direct execution
if (process.argv[1]?.includes("sample-spop")) {
  seedSampleSpop()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
