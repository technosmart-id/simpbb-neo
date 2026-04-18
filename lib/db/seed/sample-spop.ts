/**
 * Sample SPOP data seeder
 * Seeds 100 sample SPOP records from 2 kelurahan in different kecamatan
 * along with all related tables (wilayah refs, subjek pajak, bangunan, SPPT, pembayaran).
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
  datLegalitasBumi,
  sppt,
  pembayaranSppt,
  fasilitas,
} from "@/lib/db/schema";
import {
  sampleRefPropinsi,
  sampleRefDati2,
  sampleRefKecamatan,
  sampleRefKelurahan,
  sampleFasilitas,
  sampleDatSubjekPajak,
  sampleSpop,
  sampleDatOpBangunan,
  sampleDatFasilitasBangunan,
  sampleDatLegalitasBumi,
  sampleSppt,
  samplePembayaranSppt,
} from "./sample-spop-data";

export async function seedSampleSpop() {
  console.log("📋 Seeding sample SPOP data...\n");

  // 1. Wilayah reference data (top-down)
  console.log("  🗺️  ref_propinsi...");
  await db
    .insert(refPropinsi)
    .values(sampleRefPropinsi as any)
    .onDuplicateKeyUpdate({ set: { nmPropinsi: sql`VALUES(NM_PROPINSI)` } });

  console.log("  🗺️  ref_dati2...");
  await db
    .insert(refDati2)
    .values(sampleRefDati2 as any)
    .onDuplicateKeyUpdate({ set: { nmDati2: sql`VALUES(NM_DATI2)` } });

  console.log("  🗺️  ref_kecamatan...");
  await db
    .insert(refKecamatan)
    .values(sampleRefKecamatan as any)
    .onDuplicateKeyUpdate({ set: { nmKecamatanOnly: sql`VALUES(NM_KECAMATAN_ONLY)` } });

  console.log("  🗺️  ref_kelurahan...");
  await db
    .insert(refKelurahan)
    .values(sampleRefKelurahan as any)
    .onDuplicateKeyUpdate({ set: { nmKelurahanOnly: sql`VALUES(NM_KELURAHAN_ONLY)` } });

  // 2. Master data
  if (sampleFasilitas.length > 0) {
    console.log("  🔧 fasilitas...");
    await db
      .insert(fasilitas)
      .values(sampleFasilitas as any)
      .onDuplicateKeyUpdate({
        set: {
          nmFasilitas: sql`VALUES(NM_FASILITAS)`,
          satuanFasilitas: sql`VALUES(SATUAN_FASILITAS)`,
          nilaiFasilitas: sql`VALUES(NILAI_FASILITAS)`,
          statusFasilitas: sql`VALUES(STATUS_FASILITAS)`,
          ketergantungan: sql`VALUES(KETERGANTUNGAN)`,
        },
      });
  }

  // 3. Core entities
  console.log("  👤 dat_subjek_pajak...");
  await db
    .insert(datSubjekPajak)
    .values(sampleDatSubjekPajak as any)
    .onDuplicateKeyUpdate({
      set: {
        nmWp: sql`VALUES(NM_WP)`,
        jalanWp: sql`VALUES(JALAN_WP)`,
        blokKavNoWp: sql`VALUES(BLOK_KAV_NO_WP)`,
        rwWp: sql`VALUES(RW_WP)`,
        rtWp: sql`VALUES(RT_WP)`,
        kelurahanWp: sql`VALUES(KELURAHAN_WP)`,
        kotaWp: sql`VALUES(KOTA_WP)`,
        kdPosWp: sql`VALUES(KD_POS_WP)`,
        telpWp: sql`VALUES(TELP_WP)`,
        npwp: sql`VALUES(NPWP)`,
        statusPekerjaanWp: sql`VALUES(STATUS_PEKERJAAN_WP)`,
        emailWp: sql`VALUES(EMAIL_WP)`,
      },
    });

  console.log("  📋 spop (100 records)...");
  await db
    .insert(spop)
    .values(sampleSpop as any)
    .onDuplicateKeyUpdate({
      set: {
        subjekPajakId: sql`VALUES(SUBJEK_PAJAK_ID)`,
        noFormulirSpop: sql`VALUES(NO_FORMULIR_SPOP)`,
        jnsTransaksiOp: sql`VALUES(JNS_TRANSAKSI_OP)`,
        jalanOp: sql`VALUES(JALAN_OP)`,
        blokKavNoOp: sql`VALUES(BLOK_KAV_NO_OP)`,
        rtOp: sql`VALUES(RT_OP)`,
        rwOp: sql`VALUES(RW_OP)`,
        kelurahanOp: sql`VALUES(KELURAHAN_OP)`,
        kdStatusWp: sql`VALUES(KD_STATUS_WP)`,
        luasBumi: sql`VALUES(LUAS_BUMI)`,
        kdZnt: sql`VALUES(KD_ZNT)`,
        jnsBumi: sql`VALUES(JNS_BUMI)`,
        nilaiSistemBumi: sql`VALUES(NILAI_SISTEM_BUMI)`,
        tglPendataanOp: sql`VALUES(TGL_PENDATAAN_OP)`,
        nmPendataanOp: sql`VALUES(NM_PENDATAAN_OP)`,
        nipPendata: sql`VALUES(NIP_PENDATA)`,
        tglPemeriksaanOp: sql`VALUES(TGL_PEMERIKSAAN_OP)`,
        nmPemeriksaanOp: sql`VALUES(NM_PEMERIKSAAN_OP)`,
        nipPemeriksaOp: sql`VALUES(NIP_PEMERIKSA_OP)`,
      },
    });

  // 4. Child entities
  if (sampleDatOpBangunan.length > 0) {
    console.log(`  🏗️  dat_op_bangunan (${sampleDatOpBangunan.length})...`);
    await db
      .insert(datOpBangunan)
      .values(sampleDatOpBangunan as any)
      .onDuplicateKeyUpdate({
        set: {
          kdJpb: sql`VALUES(KD_JPB)`,
          luasBng: sql`VALUES(LUAS_BNG)`,
          jmlLantaiBng: sql`VALUES(JML_LANTAI_BNG)`,
          kondisiBng: sql`VALUES(KONDISI_BNG)`,
          jnsKonstruksiBng: sql`VALUES(JNS_KONSTRUKSI_BNG)`,
          jnsAtapBng: sql`VALUES(JNS_ATAP_BNG)`,
          kdDinding: sql`VALUES(KD_DINDING)`,
          kdLantai: sql`VALUES(KD_LANTAI)`,
          kdLangitLangit: sql`VALUES(KD_LANGIT_LANGIT)`,
          nilaiSistemBng: sql`VALUES(NILAI_SISTEM_BNG)`,
          nilaiIndividu: sql`VALUES(NILAI_INDIVIDU)`,
          aktif: sql`VALUES(AKTIF)`,
        },
      });
  }

  if (sampleDatFasilitasBangunan.length > 0) {
    console.log(`  🏠 dat_fasilitas_bangunan (${sampleDatFasilitasBangunan.length})...`);
    await db
      .insert(datFasilitasBangunan)
      .values(sampleDatFasilitasBangunan as any)
      .onDuplicateKeyUpdate({
        set: { jmlSatuan: sql`VALUES(JML_SATUAN)` },
      });
  }

  if (sampleDatLegalitasBumi.length > 0) {
    console.log(`  📄 dat_legalitas_bumi (${sampleDatLegalitasBumi.length})...`);
    await db
      .insert(datLegalitasBumi)
      .values(sampleDatLegalitasBumi as any)
      .onDuplicateKeyUpdate({
        set: { noLegalitasTanah: sql`VALUES(NO_LEGALITAS_TANAH)` },
      });
  }

  // 5. SPPT (batch into chunks of 200 to avoid packet size issues)
  if (sampleSppt.length > 0) {
    console.log(`  📊 sppt (${sampleSppt.length})...`);
    const SPPT_CHUNK = 200;
    for (let i = 0; i < sampleSppt.length; i += SPPT_CHUNK) {
      const chunk = sampleSppt.slice(i, i + SPPT_CHUNK);
      await db
        .insert(sppt)
        .values(chunk as any)
        .onDuplicateKeyUpdate({
          set: {
            siklusSppt: sql`VALUES(SIKLUS_SPPT)`,
            luasBumi: sql`VALUES(LUAS_BUMI)`,
            luasBng: sql`VALUES(LUAS_BNG)`,
            njopBumi: sql`VALUES(NJOP_BUMI)`,
            njopBng: sql`VALUES(NJOP_BNG)`,
            njopSppt: sql`VALUES(NJOP_SPPT)`,
            njoptkpSppt: sql`VALUES(NJOPTKP_SPPT)`,
            njkpSppt: sql`VALUES(NJKP_SPPT)`,
            pbbTerhutangSppt: sql`VALUES(PBB_TERHUTANG_SPPT)`,
            faktorPengurangSppt: sql`VALUES(FAKTOR_PENGURANG_SPPT)`,
            pbbYgHarusDibayarSppt: sql`VALUES(PBB_YG_HARUS_DIBAYAR_SPPT)`,
            statusPembayaranSppt: sql`VALUES(STATUS_PEMBAYARAN_SPPT)`,
            statusTagihanSppt: sql`VALUES(STATUS_TAGIHAN_SPPT)`,
            statusCetakSppt: sql`VALUES(STATUS_CETAK_SPPT)`,
            nmWp: sql`VALUES(NM_WP)`,
            jalanWp: sql`VALUES(JALAN_WP)`,
          },
        });
    }
  }

  // 6. Pembayaran SPPT (batch into chunks)
  if (samplePembayaranSppt.length > 0) {
    console.log(`  💰 pembayaran_sppt (${samplePembayaranSppt.length})...`);
    const PAY_CHUNK = 200;
    for (let i = 0; i < samplePembayaranSppt.length; i += PAY_CHUNK) {
      const chunk = samplePembayaranSppt.slice(i, i + PAY_CHUNK);
      await db
        .insert(pembayaranSppt)
        .values(chunk as any)
        .onDuplicateKeyUpdate({
          set: {
            tglPembayaranSppt: sql`VALUES(TGL_PEMBAYARAN_SPPT)`,
            jmlSpptYgDibayar: sql`VALUES(JML_SPPT_YG_DIBAYAR)`,
            dendaSppt: sql`VALUES(DENDA_SPPT)`,
          },
        });
    }
  }

  console.log("\n  ✅ Sample SPOP data seeded successfully!");
  console.log(`     100 SPOP | ${sampleDatSubjekPajak.length} Subjek | ${sampleDatOpBangunan.length} Bangunan | ${sampleSppt.length} SPPT | ${samplePembayaranSppt.length} Pembayaran\n`);
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
