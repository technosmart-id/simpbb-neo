CREATE TABLE `dat_penghapusan` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`JENIS_PENGHAPUSAN` tinyint NOT NULL,
	`ALASAN` text NOT NULL,
	`STATUS` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`USER_PENGAJU` varchar(30) NOT NULL,
	`TGL_PENGAJUAN` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`USER_APPROVER` varchar(30),
	`TGL_APPROVAL` datetime,
	`CATATAN_APPROVER` text,
	CONSTRAINT `dat_penghapusan_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `dat_penghapusan_sppt` (
	`ID_PENGHAPUSAN` int NOT NULL,
	`KD_PROPINSI` char(2) NOT NULL,
	`KD_DATI2` char(2) NOT NULL,
	`KD_KECAMATAN` char(3) NOT NULL,
	`KD_KELURAHAN` char(3) NOT NULL,
	`KD_BLOK` char(3) NOT NULL,
	`NO_URUT` char(4) NOT NULL,
	`KD_JNS_OP` char(1) NOT NULL,
	`THN_PAJAK_SPPT` char(4) NOT NULL,
	`NAMA_WP` varchar(100),
	`NJOP_BUMI_SPPT` int,
	`NJOP_BNG_SPPT` int,
	`PBB_YG_HARUS_DIBAYAR_SPPT` int,
	CONSTRAINT `pk_penghapusan_sppt` PRIMARY KEY(`ID_PENGHAPUSAN`,`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`,`THN_PAJAK_SPPT`)
);
--> statement-breakpoint
ALTER TABLE `dat_penghapusan` ADD CONSTRAINT `fk_penghapusan_spop` FOREIGN KEY (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) REFERENCES `spop`(`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dat_penghapusan_sppt` ADD CONSTRAINT `fk_penghapusan_sppt_header` FOREIGN KEY (`ID_PENGHAPUSAN`) REFERENCES `dat_penghapusan`(`ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_penghapusan_status` ON `dat_penghapusan` (`STATUS`);--> statement-breakpoint
CREATE INDEX `idx_penghapusan_nop` ON `dat_penghapusan` (`KD_PROPINSI`,`KD_DATI2`,`KD_KECAMATAN`,`KD_KELURAHAN`,`KD_BLOK`,`NO_URUT`,`KD_JNS_OP`);