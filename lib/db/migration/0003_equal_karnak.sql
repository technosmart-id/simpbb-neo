CREATE TABLE `material_bangunan` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`KATEGORI` char(2) NOT NULL,
	`KODE_MATERIAL` varchar(10) NOT NULL,
	`NAMA_MATERIAL` varchar(100) NOT NULL,
	`NILAI_AWAL` decimal(15,2) NOT NULL DEFAULT '0',
	`NILAI_BARU` decimal(15,2) NOT NULL DEFAULT '0',
	`THN_BERLAKU` char(4) NOT NULL,
	CONSTRAINT `material_bangunan_ID` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `ref_kategori_material_bangunan` (
	`KATEGORI` char(2) NOT NULL,
	`NAMA_KATEGORI` varchar(100) NOT NULL,
	`BOBOT` decimal(5,2) NOT NULL,
	CONSTRAINT `ref_kategori_material_bangunan_KATEGORI` PRIMARY KEY(`KATEGORI`)
);
--> statement-breakpoint
ALTER TABLE `dat_fasilitas_bangunan` MODIFY COLUMN `NO_BNG` int NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_mat_bng_kategori` ON `material_bangunan` (`KATEGORI`);--> statement-breakpoint
CREATE INDEX `idx_mat_bng_thn` ON `material_bangunan` (`THN_BERLAKU`);