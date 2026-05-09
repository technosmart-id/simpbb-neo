import { pbbUserProfile, groupAkses, akses } from "../schema/pengguna";

export const legacyAkses = [
  {
    "akses": "BERKAS",
    "aktif": 1
  },
  {
    "akses": "CETAK_DHKP",
    "aktif": 1
  },
  {
    "akses": "CETAK_KLASIFIKASI_BANGUNAN",
    "aktif": 1
  },
  {
    "akses": "CETAK_KLASIFIKASI_BUMI",
    "aktif": 1
  },
  {
    "akses": "CETAK_SPPT",
    "aktif": 1
  },
  {
    "akses": "CETAK_SSPD",
    "aktif": 1
  },
  {
    "akses": "GRUP",
    "aktif": 1
  },
  {
    "akses": "INFO_OP",
    "aktif": 1
  },
  {
    "akses": "JALAN",
    "aktif": 1
  },
  {
    "akses": "KLASIFIKASI_PBB",
    "aktif": 1
  },
  {
    "akses": "KONFIGURASI",
    "aktif": 1
  },
  {
    "akses": "LAPORAN",
    "aktif": 1
  },
  {
    "akses": "LIHAT_DHKP",
    "aktif": 0
  },
  {
    "akses": "LIHAT_SPPT",
    "aktif": 0
  },
  {
    "akses": "LIHAT_SSPD",
    "aktif": 0
  },
  {
    "akses": "LSPOP",
    "aktif": 1
  },
  {
    "akses": "PELAYANAN",
    "aktif": 1
  },
  {
    "akses": "PEMBAYARAN_BATAL",
    "aktif": 1
  },
  {
    "akses": "PEMBAYARAN_MASAL",
    "aktif": 1
  },
  {
    "akses": "PEMBAYARAN_PER_NOP",
    "aktif": 1
  },
  {
    "akses": "PEMEKARAN",
    "aktif": 1
  },
  {
    "akses": "PENGGUNA",
    "aktif": 1
  },
  {
    "akses": "PENGHAPUSAN",
    "aktif": 1
  },
  {
    "akses": "PETA",
    "aktif": 1
  },
  {
    "akses": "REFERENSI_KECAMATAN",
    "aktif": 1
  },
  {
    "akses": "REFERENSI_KELURAHAN",
    "aktif": 1
  },
  {
    "akses": "SIMULASI",
    "aktif": 1
  },
  {
    "akses": "SPOP",
    "aktif": 1
  },
  {
    "akses": "STATISTIK",
    "aktif": 1
  },
  {
    "akses": "TEMPAT_PEMBAYARAN",
    "aktif": 1
  },
  {
    "akses": "TUNGGAKAN",
    "aktif": 1
  },
  {
    "akses": "UPDATE_BANGUNAN",
    "aktif": 1
  },
  {
    "akses": "UPDATE_BUMI",
    "aktif": 1
  },
  {
    "akses": "UPDATE_SPPT_MASAL",
    "aktif": 1
  },
  {
    "akses": "UPDATE_SPPT_PER_NOP",
    "aktif": 1
  }
] as const;

export const legacyGroupAkses = [
  {
    "hakAkses": "admin",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "admin",
    "akses": "CETAK_DHKP"
  },
  {
    "hakAkses": "admin",
    "akses": "CETAK_KLASIFIKASI_BANGUNAN"
  },
  {
    "hakAkses": "admin",
    "akses": "CETAK_KLASIFIKASI_BUMI"
  },
  {
    "hakAkses": "admin",
    "akses": "CETAK_SPPT"
  },
  {
    "hakAkses": "admin",
    "akses": "CETAK_SSPD"
  },
  {
    "hakAkses": "admin",
    "akses": "GRUP"
  },
  {
    "hakAkses": "admin",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "admin",
    "akses": "JALAN"
  },
  {
    "hakAkses": "admin",
    "akses": "KLASIFIKASI_PBB"
  },
  {
    "hakAkses": "admin",
    "akses": "KONFIGURASI"
  },
  {
    "hakAkses": "admin",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "admin",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "admin",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "admin",
    "akses": "PEMBAYARAN_BATAL"
  },
  {
    "hakAkses": "admin",
    "akses": "PEMBAYARAN_MASAL"
  },
  {
    "hakAkses": "admin",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "admin",
    "akses": "PEMEKARAN"
  },
  {
    "hakAkses": "admin",
    "akses": "PENGGUNA"
  },
  {
    "hakAkses": "admin",
    "akses": "PENGHAPUSAN"
  },
  {
    "hakAkses": "admin",
    "akses": "PETA"
  },
  {
    "hakAkses": "admin",
    "akses": "REFERENSI_KECAMATAN"
  },
  {
    "hakAkses": "admin",
    "akses": "REFERENSI_KELURAHAN"
  },
  {
    "hakAkses": "admin",
    "akses": "SIMULASI"
  },
  {
    "hakAkses": "admin",
    "akses": "SPOP"
  },
  {
    "hakAkses": "admin",
    "akses": "STATISTIK"
  },
  {
    "hakAkses": "admin",
    "akses": "TEMPAT_PEMBAYARAN"
  },
  {
    "hakAkses": "admin",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "admin",
    "akses": "UPDATE_BANGUNAN"
  },
  {
    "hakAkses": "admin",
    "akses": "UPDATE_BUMI"
  },
  {
    "hakAkses": "admin",
    "akses": "UPDATE_SPPT_MASAL"
  },
  {
    "hakAkses": "admin",
    "akses": "UPDATE_SPPT_PER_NOP"
  },
  {
    "hakAkses": "admin2",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "admin2",
    "akses": "CETAK_DHKP"
  },
  {
    "hakAkses": "admin2",
    "akses": "CETAK_KLASIFIKASI_BANGUNAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "CETAK_KLASIFIKASI_BUMI"
  },
  {
    "hakAkses": "admin2",
    "akses": "CETAK_SPPT"
  },
  {
    "hakAkses": "admin2",
    "akses": "CETAK_SSPD"
  },
  {
    "hakAkses": "admin2",
    "akses": "GRUP"
  },
  {
    "hakAkses": "admin2",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "admin2",
    "akses": "JALAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "KLASIFIKASI_PBB"
  },
  {
    "hakAkses": "admin2",
    "akses": "KONFIGURASI"
  },
  {
    "hakAkses": "admin2",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "admin2",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "PEMBAYARAN_BATAL"
  },
  {
    "hakAkses": "admin2",
    "akses": "PEMBAYARAN_MASAL"
  },
  {
    "hakAkses": "admin2",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "admin2",
    "akses": "PEMEKARAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "PENGGUNA"
  },
  {
    "hakAkses": "admin2",
    "akses": "PENGHAPUSAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "PETA"
  },
  {
    "hakAkses": "admin2",
    "akses": "REFERENSI_KECAMATAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "REFERENSI_KELURAHAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "SIMULASI"
  },
  {
    "hakAkses": "admin2",
    "akses": "SPOP"
  },
  {
    "hakAkses": "admin2",
    "akses": "STATISTIK"
  },
  {
    "hakAkses": "admin2",
    "akses": "TEMPAT_PEMBAYARAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "UPDATE_BANGUNAN"
  },
  {
    "hakAkses": "admin2",
    "akses": "UPDATE_BUMI"
  },
  {
    "hakAkses": "admin2",
    "akses": "UPDATE_SPPT_MASAL"
  },
  {
    "hakAkses": "admin2",
    "akses": "UPDATE_SPPT_PER_NOP"
  },
  {
    "hakAkses": "bpk",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "bpk",
    "akses": "CETAK_DHKP"
  },
  {
    "hakAkses": "bpk",
    "akses": "CETAK_SPPT"
  },
  {
    "hakAkses": "bpk",
    "akses": "KLASIFIKASI_PBB"
  },
  {
    "hakAkses": "bpk",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "bpk",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "bpk",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "bpk",
    "akses": "SPOP"
  },
  {
    "hakAkses": "bpk",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "input_spop",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "input_spop",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "input_spop",
    "akses": "SPOP"
  },
  {
    "hakAkses": "input_spop",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "kasubid penagihan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "kasubid penagihan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "kasubid penagihan",
    "akses": "PEMBAYARAN_BATAL"
  },
  {
    "hakAkses": "kasubid penagihan",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "kasubid penagihan",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "kasubid_keberatan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "kasubid_keberatan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "kasubid_keberatan",
    "akses": "PEMBAYARAN_BATAL"
  },
  {
    "hakAkses": "kasubid_keberatan",
    "akses": "PEMBAYARAN_MASAL"
  },
  {
    "hakAkses": "kasubid_keberatan",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "kasubid_keberatan",
    "akses": "PETA"
  },
  {
    "hakAkses": "kasubid_keberatan",
    "akses": "SPOP"
  },
  {
    "hakAkses": "kasubid_keberatan",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "keberatan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "keberatan",
    "akses": "PETA"
  },
  {
    "hakAkses": "keberatan",
    "akses": "SPOP"
  },
  {
    "hakAkses": "kiki",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "kiki",
    "akses": "SPOP"
  },
  {
    "hakAkses": "koor_penagihan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "koor_penagihan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "koor_penagihan",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "koor_penagihan",
    "akses": "PEMBAYARAN_BATAL"
  },
  {
    "hakAkses": "koor_penagihan",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "koor_pendataan",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "koor_pendataan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "koor_pendataan",
    "akses": "JALAN"
  },
  {
    "hakAkses": "koor_pendataan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "koor_pendataan",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "koor_pendataan",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "koor_pendataan",
    "akses": "PETA"
  },
  {
    "hakAkses": "koor_pendataan",
    "akses": "SPOP"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "CETAK_DHKP"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "CETAK_KLASIFIKASI_BANGUNAN"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "CETAK_KLASIFIKASI_BUMI"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "CETAK_SPPT"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "CETAK_SSPD"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "KLASIFIKASI_PBB"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "koor_penetapan",
    "akses": "SPOP"
  },
  {
    "hakAkses": "laporan",
    "akses": "CETAK_DHKP"
  },
  {
    "hakAkses": "laporan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "laporan",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "mobil_keliling",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "mobil_keliling",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "mobil_keliling",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "pelayanan",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "pelayanan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "pelayanan",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "pelayanan",
    "akses": "PETA"
  },
  {
    "hakAkses": "pelayanan_laporan",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "pelayanan_laporan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "pelayanan_laporan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "pelayanan_laporan",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "pelayanan_laporan",
    "akses": "PETA"
  },
  {
    "hakAkses": "pelayanan_laporan",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "CETAK_DHKP"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "CETAK_SPPT"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "KLASIFIKASI_PBB"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "PETA"
  },
  {
    "hakAkses": "pelayanan_pendataan",
    "akses": "SPOP"
  },
  {
    "hakAkses": "pelayanan_peta",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "pelayanan_peta",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "pelayanan_peta",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "pelayanan_peta",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "pelayanan_peta",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "pelayanan_peta",
    "akses": "PETA"
  },
  {
    "hakAkses": "pelayanan_peta",
    "akses": "SPOP"
  },
  {
    "hakAkses": "pembayaran",
    "akses": "PEMBAYARAN_MASAL"
  },
  {
    "hakAkses": "pembayaran",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "penagihan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "penagihan",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "penagihan",
    "akses": "PETA"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "PEMBAYARAN_BATAL"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "PEMBAYARAN_MASAL"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "PETA"
  },
  {
    "hakAkses": "penagihan_printout",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "pendataan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "pendataan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "pendataan",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "pendataan",
    "akses": "PETA"
  },
  {
    "hakAkses": "pendataan",
    "akses": "SPOP"
  },
  {
    "hakAkses": "pendataan",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "penetapan",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "penetapan",
    "akses": "CETAK_DHKP"
  },
  {
    "hakAkses": "penetapan",
    "akses": "CETAK_KLASIFIKASI_BANGUNAN"
  },
  {
    "hakAkses": "penetapan",
    "akses": "CETAK_KLASIFIKASI_BUMI"
  },
  {
    "hakAkses": "penetapan",
    "akses": "CETAK_SPPT"
  },
  {
    "hakAkses": "penetapan",
    "akses": "CETAK_SSPD"
  },
  {
    "hakAkses": "penetapan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "penetapan",
    "akses": "JALAN"
  },
  {
    "hakAkses": "penetapan",
    "akses": "KLASIFIKASI_PBB"
  },
  {
    "hakAkses": "penetapan",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "penetapan",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "penetapan",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "penetapan",
    "akses": "PEMBAYARAN_BATAL"
  },
  {
    "hakAkses": "penetapan",
    "akses": "PEMBAYARAN_MASAL"
  },
  {
    "hakAkses": "penetapan",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "penetapan",
    "akses": "PETA"
  },
  {
    "hakAkses": "penetapan",
    "akses": "SPOP"
  },
  {
    "hakAkses": "penetapan",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "penetapan",
    "akses": "UPDATE_BANGUNAN"
  },
  {
    "hakAkses": "penetapan",
    "akses": "UPDATE_BUMI"
  },
  {
    "hakAkses": "penetapan",
    "akses": "UPDATE_SPPT_MASAL"
  },
  {
    "hakAkses": "penetapan",
    "akses": "UPDATE_SPPT_PER_NOP"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "CETAK_DHKP"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "CETAK_KLASIFIKASI_BANGUNAN"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "CETAK_SPPT"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "JALAN"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "KLASIFIKASI_PBB"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "KONFIGURASI"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "LAPORAN"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "PEMBAYARAN_BATAL"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "PEMBAYARAN_MASAL"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "PEMBAYARAN_PER_NOP"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "SPOP"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "UPDATE_BANGUNAN"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "UPDATE_SPPT_MASAL"
  },
  {
    "hakAkses": "penetapaninputbayar",
    "akses": "UPDATE_SPPT_PER_NOP"
  },
  {
    "hakAkses": "perizinan",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "peta",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "peta",
    "akses": "LSPOP"
  },
  {
    "hakAkses": "peta",
    "akses": "PELAYANAN"
  },
  {
    "hakAkses": "peta",
    "akses": "PETA"
  },
  {
    "hakAkses": "peta",
    "akses": "SPOP"
  },
  {
    "hakAkses": "printout_tunggakan",
    "akses": "BERKAS"
  },
  {
    "hakAkses": "printout_tunggakan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "printout_tunggakan",
    "akses": "TUNGGAKAN"
  },
  {
    "hakAkses": "tunggakan",
    "akses": "INFO_OP"
  },
  {
    "hakAkses": "tunggakan",
    "akses": "PELAYANAN"
  }
] as const;

export const legacyLogin = [
  {
    "id": 1,
    "username": "admin",
    "password": "4e05783b539c496a24f5c9951a12c1a6",
    "hakAkses": "admin",
    "nip": "12345678",
    "nama": "Admin",
    "jabatan": "-",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 2,
    "username": "wirajaya",
    "password": "4da5b16ef13f16ebd0b3c7d15c6312ff",
    "hakAkses": "penetapan",
    "nip": "197805182009031004",
    "nama": "I NYOMAN GEDE WIRAJAYA, SE",
    "jabatan": "Analis Pendapatan Daerah",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 7,
    "username": "wiriyanto",
    "password": "4364adf9417394a356d9752f1e20e78d",
    "hakAkses": "pelayanan_peta",
    "nip": "197210042025211002",
    "nama": "WIRIYANTO",
    "jabatan": "Operator Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 11,
    "username": "lastri",
    "password": "42810cb02db3bb2cbb428af0d8b0376e",
    "hakAkses": "pelayanan",
    "nip": "198102102025212001",
    "nama": "NI WAYAN LASTRI",
    "jabatan": "Operator Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 12,
    "username": "wyastini",
    "password": "257ffa69697c2d5144f0b4b76b51ae95",
    "hakAkses": "pelayanan",
    "nip": "198703052025212023",
    "nama": "NI LUH PUTU WYASTINI,S.H.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 13,
    "username": "seniwati",
    "password": "a2049d874b007009de7a0def0b87b728",
    "hakAkses": "pelayanan_pendataan",
    "nip": "197903032025212014",
    "nama": "NI MADE SENIWATI",
    "jabatan": "Operator Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 15,
    "username": "radhitya",
    "password": "4c51b7030d0772224493449b91086f69",
    "hakAkses": "peta",
    "nip": "198709252025211012",
    "nama": "ANAK AGUNG NGURAH BAGUS RADHITYA NARAKUSUMA, S.E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 16,
    "username": "ariputra",
    "password": "0d28ec724443209e156b2532212b7e5a",
    "hakAkses": "penetapaninputbayar",
    "nip": "198603292025211002",
    "nama": "I DEWA GDE BAGUS ARIPUTRA, S.E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 20,
    "username": "trimayuni",
    "password": "a549edfe8a172bac08b5edb9a8d5742f",
    "hakAkses": "pelayanan",
    "nip": "198103132025212012",
    "nama": "I GUSTI AGUNG AYU TRIMAYUNI, S.TP.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 23,
    "username": "indri",
    "password": "28dc997d3731c17bf6f2cbe6e869944a",
    "hakAkses": "penagihan_printout",
    "nip": "198506012025212011",
    "nama": "NI LUH PUTU INDRIYANI SERIYASA, S.E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 24,
    "username": "ardika",
    "password": "3bf936993408acabaaa73fc0b58fdcec",
    "hakAkses": "pelayanan_peta",
    "nip": "198809032025211017",
    "nama": "NYOMAN ARDIKA SAPUTRAWAN, S.Pd.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 25,
    "username": "wira",
    "password": "2b24f42af80a7de7e2af286a014b254d",
    "hakAkses": "pelayanan_peta",
    "nip": "198911022025211018",
    "nama": "I GEDE WIRADANA, S.H.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 28,
    "username": "ogek",
    "password": "05d1ff645adecbd91f53bdeccf7dc2de",
    "hakAkses": "pelayanan",
    "nip": "199010112025212018",
    "nama": "DEWA AYU SRI ASTITI, S.E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 29,
    "username": "putri",
    "password": "5586af91382b24767651586ba98992e1",
    "hakAkses": "pelayanan_peta",
    "nip": "199301212025212014",
    "nama": "MADE PUTERI PRADNYA PARAHITA, S.H.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 30,
    "username": "nanda",
    "password": "a3a87e1dc3d62524fbaeeff771f2fd04",
    "hakAkses": "penagihan_printout",
    "nip": "199305092025212026",
    "nama": "I. A. FRISKA NANDASARI M,S.M.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 33,
    "username": "dedy",
    "password": "2b45e8d6abf59038a975faeeb6dc0782",
    "hakAkses": "admin2",
    "nip": "197809012010011012",
    "nama": "DEDY SUTRISNA AGUNG, SE.,M.Ec.Dev",
    "jabatan": "Kepala Bidang Perencanaan dan Pengembangan Pendapatan Daerah",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 35,
    "username": "yuda",
    "password": "6c78e25beca07fc24f7c1c9a18a0bf09",
    "hakAkses": "penagihan",
    "nip": "199507072025211017",
    "nama": "PUTU NANDA BAGUS KRESNA YUDHA, S.E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 38,
    "username": "sarhi",
    "password": "febe85db2cfa4dcbc566a99758fd5b81",
    "hakAkses": "pelayanan_pendataan",
    "nip": "198311222025212007",
    "nama": "ANAK AGUNG AYU KETUT SARHI LESTARI, S.Kom.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 39,
    "username": "yuliani",
    "password": "d02b8bae8842cf8eec4c28c0791e78d8",
    "hakAkses": "laporan",
    "nip": "198807282025212009",
    "nama": "LUH PUTRI AYU YULIANI, S.H.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 40,
    "username": "arsawicita",
    "password": "aed322bdf816e79fd1a90f612ba89f00",
    "hakAkses": "laporan",
    "nip": "198604222025211020",
    "nama": "COKORDA GEDE MAHADI ARSAWICITA, SH",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 41,
    "username": "armaya",
    "password": "ffce3759c0d736c5365efe989eb2e16e",
    "hakAkses": "kasubid_keberatan",
    "nip": "196909182000031007",
    "nama": "I PUTU ARMAYA, S.E., M.Si.",
    "jabatan": "Kepala Sub Bidang Keberatan",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 42,
    "username": "winda",
    "password": "6cf9887228d7eab464faaf98c6813f89",
    "hakAkses": "pelayanan",
    "nip": "199510122025212022",
    "nama": "NI MADE WINDA PERMATA SARI, S.E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 44,
    "username": "juni",
    "password": "582d74b3e980c1915e16fe6326bfda3d",
    "hakAkses": "penagihan",
    "nip": "198906202025211012",
    "nama": "I WAYAN JUNIARNATHA, S.E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 46,
    "username": "resa",
    "password": "a9dd14d824822d6d78d0fe3e55dbd7fb",
    "hakAkses": "pelayanan",
    "nip": "199408022025212015",
    "nama": "NI PUTU RESA KARMANTIKA, S.S.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 47,
    "username": "ngurah",
    "password": "91f2d67d87cb584c0999ee049741285c",
    "hakAkses": "penagihan",
    "nip": "198506162025211020",
    "nama": "ANAK AGUNG NGURAH AGUNG WIRAJAYA, S. E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 48,
    "username": "wardana",
    "password": "d41d8cd98f00b204e9800998ecf8427e",
    "hakAkses": "tunggakan",
    "nip": "196709302008011007",
    "nama": "I GUSTI NGURAH BAGUS WARDHANA, S.Sos",
    "jabatan": "Analisis Pajak Daerah",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 49,
    "username": "arik",
    "password": "b772852a7859d9e776b7f4254fe97d7e",
    "hakAkses": "tunggakan",
    "nip": "199510142025212008",
    "nama": "NI PUTU ARI OKTARI SARASWATI, S.Ak.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 50,
    "username": "veni",
    "password": "cc54f4aeeaca241a4f24dc92defca6e8",
    "hakAkses": "pelayanan_peta",
    "nip": "199303282025212020",
    "nama": "NI WAYAN TRIVENI SAWITRI, S.E",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 52,
    "username": "tiwi",
    "password": "d41d8cd98f00b204e9800998ecf8427e",
    "hakAkses": "pelayanan",
    "nip": "199410252025212015",
    "nama": "PUTU PRATIWI ANDYANI PUTRI, S.E",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 54,
    "username": "mirah",
    "password": "568f2007361d052c46d7ac78b7126c24",
    "hakAkses": "nonaktif",
    "nip": "197503211996032004",
    "nama": "IDA AYU PUTU MIRAH ULANTARI, S.Sos",
    "jabatan": "Kepala Sub Bidang Sistem dan Pelayanan Informasi",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 55,
    "username": "giri",
    "password": "233dfea2fe62c20984f6d93019c9d302",
    "hakAkses": "admin2",
    "nip": "197504202008011011",
    "nama": "I MADE GIRIASA, SH.,M.H",
    "jabatan": "Analisis Pajak Daerah",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 56,
    "username": "rai",
    "password": "bf12ef8d4b06e0e62bae54af6c8c0284",
    "hakAkses": "penagihan_printout",
    "nip": "197703141996011001",
    "nama": "MADE RAI EDI MULYAWAN, SSTP, M.E",
    "jabatan": "Kepala Bidang Pengendalian dan Evaluasi Pendapatan Daerah",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 57,
    "username": "petugas",
    "password": "d41d8cd98f00b204e9800998ecf8427e",
    "hakAkses": "nonaktif",
    "nip": "-",
    "nama": "-",
    "jabatan": "-",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 58,
    "username": "perijinan",
    "password": "83db2b74ed0a1a4567c1532ebc01ebe0",
    "hakAkses": "perizinan",
    "nip": "053",
    "nama": "DPMPTSP",
    "jabatan": "-",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 60,
    "username": "mobil",
    "password": "1adf55fbfe0cbe88b146a2eba3893491",
    "hakAkses": "nonaktif",
    "nip": "-",
    "nama": "Petugas Mobil Pelayanan",
    "jabatan": "-",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 63,
    "username": "oka",
    "password": "213f07f24d407690e96e10abb024cdae",
    "hakAkses": "penagihan_printout",
    "nip": "197911232010011015",
    "nama": "I GUSTI MADE OKA DIARA PUTRA, SE., MM",
    "jabatan": "Analis Kebijakan Ahli Muda",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 64,
    "username": "yuni",
    "password": "b41eff24b37ec9e4fe4dcf968da2a8ba",
    "hakAkses": "pelayanan",
    "nip": "197406082010012006",
    "nama": "PUTU YUNI ANGGRENI, S.Sos",
    "jabatan": "Analisis Pajak Daerah",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 65,
    "username": "wias",
    "password": "38d443e0ecbbb540f69fcb42ba63f729",
    "hakAkses": "pelayanan",
    "nip": "199511152025212017",
    "nama": "NI PUTU WIASTRINI, S.E.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 67,
    "username": "dwita",
    "password": "fb56d711687c199fb80fb8186fce51c1",
    "hakAkses": "pelayanan",
    "nip": "199602222025212013",
    "nama": "DWITA ANTARI RAHAYU, S.H.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 68,
    "username": "arinugraha",
    "password": "98a3a7566eafbee458174dd313c1c256",
    "hakAkses": "pelayanan_peta",
    "nip": "-",
    "nama": "Ketut Ari Nugraha",
    "jabatan": "-",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 69,
    "username": "bpk",
    "password": "f383bd7a0f441979452e52cb5dde86c3",
    "hakAkses": "bpk",
    "nip": "-",
    "nama": "BPK",
    "jabatan": "-",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 71,
    "username": "kiki",
    "password": "0192023a7bbd73250516f069df18b500",
    "hakAkses": "admin",
    "nip": "-",
    "nama": "-",
    "jabatan": "-",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 72,
    "username": "nitya",
    "password": "52747359fde420637ddaa9824dbb7c2d",
    "hakAkses": "laporan",
    "nip": "199608222022032009",
    "nama": "KADEK NITYA DEVI IRMAYANTI, S.E.",
    "jabatan": "Analis Pendapatan Daerah",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 73,
    "username": "surya",
    "password": "4e05783b539c496a24f5c9951a12c1a6",
    "hakAkses": "admin",
    "nip": "199006282025211014",
    "nama": "I KOMANG SURYA SATRIA DIPUTRA, S.T.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 74,
    "username": "triana",
    "password": "64b1848bf7712b67279a3e0be350d613",
    "hakAkses": "admin",
    "nip": "199004062025212012",
    "nama": "NI KOMANG AYU TRIANA SARI, S.T.",
    "jabatan": "Penata Layanan Operasional",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 75,
    "username": "suasti",
    "password": "c1b01c85f96519afb28e43dab8827e18",
    "hakAkses": "printout_tunggakan",
    "nip": "197007082008012022",
    "nama": "A.A AYU SUASTI, S.Sos",
    "jabatan": "Kepala Sub Bidang Sistem dan Pelayanan Informasi",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 76,
    "username": "nengah_putra",
    "password": "2a14fbccc46372e127492c153703ea31",
    "hakAkses": "penagihan_printout",
    "nip": "197003182008011008",
    "nama": "I NENGAH PUTRA, S.H.",
    "jabatan": "Kepala Sub Bidang Pendaftaran dan Penetapan",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 77,
    "username": "printout",
    "password": "f31f84a1dcd6e035a229ecbd6a9ddb30",
    "hakAkses": "printout_tunggakan",
    "nip": "-",
    "nama": "-",
    "jabatan": "-",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 78,
    "username": "ariefan",
    "password": "b6bfa5c3c8ee9d097fc88552b942fd31",
    "hakAkses": "admin",
    "nip": "12345678",
    "nama": "Admin",
    "jabatan": "-",
    "penanggungJawabCetak": 0,
    "tandaTangan": null,
    "userId": null
  },
  {
    "id": 79,
    "username": "dayukumala",
    "password": "3987f4d1031cc1a0e2cb11342ee154a6",
    "hakAkses": "kasubid_keberatan",
    "nip": "197108272007012003",
    "nama": "IDA AYU WIDYA KUMALASARI, S.E.",
    "jabatan": "Kepala Sub Bidang Keberatan",
    "penanggungJawabCetak": 1,
    "tandaTangan": null,
    "userId": null
  }
] as const;
