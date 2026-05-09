CREATE TABLE `account` (
	`id` varchar(36) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` datetime,
	`refresh_token_expires_at` datetime,
	`scope` text,
	`password` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` varchar(255),
	`team_id` varchar(255),
	`status` varchar(255) NOT NULL DEFAULT 'pending',
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`inviter_id` varchar(36) NOT NULL,
	CONSTRAINT `invitation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`role` varchar(255) NOT NULL DEFAULT 'member',
	`custom_role_id` varchar(36),
	`created_at` datetime NOT NULL,
	CONSTRAINT `member_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_access_token` (
	`id` varchar(36) NOT NULL,
	`access_token` varchar(191),
	`refresh_token` varchar(191),
	`access_token_expires_at` datetime,
	`refresh_token_expires_at` datetime,
	`client_id` varchar(36),
	`user_id` varchar(36),
	`scopes` text,
	`created_at` datetime,
	`updated_at` datetime,
	CONSTRAINT `oauth_access_token_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauth_access_token_access_token_unique` UNIQUE(`access_token`),
	CONSTRAINT `oauth_access_token_refresh_token_unique` UNIQUE(`refresh_token`)
);
--> statement-breakpoint
CREATE TABLE `oauth_application` (
	`id` varchar(36) NOT NULL,
	`name` text,
	`icon` text,
	`metadata` text,
	`client_id` varchar(191),
	`client_secret` text,
	`redirect_urls` text,
	`type` text,
	`disabled` boolean DEFAULT false,
	`user_id` varchar(36),
	`created_at` datetime,
	`updated_at` datetime,
	CONSTRAINT `oauth_application_id` PRIMARY KEY(`id`),
	CONSTRAINT `oauth_application_client_id_unique` UNIQUE(`client_id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_consent` (
	`id` varchar(36) NOT NULL,
	`client_id` varchar(36),
	`user_id` varchar(36),
	`scopes` text,
	`created_at` datetime,
	`updated_at` datetime,
	`consent_given` boolean,
	CONSTRAINT `oauth_consent_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(191) NOT NULL,
	`logo` text,
	`created_at` datetime NOT NULL,
	`metadata` text,
	`auto_join` boolean NOT NULL DEFAULT true,
	CONSTRAINT `organization_id` PRIMARY KEY(`id`),
	CONSTRAINT `organization_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `organization_slug_uidx` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` varchar(36) NOT NULL,
	`expires_at` datetime NOT NULL,
	`token` varchar(191) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(36) NOT NULL,
	`impersonated_by` text,
	`active_organization_id` text,
	`active_team_id` text,
	CONSTRAINT `session_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `team` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`created_at` datetime NOT NULL,
	`updated_at` datetime,
	CONSTRAINT `team_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_member` (
	`id` varchar(36) NOT NULL,
	`team_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`created_at` datetime,
	CONSTRAINT `team_member_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `two_factor` (
	`id` varchar(36) NOT NULL,
	`secret` varchar(255) NOT NULL,
	`backup_codes` text NOT NULL,
	`user_id` varchar(36) NOT NULL,
	CONSTRAINT `two_factor_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(191) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`two_factor_enabled` boolean DEFAULT false,
	`username` varchar(191),
	`display_username` text,
	`phone_number` varchar(191),
	`phone_number_verified` boolean,
	`role` text,
	`banned` boolean DEFAULT false,
	`ban_reason` text,
	`ban_expires` datetime,
	`is_anonymous` boolean DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`),
	CONSTRAINT `user_username_unique` UNIQUE(`username`),
	CONSTRAINT `user_phone_number_unique` UNIQUE(`phone_number`)
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `verification_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `casbin_rule` (
	`id` varchar(36) NOT NULL,
	`ptype` varchar(255) NOT NULL,
	`v0` varchar(255),
	`v1` varchar(255),
	`v2` varchar(255),
	`v3` varchar(255),
	`v4` varchar(255),
	`v5` text,
	CONSTRAINT `casbin_rule_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `member_roles` (
	`id` varchar(36) NOT NULL,
	`member_id` varchar(36) NOT NULL,
	`role_id` varchar(36) NOT NULL,
	`role_type` varchar(20) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` varchar(36) NOT NULL,
	CONSTRAINT `member_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_member_role` UNIQUE(`member_id`,`role_id`,`role_type`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` varchar(50) NOT NULL DEFAULT 'info',
	`link` text,
	`is_read` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`in_app_enabled` boolean NOT NULL DEFAULT true,
	`toasts_enabled` boolean NOT NULL DEFAULT true,
	`success_enabled` boolean NOT NULL DEFAULT true,
	`warning_enabled` boolean NOT NULL DEFAULT true,
	`error_enabled` boolean NOT NULL DEFAULT true,
	`info_enabled` boolean NOT NULL DEFAULT true,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `org_roles` (
	`id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`is_default_role` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`created_by` varchar(36) NOT NULL,
	CONSTRAINT `org_roles_id` PRIMARY KEY(`id`),
	CONSTRAINT `org_roles_org_slug_idx` UNIQUE(`organization_id`,`slug`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`author` varchar(255) NOT NULL,
	`published_at` datetime,
	`organization_id` varchar(36),
	`created_by_id` varchar(36),
	`cover_image` varchar(512),
	`attachment_file` varchar(512),
	`gallery_images` json,
	`additional_documents` json,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `books_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resource_ownership` (
	`id` varchar(36) NOT NULL,
	`resource_type` varchar(100) NOT NULL,
	`resource_id` varchar(36) NOT NULL,
	`owner_id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `resource_ownership_id` PRIMARY KEY(`id`),
	CONSTRAINT `resource_ownership_unique_idx` UNIQUE(`resource_type`,`resource_id`,`owner_id`)
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
	CONSTRAINT `pk_ref_dati2` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`)
);
--> statement-breakpoint
CREATE TABLE `ref_kecamatan` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`NM_KECAMATAN` varchar(30),
	`NM_KECAMATAN_ONLY` varchar(30) NOT NULL,
	CONSTRAINT `pk_ref_kecamatan` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`)
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
	CONSTRAINT `pk_ref_kelurahan` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_SEKTOR`)
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
	`HAK_AKSES` varchar(30) NOT NULL,
	`AKSES` varchar(50) NOT NULL,
	CONSTRAINT `group_akses_HAK_AKSES_AKSES_pk` PRIMARY KEY(`HAK_AKSES`,`AKSES`)
);
--> statement-breakpoint
CREATE TABLE `login` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`USERNAME` varchar(20) NOT NULL,
	`PASSWORD` varchar(255) NOT NULL DEFAULT 'd41d8cd98f00b204e9800998ecf8427e',
	`HAK_AKSES` varchar(30) NOT NULL,
	`NIP` varchar(30) DEFAULT '-',
	`NAMA` varchar(200) DEFAULT '-',
	`JABATAN` varchar(200) DEFAULT '-',
	`PENANGGUNG_JAWAB_CETAK` tinyint DEFAULT 1,
	`TANDA_TANGAN` LONGBLOB,
	`USER_ID` varchar(36),
	CONSTRAINT `login_ID` PRIMARY KEY(`ID`),
	CONSTRAINT `uk_username` UNIQUE(`USERNAME`)
);
--> statement-breakpoint
CREATE TABLE `lookup_group` (
	`KD_LOOKUP_GROUP` char(2) NOT NULL,
	`NM_LOOKUP_GROUP` varchar(50),
	CONSTRAINT `lookup_group_KD_LOOKUP_GROUP` PRIMARY KEY(`KD_LOOKUP_GROUP`)
);
--> statement-breakpoint
CREATE TABLE `lookup_item` (
	`KD_LOOKUP_GROUP` char(2) NOT NULL,
	`KD_LOOKUP_ITEM` char(1) NOT NULL,
	`NM_LOOKUP_ITEM` varchar(225),
	CONSTRAINT `pk_lookup_item` PRIMARY KEY(`KD_LOOKUP_GROUP`,`KD_LOOKUP_ITEM`)
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
	`NAME` varchar(100) NOT NULL,
	`TARIF_KHUSUS` decimal(8,4),
	`NJKP_KHUSUS` int,
	CONSTRAINT `jenis_sppt_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `kelas_bangunan` (
	`KELAS_BANGUNAN` varchar(5) NOT NULL,
	`NILAI_MINIMUM` decimal(8,2) NOT NULL,
	`NILAI_MAKSIMUM` decimal(8,2) NOT NULL,
	`NJOP_BANGUNAN` decimal(8,2) NOT NULL,
	CONSTRAINT `kelas_bangunan_KELAS_BANGUNAN` PRIMARY KEY(`KELAS_BANGUNAN`)
);
--> statement-breakpoint
CREATE TABLE `kelas_bumi` (
	`KELAS_BUMI` varchar(5) NOT NULL,
	`NILAI_MINIMUM` decimal(8,2) NOT NULL,
	`NILAI_MAKSIMUM` decimal(8,2) NOT NULL,
	`NJOP_BUMI` decimal(8,2) NOT NULL,
	CONSTRAINT `kelas_bumi_KELAS_BUMI` PRIMARY KEY(`KELAS_BUMI`)
);
--> statement-breakpoint
CREATE TABLE `kelas_tanah` (
	`KD_KLS_TANAH` char(3) NOT NULL,
	`THN_AWAL_KLS_TANAH` char(4) NOT NULL,
	`THN_AKHIR_KLS_TANAH` char(4) NOT NULL,
	`NILAI_MIN_TANAH` decimal(15,2),
	`NILAI_MAX_TANAH` decimal(15,2),
	`NILAI_PER_M2_TANAH` decimal(15,2),
	CONSTRAINT `pk_kelas_tanah` PRIMARY KEY(`KD_KLS_TANAH`,`THN_AWAL_KLS_TANAH`,`THN_AKHIR_KLS_TANAH`)
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
	`JALAN_WP` varchar(30) NOT NULL,
	`BLOK_KAV_NO_WP` varchar(15),
	`RW_WP` varchar(2),
	`RT_WP` varchar(3),
	`KELURAHAN_WP` varchar(30),
	`KOTA_WP` varchar(30),
	`KD_POS_WP` varchar(5),
	`TELP_WP` varchar(20),
	`NPWP` varchar(16),
	`EMAIL_WP` varchar(50),
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
	`NO_FORMULIR_SPOP` varchar(11),
	`JNS_TRANSAKSI_OP` varchar(1) NOT NULL,
	`KD_PROPINSI_BERSAMA` varchar(2),
	`KD_DATI2_BERSAMA` varchar(2),
	`KD_KECAMATAN_BERSAMA` varchar(3),
	`KD_KELURAHAN_BERSAMA` varchar(3),
	`KD_BLOK_BERSAMA` varchar(3),
	`NO_URUT_BERSAMA` varchar(4),
	`KD_JNS_OP_BERSAMA` varchar(1),
	`KD_PROPINSI_ASAL` varchar(2),
	`KD_DATI2_ASAL` varchar(2),
	`KD_KECAMATAN_ASAL` varchar(3),
	`KD_KELURAHAN_ASAL` varchar(3),
	`KD_BLOK_ASAL` varchar(3),
	`NO_URUT_ASAL` varchar(4),
	`KD_JNS_OP_ASAL` varchar(1),
	`NO_SPPT_LAMA` varchar(4),
	`JALAN_OP` varchar(30) NOT NULL,
	`BLOK_KAV_NO_OP` varchar(15),
	`RT_OP` varchar(3),
	`RW_OP` varchar(2),
	`KELURAHAN_OP` varchar(30),
	`KD_STATUS_WP` varchar(1) NOT NULL,
	`LUAS_BUMI` bigint NOT NULL,
	`KD_ZNT` varchar(2),
	`JNS_BUMI` varchar(1) NOT NULL,
	`NILAI_SISTEM_BUMI` bigint NOT NULL,
	`TGL_PENDATAAN_OP` date NOT NULL,
	`NM_PENDATAAN_OP` varchar(30),
	`NIP_PENDATA` varchar(20),
	`TGL_PEMERIKSAAN_OP` date NOT NULL,
	`NM_PEMERIKSAAN_OP` varchar(30),
	`NIP_PEMERIKSA_OP` varchar(20),
	`NO_PERSIL` varchar(5),
	CONSTRAINT `pk_spop` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
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
	CONSTRAINT `pk_fasilitas_bangunan` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`,`KD_FASILITAS`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb12` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`TYPE_KONSTRUKSI_JPB12` char(1) NOT NULL DEFAULT '1',
	CONSTRAINT `pk_jpb12` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb13` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`KLS_JPB13` char(1) NOT NULL DEFAULT '1',
	`JML_JPB13` decimal(4,0),
	`LUAS_JPB13_DGN_AC_SENT` decimal(12,0),
	`LUAS_JPB13_LAIN_DGN_AC_SENT` decimal(12,0),
	CONSTRAINT `pk_jpb13` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb14` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`LUAS_KANOPI_JPB14` decimal(12,0),
	CONSTRAINT `pk_jpb14` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb15` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`LETAK_TANGKI_JPB15` char(1) NOT NULL DEFAULT '1',
	`KAPASITAS_TANGKI_JPB15` decimal(6,0),
	CONSTRAINT `pk_jpb15` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb16` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`KLS_JPB16` char(1) NOT NULL DEFAULT '1',
	CONSTRAINT `pk_jpb16` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb2` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`KLS_JPB2` char(1) NOT NULL DEFAULT '1',
	CONSTRAINT `pk_jpb2` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb3` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`TYPE_KONSTRUKSI` char(1) NOT NULL DEFAULT '1',
	`TING_KOLOM_JPB3` decimal(4,0) NOT NULL,
	`LBR_BENT_JPB3` decimal(4,0) NOT NULL,
	`LUAS_MEZZANINE_JPB3` decimal(4,0) NOT NULL,
	`KELILING_DINDING_JPB3` decimal(4,0) NOT NULL,
	`DAYA_DUKUNG_LANTAI_JPB3` decimal(8,0) NOT NULL,
	CONSTRAINT `pk_jpb3` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb4` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`KLS_JPB4` char(1) NOT NULL DEFAULT '1',
	CONSTRAINT `pk_jpb4` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb5` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`KLS_JPB5` char(1) NOT NULL DEFAULT '1',
	`LUAS_JPB5_DGN_AC_SENT` decimal(12,0),
	`LUAS_JPB5_LAIN_DGN_AC_SENT` decimal(12,0),
	CONSTRAINT `pk_jpb5` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb6` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`KLS_JPB6` char(1) NOT NULL DEFAULT '1',
	CONSTRAINT `pk_jpb6` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb7` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`JNS_JPB7` char(1) NOT NULL,
	`BINTANG_JPB7` char(1) NOT NULL,
	`JML_KMR_JPB7` int NOT NULL,
	`LUAS_KMR_JPB7_DGN_AC_SENT` decimal(12,0) NOT NULL,
	`LUAS_KMR_LAIN_JPB7_DGN_AC_SENT` decimal(12,0) NOT NULL,
	CONSTRAINT `pk_jpb7` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb8` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`TYPE_KONSTRUKSI` char(1) NOT NULL DEFAULT '1',
	`TING_KOLOM_JPB8` decimal(4,0) NOT NULL,
	`LBR_BENT_JPB8` decimal(4,0) NOT NULL,
	`LUAS_MEZZANINE_JPB8` decimal(4,0) NOT NULL,
	`KELILING_DINDING_JPB8` decimal(4,0) NOT NULL,
	`DAYA_DUKUNG_LANTAI_JPB8` decimal(8,0),
	CONSTRAINT `pk_jpb8` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `dat_jpb9` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`NO_BNG` int NOT NULL,
	`KLS_JPB9` char(1) NOT NULL DEFAULT '1',
	CONSTRAINT `pk_jpb9` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`NILAI_SISTEM_BNG` bigint NOT NULL DEFAULT 0,
	`NILAI_INDIVIDU` bigint NOT NULL DEFAULT 0,
	`TGL_PENDATAAN_BNG` datetime,
	`NIP_PENDATA_BNG` char(30),
	`TGL_PEMERIKSAAN_BNG` datetime,
	`NIP_PEMERIKSA_BNG` char(30),
	`TGL_PEREKAMAN_BNG` datetime,
	`NIP_PEREKAM_BNG` char(30),
	`TGL_KUNJUNGAN_KEMBALI` datetime,
	`AKTIF` tinyint NOT NULL DEFAULT 1,
	CONSTRAINT `pk_op_bangunan` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	CONSTRAINT `pk_dat_legalitas_bumi` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
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
	CONSTRAINT `pk_dat_op_anggota` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
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
	CONSTRAINT `pk_dat_op_induk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
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
	`THN_PAJAK_SPPT` varchar(4) NOT NULL,
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
	`THN_PAJAK_SPPT` varchar(4) NOT NULL,
	`SIKLUS_SPPT` tinyint DEFAULT 1,
	`KD_KANWIL_BANK` varchar(2),
	`KD_KPPBB_BANK` varchar(2),
	`KD_BANK_TUNGGAL` varchar(2),
	`KD_BANK_PERSEPSI` varchar(2),
	`KD_TP` varchar(2),
	`NM_WP_SPPT` varchar(30),
	`JLN_WP_SPPT` varchar(30),
	`BLOK_KAV_NO_WP_SPPT` varchar(15),
	`RW_WP_SPPT` varchar(2),
	`RT_WP_SPPT` varchar(3),
	`KELURAHAN_WP_SPPT` varchar(30),
	`KOTA_WP_SPPT` varchar(30),
	`KD_POS_WP_SPPT` varchar(5),
	`NPWP_SPPT` varchar(15),
	`NO_PERSIL_SPPT` varchar(5),
	`KD_KLS_TANAH` varchar(3),
	`THN_AWAL_KLS_TANAH` year DEFAULT 2000,
	`KD_KLS_BNG` varchar(3),
	`THN_AWAL_KLS_BNG` year DEFAULT 2000,
	`TGL_JATUH_TEMPO_SPPT` date,
	`TGL_TERBIT_SPPT` datetime,
	`TGL_CETAK_SPPT` datetime,
	`LUAS_BUMI_SPPT` bigint NOT NULL DEFAULT 0,
	`LUAS_BNG_SPPT` bigint NOT NULL DEFAULT 0,
	`NJOP_BUMI_SPPT` bigint NOT NULL DEFAULT 0,
	`NJOP_BNG_SPPT` bigint NOT NULL DEFAULT 0,
	`NJOP_SPPT` bigint NOT NULL DEFAULT 0,
	`NJOPTKP_SPPT` int NOT NULL DEFAULT 0,
	`NJKP_SPPT` bigint NOT NULL DEFAULT 0,
	`PBB_TERHUTANG_SPPT` bigint NOT NULL DEFAULT 0,
	`FAKTOR_PENGURANG_SPPT` bigint NOT NULL DEFAULT 0,
	`PBB_YG_HARUS_DIBAYAR_SPPT` bigint NOT NULL DEFAULT 0,
	`STATUS_PEMBAYARAN_SPPT` tinyint DEFAULT 0,
	`STATUS_TAGIHAN_SPPT` tinyint DEFAULT 0,
	`STATUS_CETAK_SPPT` tinyint DEFAULT 0,
	`STATUS_PEMBATALAN` char(1) NOT NULL DEFAULT '0',
	`NIP_PENCETAK_SPPT` varchar(20),
	CONSTRAINT `pk_sppt` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`)
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
	`JENIS_SPPT` varchar(10),
	`TAHAP` smallint,
	CONSTRAINT `pk_sppt_khusus` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
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
	CONSTRAINT `pk_status_pbb` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`TAHUN_PBB`)
);
--> statement-breakpoint
CREATE TABLE `sppt_e` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`THN_PAJAK_SPPT` year NOT NULL,
	`CETAK_KE` int NOT NULL,
	`EMAIL` varchar(500),
	`NM_WP_SPPT` varchar(255),
	`PBB_YG_HARUS_DIBAYAR` bigint,
	`TGL_PEMBAYARAN_TERAKHIR` date,
	`TGL_DIBUAT` datetime,
	`TGL_EMAIL` datetime,
	`TGL_RECORD` datetime DEFAULT CURRENT_TIMESTAMP,
	`NIP_VERIFIKASI_1` varchar(100),
	`NIP_VERIFIKASI_2` varchar(100),
	`NIP_VERIFIKASI_3` varchar(100),
	`TGL_VERIFIKASI_1` datetime,
	`TGL_VERIFIKASI_2` datetime,
	`TGL_VERIFIKASI_3` datetime,
	`TGL_KIRIM_TTD` datetime,
	`TGL_TERIMA_TTD` datetime,
	`FILE_SPPT` text,
	CONSTRAINT `pk_sppt_e` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`,`CETAK_KE`)
);
--> statement-breakpoint
CREATE TABLE `sppt_op_bersama` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`THN_PAJAK_SPPT` varchar(4) NOT NULL,
	`KD_KLS_TANAH` varchar(3) NOT NULL,
	`THN_AWAL_KLS_TANAH` varchar(4) NOT NULL,
	`KD_KLS_BNG` varchar(3) NOT NULL,
	`THN_AWAL_KLS_BNG` varchar(4) NOT NULL,
	`LUAS_BUMI_BEBAN_SPPT` bigint NOT NULL,
	`LUAS_BNG_BEBAN_SPPT` bigint NOT NULL,
	`NJOP_BUMI_BEBAN_SPPT` bigint NOT NULL,
	`NJOP_BNG_BEBAN_SPPT` bigint NOT NULL,
	CONSTRAINT `pk_sppt_op_bersama` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`)
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
	`THN_PAJAK_SPPT` varchar(4) NOT NULL,
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
	CONSTRAINT `pk_pembayaran_sppt` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`,`PEMBAYARAN_KE`)
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
CREATE TABLE `bangunan_lantai` (
	`KD_JPB` char(2) NOT NULL,
	`TIPE_BNG` char(5) NOT NULL,
	`KD_BNG_LANTAI` char(8) NOT NULL,
	`LANTAI_MIN_BNG_LANTAI` int,
	`LANTAI_MAX_BNG_LANTAI` int,
	CONSTRAINT `pk_bangunan_lantai` PRIMARY KEY(`KD_JPB`,`TIPE_BNG`,`KD_BNG_LANTAI`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_daya_dukung` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_DAYA_DUKUNG` char(4) NOT NULL,
	`TYPE_KONSTRUKSI` char(1) NOT NULL,
	`NILAI_DBKB_DAYA_DUKUNG` int,
	CONSTRAINT `pk_dbkb_daya_dukung` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_DAYA_DUKUNG`,`TYPE_KONSTRUKSI`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb12` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB12` char(4) NOT NULL,
	`TYPE_DBKB_JPB12` char(1) NOT NULL,
	`NILAI_DBKB_JPB12` int,
	CONSTRAINT `pk_dbkb_jpb12` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB12`,`TYPE_DBKB_JPB12`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb13` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB13` char(4) NOT NULL,
	`KLS_DBKB_JPB13` char(1) NOT NULL,
	`LANTAI_MIN_JPB13` tinyint NOT NULL,
	`LANTAI_MAX_JPB13` tinyint NOT NULL,
	`NILAI_DBKB_JPB13` int,
	CONSTRAINT `pk_dbkb_jpb13` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB13`,`KLS_DBKB_JPB13`,`LANTAI_MIN_JPB13`,`LANTAI_MAX_JPB13`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb14` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB14` char(4) NOT NULL,
	`NILAI_DBKB_JPB14` int,
	CONSTRAINT `pk_dbkb_jpb14` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB14`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb15` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB15` char(4) NOT NULL,
	`JNS_TANGKI_DBKB_JPB15` char(1) NOT NULL,
	`KAPASITAS_MIN_DBKB_JPB15` decimal(9,4) NOT NULL,
	`KAPASITAS_MAX_DBKB_JPB15` decimal(9,4) NOT NULL,
	`NILAI_DBKB_JPB15` int,
	CONSTRAINT `pk_dbkb_jpb15` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB15`,`JNS_TANGKI_DBKB_JPB15`,`KAPASITAS_MIN_DBKB_JPB15`,`KAPASITAS_MAX_DBKB_JPB15`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb16` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB16` char(4) NOT NULL,
	`KLS_DBKB_JPB16` char(1) NOT NULL,
	`LANTAI_MIN_JPB16` tinyint NOT NULL,
	`LANTAI_MAX_JPB16` tinyint NOT NULL,
	`NILAI_DBKB_JPB16` int,
	CONSTRAINT `pk_dbkb_jpb16` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB16`,`KLS_DBKB_JPB16`,`LANTAI_MIN_JPB16`,`LANTAI_MAX_JPB16`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb2` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB2` char(4) NOT NULL,
	`KLS_DBKB_JPB2` char(1) NOT NULL,
	`LANTAI_MIN_JPB2` tinyint NOT NULL,
	`LANTAI_MAX_JPB2` tinyint NOT NULL,
	`NILAI_DBKB_JPB2` int,
	CONSTRAINT `pk_dbkb_jpb2` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB2`,`KLS_DBKB_JPB2`,`LANTAI_MIN_JPB2`,`LANTAI_MAX_JPB2`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb3` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB3` char(4) NOT NULL,
	`LBR_BENT_MIN_DBKB_JPB3` int NOT NULL,
	`LBR_BENT_MAX_DBKB_JPB3` int NOT NULL,
	`TING_KOLOM_MIN_DBKB_JPB3` int NOT NULL,
	`TING_KOLOM_MAX_DBKB_JPB3` int NOT NULL,
	`NILAI_DBKB_JPB3` decimal(12,2),
	CONSTRAINT `pk_dbkb_jpb3` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB3`,`LBR_BENT_MIN_DBKB_JPB3`,`LBR_BENT_MAX_DBKB_JPB3`,`TING_KOLOM_MIN_DBKB_JPB3`,`TING_KOLOM_MAX_DBKB_JPB3`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb4` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB4` char(4) NOT NULL,
	`KLS_DBKB_JPB4` char(1) NOT NULL,
	`LANTAI_MIN_JPB4` tinyint NOT NULL,
	`LANTAI_MAX_JPB4` tinyint NOT NULL,
	`NILAI_DBKB_JPB4` int,
	CONSTRAINT `pk_dbkb_jpb4` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB4`,`KLS_DBKB_JPB4`,`LANTAI_MIN_JPB4`,`LANTAI_MAX_JPB4`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb5` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB5` char(4) NOT NULL,
	`KLS_DBKB_JPB5` char(1) NOT NULL,
	`LANTAI_MIN_JPB5` tinyint NOT NULL,
	`LANTAI_MAX_JPB5` tinyint NOT NULL,
	`NILAI_DBKB_JPB5` int,
	CONSTRAINT `pk_dbkb_jpb5` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB5`,`KLS_DBKB_JPB5`,`LANTAI_MIN_JPB5`,`LANTAI_MAX_JPB5`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb6` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB6` char(4) NOT NULL,
	`KLS_DBKB_JPB6` char(1) NOT NULL,
	`NILAI_DBKB_JPB6` int,
	CONSTRAINT `pk_dbkb_jpb6` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB6`,`KLS_DBKB_JPB6`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb7` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB7` char(4) NOT NULL,
	`JNS_DBKB_JPB7` char(1) NOT NULL,
	`BINTANG_DBKB_JPB7` char(1) NOT NULL,
	`LANTAI_MIN_JPB7` tinyint NOT NULL,
	`LANTAI_MAX_JPB7` tinyint NOT NULL,
	`NILAI_DBKB_JPB7` int,
	CONSTRAINT `pk_dbkb_jpb7` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB7`,`JNS_DBKB_JPB7`,`BINTANG_DBKB_JPB7`,`LANTAI_MIN_JPB7`,`LANTAI_MAX_JPB7`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb8` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB8` char(4) NOT NULL,
	`LBR_BENT_MIN_DBKB_JPB8` int NOT NULL,
	`LBR_BENT_MAX_DBKB_JPB8` int NOT NULL,
	`TING_KOLOM_MIN_DBKB_JPB8` int NOT NULL,
	`TING_KOLOM_MAX_DBKB_JPB8` int NOT NULL,
	`NILAI_DBKB_JPB8` decimal(12,2),
	CONSTRAINT `pk_dbkb_jpb8` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB8`,`LBR_BENT_MIN_DBKB_JPB8`,`LBR_BENT_MAX_DBKB_JPB8`,`TING_KOLOM_MIN_DBKB_JPB8`,`TING_KOLOM_MAX_DBKB_JPB8`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_jpb9` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_JPB9` char(4) NOT NULL,
	`KLS_DBKB_JPB9` char(1) NOT NULL,
	`LANTAI_MIN_JPB9` tinyint NOT NULL,
	`LANTAI_MAX_JPB9` tinyint NOT NULL,
	`NILAI_DBKB_JPB9` int,
	CONSTRAINT `pk_dbkb_jpb9` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_JPB9`,`KLS_DBKB_JPB9`,`LANTAI_MIN_JPB9`,`LANTAI_MAX_JPB9`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_material` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_MATERIAL` char(4) NOT NULL,
	`KD_PEKERJAAN` char(2) NOT NULL,
	`KD_KEGIATAN` char(2) NOT NULL,
	`NILAI_DBKB_MATERIAL` decimal(12,2),
	CONSTRAINT `pk_dbkb_material` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_MATERIAL`,`KD_PEKERJAAN`,`KD_KEGIATAN`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_mezanin` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_MEZANIN` char(4) NOT NULL,
	`NILAI_DBKB_MEZANIN` int,
	CONSTRAINT `pk_dbkb_mezanin` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_MEZANIN`)
);
--> statement-breakpoint
CREATE TABLE `dbkb_standard` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DBKB_STANDARD` char(4) NOT NULL,
	`KD_JPB` char(2) NOT NULL,
	`TIPE_BNG` char(5) NOT NULL,
	`KD_BNG_LANTAI` char(8) NOT NULL,
	`NILAI_DBKB_STANDARD` decimal(11,4),
	CONSTRAINT `pk_dbkb_standard` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DBKB_STANDARD`,`KD_JPB`,`TIPE_BNG`,`KD_BNG_LANTAI`)
);
--> statement-breakpoint
CREATE TABLE `fas_dep_min_max` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_DEP_MIN_MAX` char(4) NOT NULL,
	`KD_FASILITAS` char(2) NOT NULL,
	`KLS_DEP_MIN` mediumint NOT NULL,
	`KLS_DEP_MAX` mediumint NOT NULL,
	`NILAI_DEP_MIN_MAX` decimal(10,2),
	CONSTRAINT `pk_fas_dep_min_max` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_DEP_MIN_MAX`,`KD_FASILITAS`,`KLS_DEP_MIN`,`KLS_DEP_MAX`)
);
--> statement-breakpoint
CREATE TABLE `fas_non_dep` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_NON_DEP` char(4) NOT NULL,
	`KD_FASILITAS` char(2) NOT NULL,
	`NILAI_NON_DEP` decimal(10,2),
	CONSTRAINT `pk_fas_non_dep` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_NON_DEP`,`KD_FASILITAS`)
);
--> statement-breakpoint
CREATE TABLE `kayu_ulin` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_STATUS_KAYU_ULIN` char(4) NOT NULL,
	`STATUS_KAYU_ULIN` tinyint,
	CONSTRAINT `pk_kayu_ulin` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_STATUS_KAYU_ULIN`)
);
--> statement-breakpoint
CREATE TABLE `penyusutan` (
	`UMUR_EFEKTIF` tinyint NOT NULL,
	`KD_RANGE_PENYUSUTAN` char(1) NOT NULL,
	`KONDISI_BNG_SUSUT` char(1) NOT NULL,
	`NILAI_PENYUSUTAN` int,
	CONSTRAINT `pk_penyusutan` PRIMARY KEY(`UMUR_EFEKTIF`,`KD_RANGE_PENYUSUTAN`,`KONDISI_BNG_SUSUT`)
);
--> statement-breakpoint
CREATE TABLE `range_penyusutan` (
	`KD_RANGE_PENYUSUTAN` char(1) NOT NULL,
	`NILAI_MIN_PENYUSUTAN` bigint,
	`NILAI_MAX_PENYUSUTAN` bigint,
	CONSTRAINT `pk_range_penyusutan` PRIMARY KEY(`KD_RANGE_PENYUSUTAN`)
);
--> statement-breakpoint
CREATE TABLE `tipe_bangunan` (
	`TIPE_BNG` char(5) NOT NULL,
	`NM_TIPE_BNG` varchar(30),
	`LUAS_MIN_TIPE_BNG` mediumint,
	`LUAS_MAX_TIPE_BNG` mediumint,
	`FAKTOR_PEMBAGI_TIPE_BNG` decimal(8,4),
	CONSTRAINT `pk_tipe_bangunan` PRIMARY KEY(`TIPE_BNG`)
);
--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `invitation` ADD CONSTRAINT `invitation_inviter_id_user_id_fk` FOREIGN KEY (`inviter_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member` ADD CONSTRAINT `member_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member` ADD CONSTRAINT `member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_access_token` ADD CONSTRAINT `oauth_access_token_client_id_oauth_application_client_id_fk` FOREIGN KEY (`client_id`) REFERENCES `oauth_application`(`client_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_access_token` ADD CONSTRAINT `oauth_access_token_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_application` ADD CONSTRAINT `oauth_application_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_consent` ADD CONSTRAINT `oauth_consent_client_id_oauth_application_client_id_fk` FOREIGN KEY (`client_id`) REFERENCES `oauth_application`(`client_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `oauth_consent` ADD CONSTRAINT `oauth_consent_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team` ADD CONSTRAINT `team_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_team_id_team_id_fk` FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_member` ADD CONSTRAINT `team_member_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `two_factor` ADD CONSTRAINT `two_factor_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_roles` ADD CONSTRAINT `member_roles_member_id_member_id_fk` FOREIGN KEY (`member_id`) REFERENCES `member`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `member_roles` ADD CONSTRAINT `member_roles_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `org_roles` ADD CONSTRAINT `org_roles_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `org_roles` ADD CONSTRAINT `org_roles_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_ownership` ADD CONSTRAINT `resource_ownership_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ref_dati2` ADD CONSTRAINT `fk_dati2_propinsi` FOREIGN KEY (`KD_PROPINSI`) REFERENCES `ref_propinsi`(`KD_PROPINSI`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ref_kecamatan` ADD CONSTRAINT `fk_kecamatan_dati2` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`) REFERENCES `ref_dati2`(`KD_PROPINSI`,`KD_DATI2`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ref_kelurahan` ADD CONSTRAINT `fk_kelurahan_kecamatan` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`) REFERENCES `ref_kecamatan`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `group_akses` ADD CONSTRAINT `fk_group_akses_akses` FOREIGN KEY (`AKSES`) REFERENCES `akses`(`AKSES`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `login` ADD CONSTRAINT `login_USER_ID_user_id_fk` FOREIGN KEY (`USER_ID`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lookup_item` ADD CONSTRAINT `fk_lookup_item_group` FOREIGN KEY (`KD_LOOKUP_GROUP`) REFERENCES `lookup_group`(`KD_LOOKUP_GROUP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `spop` ADD CONSTRAINT `fk_spop_subjek` FOREIGN KEY (`SUBJEK_PAJAK_ID`) REFERENCES `dat_subjek_pajak`(`SUBJEK_PAJAK_ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_fasilitas_bangunan` ADD CONSTRAINT `fk_fas_bangunan` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`) REFERENCES `dat_op_bangunan`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_fasilitas_bangunan` ADD CONSTRAINT `fk_fas_master` FOREIGN KEY (`KD_FASILITAS`) REFERENCES `fasilitas`(`KD_FASILITAS`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_op_bangunan` ADD CONSTRAINT `fk_bangunan_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_legalitas_bumi` ADD CONSTRAINT `fk_legalitas_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_op_anggota` ADD CONSTRAINT `fk_anggota_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_op_induk` ADD CONSTRAINT `fk_op_induk_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `status_pbb` ADD CONSTRAINT `fk_status_pbb_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pembayaran_sppt` ADD CONSTRAINT `fk_pembayaran_sppt` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`) REFERENCES `sppt`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pelayanan` ADD CONSTRAINT `fk_pelayanan_jns` FOREIGN KEY (`KD_JNS_PELAYANAN`) REFERENCES `ref_jns_pelayanan`(`KD_JNS_PELAYANAN`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pelayanan_dokumen` ADD CONSTRAINT `fk_dok_pelayanan` FOREIGN KEY (`NO_PELAYANAN`) REFERENCES `pelayanan`(`NO_PELAYANAN`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pelayanan_lampiran_kolektif` ADD CONSTRAINT `fk_lamp_kol_pelayanan` FOREIGN KEY (`NO_PELAYANAN`) REFERENCES `pelayanan`(`NO_PELAYANAN`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pemekaran_detail` ADD CONSTRAINT `fk_pemekaran_detail_induk` FOREIGN KEY (`PEMEKARAN_ID`) REFERENCES `pemekaran`(`ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `invitation_organizationId_idx` ON `invitation` (`organization_id`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `invitation` (`email`);--> statement-breakpoint
CREATE INDEX `member_organizationId_idx` ON `member` (`organization_id`);--> statement-breakpoint
CREATE INDEX `member_userId_idx` ON `member` (`user_id`);--> statement-breakpoint
CREATE INDEX `member_custom_role_id_idx` ON `member` (`custom_role_id`);--> statement-breakpoint
CREATE INDEX `oauthAccessToken_clientId_idx` ON `oauth_access_token` (`client_id`);--> statement-breakpoint
CREATE INDEX `oauthAccessToken_userId_idx` ON `oauth_access_token` (`user_id`);--> statement-breakpoint
CREATE INDEX `oauthApplication_userId_idx` ON `oauth_application` (`user_id`);--> statement-breakpoint
CREATE INDEX `oauthConsent_clientId_idx` ON `oauth_consent` (`client_id`);--> statement-breakpoint
CREATE INDEX `oauthConsent_userId_idx` ON `oauth_consent` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE INDEX `team_organizationId_idx` ON `team` (`organization_id`);--> statement-breakpoint
CREATE INDEX `teamMember_teamId_idx` ON `team_member` (`team_id`);--> statement-breakpoint
CREATE INDEX `teamMember_userId_idx` ON `team_member` (`user_id`);--> statement-breakpoint
CREATE INDEX `twoFactor_secret_idx` ON `two_factor` (`secret`);--> statement-breakpoint
CREATE INDEX `twoFactor_userId_idx` ON `two_factor` (`user_id`);--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE INDEX `member_roles_member_id_idx` ON `member_roles` (`member_id`);--> statement-breakpoint
CREATE INDEX `member_roles_role_id_idx` ON `member_roles` (`role_id`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `notification_preferences_userId_idx` ON `notification_preferences` (`user_id`);--> statement-breakpoint
CREATE INDEX `org_roles_org_idx` ON `org_roles` (`organization_id`);--> statement-breakpoint
CREATE INDEX `org_roles_created_by_idx` ON `org_roles` (`created_by`);--> statement-breakpoint
CREATE INDEX `books_organization_id_idx` ON `books` (`organization_id`);--> statement-breakpoint
CREATE INDEX `books_created_by_id_idx` ON `books` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `resource_ownership_resource_idx` ON `resource_ownership` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE INDEX `resource_ownership_owner_idx` ON `resource_ownership` (`owner_id`);--> statement-breakpoint
CREATE INDEX `resource_ownership_org_idx` ON `resource_ownership` (`organization_id`);--> statement-breakpoint
CREATE INDEX `idx_jalan_wilayah` ON `jalan` (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`);--> statement-breakpoint
CREATE INDEX `idx_histori_nop` ON `histori_sppt` (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`);--> statement-breakpoint
CREATE INDEX `idx_sppt_thn` ON `sppt` (`THN_PAJAK_SPPT`);--> statement-breakpoint
CREATE INDEX `idx_sppt_status_bayar` ON `sppt` (`STATUS_PEMBAYARAN_SPPT`);--> statement-breakpoint
CREATE INDEX `idx_histori_mutasi_pelayanan` ON `histori_mutasi` (`NO_PELAYANAN`);--> statement-breakpoint
CREATE INDEX `idx_pelayanan_nop` ON `pelayanan` (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`);--> statement-breakpoint
CREATE INDEX `idx_pelayanan_status` ON `pelayanan` (`STATUS_PELAYANAN`);--> statement-breakpoint
CREATE INDEX `idx_pelayanan_tgl` ON `pelayanan` (`TANGGAL_PELAYANAN`);--> statement-breakpoint
CREATE INDEX `idx_lamp_kol_pelayanan` ON `pelayanan_lampiran_kolektif` (`NO_PELAYANAN`);--> statement-breakpoint
CREATE INDEX `idx_pemekaran_nop_lama` ON `pemekaran_detail` (`KD_PROPINSI_LAMA`,`KD_DATI2_LAMA`,`KD_KECAMATAN_LAMA`,`KD_KELURAHAN_LAMA`,`KD_BLOK_LAMA`,`NO_URUT_LAMA`,`KD_JNS_OP_LAMA`);--> statement-breakpoint
CREATE INDEX `idx_log_user` ON `log_aktivitas` (`USERNAME`);--> statement-breakpoint
CREATE INDEX `idx_log_tgl` ON `log_aktivitas` (`CREATED_AT`);