import { db } from "@/lib/db";
import { lookupGroup, lookupItem } from "@/lib/db/schema";

export async function seedLookups() {
  console.log("Seeding lookups...");

  const groups = [
  {
    "kdLookupGroup": "01",
    "nmLookupGroup": "STATUS TAGIHAN"
  },
  {
    "kdLookupGroup": "02",
    "nmLookupGroup": "STATUS PEMBAYARAN"
  },
  {
    "kdLookupGroup": "03",
    "nmLookupGroup": "INDIVIDU/MASSAL"
  },
  {
    "kdLookupGroup": "04",
    "nmLookupGroup": "STATUS PERMOHONAN"
  },
  {
    "kdLookupGroup": "05",
    "nmLookupGroup": "KELAS/BINTANG/TYPE"
  },
  {
    "kdLookupGroup": "06",
    "nmLookupGroup": "STATUS PROSES PST"
  },
  {
    "kdLookupGroup": "07",
    "nmLookupGroup": "KP/KANWIL"
  },
  {
    "kdLookupGroup": "08",
    "nmLookupGroup": "PEKERJAAN WAJIB PAJAK"
  },
  {
    "kdLookupGroup": "09",
    "nmLookupGroup": "LETAK TANGKI"
  },
  {
    "kdLookupGroup": "10",
    "nmLookupGroup": "STATUS WP"
  },
  {
    "kdLookupGroup": "11",
    "nmLookupGroup": "KETERGANTUNGAN FASILITAS"
  },
  {
    "kdLookupGroup": "12",
    "nmLookupGroup": "JENIS PENERIMAAN"
  },
  {
    "kdLookupGroup": "13",
    "nmLookupGroup": "JENIS SKP"
  },
  {
    "kdLookupGroup": "14",
    "nmLookupGroup": "STATUS FASILITAS"
  },
  {
    "kdLookupGroup": "15",
    "nmLookupGroup": "JENIS SURAT"
  },
  {
    "kdLookupGroup": "16",
    "nmLookupGroup": "STATUS PEKERJAAN"
  },
  {
    "kdLookupGroup": "17",
    "nmLookupGroup": "JENIS SETORAN"
  },
  {
    "kdLookupGroup": "18",
    "nmLookupGroup": "CABANG"
  },
  {
    "kdLookupGroup": "19",
    "nmLookupGroup": "JENIS PENGEMBALIAN"
  },
  {
    "kdLookupGroup": "20",
    "nmLookupGroup": "JENIS BUMI"
  },
  {
    "kdLookupGroup": "21",
    "nmLookupGroup": "KONDISI BANGUNAN"
  },
  {
    "kdLookupGroup": "22",
    "nmLookupGroup": "JENIS KONSTRUKSI BANGUNAN"
  },
  {
    "kdLookupGroup": "23",
    "nmLookupGroup": "STATUS PETA"
  },
  {
    "kdLookupGroup": "24",
    "nmLookupGroup": "STATUS KUNJUNGAN KEMBALI"
  },
  {
    "kdLookupGroup": "25",
    "nmLookupGroup": "PEMOHON"
  },
  {
    "kdLookupGroup": "26",
    "nmLookupGroup": "JENIS TAGIHAN"
  },
  {
    "kdLookupGroup": "27",
    "nmLookupGroup": "JENIS PELAYANAN"
  },
  {
    "kdLookupGroup": "28",
    "nmLookupGroup": "JENIS HOTEL"
  },
  {
    "kdLookupGroup": "29",
    "nmLookupGroup": "JENIS MUTASI"
  },
  {
    "kdLookupGroup": "30",
    "nmLookupGroup": "KELOMPOK PENILAIAN"
  },
  {
    "kdLookupGroup": "31",
    "nmLookupGroup": "PENGGUNAAN ZNT"
  },
  {
    "kdLookupGroup": "32",
    "nmLookupGroup": "YA/TIDAK"
  },
  {
    "kdLookupGroup": "33",
    "nmLookupGroup": "JENIS TRANSAKSI"
  },
  {
    "kdLookupGroup": "34",
    "nmLookupGroup": "SUMBER TRANSAKSI JUAL BELI"
  },
  {
    "kdLookupGroup": "35",
    "nmLookupGroup": "STATUS PELELANGAN"
  },
  {
    "kdLookupGroup": "36",
    "nmLookupGroup": "STATUS PERMOHONAN SKB"
  },
  {
    "kdLookupGroup": "37",
    "nmLookupGroup": "SIFAT ADJUSTMENT THD NILAI BNG"
  },
  {
    "kdLookupGroup": "38",
    "nmLookupGroup": "ADA"
  },
  {
    "kdLookupGroup": "39",
    "nmLookupGroup": "JENIS KOLAM RENANG"
  },
  {
    "kdLookupGroup": "40",
    "nmLookupGroup": "BAHAN PAGAR"
  },
  {
    "kdLookupGroup": "41",
    "nmLookupGroup": "ATAP"
  },
  {
    "kdLookupGroup": "42",
    "nmLookupGroup": "DINDING"
  },
  {
    "kdLookupGroup": "43",
    "nmLookupGroup": "LANTAI"
  },
  {
    "kdLookupGroup": "44",
    "nmLookupGroup": "LANGIT - LANGIT"
  },
  {
    "kdLookupGroup": "45",
    "nmLookupGroup": "KELAS BANGUNAN 2/9"
  },
  {
    "kdLookupGroup": "46",
    "nmLookupGroup": "KELAS JPB 4"
  },
  {
    "kdLookupGroup": "47",
    "nmLookupGroup": "KELAS JPB 6"
  },
  {
    "kdLookupGroup": "48",
    "nmLookupGroup": "KELAS JPB 16"
  },
  {
    "kdLookupGroup": "49",
    "nmLookupGroup": "TYPE JPB 12"
  },
  {
    "kdLookupGroup": "50",
    "nmLookupGroup": "KELAS JPB 5"
  },
  {
    "kdLookupGroup": "51",
    "nmLookupGroup": "BINTANG JPB 7"
  },
  {
    "kdLookupGroup": "52",
    "nmLookupGroup": "KELAS BANGUNAN JPB 13"
  },
  {
    "kdLookupGroup": "53",
    "nmLookupGroup": "SK PEMBETULAN/PEMBATALAN"
  },
  {
    "kdLookupGroup": "54",
    "nmLookupGroup": "SEBAB PENGHAPUSAN"
  },
  {
    "kdLookupGroup": "55",
    "nmLookupGroup": "STATUS CETAK"
  },
  {
    "kdLookupGroup": "56",
    "nmLookupGroup": "DIHAPUS"
  },
  {
    "kdLookupGroup": "57",
    "nmLookupGroup": "JENIS CETAK INDIVIDU"
  },
  {
    "kdLookupGroup": "58",
    "nmLookupGroup": "JENIS PRINTER"
  },
  {
    "kdLookupGroup": "59",
    "nmLookupGroup": "LIHAT/CETAK"
  },
  {
    "kdLookupGroup": "60",
    "nmLookupGroup": "KODE PENERIMA"
  },
  {
    "kdLookupGroup": "61",
    "nmLookupGroup": "KELOMPOK JENIS BUKU"
  },
  {
    "kdLookupGroup": "62",
    "nmLookupGroup": "TARIF PAJAK"
  },
  {
    "kdLookupGroup": "63",
    "nmLookupGroup": "JENIS TIDAK KENA PAJAK"
  },
  {
    "kdLookupGroup": "64",
    "nmLookupGroup": "STATUS SPPT"
  },
  {
    "kdLookupGroup": "65",
    "nmLookupGroup": "JENIS NJOPTKP NJKP TARIF BUKU"
  },
  {
    "kdLookupGroup": "66",
    "nmLookupGroup": "JENIS DOKUMEN"
  },
  {
    "kdLookupGroup": "67",
    "nmLookupGroup": "JENIS SK"
  },
  {
    "kdLookupGroup": "68",
    "nmLookupGroup": "JENIS PEMBETULAN"
  },
  {
    "kdLookupGroup": "69",
    "nmLookupGroup": "TEMP_JENIS_DATA"
  },
  {
    "kdLookupGroup": "70",
    "nmLookupGroup": "PIUTANG"
  },
  {
    "kdLookupGroup": "71",
    "nmLookupGroup": "JENIS BARANG YANG DISITA"
  },
  {
    "kdLookupGroup": "72",
    "nmLookupGroup": "STATUS SEGEL SITA"
  },
  {
    "kdLookupGroup": "73",
    "nmLookupGroup": "JENIS BAP"
  },
  {
    "kdLookupGroup": "74",
    "nmLookupGroup": "JENIS MATA ANGGARAN"
  },
  {
    "kdLookupGroup": "75",
    "nmLookupGroup": "STATUS KAYU ULIN"
  },
  {
    "kdLookupGroup": "76",
    "nmLookupGroup": "STATUS LOG DBKB ZNT"
  },
  {
    "kdLookupGroup": "77",
    "nmLookupGroup": "JENIS PENGURANGAN"
  },
  {
    "kdLookupGroup": "78",
    "nmLookupGroup": "STATUS PERUBAHAN NOP"
  },
  {
    "kdLookupGroup": "79",
    "nmLookupGroup": "STATUS BANDING"
  },
  {
    "kdLookupGroup": "80",
    "nmLookupGroup": "PERSETUJUAN STP"
  },
  {
    "kdLookupGroup": "81",
    "nmLookupGroup": "KELOMPOK HIMBAUAN"
  },
  {
    "kdLookupGroup": "82",
    "nmLookupGroup": "TYPE DAYA DUKUNG"
  }
];
  const items = [
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "0",
    "nmLookupItem": "SPPT"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "1",
    "nmLookupItem": "SKP_SPOP"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "2",
    "nmLookupItem": "SKP_KB"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "3",
    "nmLookupItem": "HIMBAUAN"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "4",
    "nmLookupItem": "STP"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "5",
    "nmLookupItem": "TEGORAN"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "6",
    "nmLookupItem": "SURAT PAKSA"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "7",
    "nmLookupItem": "SITA"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "8",
    "nmLookupItem": "LELANG"
  },
  {
    "kdLookupGroup": "01",
    "kdLookupItem": "9",
    "nmLookupItem": "HAPUS_PIUTANG"
  },
  {
    "kdLookupGroup": "02",
    "kdLookupItem": "0",
    "nmLookupItem": "BELUM LUNAS"
  },
  {
    "kdLookupGroup": "02",
    "kdLookupItem": "1",
    "nmLookupItem": "LUNAS"
  },
  {
    "kdLookupGroup": "02",
    "kdLookupItem": "2",
    "nmLookupItem": "DIHAPUSKAN"
  },
  {
    "kdLookupGroup": "02",
    "kdLookupItem": "3",
    "nmLookupItem": "LUNAS POKOK"
  },
  {
    "kdLookupGroup": "03",
    "kdLookupItem": "0",
    "nmLookupItem": "INDIVIDU"
  },
  {
    "kdLookupGroup": "03",
    "kdLookupItem": "1",
    "nmLookupItem": "MASSAL / KOLEKTIF"
  },
  {
    "kdLookupGroup": "04",
    "kdLookupItem": "0",
    "nmLookupItem": "DITERIMA"
  },
  {
    "kdLookupGroup": "04",
    "kdLookupItem": "1",
    "nmLookupItem": "DITERIMA SEBAGIAN"
  },
  {
    "kdLookupGroup": "04",
    "kdLookupItem": "2",
    "nmLookupItem": "DITOLAK"
  },
  {
    "kdLookupGroup": "04",
    "kdLookupItem": "3",
    "nmLookupItem": "MENAMBAH BESARNYA PAJAK"
  },
  {
    "kdLookupGroup": "05",
    "kdLookupItem": "1",
    "nmLookupItem": "KELAS 1/BINTANG 5/TIPE 4"
  },
  {
    "kdLookupGroup": "05",
    "kdLookupItem": "2",
    "nmLookupItem": "KELAS 2/BINTANG 4/TIPE 3"
  },
  {
    "kdLookupGroup": "05",
    "kdLookupItem": "3",
    "nmLookupItem": "KELAS 3/BINTANG 3/TIPE 2"
  },
  {
    "kdLookupGroup": "05",
    "kdLookupItem": "4",
    "nmLookupItem": "KELAS 4/BINTANG 1-2/TIPE 1"
  },
  {
    "kdLookupGroup": "05",
    "kdLookupItem": "5",
    "nmLookupItem": "NON KELAS/NON BINTANG/NON TIPE"
  },
  {
    "kdLookupGroup": "06",
    "kdLookupItem": "0",
    "nmLookupItem": "SEDANG DIPROSES"
  },
  {
    "kdLookupGroup": "06",
    "kdLookupItem": "1",
    "nmLookupItem": "SIAP KE WP"
  },
  {
    "kdLookupGroup": "06",
    "kdLookupItem": "2",
    "nmLookupItem": "SELESAI"
  },
  {
    "kdLookupGroup": "07",
    "kdLookupItem": "0",
    "nmLookupItem": "KPPBB"
  },
  {
    "kdLookupGroup": "07",
    "kdLookupItem": "1",
    "nmLookupItem": "KANWIL"
  },
  {
    "kdLookupGroup": "08",
    "kdLookupItem": "0",
    "nmLookupItem": "LAINNYA"
  },
  {
    "kdLookupGroup": "08",
    "kdLookupItem": "1",
    "nmLookupItem": "PNS"
  },
  {
    "kdLookupGroup": "08",
    "kdLookupItem": "2",
    "nmLookupItem": "ABRI"
  },
  {
    "kdLookupGroup": "08",
    "kdLookupItem": "3",
    "nmLookupItem": "PENSIUNAN"
  },
  {
    "kdLookupGroup": "08",
    "kdLookupItem": "4",
    "nmLookupItem": "BADAN"
  },
  {
    "kdLookupGroup": "08",
    "kdLookupItem": "5",
    "nmLookupItem": "LAINNYA"
  },
  {
    "kdLookupGroup": "09",
    "kdLookupItem": "1",
    "nmLookupItem": "DI ATAS TANAH"
  },
  {
    "kdLookupGroup": "09",
    "kdLookupItem": "2",
    "nmLookupItem": "DI BAWAH TANAH"
  },
  {
    "kdLookupGroup": "10",
    "kdLookupItem": "1",
    "nmLookupItem": "PEMILIK"
  },
  {
    "kdLookupGroup": "10",
    "kdLookupItem": "2",
    "nmLookupItem": "PENYEWA"
  },
  {
    "kdLookupGroup": "10",
    "kdLookupItem": "3",
    "nmLookupItem": "PENGELOLA"
  },
  {
    "kdLookupGroup": "10",
    "kdLookupItem": "4",
    "nmLookupItem": "PEMAKAI"
  },
  {
    "kdLookupGroup": "10",
    "kdLookupItem": "5",
    "nmLookupItem": "SENGKETA"
  },
  {
    "kdLookupGroup": "11",
    "kdLookupItem": "0",
    "nmLookupItem": "NON DEP"
  },
  {
    "kdLookupGroup": "11",
    "kdLookupItem": "1",
    "nmLookupItem": "DEP MIN MAX"
  },
  {
    "kdLookupGroup": "11",
    "kdLookupItem": "2",
    "nmLookupItem": "DEP JPB/KELAS/BINTANG"
  },
  {
    "kdLookupGroup": "12",
    "kdLookupItem": "0",
    "nmLookupItem": "ATAS POKOK"
  },
  {
    "kdLookupGroup": "12",
    "kdLookupItem": "1",
    "nmLookupItem": "ATAS TUNGGAKAN"
  },
  {
    "kdLookupGroup": "12",
    "kdLookupItem": "2",
    "nmLookupItem": "PENGURANGAN PENERIMAAN"
  },
  {
    "kdLookupGroup": "13",
    "kdLookupItem": "0",
    "nmLookupItem": "SKP ATAS SPOP"
  },
  {
    "kdLookupGroup": "13",
    "kdLookupItem": "1",
    "nmLookupItem": "SKP ATAS KEKURANGAN PEMBAYARAN"
  },
  {
    "kdLookupGroup": "14",
    "kdLookupItem": "0",
    "nmLookupItem": "DISUSUTKAN DIKALIKAN DG LUAS B"
  },
  {
    "kdLookupGroup": "14",
    "kdLookupItem": "1",
    "nmLookupItem": "DISUSUTKAN DIKALIKAN DG JML KA"
  },
  {
    "kdLookupGroup": "14",
    "kdLookupItem": "2",
    "nmLookupItem": "DISUSUTKAN DIKALIKAN DG LUAS K"
  },
  {
    "kdLookupGroup": "14",
    "kdLookupItem": "3",
    "nmLookupItem": "DISUSUTKAN DIKALIKAN DG LUAS R"
  },
  {
    "kdLookupGroup": "14",
    "kdLookupItem": "4",
    "nmLookupItem": "DISUSUTKAN TDK DIKALIKAN DG LU"
  },
  {
    "kdLookupGroup": "14",
    "kdLookupItem": "5",
    "nmLookupItem": "TIDAK DISUSUTKAN"
  },
  {
    "kdLookupGroup": "15",
    "kdLookupItem": "0",
    "nmLookupItem": "SPPT"
  },
  {
    "kdLookupGroup": "15",
    "kdLookupItem": "1",
    "nmLookupItem": "SKP"
  },
  {
    "kdLookupGroup": "15",
    "kdLookupItem": "2",
    "nmLookupItem": "STP"
  },
  {
    "kdLookupGroup": "16",
    "kdLookupItem": "0",
    "nmLookupItem": "KONSTRUKSI UTAMA"
  },
  {
    "kdLookupGroup": "16",
    "kdLookupItem": "1",
    "nmLookupItem": "MATERIAL"
  },
  {
    "kdLookupGroup": "17",
    "kdLookupItem": "0",
    "nmLookupItem": "STP PBB"
  },
  {
    "kdLookupGroup": "17",
    "kdLookupItem": "1",
    "nmLookupItem": "SURAT TEGORAN"
  },
  {
    "kdLookupGroup": "17",
    "kdLookupItem": "2",
    "nmLookupItem": "SURAT PAKSA"
  },
  {
    "kdLookupGroup": "17",
    "kdLookupItem": "3",
    "nmLookupItem": "SURAT SITA"
  },
  {
    "kdLookupGroup": "17",
    "kdLookupItem": "4",
    "nmLookupItem": "JADUAL LELANG"
  },
  {
    "kdLookupGroup": "17",
    "kdLookupItem": "6",
    "nmLookupItem": "PENGUMUMAN LELANG"
  },
  {
    "kdLookupGroup": "17",
    "kdLookupItem": "7",
    "nmLookupItem": "BATAL LELANG"
  },
  {
    "kdLookupGroup": "17",
    "kdLookupItem": "8",
    "nmLookupItem": "PENCABUTAN SITA"
  },
  {
    "kdLookupGroup": "18",
    "kdLookupItem": "0",
    "nmLookupItem": "CABANG"
  },
  {
    "kdLookupGroup": "18",
    "kdLookupItem": "1",
    "nmLookupItem": "BUKAN CABANG"
  },
  {
    "kdLookupGroup": "19",
    "kdLookupItem": "0",
    "nmLookupItem": "KOMPENSASI"
  },
  {
    "kdLookupGroup": "19",
    "kdLookupItem": "1",
    "nmLookupItem": "RESTITUSI"
  },
  {
    "kdLookupGroup": "19",
    "kdLookupItem": "2",
    "nmLookupItem": "DISUMBANGKAN KE NEGARA"
  },
  {
    "kdLookupGroup": "20",
    "kdLookupItem": "1",
    "nmLookupItem": "TANAH + BANGUNAN"
  },
  {
    "kdLookupGroup": "20",
    "kdLookupItem": "2",
    "nmLookupItem": "KAVLING SIAP BANGUN"
  },
  {
    "kdLookupGroup": "20",
    "kdLookupItem": "3",
    "nmLookupItem": "TANAH KOSONG"
  },
  {
    "kdLookupGroup": "20",
    "kdLookupItem": "4",
    "nmLookupItem": "FASILITAS UMUM"
  },
  {
    "kdLookupGroup": "21",
    "kdLookupItem": "1",
    "nmLookupItem": "SANGAT BAIK"
  },
  {
    "kdLookupGroup": "21",
    "kdLookupItem": "2",
    "nmLookupItem": "BAIK"
  },
  {
    "kdLookupGroup": "21",
    "kdLookupItem": "3",
    "nmLookupItem": "SEDANG"
  },
  {
    "kdLookupGroup": "21",
    "kdLookupItem": "4",
    "nmLookupItem": "JELEK"
  },
  {
    "kdLookupGroup": "22",
    "kdLookupItem": "1",
    "nmLookupItem": "BAJA"
  },
  {
    "kdLookupGroup": "22",
    "kdLookupItem": "2",
    "nmLookupItem": "BETON"
  },
  {
    "kdLookupGroup": "22",
    "kdLookupItem": "3",
    "nmLookupItem": "BATU BATA"
  },
  {
    "kdLookupGroup": "22",
    "kdLookupItem": "4",
    "nmLookupItem": "KAYU"
  },
  {
    "kdLookupGroup": "23",
    "kdLookupItem": "0",
    "nmLookupItem": "TIDAK BERPETA"
  },
  {
    "kdLookupGroup": "23",
    "kdLookupItem": "1",
    "nmLookupItem": "BERPETA"
  },
  {
    "kdLookupGroup": "24",
    "kdLookupItem": "0",
    "nmLookupItem": "TIDAK PERLU DIKUNJUNGI"
  },
  {
    "kdLookupGroup": "24",
    "kdLookupItem": "1",
    "nmLookupItem": "PERLU DIKUNJUNGI"
  },
  {
    "kdLookupGroup": "25",
    "kdLookupItem": "0",
    "nmLookupItem": "PERORANGAN"
  },
  {
    "kdLookupGroup": "25",
    "kdLookupItem": "1",
    "nmLookupItem": "BADAN/LEMBAGA/KELURAHAN"
  },
  {
    "kdLookupGroup": "26",
    "kdLookupItem": "1",
    "nmLookupItem": "SPPT"
  },
  {
    "kdLookupGroup": "26",
    "kdLookupItem": "2",
    "nmLookupItem": "SKP"
  },
  {
    "kdLookupGroup": "27",
    "kdLookupItem": "0",
    "nmLookupItem": "PELAYANAN PBB"
  },
  {
    "kdLookupGroup": "27",
    "kdLookupItem": "1",
    "nmLookupItem": "PELAYANAN P3"
  },
  {
    "kdLookupGroup": "27",
    "kdLookupItem": "2",
    "nmLookupItem": "PELAYANAN BPHTB"
  },
  {
    "kdLookupGroup": "28",
    "kdLookupItem": "1",
    "nmLookupItem": "NON RESORT"
  },
  {
    "kdLookupGroup": "28",
    "kdLookupItem": "2",
    "nmLookupItem": "RESORT"
  },
  {
    "kdLookupGroup": "29",
    "kdLookupItem": "0",
    "nmLookupItem": "MUTASI WP"
  },
  {
    "kdLookupGroup": "29",
    "kdLookupItem": "1",
    "nmLookupItem": "PENGGABUNGAN OP"
  },
  {
    "kdLookupGroup": "29",
    "kdLookupItem": "2",
    "nmLookupItem": "PEMECAHAN OP"
  },
  {
    "kdLookupGroup": "30",
    "kdLookupItem": "1",
    "nmLookupItem": "WILAYAH"
  },
  {
    "kdLookupGroup": "30",
    "kdLookupItem": "2",
    "nmLookupItem": "OBYEK"
  },
  {
    "kdLookupGroup": "30",
    "kdLookupItem": "3",
    "nmLookupItem": "SEMUA DATA"
  },
  {
    "kdLookupGroup": "31",
    "kdLookupItem": "0",
    "nmLookupItem": "BELUM DIGUNAKAN"
  },
  {
    "kdLookupGroup": "31",
    "kdLookupItem": "1",
    "nmLookupItem": "SUDAH DIGUNAKAN"
  },
  {
    "kdLookupGroup": "32",
    "kdLookupItem": "T",
    "nmLookupItem": "TIDAK"
  },
  {
    "kdLookupGroup": "32",
    "kdLookupItem": "Y",
    "nmLookupItem": "YA"
  },
  {
    "kdLookupGroup": "33",
    "kdLookupItem": "1",
    "nmLookupItem": "PEREKAMAN DATA BARU"
  },
  {
    "kdLookupGroup": "33",
    "kdLookupItem": "2",
    "nmLookupItem": "PEMUTAKHIRAN"
  },
  {
    "kdLookupGroup": "33",
    "kdLookupItem": "3",
    "nmLookupItem": "PENGHAPUSAN DATA"
  },
  {
    "kdLookupGroup": "33",
    "kdLookupItem": "4",
    "nmLookupItem": "PENILAIAN MASSAL"
  },
  {
    "kdLookupGroup": "34",
    "kdLookupItem": "1",
    "nmLookupItem": "PPAT"
  },
  {
    "kdLookupGroup": "34",
    "kdLookupItem": "2",
    "nmLookupItem": "LURAH"
  },
  {
    "kdLookupGroup": "34",
    "kdLookupItem": "3",
    "nmLookupItem": "CAMAT"
  },
  {
    "kdLookupGroup": "34",
    "kdLookupItem": "4",
    "nmLookupItem": "IKLAN"
  },
  {
    "kdLookupGroup": "34",
    "kdLookupItem": "5",
    "nmLookupItem": "LAIN-LAIN"
  },
  {
    "kdLookupGroup": "35",
    "kdLookupItem": "0",
    "nmLookupItem": "JADUAL PELELANGAN"
  },
  {
    "kdLookupGroup": "35",
    "kdLookupItem": "1",
    "nmLookupItem": "PELELANGAN BATAL"
  },
  {
    "kdLookupGroup": "35",
    "kdLookupItem": "2",
    "nmLookupItem": "LELANG"
  },
  {
    "kdLookupGroup": "36",
    "kdLookupItem": "1",
    "nmLookupItem": "DITERIMA"
  },
  {
    "kdLookupGroup": "36",
    "kdLookupItem": "2",
    "nmLookupItem": "DITOLAK"
  },
  {
    "kdLookupGroup": "37",
    "kdLookupItem": "1",
    "nmLookupItem": "PENAMBAHAN"
  },
  {
    "kdLookupGroup": "37",
    "kdLookupItem": "2",
    "nmLookupItem": "PERKALIAN"
  },
  {
    "kdLookupGroup": "37",
    "kdLookupItem": "3",
    "nmLookupItem": "PEMBAGIAN"
  },
  {
    "kdLookupGroup": "37",
    "kdLookupItem": "4",
    "nmLookupItem": "PERSENTASE"
  },
  {
    "kdLookupGroup": "38",
    "kdLookupItem": "0",
    "nmLookupItem": "TIDAK ADA"
  },
  {
    "kdLookupGroup": "38",
    "kdLookupItem": "1",
    "nmLookupItem": "ADA"
  },
  {
    "kdLookupGroup": "38",
    "kdLookupItem": "2",
    "nmLookupItem": "TIDAK ADA"
  },
  {
    "kdLookupGroup": "39",
    "kdLookupItem": "1",
    "nmLookupItem": "DIPLESTER"
  },
  {
    "kdLookupGroup": "39",
    "kdLookupItem": "2",
    "nmLookupItem": "DENGAN PELAPIS"
  },
  {
    "kdLookupGroup": "40",
    "kdLookupItem": "1",
    "nmLookupItem": "BAJA/BESI"
  },
  {
    "kdLookupGroup": "40",
    "kdLookupItem": "2",
    "nmLookupItem": "BATA/BATAKO"
  },
  {
    "kdLookupGroup": "41",
    "kdLookupItem": "1",
    "nmLookupItem": "DECRABON/BETON/GTG GLAZUR"
  },
  {
    "kdLookupGroup": "41",
    "kdLookupItem": "2",
    "nmLookupItem": "GTG BETON/ALUMUNIUM"
  },
  {
    "kdLookupGroup": "41",
    "kdLookupItem": "3",
    "nmLookupItem": "GTG BIASA/SIRAP"
  },
  {
    "kdLookupGroup": "41",
    "kdLookupItem": "4",
    "nmLookupItem": "ASBES"
  },
  {
    "kdLookupGroup": "41",
    "kdLookupItem": "5",
    "nmLookupItem": "SENG"
  },
  {
    "kdLookupGroup": "42",
    "kdLookupItem": "1",
    "nmLookupItem": "KACA/ALUMUNIUM"
  },
  {
    "kdLookupGroup": "42",
    "kdLookupItem": "2",
    "nmLookupItem": "BETON"
  },
  {
    "kdLookupGroup": "42",
    "kdLookupItem": "3",
    "nmLookupItem": "BATU BATA/CONBLOK"
  },
  {
    "kdLookupGroup": "42",
    "kdLookupItem": "4",
    "nmLookupItem": "KAYU"
  },
  {
    "kdLookupGroup": "42",
    "kdLookupItem": "5",
    "nmLookupItem": "SENG"
  },
  {
    "kdLookupGroup": "42",
    "kdLookupItem": "6",
    "nmLookupItem": "TIDAK ADA"
  },
  {
    "kdLookupGroup": "43",
    "kdLookupItem": "1",
    "nmLookupItem": "MARMER"
  },
  {
    "kdLookupGroup": "43",
    "kdLookupItem": "2",
    "nmLookupItem": "KERAMIK"
  },
  {
    "kdLookupGroup": "43",
    "kdLookupItem": "3",
    "nmLookupItem": "TERASO"
  },
  {
    "kdLookupGroup": "43",
    "kdLookupItem": "4",
    "nmLookupItem": "UBIN PC/PAPAN"
  },
  {
    "kdLookupGroup": "43",
    "kdLookupItem": "5",
    "nmLookupItem": "SEMEN"
  },
  {
    "kdLookupGroup": "44",
    "kdLookupItem": "1",
    "nmLookupItem": "AKUSTIK/JATI"
  },
  {
    "kdLookupGroup": "44",
    "kdLookupItem": "2",
    "nmLookupItem": "TRIPLEK/ASBES BAMBU"
  },
  {
    "kdLookupGroup": "44",
    "kdLookupItem": "3",
    "nmLookupItem": "TIDAK ADA"
  },
  {
    "kdLookupGroup": "45",
    "kdLookupItem": "1",
    "nmLookupItem": "KELAS 1"
  },
  {
    "kdLookupGroup": "45",
    "kdLookupItem": "2",
    "nmLookupItem": "KELAS 2"
  },
  {
    "kdLookupGroup": "45",
    "kdLookupItem": "3",
    "nmLookupItem": "KELAS 3"
  },
  {
    "kdLookupGroup": "45",
    "kdLookupItem": "4",
    "nmLookupItem": "KELAS 4"
  },
  {
    "kdLookupGroup": "46",
    "kdLookupItem": "1",
    "nmLookupItem": "KELAS 1"
  },
  {
    "kdLookupGroup": "46",
    "kdLookupItem": "2",
    "nmLookupItem": "KELAS 2"
  },
  {
    "kdLookupGroup": "46",
    "kdLookupItem": "3",
    "nmLookupItem": "KELAS 3"
  },
  {
    "kdLookupGroup": "47",
    "kdLookupItem": "1",
    "nmLookupItem": "KELAS 1"
  },
  {
    "kdLookupGroup": "47",
    "kdLookupItem": "2",
    "nmLookupItem": "KELAS 2"
  },
  {
    "kdLookupGroup": "48",
    "kdLookupItem": "1",
    "nmLookupItem": "KELAS 1"
  },
  {
    "kdLookupGroup": "48",
    "kdLookupItem": "2",
    "nmLookupItem": "KELAS 2"
  },
  {
    "kdLookupGroup": "49",
    "kdLookupItem": "1",
    "nmLookupItem": "TIPE 1"
  },
  {
    "kdLookupGroup": "49",
    "kdLookupItem": "2",
    "nmLookupItem": "TIPE 2"
  },
  {
    "kdLookupGroup": "49",
    "kdLookupItem": "3",
    "nmLookupItem": "TIPE 3"
  },
  {
    "kdLookupGroup": "49",
    "kdLookupItem": "4",
    "nmLookupItem": "TIPE 4"
  },
  {
    "kdLookupGroup": "50",
    "kdLookupItem": "1",
    "nmLookupItem": "KELAS 1"
  },
  {
    "kdLookupGroup": "50",
    "kdLookupItem": "2",
    "nmLookupItem": "KELAS 2"
  },
  {
    "kdLookupGroup": "50",
    "kdLookupItem": "3",
    "nmLookupItem": "KELAS 3"
  },
  {
    "kdLookupGroup": "50",
    "kdLookupItem": "4",
    "nmLookupItem": "KELAS 4"
  },
  {
    "kdLookupGroup": "51",
    "kdLookupItem": "0",
    "nmLookupItem": "NON BINTANG"
  },
  {
    "kdLookupGroup": "51",
    "kdLookupItem": "1",
    "nmLookupItem": "BINTANG 5"
  },
  {
    "kdLookupGroup": "51",
    "kdLookupItem": "2",
    "nmLookupItem": "BINTANG 4"
  },
  {
    "kdLookupGroup": "51",
    "kdLookupItem": "3",
    "nmLookupItem": "BINTANG 3"
  },
  {
    "kdLookupGroup": "51",
    "kdLookupItem": "4",
    "nmLookupItem": "BINTANG 1-2"
  },
  {
    "kdLookupGroup": "51",
    "kdLookupItem": "5",
    "nmLookupItem": "NON BINTANG"
  },
  {
    "kdLookupGroup": "52",
    "kdLookupItem": "1",
    "nmLookupItem": "KELAS 1"
  },
  {
    "kdLookupGroup": "52",
    "kdLookupItem": "2",
    "nmLookupItem": "KELAS 2"
  },
  {
    "kdLookupGroup": "52",
    "kdLookupItem": "3",
    "nmLookupItem": "KELAS 3"
  },
  {
    "kdLookupGroup": "52",
    "kdLookupItem": "4",
    "nmLookupItem": "KELAS 4"
  },
  {
    "kdLookupGroup": "53",
    "kdLookupItem": "0",
    "nmLookupItem": "PEMBETULAN"
  },
  {
    "kdLookupGroup": "53",
    "kdLookupItem": "1",
    "nmLookupItem": "PEMBATALAN"
  },
  {
    "kdLookupGroup": "54",
    "kdLookupItem": "0",
    "nmLookupItem": "KADALUARSA"
  },
  {
    "kdLookupGroup": "54",
    "kdLookupItem": "1",
    "nmLookupItem": "SEBAB LAIN"
  },
  {
    "kdLookupGroup": "55",
    "kdLookupItem": "0",
    "nmLookupItem": "PADA SAAT CETAK MASSAL"
  },
  {
    "kdLookupGroup": "55",
    "kdLookupItem": "1",
    "nmLookupItem": "SETELAH CETAK MASSAL"
  },
  {
    "kdLookupGroup": "56",
    "kdLookupItem": "0",
    "nmLookupItem": "TIDAK DIHAPUS"
  },
  {
    "kdLookupGroup": "56",
    "kdLookupItem": "1",
    "nmLookupItem": "DIHAPUS"
  },
  {
    "kdLookupGroup": "56",
    "kdLookupItem": "2",
    "nmLookupItem": "PROSES"
  },
  {
    "kdLookupGroup": "57",
    "kdLookupItem": "0",
    "nmLookupItem": "SPPT"
  },
  {
    "kdLookupGroup": "57",
    "kdLookupItem": "1",
    "nmLookupItem": "SKP TERHADAP SPOP"
  },
  {
    "kdLookupGroup": "57",
    "kdLookupItem": "2",
    "nmLookupItem": "SKP KURANG BAYAR"
  },
  {
    "kdLookupGroup": "58",
    "kdLookupItem": "0",
    "nmLookupItem": "EPSON"
  },
  {
    "kdLookupGroup": "58",
    "kdLookupItem": "1",
    "nmLookupItem": "DATA PRODUCT"
  },
  {
    "kdLookupGroup": "58",
    "kdLookupItem": "2",
    "nmLookupItem": "GENICOM"
  },
  {
    "kdLookupGroup": "58",
    "kdLookupItem": "3",
    "nmLookupItem": "MANESMANN TALLY"
  },
  {
    "kdLookupGroup": "58",
    "kdLookupItem": "4",
    "nmLookupItem": "PRINTRONIX"
  },
  {
    "kdLookupGroup": "59",
    "kdLookupItem": "C",
    "nmLookupItem": "CETAK"
  },
  {
    "kdLookupGroup": "59",
    "kdLookupItem": "L",
    "nmLookupItem": "LIHAT"
  },
  {
    "kdLookupGroup": "60",
    "kdLookupItem": "1",
    "nmLookupItem": "PUSAT"
  },
  {
    "kdLookupGroup": "60",
    "kdLookupItem": "2",
    "nmLookupItem": "DATI I"
  },
  {
    "kdLookupGroup": "60",
    "kdLookupItem": "3",
    "nmLookupItem": "DATI II"
  },
  {
    "kdLookupGroup": "60",
    "kdLookupItem": "4",
    "nmLookupItem": "KECAMATAN"
  },
  {
    "kdLookupGroup": "60",
    "kdLookupItem": "5",
    "nmLookupItem": "KELURAHAN"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "A",
    "nmLookupItem": "12345"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "B",
    "nmLookupItem": "1,2345"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "C",
    "nmLookupItem": "12,345"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "D",
    "nmLookupItem": "123,45"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "E",
    "nmLookupItem": "1234,5"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "F",
    "nmLookupItem": "1,2,345"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "G",
    "nmLookupItem": "1,23,45"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "H",
    "nmLookupItem": "1,234,5"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "I",
    "nmLookupItem": "12,3,45"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "J",
    "nmLookupItem": "12,34,5"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "K",
    "nmLookupItem": "123,4,5"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "L",
    "nmLookupItem": "1,2,3,45"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "M",
    "nmLookupItem": "1,2,34,5"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "N",
    "nmLookupItem": "1,23,4,5"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "O",
    "nmLookupItem": "12,3,4,5"
  },
  {
    "kdLookupGroup": "61",
    "kdLookupItem": "P",
    "nmLookupItem": "1,2,3,4,5"
  },
  {
    "kdLookupGroup": "62",
    "kdLookupItem": "0",
    "nmLookupItem": "NILAI JUAL KENA PAJAK UMUM"
  },
  {
    "kdLookupGroup": "62",
    "kdLookupItem": "1",
    "nmLookupItem": "NILAI JUAL KENA PAJAK KHUSUS"
  },
  {
    "kdLookupGroup": "62",
    "kdLookupItem": "2",
    "nmLookupItem": "KETETAPAN / TARIF PAJAK"
  },
  {
    "kdLookupGroup": "63",
    "kdLookupItem": "0",
    "nmLookupItem": "BTKP"
  },
  {
    "kdLookupGroup": "63",
    "kdLookupItem": "1",
    "nmLookupItem": "NJOPTKP"
  },
  {
    "kdLookupGroup": "64",
    "kdLookupItem": "0",
    "nmLookupItem": "AKTIF"
  },
  {
    "kdLookupGroup": "64",
    "kdLookupItem": "1",
    "nmLookupItem": "NON AKTIF"
  },
  {
    "kdLookupGroup": "64",
    "kdLookupItem": "2",
    "nmLookupItem": "NJOPTKP BELUM PENETAPAN"
  },
  {
    "kdLookupGroup": "65",
    "kdLookupItem": "0",
    "nmLookupItem": "NJOPTKP"
  },
  {
    "kdLookupGroup": "65",
    "kdLookupItem": "1",
    "nmLookupItem": "NJKP"
  },
  {
    "kdLookupGroup": "65",
    "kdLookupItem": "2",
    "nmLookupItem": "TARIF"
  },
  {
    "kdLookupGroup": "65",
    "kdLookupItem": "3",
    "nmLookupItem": "BUKU"
  },
  {
    "kdLookupGroup": "66",
    "kdLookupItem": "1",
    "nmLookupItem": "ZNT"
  },
  {
    "kdLookupGroup": "66",
    "kdLookupItem": "2",
    "nmLookupItem": "HARGA RESOURCES"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "A",
    "nmLookupItem": "KEBERATAN"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "B",
    "nmLookupItem": "PEMBETULAN SK KEBERATAN"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "C",
    "nmLookupItem": "PEMBATALAN SPPT"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "D",
    "nmLookupItem": "PEMBATALAN SKP SPOP"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "E",
    "nmLookupItem": "PEMBATALAN SKP KB"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "F",
    "nmLookupItem": "PEMBATALAN STP"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "G",
    "nmLookupItem": "PEMBETULAN SPPT"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "H",
    "nmLookupItem": "PEMBETULAN SKP SPOP"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "I",
    "nmLookupItem": "PEMBETULAN SKP KB"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "J",
    "nmLookupItem": "PEMBETULAN STP"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "K",
    "nmLookupItem": "PENGURANGAN SPPT"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "L",
    "nmLookupItem": "PENGURANGAN DENDA ADMINISTRASI"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "M",
    "nmLookupItem": "PENGURANGAN SKP SPOP"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "N",
    "nmLookupItem": "PENGURANGAN SKP KB"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "O",
    "nmLookupItem": "RESTITUSI"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "P",
    "nmLookupItem": "KOMPENSASI"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "Q",
    "nmLookupItem": "PENENTUAN KEMBALI TGL JATUH TE"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "R",
    "nmLookupItem": "PENENTUAN KEMBALI TGL JATUH TE"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "S",
    "nmLookupItem": "PENENTUAN KEMBALI TGL JATUH TE"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "T",
    "nmLookupItem": "PENENTUAN KEMBALI TGL JATUH TE"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "U",
    "nmLookupItem": "PENGHAPUSAN PIUTANG"
  },
  {
    "kdLookupGroup": "67",
    "kdLookupItem": "V",
    "nmLookupItem": "SPPPSS"
  },
  {
    "kdLookupGroup": "68",
    "kdLookupItem": "0",
    "nmLookupItem": "SPPT"
  },
  {
    "kdLookupGroup": "68",
    "kdLookupItem": "1",
    "nmLookupItem": "SKP"
  },
  {
    "kdLookupGroup": "68",
    "kdLookupItem": "2",
    "nmLookupItem": "STP"
  },
  {
    "kdLookupGroup": "69",
    "kdLookupItem": "0",
    "nmLookupItem": "KEBERATAN"
  },
  {
    "kdLookupGroup": "69",
    "kdLookupItem": "1",
    "nmLookupItem": "PEMBETULAN"
  },
  {
    "kdLookupGroup": "70",
    "kdLookupItem": "0",
    "nmLookupItem": "DISETUJUI"
  },
  {
    "kdLookupGroup": "70",
    "kdLookupItem": "1",
    "nmLookupItem": "DITOLAK"
  },
  {
    "kdLookupGroup": "70",
    "kdLookupItem": "2",
    "nmLookupItem": "DIUSULKAN"
  },
  {
    "kdLookupGroup": "71",
    "kdLookupItem": "0",
    "nmLookupItem": "BARANG BERGERAK"
  },
  {
    "kdLookupGroup": "71",
    "kdLookupItem": "1",
    "nmLookupItem": "TIDAK BERGERAK"
  },
  {
    "kdLookupGroup": "72",
    "kdLookupItem": "0",
    "nmLookupItem": "BARANG SITA"
  },
  {
    "kdLookupGroup": "72",
    "kdLookupItem": "1",
    "nmLookupItem": "SITA"
  },
  {
    "kdLookupGroup": "73",
    "kdLookupItem": "0",
    "nmLookupItem": "PEMERIKSAAN SEDERHANA KANTOR"
  },
  {
    "kdLookupGroup": "73",
    "kdLookupItem": "1",
    "nmLookupItem": "PEMERIKSAAN SEDERHANA LAPANGAN"
  },
  {
    "kdLookupGroup": "74",
    "kdLookupItem": "0",
    "nmLookupItem": "PENERIMAAN"
  },
  {
    "kdLookupGroup": "74",
    "kdLookupItem": "1",
    "nmLookupItem": "PENGELUARKAN"
  },
  {
    "kdLookupGroup": "75",
    "kdLookupItem": "0",
    "nmLookupItem": "BUKAN KAYU ULIN"
  },
  {
    "kdLookupGroup": "75",
    "kdLookupItem": "1",
    "nmLookupItem": "KAYU ULIN"
  },
  {
    "kdLookupGroup": "76",
    "kdLookupItem": "0",
    "nmLookupItem": "TIDAK PERLU PROSES SELANJUTNYA"
  },
  {
    "kdLookupGroup": "76",
    "kdLookupItem": "1",
    "nmLookupItem": "PERLU PROSES SELANJUTNYA"
  },
  {
    "kdLookupGroup": "77",
    "kdLookupItem": "1",
    "nmLookupItem": "PENGURANGAN PERMANEN"
  },
  {
    "kdLookupGroup": "77",
    "kdLookupItem": "2",
    "nmLookupItem": "PENGURANGAN PST"
  },
  {
    "kdLookupGroup": "77",
    "kdLookupItem": "3",
    "nmLookupItem": "PENGURANGAN PENGENAAN JPB"
  },
  {
    "kdLookupGroup": "77",
    "kdLookupItem": "4",
    "nmLookupItem": "PENGURANGAN DENDA ADMINISTRASI"
  },
  {
    "kdLookupGroup": "77",
    "kdLookupItem": "5",
    "nmLookupItem": "PENGURANGAN SEBELUM SPPT TERBIT"
  },
  {
    "kdLookupGroup": "78",
    "kdLookupItem": "0",
    "nmLookupItem": "BELUM DIPROSES"
  },
  {
    "kdLookupGroup": "78",
    "kdLookupItem": "1",
    "nmLookupItem": "SUDAH DIPROSES"
  },
  {
    "kdLookupGroup": "79",
    "kdLookupItem": "0",
    "nmLookupItem": "SEDANG DIPROSES"
  },
  {
    "kdLookupGroup": "79",
    "kdLookupItem": "1",
    "nmLookupItem": "SUDAH DIPROSES"
  },
  {
    "kdLookupGroup": "80",
    "kdLookupItem": "0",
    "nmLookupItem": "DIUSULKAN"
  },
  {
    "kdLookupGroup": "80",
    "kdLookupItem": "1",
    "nmLookupItem": "DITETAPKAN"
  },
  {
    "kdLookupGroup": "81",
    "kdLookupItem": "0",
    "nmLookupItem": "HIMBAUAN ATAS SPPT"
  },
  {
    "kdLookupGroup": "81",
    "kdLookupItem": "1",
    "nmLookupItem": "HIMBAUAN ATAS TAGIHAN SKP"
  },
  {
    "kdLookupGroup": "82",
    "kdLookupItem": "1",
    "nmLookupItem": "RINGAN"
  },
  {
    "kdLookupGroup": "82",
    "kdLookupItem": "2",
    "nmLookupItem": "SEDANG"
  },
  {
    "kdLookupGroup": "82",
    "kdLookupItem": "3",
    "nmLookupItem": "MENENGAH"
  },
  {
    "kdLookupGroup": "82",
    "kdLookupItem": "4",
    "nmLookupItem": "BERAT"
  },
  {
    "kdLookupGroup": "82",
    "kdLookupItem": "5",
    "nmLookupItem": "SANGAT BERAT"
  }
];

  await db.transaction(async (tx) => {
    // Clear existing to avoid conflicts during seed
    await tx.delete(lookupItem);
    await tx.delete(lookupGroup);

    console.log(`Inserting ${groups.length} lookup groups...`);
    const GROUP_CHUNK = 50;
    for (let i = 0; i < groups.length; i += GROUP_CHUNK) {
      await tx.insert(lookupGroup).values(groups.slice(i, i + GROUP_CHUNK));
    }

    console.log(`Inserting ${items.length} lookup items...`);
    const ITEM_CHUNK = 100;
    for (let i = 0; i < items.length; i += ITEM_CHUNK) {
      await tx.insert(lookupItem).values(items.slice(i, i + ITEM_CHUNK));
    }
  });

  console.log("Lookups seeded successfully!");
}
