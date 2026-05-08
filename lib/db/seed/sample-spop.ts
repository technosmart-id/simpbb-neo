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
  datJpb2,
  datJpb3,
  datJpb4,
  datJpb5,
  datJpb6,
  datJpb7,
  datJpb8,
  datJpb9,
  datJpb12,
  datJpb13,
  datJpb14,
  datJpb15,
  datJpb16,
} from "@/lib/db/schema";

import { randNumber } from "@ngneat/falso";
import { getBaseWilayahData, getRandomRegion } from "./factories/wilayah";
import { createSubjekPajak } from "./factories/subjek-pajak";
import { createSpop } from "./factories/spop";
import { createDatOpBangunan, createFasilitasBangunan } from "./factories/bangunan";
import { createJpbData } from "./factories/jpb";
import { createSppt } from "./factories/sppt";
import { createPembayaranSppt } from "./factories/pembayaran";

export async function seedSampleSpop() {
  console.log("📋 Seeding dynamic sample SPOP data using Falso...\n");

  // 1. Wilayah reference data
  console.log("  🗺️  Seeding wilayah reference data...");
  const { propinsis, dati2s, kecamatans, kelurahans } = getBaseWilayahData();
  
  await db.insert(refPropinsi).values(propinsis);
  await db.insert(refDati2).values(dati2s);
  await db.insert(refKecamatan).values(kecamatans);
  await db.insert(refKelurahan).values(kelurahans);

  // 2. Master Fasilitas - SKIPPED (Already seeded by seedProd)
  console.log("  🔧 Master fasilitas already seeded by production seeder.");

  // 3. Generate Core Data
  console.log("  🚀 Generating 100 SPOP records and relations...");
  
  const subjekPajaks: any[] = [];
  const spops: any[] = [];
  const bangunans: any[] = [];
  const fasBangunans: any[] = [];
  const sppts: any[] = [];
  const pembayarans: any[] = [];
  const jpbDataMap: Record<string, any[]> = {
    '02': [], '03': [], '04': [], '05': [], '06': [], '07': [], '08': [], '09': [], '12': [], '13': [], '14': [], '15': [], '16': []
  };

  for (let i = 0; i < 100; i++) {
    const subjek = createSubjekPajak();
    subjekPajaks.push(subjek);

    const region = getRandomRegion();
    const s = createSpop(subjek.subjekPajakId!, region, i + 1);
    spops.push(s);

    // 50% chance of having buildings
    if (Math.random() > 0.5) {
      const bngCount = randNumber({ min: 1, max: 3 });
      for (let b = 1; b <= bngCount; b++) {
        const bng = createDatOpBangunan(s, b);
        bangunans.push(bng);

        // Generate JPB-specific data
        if (bng.kdJpb && jpbDataMap[bng.kdJpb]) {
          const jpb = createJpbData(s, b, bng.kdJpb);
          if (jpb) {
            // Special case for 02 and 09 sharing the same table/structure in UI but separate in schema
            if (bng.kdJpb === '09') {
              jpbDataMap['09'].push({ ...jpb, klsJpb9: (jpb as any).klsJpb2 });
            } else {
              jpbDataMap[bng.kdJpb].push(jpb);
            }
          }
        }

        // 30% chance of having a facility
        if (Math.random() > 0.7) {
          fasBangunans.push(createFasilitasBangunan(s, b, "04")); // Pagar
        }
      }
    }

    // Generate 3 years of SPPT
    const years = [2023, 2024, 2025];
    for (const year of years) {
      const sp = createSppt(s, year, s.luasBumi!, bangunans.find(b => b.noUrut === s.noUrut)?.luasBng || 0);
      sppts.push(sp);

      // If status is paid (1 or 2), create payment
      if (sp.statusPembayaranSppt === 1 || sp.statusPembayaranSppt === 2) {
        pembayarans.push(createPembayaranSppt(sp));
      }
    }
  }

  // 4. Batch Insert
  console.log(`  👤 Inserting ${subjekPajaks.length} Subjek Pajak...`);
  await db.insert(datSubjekPajak).values(subjekPajaks);

  console.log(`  📋 Inserting ${spops.length} SPOP...`);
  await db.insert(spop).values(spops);

  if (bangunans.length > 0) {
    console.log(`  🏗️  Inserting ${bangunans.length} Bangunan...`);
    await db.insert(datOpBangunan).values(bangunans);
    
    // Insert JPB specific data
    const jpbTables: Record<string, any> = {
      '02': datJpb2, '03': datJpb3, '04': datJpb4, '05': datJpb5, '06': datJpb6, '07': datJpb7, '08': datJpb8, '09': datJpb9, '12': datJpb12, '13': datJpb13, '14': datJpb14, '15': datJpb15, '16': datJpb16
    };
    
    for (const [kdJpb, table] of Object.entries(jpbTables)) {
      const data = jpbDataMap[kdJpb];
      if (data && data.length > 0) {
        console.log(`  🏠 Inserting ${data.length} records for JPB ${kdJpb}...`);
        await db.insert(table).values(data);
      }
    }
  }

  if (fasBangunans.length > 0) {
    console.log(`  🏠 Inserting ${fasBangunans.length} Fasilitas Bangunan...`);
    await db.insert(datFasilitasBangunan).values(fasBangunans);
  }

  if (sppts.length > 0) {
    console.log(`  📊 Inserting ${sppts.length} SPPT...`);
    // Chunking to avoid large packet size
    for (let i = 0; i < sppts.length; i += 200) {
      await db.insert(sppt).values(sppts.slice(i, i + 200));
    }
  }

  if (pembayarans.length > 0) {
    console.log(`  💰 Inserting ${pembayarans.length} Pembayaran...`);
    for (let i = 0; i < pembayarans.length; i += 200) {
      await db.insert(pembayaranSppt).values(pembayarans.slice(i, i + 200));
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
