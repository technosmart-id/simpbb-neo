import { db } from "../index";
import { kelasBumi, kelasBangunan, tarif, fasilitas } from "../schema";
import { sql } from "drizzle-orm";

export async function seedMasterData() {
  console.log("📊 Seeding official SISMIOP master data...");

  // 1. Kelas Bumi (100 classes)
  console.log("  🌱 Seeding kelas_bumi...");
  const dataKelasBumi = [
    ["001", "67390", "69700", "68545"], ["002", "65120", "67390", "66255"], ["003", "62890", "65120", "64000"], ["004", "60700", "62890", "61795"], ["005", "58550", "60700", "59625"],
    ["006", "56440", "58550", "57495"], ["007", "54370", "56440", "55405"], ["008", "52340", "54370", "53355"], ["009", "50350", "52340", "51345"], ["010", "48400", "50350", "49375"],
    ["011", "46490", "48400", "47445"], ["012", "44620", "46490", "45555"], ["013", "42790", "44620", "43705"], ["014", "41000", "42790", "41895"], ["015", "39250", "41000", "40125"],
    ["016", "37540", "39250", "38395"], ["017", "35870", "37540", "36705"], ["018", "34240", "35870", "35055"], ["019", "32650", "34240", "33445"], ["020", "31100", "32650", "31875"],
    ["021", "29590", "31100", "30345"], ["022", "28120", "29590", "28855"], ["023", "26690", "28120", "27405"], ["024", "25300", "26690", "25995"], ["025", "23950", "25300", "24625"],
    ["026", "22640", "23950", "23295"], ["027", "21370", "22640", "22005"], ["028", "20140", "21370", "20755"], ["029", "18950", "20140", "19545"], ["030", "17800", "18950", "18375"],
    ["031", "16690", "17800", "17245"], ["032", "15620", "16690", "16155"], ["033", "14590", "15620", "15105"], ["034", "13600", "14590", "14095"], ["035", "12650", "13600", "13125"],
    ["036", "11740", "12650", "12195"], ["037", "10870", "11740", "11305"], ["038", "10040", "10870", "10455"], ["039", "9250", "10040", "9645"], ["040", "8500", "9250", "8875"],
    ["041", "7790", "8500", "8145"], ["042", "7120", "7790", "7455"], ["043", "6490", "7120", "6805"], ["044", "5900", "6490", "6195"], ["045", "5350", "5900", "5625"],
    ["046", "4840", "5350", "5095"], ["047", "4370", "4840", "4605"], ["048", "3940", "4370", "4155"], ["049", "3550", "3940", "3745"], ["050", "3200", "3550", "3375"],
    ["051", "3000", "3200", "3100"], ["052", "2850", "3000", "2925"], ["053", "2708", "2850", "2779"], ["054", "2573", "2708", "2640"], ["055", "2444", "2573", "2508"],
    ["056", "2261", "2444", "2352"], ["057", "2091", "2261", "2176"], ["058", "1934", "2091", "2013"], ["059", "1789", "1934", "1862"], ["060", "1655", "1789", "1722"],
    ["061", "1490", "1655", "1573"], ["062", "1341", "1490", "1416"], ["063", "1207", "1341", "1274"], ["064", "1086", "1207", "1147"], ["065", "977", "1086", "1032"],
    ["066", "855", "977", "916"], ["067", "748", "855", "802"], ["068", "655", "748", "702"], ["069", "573", "655", "614"], ["070", "501", "573", "537"],
    ["071", "426", "501", "464"], ["072", "362", "426", "394"], ["073", "308", "362", "335"], ["074", "262", "308", "285"], ["075", "223", "262", "243"],
    ["076", "178", "223", "200"], ["077", "142", "178", "160"], ["078", "114", "142", "128"], ["079", "91", "114", "103"], ["080", "73", "91", "82"],
    ["081", "55", "73", "64"], ["082", "41", "55", "48"], ["083", "31", "41", "36"], ["084", "23", "31", "27"], ["085", "17", "23", "20"],
    ["086", "12", "17", "14"], ["087", "8.40", "12.00", "10.00"], ["088", "5.90", "8.40", "7.15"], ["089", "4.10", "5.90", "5.00"], ["090", "2.90", "4.10", "3.50"],
    ["091", "2.00", "2.90", "2.45"], ["092", "1.40", "2.00", "1.70"], ["093", "1.05", "1.40", "1.20"], ["094", "0.76", "1.05", "0.91"], ["095", "0.55", "0.76", "0.66"],
    ["096", "0.41", "0.55", "0.48"], ["097", "0.31", "0.41", "0.35"], ["098", "0.24", "0.31", "0.27"], ["099", "0.17", "0.24", "0.20"], ["100", "0.00", "0.17", "0.14"]
  ].map(([kelas, min, max, njop]) => ({
    kelasBumi: kelas,
    nilaiMinimum: min,
    nilaiMaksimum: max,
    njopBumi: njop,
  }));

  await db.insert(kelasBumi).values(dataKelasBumi).onDuplicateKeyUpdate({
    set: {
      nilaiMinimum: sql`VALUES(NILAI_MINIMUM)`,
      nilaiMaksimum: sql`VALUES(NILAI_MAKSIMUM)`,
      njopBumi: sql`VALUES(NJOP_BUMI)`,
    },
  });

  // 2. Kelas Bangunan (40 classes)
  console.log("  🏢 Seeding kelas_bangunan...");
  const dataKelasBangunan = [
    ["001", "14700", "15800", "15250"], ["002", "13600", "14700", "14150"], ["003", "12550", "13600", "13075"], ["004", "11550", "12550", "12050"], ["005", "10600", "11550", "11075"],
    ["006", "9700", "10600", "10150"], ["007", "8850", "9700", "9275"], ["008", "8050", "8850", "8450"], ["009", "7300", "8050", "7675"], ["010", "6600", "7300", "6950"],
    ["011", "5850", "6600", "6225"], ["012", "5150", "5850", "5500"], ["013", "4500", "5150", "4825"], ["014", "3900", "4500", "4200"], ["015", "3350", "3900", "3625"],
    ["016", "2850", "3350", "3100"], ["017", "2400", "2850", "2625"], ["018", "2000", "2400", "2200"], ["019", "1666", "2000", "1833"], ["020", "1366", "1666", "1516"],
    ["021", "1034", "1366", "1200"], ["022", "902", "1034", "968"], ["023", "744", "902", "823"], ["024", "656", "744", "700"], ["025", "534", "656", "595"],
    ["026", "476", "534", "505"], ["027", "382", "476", "429"], ["028", "348", "382", "365"], ["029", "272", "348", "310"], ["030", "256", "272", "264"],
    ["031", "194", "256", "225"], ["032", "188", "194", "191"], ["033", "136", "188", "162"], ["034", "128", "136", "132"], ["035", "104", "128", "116"],
    ["036", "92", "104", "98"], ["037", "74", "92", "83"], ["038", "68", "74", "71"], ["039", "52", "68", "60"], ["040", "0", "52", "50"]
  ].map(([kelas, min, max, njop]) => ({
    kelasBangunan: kelas,
    nilaiMinimum: min,
    nilaiMaksimum: max,
    njopBangunan: njop,
  }));

  await db.insert(kelasBangunan).values(dataKelasBangunan).onDuplicateKeyUpdate({
    set: {
      nilaiMinimum: sql`VALUES(NILAI_MINIMUM)`,
      nilaiMaksimum: sql`VALUES(NILAI_MAKSIMUM)`,
      njopBangunan: sql`VALUES(NJOP_BANGUNAN)`,
    },
  });

  // 3. Tarif
  console.log("  💸 Seeding tarif...");
  const dataTarif = [
    { thnAwal: "1970", thnAkhir: "2023", njopMin: "0", njopMax: "1000000000", nilaiTarif: "0.1000" },
    { thnAwal: "1970", thnAkhir: "2023", njopMin: "1000000001", njopMax: "999999999999", nilaiTarif: "0.2000" },
    { thnAwal: "2024", thnAkhir: "2155", njopMin: "0", njopMax: "1000000000", nilaiTarif: "0.1000" },
    { thnAwal: "2024", thnAkhir: "2155", njopMin: "1000000001", njopMax: "999999999999", nilaiTarif: "0.2000" },
  ];
  await db.insert(tarif).values(dataTarif).onDuplicateKeyUpdate({
    set: {
      thnAkhir: sql`VALUES(THN_AKHIR)`,
      njopMin: sql`VALUES(NJOP_MIN)`,
      njopMax: sql`VALUES(NJOP_MAX)`,
      nilaiTarif: sql`VALUES(NILAI_TARIF)`,
    },
  });

  // 4. Fasilitas
  console.log("  🔧 Seeding fasilitas...");
  const dataFasilitas = [
    ["01", "AC SPLIT", "BH", "5", "0"], ["02", "AC WINDOWS", "BH", "5", "0"], ["03", "AC SENTRAL KANTOR", "M2", "0", "2"],
    ["04", "AC CENTRAL KAMAR HOTEL", "M2", "2", "2"], ["05", "AC CENTRAL RUANG LAIN HOTEL", "M2", "3", "2"],
    ["06", "AC CENTRAL PERTOKOAN", "M2", "0", "2"], ["07", "AC CENTRAL KAMAR RUMAH SAKIT", "M2", "2", "2"],
    ["08", "AC SENTRAL RUANG LAIN RUMAH SAKIT", "M2", "3", "2"], ["09", "AC SENTRAL APARTEMEN", "M2", "2", "2"],
    ["10", "AC SENTRAL RUANG LAIN APARTEMEN", "M2", "3", "2"], ["11", "AC SENTRAL BANGUNAN LAIN", "M2", "0", "0"],
    ["12", "KOLAM RENANG DIPLESTER", "M2", "4", "1"], ["13", "KOLAM RENANG DENGAN PELAPIS", "M2", "4", "1"],
    ["14", "PERKERASAN KONSTRUKSI RINGAN", "M2", "4", "0"], ["15", "PERKERASAN KONSTRUKSI SEDANG", "M2", "4", "0"],
    ["16", "PERKERASAN KONSTRUKSI BERAT", "M2", "4", "0"], ["17", "PENUTUP PERKERASAN", "M2", "4", "0"],
    ["18", "LAPANGAN TENIS 1 BAN BETON DENGAN LAMPU", "BH", "4", "0"], ["19", "LAPANGAN TENIS 1 BAN ASPAL DENGAN LAMPU", "BH", "4", "0"],
    ["20", "LAPANGAN TENIS 1 BAN TANAH LIAT DENGAN LAMPU", "BH", "4", "0"], ["21", "LAPANGAN TENIS 1 BAN BETON TANPA LAMPU", "BH", "4", "0"],
    ["22", "LAPANGAN TENIS 1 BAN ASPAL TANPA LAMPU", "BH", "4", "0"], ["23", "LAPANGAN TENIS 1 BAN TANAH LIAT TANPA LAMPU", "BH", "4", "0"],
    ["24", "LAPANGAN TENIS LEBIH 1 BAN BETON DENGAN LAMPU", "BH", "4", "0"], ["25", "LAPANGAN TENIS LEBIH 1 BAN ASPAL DENGAN LAMPU", "BH", "4", "0"],
    ["26", "LAPANGAN TENIS LEBIH 1 BAN TANAH LIAT DENGAN LAMPU", "BH", "4", "0"], ["27", "LAPANGAN TENIS LEBIH 1 BAN BETON TANPA LAMPU", "BH", "4", "0"],
    ["28", "LAPANGAN TENIS LEBIH 1 BAN ASPAL TANPA LAMPU", "BH", "4", "0"], ["29", "LAPANGAN TENIS LEBIH 1 BAN TANAH LIAT TANPA LAMPU", "BH", "4", "0"],
    ["30", "LIFT PENUMPANG BIASA", "BH", "4", "1"], ["31", "LIFT KAPSUL", "BH", "4", "1"], ["32", "LIFT BARANG", "BH", "4", "1"],
    ["33", "TANGGA BERJALAN (ESCALATOR) <= 0.80 M", "BH", "4", "0"], ["34", "TANGGA BERJALAN (ESCALATOR) > 0.80 M", "BH", "4", "0"],
    ["35", "PAGAR BAJA / BESI", "M", "4", "0"], ["36", "PAGAR BATA / BATAKO", "M", "4", "0"], ["37", "PROTEKSI API HYDRANT", "M2", "0", "0"],
    ["38", "PROTEKSI API FIRE ALARM", "M2", "0", "0"], ["39", "PROTEKSI API SPLINKLER", "M2", "0", "0"], ["40", "GENSET", "KVA", "4", "1"],
    ["41", "SALURAN PESAWAT PABX", "PESAWAT", "4", "0"], ["42", "SUMUR ARTESIS", "M", "4", "0"], ["43", "BOILER HOTEL", "KAMAR", "1", "2"],
    ["44", "LISTRIK WATT (VA)", "VA", "5", "0"], ["45", "BOILER APARTEMEN", "APT", "1", "2"]
  ].map(([kd, nama, satuan, status, ket]) => ({
    kdFasilitas: kd,
    nmFasilitas: nama,
    satuanFasilitas: satuan,
    statusFasilitas: status,
    ketergantungan: ket,
  }));

  await db.insert(fasilitas).values(dataFasilitas).onDuplicateKeyUpdate({
    set: {
      nmFasilitas: sql`VALUES(NM_FASILITAS)`,
      satuanFasilitas: sql`VALUES(SATUAN_FASILITAS)`,
      statusFasilitas: sql`VALUES(STATUS_FASILITAS)`,
      ketergantungan: sql`VALUES(KETERGANTUNGAN)`,
    },
  });

  console.log("  ✅ Master data seeded successfully.");
}
