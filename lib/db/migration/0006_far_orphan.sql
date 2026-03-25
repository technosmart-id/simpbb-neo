CREATE TABLE `member_roles` (
	`id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`role_type` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`created_by` varchar(36) NOT NULL,
	CONSTRAINT `member_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_member_role` UNIQUE(`member_id`,`role_id`,`role_type`)
);
--> statement-breakpoint
CREATE TABLE `jalan` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`NM_JALAN` varchar(100) NOT NULL,
	CONSTRAINT `jalan_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `ref_dati2` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`NM_DATI2` varchar(30) NOT NULL,
	CONSTRAINT `ref_dati2_KD_PROPINSI_KD_DATI2_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`)
);
--> statement-breakpoint
CREATE TABLE `ref_kecamatan` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`NM_KECAMATAN` varchar(30),
	`NM_KECAMATAN_ONLY` varchar(30) NOT NULL,
	CONSTRAINT `ref_kecamatan_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`)
);
--> statement-breakpoint
CREATE TABLE `ref_kelurahan` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_SEKTOR` char(2) NOT NULL DEFAULT '00',
	`NM_KELURAHAN` varchar(30),
	`NM_KELURAHAN_ONLY` varchar(30) NOT NULL,
	`NO_KELURAHAN` smallint,
	`KD_POS_KELURAHAN` varchar(5),
	CONSTRAINT `ref_kelurahan_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_SEKTOR_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_SEKTOR`)
);
--> statement-breakpoint
CREATE TABLE `ref_propinsi` (
	`KD_PROPINSI` char(2) NOT NULL,
	`NM_PROPINSI` varchar(30) NOT NULL,
	CONSTRAINT `ref_propinsi_KD_PROPINSI` PRIMARY KEY(`KD_PROPINSI`)
);
--> statement-breakpoint
CREATE TABLE `ref_jns_pelayanan` (
	`KD_JNS_PELAYANAN` char(2) NOT NULL,
	`NM_JENIS_PELAYANAN` varchar(100) NOT NULL,
	CONSTRAINT `ref_jns_pelayanan_KD_JNS_PELAYANAN` PRIMARY KEY(`KD_JNS_PELAYANAN`)
);
--> statement-breakpoint
CREATE TABLE `ref_kategori` (
	`KATEGORI` varchar(100) NOT NULL,
	`KODE` char(2) NOT NULL,
	`NAMA` varchar(100) NOT NULL,
	CONSTRAINT `ref_kategori_KATEGORI_KODE_pk` PRIMARY KEY(`KATEGORI`,`KODE`)
);
--> statement-breakpoint
CREATE TABLE `akses` (
	`AKSES` varchar(50) NOT NULL,
	`AKTIF` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `akses_AKSES` PRIMARY KEY(`AKSES`)
);
--> statement-breakpoint
CREATE TABLE `group_akses` (
	`HAK_AKSES` varchar(20) NOT NULL,
	`AKSES` varchar(50) NOT NULL,
	CONSTRAINT `group_akses_HAK_AKSES_AKSES_pk` PRIMARY KEY(`HAK_AKSES`,`AKSES`)
);
--> statement-breakpoint
CREATE TABLE `login` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`USERNAME` varchar(20) NOT NULL,
	`PASSWORD` varchar(255) NOT NULL,
	`HAK_AKSES` varchar(20) NOT NULL,
	`NIP` varchar(30),
	`NAMA` varchar(200),
	`JABATAN` varchar(200),
	`PENANGGUNG_JAWAB_CETAK` tinyint NOT NULL DEFAULT 0,
	`TANDA_TANGAN` LONGBLOB,
	`STATUS_AKTIF` tinyint NOT NULL DEFAULT 1,
	`LAST_LOGIN` datetime,
	`FAILED_ATTEMPTS` tinyint NOT NULL DEFAULT 0,
	`LOCKED_UNTIL` datetime,
	`CREATED_AT` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`USER_ID` varchar(36),
	CONSTRAINT `login_ID` PRIMARY KEY(`ID`),
	CONSTRAINT `uk_username` UNIQUE(`USERNAME`)
);
--> statement-breakpoint
CREATE TABLE `konfigurasi` (
	`NAMA` varchar(100) NOT NULL,
	`NILAI` LONGBLOB,
	CONSTRAINT `konfigurasi_NAMA` PRIMARY KEY(`NAMA`)
);
--> statement-breakpoint
CREATE TABLE `fasilitas` (
	`KD_FASILITAS` char(2) NOT NULL,
	`NM_FASILITAS` varchar(63) NOT NULL,
	`SATUAN_FASILITAS` varchar(10) NOT NULL,
	`NILAI_FASILITAS` decimal(15,2) NOT NULL DEFAULT '0',
	`STATUS_FASILITAS` char(1) NOT NULL DEFAULT '1',
	`KETERGANTUNGAN` char(1) NOT NULL DEFAULT '0',
	CONSTRAINT `fasilitas_KD_FASILITAS` PRIMARY KEY(`KD_FASILITAS`)
);
--> statement-breakpoint
CREATE TABLE `jenis_sppt` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`KODE` varchar(10) NOT NULL,
	`NAMA` varchar(100) NOT NULL,
	`TARIF_KHUSUS` decimal(8,4),
	`AKTIF` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `jenis_sppt_ID` PRIMARY KEY(`ID`),
	CONSTRAINT `uk_jenis_sppt_kode` UNIQUE(`KODE`)
);
--> statement-breakpoint
CREATE TABLE `kelas_bangunan` (
	`KELAS_BANGUNAN` varchar(5) NOT NULL,
	`NILAI_MINIMUM` decimal(15,2) NOT NULL,
	`NILAI_MAKSIMUM` decimal(15,2) NOT NULL,
	`NJOP_BANGUNAN` decimal(15,2) NOT NULL,
	CONSTRAINT `kelas_bangunan_KELAS_BANGUNAN` PRIMARY KEY(`KELAS_BANGUNAN`)
);
--> statement-breakpoint
CREATE TABLE `kelas_bumi` (
	`KELAS_BUMI` varchar(5) NOT NULL,
	`NILAI_MINIMUM` decimal(15,2) NOT NULL,
	`NILAI_MAKSIMUM` decimal(15,2) NOT NULL,
	`NJOP_BUMI` decimal(15,2) NOT NULL,
	CONSTRAINT `kelas_bumi_KELAS_BUMI` PRIMARY KEY(`KELAS_BUMI`)
);
--> statement-breakpoint
CREATE TABLE `tarif` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`THN_AWAL` year NOT NULL,
	`THN_AKHIR` year,
	`NJOP_MIN` decimal(15,2) NOT NULL,
	`NJOP_MAX` decimal(15,2) NOT NULL,
	`NILAI_TARIF` decimal(8,4) NOT NULL,
	CONSTRAINT `tarif_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `dat_subjek_pajak` (
	`SUBJEK_PAJAK_ID` varchar(30) NOT NULL,
	`NM_WP` varchar(30) NOT NULL,
	`JALAN_WP` varchar(100) NOT NULL,
	`BLOK_KAV_NO_WP` varchar(15),
	`RW_WP` varchar(2),
	`RT_WP` varchar(3),
	`KELURAHAN_WP` varchar(30),
	`KOTA_WP` varchar(30),
	`KD_POS_WP` varchar(5),
	`TELP_WP` varchar(20),
	`NPWP` varchar(16),
	`EMAIL_WP` varchar(100),
	`STATUS_PEKERJAAN_WP` char(1) NOT NULL,
	CONSTRAINT `dat_subjek_pajak_SUBJEK_PAJAK_ID` PRIMARY KEY(`SUBJEK_PAJAK_ID`)
);
--> statement-breakpoint
CREATE TABLE `spop` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`SUBJEK_PAJAK_ID` varchar(30) NOT NULL,
	`NO_FORMULIR_SPOP` varchar(50),
	`JNS_TRANSAKSI_OP` char(1) NOT NULL,
	`KD_PROPINSI_BERSAMA` char(2),
	`KD_DATI2_BERSAMA` char(2),
	`KD_KECAMATAN_BERSAMA` char(3),
	`KD_KELURAHAN_BERSAMA` char(3),
	`KD_BLOK_BERSAMA` char(3),
	`NO_URUT_BERSAMA` char(4),
	`KD_JNS_OP_BERSAMA` char(1),
	`KD_PROPINSI_ASAL` char(2),
	`KD_DATI2_ASAL` char(2),
	`KD_KECAMATAN_ASAL` char(3),
	`KD_KELURAHAN_ASAL` char(3),
	`KD_BLOK_ASAL` char(3),
	`NO_URUT_ASAL` char(4),
	`KD_JNS_OP_ASAL` char(1),
	`NO_SPPT_LAMA` char(4),
	`JALAN_OP` varchar(100) NOT NULL,
	`BLOK_KAV_NO_OP` varchar(15),
	`RT_OP` varchar(3),
	`RW_OP` varchar(2),
	`KELURAHAN_OP` varchar(30),
	`KD_STATUS_WP` char(1) NOT NULL,
	`LUAS_BUMI` bigint NOT NULL,
	`KD_ZNT` char(2),
	`JNS_BUMI` char(1) NOT NULL,
	`NILAI_SISTEM_BUMI` bigint NOT NULL,
	`TGL_PENDATAAN_OP` datetime NOT NULL,
	`NM_PENDATAAN_OP` varchar(100),
	`NIP_PENDATA` varchar(40),
	`TGL_PEMERIKSAAN_OP` datetime NOT NULL,
	`NM_PEMERIKSAAN_OP` varchar(100),
	`NIP_PEMERIKSA_OP` varchar(40),
	CONSTRAINT `spop_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
);
--> statement-breakpoint
CREATE TABLE `dat_fasilitas_bangunan` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`KD_FASILITAS` char(2) NOT NULL,
	`JML_SATUAN` bigint NOT NULL DEFAULT 0,
	CONSTRAINT `dat_fasilitas_bangunan_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_NO_BNG_KD_FASILITAS_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`,`KD_FASILITAS`)
);
--> statement-breakpoint
CREATE TABLE `dat_op_bangunan` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`NO_FORMULIR_LSPOP` varchar(11),
	`JNS_TRANSAKSI_BNG` char(1),
	`KD_JPB` char(2),
	`LUAS_BNG` bigint NOT NULL DEFAULT 0,
	`JML_LANTAI_BNG` int NOT NULL DEFAULT 1,
	`THN_DIBANGUN_BNG` char(4),
	`THN_RENOVASI_BNG` char(4),
	`KONDISI_BNG` char(1),
	`JNS_KONSTRUKSI_BNG` char(1),
	`JNS_ATAP_BNG` char(1),
	`KD_DINDING` char(1),
	`KD_LANTAI` char(1),
	`KD_LANGIT_LANGIT` char(1),
	`TING_KOLOM_JPB3` bigint,
	`LBR_BENT_JPB3` bigint,
	`DAYA_DUKUNG_LANTAI_JPB3` bigint,
	`KELILING_DINDING_JPB3` bigint,
	`LUAS_MEZZANINE_JPB3` bigint,
	`KLS_JPB2` bigint,
	`KLS_JPB4` bigint,
	`KLS_JPB5` bigint,
	`KLS_JPB6` bigint,
	`JNS_JPB7` char(1),
	`BINTANG_JPB7` tinyint,
	`JML_KMR_JPB7` int,
	`LUAS_KMR_JPB7_DGN_AC_SENT` decimal(12,2),
	`LUAS_KMR_LAIN_JPB7_DGN_AC_SENT` decimal(12,2),
	`KLS_JPB13` bigint,
	`KLS_JPB16` bigint,
	`NILAI_SISTEM_BNG` bigint NOT NULL DEFAULT 0,
	`NILAI_FORMULA` bigint,
	`NILAI_INDIVIDU` bigint NOT NULL DEFAULT 0,
	`TGL_PENDATAAN_BNG` datetime,
	`NM_PENDATAAN_OP` varchar(200),
	`NIP_PENDATA_BNG` varchar(30),
	`TGL_PEMERIKSAAN_BNG` datetime,
	`NM_PEMERIKSAAN_OP_BNG` varchar(200),
	`NIP_PEMERIKSA_BNG` varchar(30),
	`TGL_KUNJUNGAN_KEMBALI` datetime,
	`AKTIF` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `dat_op_bangunan_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_NO_BNG_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_legalitas_bumi` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_LEGALITAS_TANAH` varchar(100),
	`JNS_LEGALITAS` varchar(50),
	CONSTRAINT `dat_legalitas_bumi_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
);
--> statement-breakpoint
CREATE TABLE `dat_op_anggota` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`KD_PROPINSI_INDUK` char(2) NOT NULL,
	`KD_DATI2_INDUK` char(2) NOT NULL,
	`KD_KECAMATAN_INDUK` char(3) NOT NULL,
	`KD_KELURAHAN_INDUK` char(3) NOT NULL,
	`KD_BLOK_INDUK` char(3) NOT NULL,
	`NO_URUT_INDUK` char(4) NOT NULL,
	`KD_JNS_OP_INDUK` char(1) NOT NULL,
	`LUAS_BUMI_BEBAN` bigint,
	`LUAS_BNG_BEBAN` bigint,
	`NILAI_SISTEM_BUMI_BEBAN` bigint,
	`NILAI_SISTEM_BNG_BEBAN` bigint,
	`NJOP_BUMI_BEBAN` bigint,
	`NJOP_BNG_BEBAN` bigint,
	CONSTRAINT `dat_op_anggota_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
);
--> statement-breakpoint
CREATE TABLE `dat_op_induk` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	CONSTRAINT `dat_op_induk_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
);
--> statement-breakpoint
CREATE TABLE `histori_sppt` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`THN_PAJAK_SPPT` year NOT NULL,
	`SIKLUS_SPPT` tinyint NOT NULL,
	`NJOP_BUMI` decimal(15,2),
	`NJOP_BNG` decimal(15,2),
	`NJOP_SPPT` decimal(15,2),
	`NJOPTKP_SPPT` decimal(15,2),
	`NJKP_SPPT` decimal(15,2),
	`PBB_TERHUTANG_SPPT` decimal(15,2),
	`FAKTOR_PENGURANG_SPPT` decimal(15,2),
	`PBB_YG_HARUS_DIBAYAR_SPPT` decimal(15,2),
	`TGL_PERUBAHAN` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`NIP_PETUGAS` varchar(40),
	`KETERANGAN` text,
	CONSTRAINT `histori_sppt_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `sppt` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`THN_PAJAK_SPPT` year NOT NULL,
	`SIKLUS_SPPT` tinyint NOT NULL DEFAULT 1,
	`KD_JNS_SPPT` int,
	`KD_KLS_TANAH` varchar(5),
	`KD_KLS_BNG` varchar(5),
	`TGL_JATUH_TEMPO` date,
	`TGL_TERBIT` date,
	`TGL_CETAK` date,
	`LUAS_BUMI` decimal(12,2) NOT NULL DEFAULT '0',
	`LUAS_BNG` decimal(12,2) NOT NULL DEFAULT '0',
	`NJOP_BUMI` decimal(15,2) NOT NULL DEFAULT '0',
	`NJOP_BNG` decimal(15,2) NOT NULL DEFAULT '0',
	`NJOP_SPPT` decimal(15,2) NOT NULL DEFAULT '0',
	`NJOPTKP_SPPT` decimal(15,2) NOT NULL DEFAULT '0',
	`NJKP_SPPT` decimal(15,2) NOT NULL DEFAULT '0',
	`PBB_TERHUTANG_SPPT` decimal(15,2) NOT NULL DEFAULT '0',
	`FAKTOR_PENGURANG_SPPT` decimal(15,2) NOT NULL DEFAULT '0',
	`PBB_YG_HARUS_DIBAYAR_SPPT` decimal(15,2) NOT NULL DEFAULT '0',
	`STATUS_PEMBAYARAN_SPPT` char(1) NOT NULL DEFAULT '0',
	`STATUS_TAGIHAN_SPPT` char(1) NOT NULL DEFAULT '0',
	`STATUS_CETAK_SPPT` char(1) NOT NULL DEFAULT '0',
	`STATUS_PEMBATALAN` char(1) NOT NULL DEFAULT '0',
	`NM_WP` varchar(30),
	`JALAN_WP` varchar(100),
	CONSTRAINT `sppt_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_THN_PAJAK_SPPT_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`)
);
--> statement-breakpoint
CREATE TABLE `sppt_khusus` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`JENIS_SPPT` int NOT NULL,
	`KETERANGAN` varchar(200),
	CONSTRAINT `sppt_khusus_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
);
--> statement-breakpoint
CREATE TABLE `status_pbb` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`TAHUN_PBB` char(4) NOT NULL,
	`TANGGAL_BAYAR` datetime,
	`PERMOHONAN_PENGURANGAN` double,
	`PENGURANGAN_DIBERI` double,
	`ALASAN_PENGURANGAN` LONGTEXT,
	`ALASAN_KEBERATAN` LONGTEXT,
	`NO_SK_PENGURANGAN` varchar(100),
	`TGL_SK` date,
	CONSTRAINT `status_pbb_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_TAHUN_PBB_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`TAHUN_PBB`)
);
--> statement-breakpoint
CREATE TABLE `pembayaran_sppt` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`THN_PAJAK_SPPT` year NOT NULL,
	`PEMBAYARAN_KE` tinyint NOT NULL,
	`TGL_PEMBAYARAN_SPPT` date NOT NULL,
	`JML_SPPT_YG_DIBAYAR` decimal(15,2) NOT NULL DEFAULT '0',
	`DENDA_SPPT` decimal(15,2) NOT NULL DEFAULT '0',
	`JML_BAYAR` decimal(15,2) NOT NULL DEFAULT '0',
	`NAMA_BAYAR` varchar(100),
	`CHANNEL_PEMBAYARAN` varchar(50),
	`NO_REFERENSI` varchar(100),
	`NIP_PETUGAS` varchar(40),
	`DIBATALKAN` tinyint NOT NULL DEFAULT 0,
	`TGL_BATAL` datetime,
	`ALASAN_BATAL` text,
	CONSTRAINT `pembayaran_sppt_KD_PROPINSI_KD_DATI2_KD_KECAMATAN_KD_KELURAHAN_KD_BLOK_NO_URUT_KD_JNS_OP_THN_PAJAK_SPPT_PEMBAYARAN_KE_pk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`,`PEMBAYARAN_KE`)
);
--> statement-breakpoint
CREATE TABLE `histori_mutasi` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`NO_PELAYANAN` varchar(30) NOT NULL,
	`NOP_SEBELUM` varchar(18),
	`NAMA_SEBELUM` varchar(100),
	`LT_SEBELUM` decimal(12,2),
	`LB_SEBELUM` decimal(12,2),
	`PBB_SEBELUM` decimal(15,2),
	`NOP_SESUDAH` varchar(18),
	`NAMA_SESUDAH` varchar(100),
	`LT_SESUDAH` decimal(12,2),
	`LB_SESUDAH` decimal(12,2),
	`PBB_SESUDAH` decimal(15,2),
	`TGL_MUTASI` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`NIP_PETUGAS` varchar(40),
	CONSTRAINT `histori_mutasi_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `pelayanan` (
	`NO_PELAYANAN` varchar(30) NOT NULL,
	`KD_PROPINSI` char(2),
	`KD_DATI2` char(2),
	`KD_KECAMATAN` char(3),
	`KD_KELURAHAN` char(3),
	`KD_BLOK` char(3),
	`NO_URUT` char(4),
	`KD_JNS_OP` char(1),
	`KD_JNS_PELAYANAN` char(2) NOT NULL,
	`TANGGAL_PELAYANAN` date NOT NULL,
	`TANGGAL_PERKIRAAN_SELESAI` date,
	`NAMA_PEMOHON` varchar(100),
	`ALAMAT_PEMOHON` text,
	`LETAK_OP` varchar(200),
	`KECAMATAN` varchar(50),
	`KELURAHAN` varchar(50),
	`STATUS_PELAYANAN` smallint NOT NULL DEFAULT 1,
	`NIP_PETUGAS_PENERIMA` varchar(40),
	`NAMA_PETUGAS_PENERIMA` varchar(100),
	`NIP_AR` varchar(40),
	`NAMA_AR` varchar(100),
	`CATATAN` text,
	`KETERANGAN` text,
	`TGL_MASUK_PENILAI` date,
	`NIP_MASUK_PENILAI` varchar(40),
	`TGL_MASUK_PENETAPAN` date,
	`NIP_MASUK_PENETAPAN` varchar(40),
	`TGL_SELESAI` date,
	`NIP_SELESAI` varchar(40),
	`TGL_TERKONFIRMASI_WP` date,
	`NIP_TERKONFIRMASI_WP` varchar(40),
	`TGL_BERKAS_DITUNDA` date,
	`ALASAN_DITUNDA` text,
	`IS_KOLEKTIF` tinyint NOT NULL DEFAULT 0,
	`TTD_KIRI_JABATAN` varchar(100),
	`TTD_KIRI_NAMA` varchar(100),
	`TTD_KIRI_NIP` varchar(40),
	`TTD_KANAN_JABATAN` varchar(100),
	`TTD_KANAN_NAMA` varchar(100),
	`TTD_KANAN_NIP` varchar(40),
	CONSTRAINT `pelayanan_NO_PELAYANAN` PRIMARY KEY(`NO_PELAYANAN`)
);
--> statement-breakpoint
CREATE TABLE `pelayanan_dokumen` (
	`NO_PELAYANAN` varchar(30) NOT NULL,
	`DOKUMEN_ID` tinyint NOT NULL,
	CONSTRAINT `pelayanan_dokumen_NO_PELAYANAN_DOKUMEN_ID_pk` PRIMARY KEY(`NO_PELAYANAN`,`DOKUMEN_ID`)
);
--> statement-breakpoint
CREATE TABLE `pelayanan_lampiran_kolektif` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`NO_PELAYANAN` varchar(30) NOT NULL,
	`NOP` varchar(18),
	`NAMA` varchar(100),
	`ALAMAT` text,
	`LT` decimal(12,2),
	`LB` decimal(12,2),
	`KETERANGAN` text,
	CONSTRAINT `pelayanan_lampiran_kolektif_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `pemekaran` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`NAMA_PEMEKARAN` varchar(100) NOT NULL,
	`TGL_BERLAKU` date NOT NULL,
	`KETERANGAN` text,
	CONSTRAINT `pemekaran_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `pemekaran_detail` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`PEMEKARAN_ID` int NOT NULL,
	`KD_PROPINSI_LAMA` char(2) NOT NULL,
	`KD_DATI2_LAMA` char(2) NOT NULL,
	`KD_KECAMATAN_LAMA` char(3) NOT NULL,
	`KD_KELURAHAN_LAMA` char(3) NOT NULL,
	`KD_BLOK_LAMA` char(3) NOT NULL,
	`NO_URUT_LAMA` char(4) NOT NULL,
	`KD_JNS_OP_LAMA` char(1) NOT NULL,
	`KD_PROPINSI_BARU` char(2) NOT NULL,
	`KD_DATI2_BARU` char(2) NOT NULL,
	`KD_KECAMATAN_BARU` char(3) NOT NULL,
	`KD_KELURAHAN_BARU` char(3) NOT NULL,
	`KD_BLOK_BARU` char(3) NOT NULL,
	`NO_URUT_BARU` char(4) NOT NULL,
	`KD_JNS_OP_BARU` char(1) NOT NULL,
	CONSTRAINT `pemekaran_detail_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `log_aktivitas` (
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`USERNAME` varchar(20) NOT NULL,
	`AKSI` varchar(50) NOT NULL,
	`MODUL` varchar(50),
	`KETERANGAN` text,
	`IP_ADDRESS` varchar(45),
	`CREATED_AT` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `log_aktivitas_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `log_delete_pelayanan` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`NO_PELAYANAN` varchar(30) NOT NULL,
	`DATA_SNAPSHOT` json,
	`DIHAPUS_OLEH` varchar(20),
	`TGL_HAPUS` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`ALASAN` text,
	CONSTRAINT `log_delete_pelayanan_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
ALTER TABLE `organization` ADD `auto_join` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `member_roles` ADD CONSTRAINT `member_roles_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_roles` ADD CONSTRAINT `member_roles_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ref_dati2` ADD CONSTRAINT `fk_dati2_propinsi` FOREIGN KEY (`KD_PROPINSI`) REFERENCES `ref_propinsi`(`KD_PROPINSI`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ref_kecamatan` ADD CONSTRAINT `fk_kecamatan_dati2` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`) REFERENCES `ref_dati2`(`KD_PROPINSI`,`KD_DATI2`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ref_kelurahan` ADD CONSTRAINT `fk_kelurahan_kecamatan` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`) REFERENCES `ref_kecamatan`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_akses` ADD CONSTRAINT `fk_group_akses_akses` FOREIGN KEY (`AKSES`) REFERENCES `akses`(`AKSES`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `login` ADD CONSTRAINT `login_USER_ID_user_id_fk` FOREIGN KEY (`USER_ID`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `spop` ADD CONSTRAINT `fk_spop_subjek` FOREIGN KEY (`SUBJEK_PAJAK_ID`) REFERENCES `dat_subjek_pajak`(`SUBJEK_PAJAK_ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_fasilitas_bangunan` ADD CONSTRAINT `fk_fas_bangunan` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`) REFERENCES `dat_op_bangunan`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_fasilitas_bangunan` ADD CONSTRAINT `fk_fas_master` FOREIGN KEY (`KD_FASILITAS`) REFERENCES `fasilitas`(`KD_FASILITAS`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_op_bangunan` ADD CONSTRAINT `fk_bangunan_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_legalitas_bumi` ADD CONSTRAINT `fk_legalitas_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_op_anggota` ADD CONSTRAINT `fk_anggota_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_op_induk` ADD CONSTRAINT `fk_op_induk_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sppt` ADD CONSTRAINT `fk_sppt_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sppt_khusus` ADD CONSTRAINT `fk_sppt_khusus_jenis` FOREIGN KEY (`JENIS_SPPT`) REFERENCES `jenis_sppt`(`ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `status_pbb` ADD CONSTRAINT `fk_status_pbb_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pembayaran_sppt` ADD CONSTRAINT `fk_pembayaran_sppt` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`) REFERENCES `sppt`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pelayanan` ADD CONSTRAINT `fk_pelayanan_jns` FOREIGN KEY (`KD_JNS_PELAYANAN`) REFERENCES `ref_jns_pelayanan`(`KD_JNS_PELAYANAN`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pelayanan_dokumen` ADD CONSTRAINT `fk_dok_pelayanan` FOREIGN KEY (`NO_PELAYANAN`) REFERENCES `pelayanan`(`NO_PELAYANAN`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pelayanan_lampiran_kolektif` ADD CONSTRAINT `fk_lamp_kol_pelayanan` FOREIGN KEY (`NO_PELAYANAN`) REFERENCES `pelayanan`(`NO_PELAYANAN`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pemekaran_detail` ADD CONSTRAINT `fk_pemekaran_detail_induk` FOREIGN KEY (`PEMEKARAN_ID`) REFERENCES `pemekaran`(`ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `member_roles_member_id_idx` ON `member_roles` (`member_id`);--> statement-breakpoint
CREATE INDEX `member_roles_role_id_idx` ON `member_roles` (`role_id`);--> statement-breakpoint
CREATE INDEX `idx_jalan_wilayah` ON `jalan` (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`);--> statement-breakpoint
CREATE INDEX `idx_histori_nop` ON `histori_sppt` (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`);--> statement-breakpoint
CREATE INDEX `idx_sppt_status_bayar` ON `sppt` (`STATUS_PEMBAYARAN_SPPT`);--> statement-breakpoint
CREATE INDEX `idx_sppt_thn` ON `sppt` (`THN_PAJAK_SPPT`);--> statement-breakpoint
CREATE INDEX `idx_histori_mutasi_pelayanan` ON `histori_mutasi` (`NO_PELAYANAN`);--> statement-breakpoint
CREATE INDEX `idx_pelayanan_nop` ON `pelayanan` (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`);--> statement-breakpoint
CREATE INDEX `idx_pelayanan_status` ON `pelayanan` (`STATUS_PELAYANAN`);--> statement-breakpoint
CREATE INDEX `idx_pelayanan_tgl` ON `pelayanan` (`TANGGAL_PELAYANAN`);--> statement-breakpoint
CREATE INDEX `idx_lamp_kol_pelayanan` ON `pelayanan_lampiran_kolektif` (`NO_PELAYANAN`);--> statement-breakpoint
CREATE INDEX `idx_pemekaran_nop_lama` ON `pemekaran_detail` (`KD_PROPINSI_LAMA`,`KD_DATI2_LAMA`,`KD_KECAMATAN_LAMA`,`KD_KELURAHAN_LAMA`,`KD_BLOK_LAMA`,`NO_URUT_LAMA`,`KD_JNS_OP_LAMA`);--> statement-breakpoint
CREATE INDEX `idx_log_user` ON `log_aktivitas` (`USERNAME`);--> statement-breakpoint
CREATE INDEX `idx_log_tgl` ON `log_aktivitas` (`CREATED_AT`);--> statement-breakpoint
ALTER TABLE `org_roles` DROP COLUMN `permissions`;