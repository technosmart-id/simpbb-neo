import { db } from "../index";
import { refJnsPelayanan } from "../schema/referensi";
import { sql } from "drizzle-orm";

export async function seedReferensi() {
  console.log("Seeding ref_jns_pelayanan...");
  await db
    .insert(refJnsPelayanan)
    .values([
      { kdJnsPelayanan: "01", nmJenisPelayanan: "Pendaftaran Data Baru" },
      { kdJnsPelayanan: "02", nmJenisPelayanan: "Mutasi Objek/Subjek" },
      { kdJnsPelayanan: "03", nmJenisPelayanan: "Pembetulan SPPT/SKP/STP" },
      { kdJnsPelayanan: "04", nmJenisPelayanan: "Pembatalan SPPT/SKP" },
      { kdJnsPelayanan: "05", nmJenisPelayanan: "Salinan SPPT/SKP" },
      {
        kdJnsPelayanan: "06",
        nmJenisPelayanan: "Keberatan Penunjukan Wajib Pajak",
      },
      {
        kdJnsPelayanan: "07",
        nmJenisPelayanan: "Keberatan Atas Pajak Terhutang",
      },
      {
        kdJnsPelayanan: "08",
        nmJenisPelayanan: "Pengurangan Atas Besarnya Pajak Terhutang",
      },
      {
        kdJnsPelayanan: "09",
        nmJenisPelayanan: "Restitusi dan Kompensasi",
      },
      {
        kdJnsPelayanan: "10",
        nmJenisPelayanan: "Pengurangan Denda Administrasi",
      },
      {
        kdJnsPelayanan: "11",
        nmJenisPelayanan: "Penentuan Kembali Tanggal Jatuh Tempo",
      },
      {
        kdJnsPelayanan: "12",
        nmJenisPelayanan: "Penundaan Tanggal Jatuh Tempo SPOP",
      },
      {
        kdJnsPelayanan: "13",
        nmJenisPelayanan: "PEMBERIAN INFORMASI PBB",
      },
      {
        kdJnsPelayanan: "14",
        nmJenisPelayanan: "PEMBETULAN SK KEBERATAN",
      },
      { kdJnsPelayanan: "15", nmJenisPelayanan: "MUTASI PEMECAHAN" },
    ])
    .onDuplicateKeyUpdate({
      set: { nmJenisPelayanan: sql`VALUES(NM_JENIS_PELAYANAN)` },
    });

  console.log("  ✓ 15 jenis pelayanan seeded");
}
