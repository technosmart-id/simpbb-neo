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
CREATE TABLE `ref_dati2` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`NM_DATI2` varchar(30) NOT NULL,
	CONSTRAINT `pk_ref_dati2` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`)
);
--> statement-breakpoint
CREATE TABLE `ref_jns_pelayanan` (
	`KD_JNS_PELAYANAN` char(2) NOT NULL,
	`NM_JENIS_PELAYANAN` varchar(50) NOT NULL,
	CONSTRAINT `ref_jns_pelayanan_KD_JNS_PELAYANAN` PRIMARY KEY(`KD_JNS_PELAYANAN`)
);
--> statement-breakpoint
CREATE TABLE `ref_kecamatan` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`NM_KECAMATAN` varchar(30) NOT NULL,
	CONSTRAINT `pk_ref_kecamatan` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`)
);
--> statement-breakpoint
CREATE TABLE `ref_kelurahan` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_SEKTOR` varchar(2) NOT NULL,
	`NM_KELURAHAN` varchar(30) NOT NULL,
	`NO_KELURAHAN` smallint,
	`KD_POS_KELURAHAN` varchar(5),
	CONSTRAINT `pk_ref_kelurahan` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`)
);
--> statement-breakpoint
CREATE TABLE `ref_propinsi` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`NM_PROPINSI` varchar(30) NOT NULL,
	CONSTRAINT `ref_propinsi_KD_PROPINSI` PRIMARY KEY(`KD_PROPINSI`)
);
--> statement-breakpoint
CREATE TABLE `akses` (
	`AKSES` varchar(50) NOT NULL,
	`AKTIF` tinyint(1),
	CONSTRAINT `akses_AKSES` PRIMARY KEY(`AKSES`)
);
--> statement-breakpoint
CREATE TABLE `group_akses` (
	`HAK_AKSES` varchar(30) NOT NULL,
	`AKSES` varchar(50) NOT NULL,
	CONSTRAINT `pk_group_akses` PRIMARY KEY(`HAK_AKSES`,`AKSES`)
);
--> statement-breakpoint
CREATE TABLE `login` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`USERNAME` varchar(20) NOT NULL,
	`PASSWORD` char(32) NOT NULL,
	`HAK_AKSES` varchar(20) NOT NULL,
	`NIP` varchar(30),
	`NAMA` varchar(200),
	`JABATAN` varchar(200),
	`PENANGGUNG_JAWAB_CETAK` tinyint(1),
	`TANDA_TANGAN` longblob,
	`USER_ID` varchar(36),
	CONSTRAINT `login_ID` PRIMARY KEY(`ID`)
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
	`NM_FASILITAS` varchar(50),
	`SATUAN_FASILITAS` varchar(10),
	`NILAI_FASILITAS` decimal(15,2) NOT NULL DEFAULT '0',
	`STATUS_FASILITAS` char(1),
	`KETERGANTUNGAN` char(1),
	CONSTRAINT `fasilitas_KD_FASILITAS` PRIMARY KEY(`KD_FASILITAS`)
);
--> statement-breakpoint
CREATE TABLE `jenis_sppt` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`NAME` varchar(255),
	`TARIF_KHUSUS` decimal(3,3),
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
CREATE TABLE `dat_legalitas_bumi` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_BLOK` varchar(3) NOT NULL,
	`NO_URUT` varchar(4) NOT NULL,
	`KD_JNS_OP` varchar(1) NOT NULL,
	`NO_LEGALITAS_TANAH` varchar(15),
	CONSTRAINT `pk_dat_legalitas_bumi` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
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
	`STATUS_PEKERJAAN_WP` varchar(1) NOT NULL,
	`EMAIL_WP` varchar(50),
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
	`KELURAHAN_OP` varchar(30),
	`RW_OP` varchar(2),
	`RT_OP` varchar(3),
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
CREATE TABLE `dat_op_anggota` (
	`KD_PROPINSI_INDUK` varchar(2) NOT NULL,
	`KD_DATI2_INDUK` varchar(2) NOT NULL,
	`KD_KECAMATAN_INDUK` varchar(3) NOT NULL,
	`KD_KELURAHAN_INDUK` varchar(3) NOT NULL,
	`KD_BLOK_INDUK` varchar(3) NOT NULL,
	`NO_URUT_INDUK` varchar(4) NOT NULL,
	`KD_JNS_OP_INDUK` varchar(1) NOT NULL,
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_BLOK` varchar(3) NOT NULL,
	`NO_URUT` varchar(4) NOT NULL,
	`KD_JNS_OP` varchar(1) NOT NULL,
	`LUAS_BUMI_BEBAN` bigint,
	`LUAS_BNG_BEBAN` bigint,
	`NILAI_SISTEM_BUMI_BEBAN` bigint,
	`NILAI_SISTEM_BNG_BEBAN` bigint,
	`NJOP_BUMI_BEBAN` bigint,
	`NJOP_BNG_BEBAN` bigint,
	CONSTRAINT `pk_dat_op_anggota` PRIMARY KEY(`KD_PROPINSI_INDUK`,`KD_DATI2_INDUK`,`KD_KECAMATAN_INDUK`,`KD_KELURAHAN_INDUK`,`KD_BLOK_INDUK`,`NO_URUT_INDUK`,`KD_JNS_OP_INDUK`,`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
);
--> statement-breakpoint
CREATE TABLE `dat_op_induk` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_BLOK` varchar(3) NOT NULL,
	`NO_URUT` varchar(4) NOT NULL,
	`KD_JNS_OP` varchar(1) NOT NULL,
	CONSTRAINT `pk_dat_op_induk` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`)
);
--> statement-breakpoint
CREATE TABLE `dat_fasilitas_bangunan` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_BLOK` varchar(3) NOT NULL,
	`NO_URUT` varchar(4) NOT NULL,
	`KD_JNS_OP` varchar(1) NOT NULL,
	`NO_BNG` smallint NOT NULL,
	`KD_FASILITAS` varchar(2) NOT NULL,
	`JML_SATUAN` bigint NOT NULL,
	CONSTRAINT `pk_dat_fasilitas_bangunan` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`,`KD_FASILITAS`)
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
	`TYPE_JPB12` char(1) NOT NULL,
	CONSTRAINT `pk_dat_jpb12` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`KLS_JPB13` char(1) NOT NULL,
	`JML_JPB13` decimal(4,0) NOT NULL,
	`LUAS_JPB13_DGN_AC_SENT` decimal(12,0) NOT NULL,
	`LUAS_JPB13_LAIN_DGN_AC_SENT` decimal(12,0) NOT NULL,
	CONSTRAINT `pk_dat_jpb13` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`LUAS_KANOPI_JPB14` decimal(12,0) NOT NULL,
	CONSTRAINT `pk_dat_jpb14` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`LETAK_TANGKI_JPB15` char(1) NOT NULL,
	`KAPASITAS_TANGKI_JPB15` decimal(6,0) NOT NULL,
	CONSTRAINT `pk_dat_jpb15` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`KLS_JPB16` char(1) NOT NULL,
	CONSTRAINT `pk_dat_jpb16` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`KLS_JPB2` char(1) NOT NULL,
	CONSTRAINT `pk_dat_jpb2` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`TYPE_KONSTRUKSI` char(1) NOT NULL,
	`TING_KOLOM_JPB3` decimal(4,0) NOT NULL,
	`LBR_BENT_JPB3` decimal(4,0) NOT NULL,
	`LUAS_MEZZANINE_JPB3` decimal(4,0) NOT NULL,
	`KELILING_DINDING_JPB3` decimal(4,0) NOT NULL,
	`DAYA_DUKUNG_LANTAI_JPB3` decimal(8,0) NOT NULL,
	CONSTRAINT `pk_dat_jpb3` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`KLS_JPB4` char(1) NOT NULL,
	CONSTRAINT `pk_dat_jpb4` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`KLS_JPB5` char(1) NOT NULL,
	`LUAS_KMR_JPB5_DGN_AC_SENT` decimal(12,0) NOT NULL,
	`LUAS_RNG_LAIN_JPB5_DGN_AC_SENT` decimal(12,0) NOT NULL,
	CONSTRAINT `pk_dat_jpb5` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`KLS_JPB6` char(1) NOT NULL,
	CONSTRAINT `pk_dat_jpb6` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`JML_KMR_JPB7` decimal(4,0) NOT NULL,
	`LUAS_KMR_JPB7_DGN_AC_SENT` decimal(12,0) NOT NULL,
	`LUAS_KMR_LAIN_JPB7_DGN_AC_SENT` decimal(12,0) NOT NULL,
	CONSTRAINT `pk_dat_jpb7` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`TYPE_KONSTRUKSI` char(1) NOT NULL,
	`TING_KOLOM_JPB8` decimal(4,0) NOT NULL,
	`LBR_BENT_JPB8` decimal(4,0) NOT NULL,
	`LUAS_MEZZANINE_JPB8` decimal(4,0) NOT NULL,
	`KELILING_DINDING_JPB8` decimal(4,0) NOT NULL,
	`DAYA_DUKUNG_LANTAI_JPB8` decimal(8,0),
	CONSTRAINT `pk_dat_jpb8` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`KLS_JPB9` char(1) NOT NULL,
	CONSTRAINT `pk_dat_jpb9` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
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
	`KD_JPB` char(2),
	`NO_FORMULIR_LSPOP` char(11),
	`THN_DIBANGUN_BNG` char(4) NOT NULL,
	`THN_RENOVASI_BNG` char(4),
	`LUAS_BNG` bigint NOT NULL,
	`JML_LANTAI_BNG` int NOT NULL,
	`KONDISI_BNG` char(1),
	`JNS_KONSTRUKSI_BNG` char(1),
	`JNS_ATAP_BNG` char(1),
	`KD_DINDING` char(1),
	`KD_LANTAI` char(1),
	`KD_LANGIT_LANGIT` char(1),
	`NILAI_SISTEM_BNG` bigint NOT NULL,
	`JNS_TRANSAKSI_BNG` char(1),
	`TGL_PENDATAAN_BNG` datetime,
	`NIP_PENDATA_BNG` char(30),
	`TGL_PEMERIKSAAN_BNG` datetime,
	`NIP_PEMERIKSA_BNG` char(30),
	`TGL_PEREKAMAN_BNG` datetime,
	`NIP_PEREKAM_BNG` char(30),
	`TGL_KUNJUNGAN_KEMBALI` date,
	`NILAI_INDIVIDU` bigint NOT NULL,
	`AKTIF` tinyint(1) NOT NULL,
	CONSTRAINT `pk_dat_op_bangunan` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`NO_BNG`)
);
--> statement-breakpoint
CREATE TABLE `sppt` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_BLOK` varchar(3) NOT NULL,
	`NO_URUT` varchar(4) NOT NULL,
	`KD_JNS_OP` varchar(1) NOT NULL,
	`THN_PAJAK_SPPT` varchar(4) NOT NULL,
	`SIKLUS_SPPT` tinyint(1),
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
	`THN_AWAL_KLS_TANAH` year(4),
	`KD_KLS_BNG` varchar(3),
	`THN_AWAL_KLS_BNG` year(4),
	`TGL_JATUH_TEMPO_SPPT` date,
	`LUAS_BUMI_SPPT` bigint NOT NULL,
	`LUAS_BNG_SPPT` bigint NOT NULL,
	`NJOP_BUMI_SPPT` bigint NOT NULL,
	`NJOP_BNG_SPPT` bigint NOT NULL,
	`NJOP_SPPT` bigint NOT NULL,
	`NJOPTKP_SPPT` int NOT NULL,
	`NJKP_SPPT` bigint NOT NULL,
	`PBB_TERHUTANG_SPPT` bigint NOT NULL,
	`FAKTOR_PENGURANG_SPPT` bigint NOT NULL,
	`PBB_YG_HARUS_DIBAYAR_SPPT` bigint NOT NULL,
	`STATUS_PEMBAYARAN_SPPT` tinyint(1),
	`STATUS_TAGIHAN_SPPT` tinyint(1),
	`STATUS_CETAK_SPPT` tinyint(1),
	`STATUS_PEMBATALAN` char(1) NOT NULL DEFAULT '0',
	`TGL_TERBIT_SPPT` datetime,
	`TGL_CETAK_SPPT` datetime,
	`NIP_PENCETAK_SPPT` varchar(20),
	CONSTRAINT `pk_sppt` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`)
);
--> statement-breakpoint
CREATE TABLE `sppt_e` (
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_BLOK` varchar(3) NOT NULL,
	`NO_URUT` varchar(4) NOT NULL,
	`KD_JNS_OP` varchar(1) NOT NULL,
	`THN_PAJAK_SPPT` year(4) NOT NULL,
	`CETAK_KE` int NOT NULL,
	`EMAIL` varchar(500),
	`NM_WP_SPPT` varchar(255),
	`PBB_YG_HARUS_DIBAYAR` bigint,
	`TGL_PEMBAYARAN_TERAKHIR` date,
	`TGL_DIBUAT` datetime,
	`TGL_EMAIL` datetime,
	`TGL_RECORD` timestamp NULL,
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
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_BLOK` varchar(3) NOT NULL,
	`NO_URUT` varchar(4) NOT NULL,
	`KD_JNS_OP` varchar(1) NOT NULL,
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
	`KD_PROPINSI` varchar(2) NOT NULL,
	`KD_DATI2` varchar(2) NOT NULL,
	`KD_KECAMATAN` varchar(3) NOT NULL,
	`KD_KELURAHAN` varchar(3) NOT NULL,
	`KD_BLOK` varchar(3) NOT NULL,
	`NO_URUT` varchar(4) NOT NULL,
	`KD_JNS_OP` varchar(1) NOT NULL,
	`THN_PAJAK_SPPT` varchar(4) NOT NULL,
	`PEMBAYARAN_SPPT_KE` tinyint NOT NULL,
	`KD_KANWIL_BANK` varchar(2) NOT NULL,
	`KD_KPPBB_BANK` varchar(2) NOT NULL,
	`KD_BANK_TUNGGAL` varchar(2) NOT NULL,
	`KD_BANK_PERSEPSI` varchar(2) NOT NULL,
	`KD_TP` varchar(2) NOT NULL,
	`DENDA_SPPT` bigint,
	`JML_SPPT_YG_DIBAYAR` bigint NOT NULL,
	`TGL_PEMBAYARAN_SPPT` date,
	`TGL_REKAM_BYR_SPPT` datetime NOT NULL,
	`NIP_REKAM_BYR_SPPT` varchar(15) NOT NULL,
	`NO_BUKTI` varchar(50),
	`DIBATALKAN` tinyint(1) DEFAULT 0,
	CONSTRAINT `pk_pembayaran_sppt` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`,`PEMBAYARAN_SPPT_KE`)
);
--> statement-breakpoint
CREATE TABLE `histori_mutasi` (
	`no_pelayanan` varchar(50) NOT NULL,
	`nop_sebelum` varchar(20),
	`nama_sebelum` varchar(200),
	`lt_sebelum` int,
	`lb_sebelum` int,
	`pbb_sebelum` bigint,
	`nop_sesudah` varchar(18),
	`nama_sesudah` varchar(200),
	`lt_sesudah` int,
	`lb_sesudah` int,
	`pbb_sesudah` bigint,
	`id` bigint AUTO_INCREMENT NOT NULL,
	`keterangan` text,
	CONSTRAINT `histori_mutasi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pelayanan` (
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`NAMA_PEMOHON` varchar(300),
	`ALAMAT_PEMOHON` varchar(500),
	`LETAK_OP` varchar(250),
	`KECAMATAN` varchar(250),
	`KELURAHAN` varchar(250),
	`NO_PELAYANAN` varchar(13) NOT NULL,
	`TANGGAL_PELAYANAN` date,
	`KD_PROPINSI` varchar(2),
	`KD_DATI2` varchar(2),
	`KD_KECAMATAN` varchar(3),
	`KD_KELURAHAN` varchar(3),
	`KD_BLOK` varchar(3),
	`NO_URUT` varchar(4),
	`KD_JNS_OP` varchar(1),
	`KD_JNS_PELAYANAN` char(2),
	`TANGGAL_PERKIRAAN_SELESAI` date,
	`STATUS_PELAYANAN` smallint,
	`NIP_PETUGAS_PENERIMA` varchar(300),
	`NAMA_PETUGAS_PENERIMA` varchar(300),
	`NIP_AR` varchar(300),
	`NAMA_AR` varchar(300),
	`CATATAN` text,
	`KETERANGAN` text,
	`TGL_MASUK_PENILAI` datetime,
	`NIP_MASUK_PENILAI` varchar(300),
	`TGL_SELESAI` datetime,
	`NIP_SELESAI` varchar(300),
	`TGL_TERKONFIRMASI_WP` datetime,
	`NIP_TERKONFIRMASI_WP` varchar(300),
	`TGL_PENETAPAN` datetime,
	`NIP_PENETAPAN` varchar(300),
	`TGL_BERKAS_DITUNDA` datetime,
	`NIP_BERKAS_DITUNDA` varchar(300),
	`TTD_JABATAN_KIRI` varchar(500),
	`TTD_NAMA_KIRI` varchar(500),
	`TTD_NIP_KIRI` varchar(500),
	`TTD_JABATAN_KANAN` varchar(500),
	`TTD_NAMA_KANAN` varchar(500),
	`TTD_NIP_KANAN` varchar(500),
	`KETERANGAN_BERKAS` text,
	`EKSTRA` text,
	CONSTRAINT `pelayanan_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `pelayanan_dokumen` (
	`pelayanan_id` bigint NOT NULL,
	`dokumen_id` smallint NOT NULL,
	CONSTRAINT `pelayanan_dokumen_pelayanan_id_dokumen_id_pk` PRIMARY KEY(`pelayanan_id`,`dokumen_id`)
);
--> statement-breakpoint
CREATE TABLE `pelayanan_lampiran_kolektif` (
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`NO_PELAYANAN` varchar(30) NOT NULL,
	`NOP` varchar(40),
	`NAMA` varchar(100),
	`ALAMAT` text,
	`LT` double,
	`LB` double,
	`KETERANGAN` text,
	CONSTRAINT `pelayanan_lampiran_kolektif_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `pemekaran` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`JENIS_PEMEKARAN` int,
	`KD_PROPINSI_LAMA` varchar(2),
	`KD_DATI2_LAMA` varchar(2),
	`KD_KECAMATAN_LAMA` varchar(3),
	`KD_KELURAHAN_LAMA` varchar(3),
	`KD_BLOK_AWAL` varchar(3),
	`NO_URUT_AWAL` varchar(4),
	`NO_URUT_AKHIR` varchar(4),
	`KD_BLOK_AKHIR` varchar(3),
	`KD_PROPINSI_BARU` varchar(2),
	`KD_DATI2_BARU` varchar(2),
	`KD_KECAMATAN_BARU` varchar(3),
	`KD_KELURAHAN_BARU` varchar(3),
	`KD_BLOK_BARU` varchar(3),
	`TGL_ENTRY` datetime,
	`USER_ENTRY` varchar(200),
	`IS_CANCEL` tinyint(1),
	CONSTRAINT `pemekaran_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `pemekaran_detail` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`PEMEKARAN_ID` int,
	`KD_PROPINSI_LAMA` varchar(2) NOT NULL,
	`KD_DATI2_LAMA` varchar(2) NOT NULL,
	`KD_KECAMATAN_LAMA` varchar(3) NOT NULL,
	`KD_KELURAHAN_LAMA` varchar(3) NOT NULL,
	`KD_BLOK_LAMA` varchar(3) NOT NULL,
	`NO_URUT_LAMA` varchar(4) NOT NULL,
	`KD_JNS_OP_LAMA` varchar(1) NOT NULL,
	`KD_PROPINSI_BARU` varchar(2) NOT NULL,
	`KD_DATI2_BARU` varchar(2) NOT NULL,
	`KD_KECAMATAN_BARU` varchar(3) NOT NULL,
	`KD_KELURAHAN_BARU` varchar(3) NOT NULL,
	`KD_BLOK_BARU` varchar(3) NOT NULL,
	`NO_URUT_BARU` varchar(4) NOT NULL,
	`KD_JNS_OP_BARU` varchar(1) NOT NULL,
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
	`ID` bigint AUTO_INCREMENT NOT NULL,
	`TGL_DELETE` datetime,
	`USER_DELETE` varchar(200),
	`NAMA_DELETE` varchar(200),
	`NAMA_PEMOHON` varchar(300),
	`ALAMAT_PEMOHON` varchar(500),
	`NO_PELAYANAN` varchar(13) NOT NULL,
	`TANGGAL_PELAYANAN` date,
	`KD_PROPINSI` varchar(2),
	`KD_DATI2` varchar(2),
	`KD_KECAMATAN` varchar(3),
	`KD_KELURAHAN` varchar(3),
	`KD_BLOK` varchar(3),
	`NO_URUT` varchar(4),
	`KD_JNS_OP` varchar(1),
	`KD_JNS_PELAYANAN` char(2),
	`TANGGAL_PERKIRAAN_SELESAI` date,
	`STATUS_PELAYANAN` smallint,
	`NIP_PETUGAS_PENERIMA` varchar(300),
	`NAMA_PETUGAS_PENERIMA` varchar(300),
	`NIP_AR` varchar(300),
	`NAMA_AR` varchar(300),
	`CATATAN` text,
	`KETERANGAN` text,
	`TGL_MASUK_PENILAI` datetime,
	`NIP_MASUK_PENILAI` varchar(300),
	`TGL_SELESAI` datetime,
	`NIP_SELESAI` varchar(300),
	`TGL_TERKONFIRMASI_WP` datetime,
	`NIP_TERKONFIRMASI_WP` varchar(300),
	`TTD_JABATAN_KIRI` varchar(500),
	`TTD_NAMA_KIRI` varchar(500),
	`TTD_NIP_KIRI` varchar(500),
	`TTD_JABATAN_KANAN` varchar(500),
	`TTD_NAMA_KANAN` varchar(500),
	`TTD_NIP_KANAN` varchar(500),
	CONSTRAINT `log_delete_pelayanan_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `bangunan_lantai` (
	`KD_JPB` char(2) NOT NULL,
	`TIPE_BNG` char(5) NOT NULL,
	`KD_BNG_LANTAI` char(8) NOT NULL,
	`LANTAI_MIN_BNG_LANTAI` smallint,
	`LANTAI_MAX_BNG_LANTAI` smallint,
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
	`LBR_BENT_MIN_DBKB_JPB3` smallint NOT NULL,
	`LBR_BENT_MAX_DBKB_JPB3` smallint NOT NULL,
	`TING_KOLOM_MIN_DBKB_JPB3` smallint NOT NULL,
	`TING_KOLOM_MAX_DBKB_JPB3` smallint NOT NULL,
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
	`LBR_BENT_MIN_DBKB_JPB8` smallint NOT NULL,
	`LBR_BENT_MAX_DBKB_JPB8` smallint NOT NULL,
	`TING_KOLOM_MIN_DBKB_JPB8` smallint NOT NULL,
	`TING_KOLOM_MAX_DBKB_JPB8` smallint NOT NULL,
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
	`STATUS_KAYU_ULIN` tinyint(1),
	CONSTRAINT `pk_kayu_ulin` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_STATUS_KAYU_ULIN`)
);
--> statement-breakpoint
CREATE TABLE `penyusutan` (
	`UMUR_EFEKTIF` tinyint NOT NULL,
	`KD_RANGE_PENYUSUTAN` char(1) NOT NULL,
	`KONDISI_BNG_SUSUT` char(1) NOT NULL,
	`NILAI_PENYUSUTAN` smallint,
	CONSTRAINT `pk_penyusutan` PRIMARY KEY(`UMUR_EFEKTIF`,`KD_RANGE_PENYUSUTAN`,`KONDISI_BNG_SUSUT`)
);
--> statement-breakpoint
CREATE TABLE `range_penyusutan` (
	`KD_RANGE_PENYUSUTAN` char(1) NOT NULL,
	`NILAI_MIN_PENYUSUTAN` bigint,
	`NILAI_MAX_PENYUSUTAN` bigint,
	CONSTRAINT `range_penyusutan_KD_RANGE_PENYUSUTAN` PRIMARY KEY(`KD_RANGE_PENYUSUTAN`)
);
--> statement-breakpoint
CREATE TABLE `tarif` (
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`THN_AWAL` char(4) NOT NULL,
	`THN_AKHIR` char(4) NOT NULL,
	`NJOP_MIN` decimal(15,0) NOT NULL,
	`NJOP_MAX` decimal(15,0),
	`NILAI_TARIF` decimal(3,3),
	`NJKP` int NOT NULL,
	CONSTRAINT `pk_tarif` PRIMARY KEY(`KD_PROPINSI`,`KD_DATI2`,`THN_AWAL`,`THN_AKHIR`,`NJOP_MIN`)
);
--> statement-breakpoint
CREATE TABLE `tipe_bangunan` (
	`TIPE_BNG` char(5) NOT NULL,
	`NM_TIPE_BNG` varchar(30),
	`LUAS_MIN_TIPE_BNG` mediumint,
	`LUAS_MAX_TIPE_BNG` mediumint,
	`FAKTOR_PEMBAGI_TIPE_BNG` decimal(8,4),
	CONSTRAINT `tipe_bangunan_TIPE_BNG` PRIMARY KEY(`TIPE_BNG`)
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
ALTER TABLE `org_roles` ADD CONSTRAINT `org_roles_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `org_roles` ADD CONSTRAINT `org_roles_created_by_user_id_fk` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_ownership` ADD CONSTRAINT `resource_ownership_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_organization_id_organization_id_fk` FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lookup_item` ADD CONSTRAINT `fk_lookup_item_group` FOREIGN KEY (`KD_LOOKUP_GROUP`) REFERENCES `lookup_group`(`KD_LOOKUP_GROUP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX `org_roles_org_idx` ON `org_roles` (`organization_id`);--> statement-breakpoint
CREATE INDEX `org_roles_created_by_idx` ON `org_roles` (`created_by`);--> statement-breakpoint
CREATE INDEX `resource_ownership_resource_idx` ON `resource_ownership` (`resource_type`,`resource_id`);--> statement-breakpoint
CREATE INDEX `resource_ownership_owner_idx` ON `resource_ownership` (`owner_id`);--> statement-breakpoint
CREATE INDEX `resource_ownership_org_idx` ON `resource_ownership` (`organization_id`);--> statement-breakpoint
CREATE INDEX `notifications_userId_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_createdAt_idx` ON `notifications` (`created_at`);--> statement-breakpoint
CREATE INDEX `notification_preferences_userId_idx` ON `notification_preferences` (`user_id`);--> statement-breakpoint
CREATE INDEX `books_organization_id_idx` ON `books` (`organization_id`);--> statement-breakpoint
CREATE INDEX `books_created_by_id_idx` ON `books` (`created_by_id`);--> statement-breakpoint
CREATE INDEX `idx_log_user` ON `log_aktivitas` (`USERNAME`);--> statement-breakpoint
CREATE INDEX `idx_log_tgl` ON `log_aktivitas` (`CREATED_AT`);