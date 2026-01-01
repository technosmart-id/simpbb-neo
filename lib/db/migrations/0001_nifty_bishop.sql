CREATE TABLE "dat_nilai_individu" (
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"no_bng" smallint NOT NULL,
	"no_formulir_individu" char(11) NOT NULL,
	"nilai_individu" bigint NOT NULL,
	"tgl_penilaian_individu" timestamp (0) NOT NULL,
	"nip_penilai_individu" char(18) NOT NULL,
	"tgl_pemeriksaan_individu" timestamp (0) NOT NULL,
	"nip_pemeriksa_individu" char(18) NOT NULL,
	"tgl_rekam_nilai_individu" timestamp (0) DEFAULT now() NOT NULL,
	"nip_perekam_individu" char(18) NOT NULL,
	CONSTRAINT "dat_nilai_individu_kd_propinsi_kd_dati2_kd_kecamatan_kd_kelurahan_kd_blok_no_urut_kd_jns_op_no_bng_pk" PRIMARY KEY("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng")
);
--> statement-breakpoint
CREATE TABLE "dat_subjek_pajak_njoptkp" (
	"subjek_pajak_id" char(30) PRIMARY KEY NOT NULL,
	"kd_propinsi" char(2) NOT NULL,
	"kd_dati2" char(2) NOT NULL,
	"kd_kecamatan" char(3) NOT NULL,
	"kd_kelurahan" char(3) NOT NULL,
	"kd_blok" char(3) NOT NULL,
	"no_urut" char(4) NOT NULL,
	"kd_jns_op" char(1) NOT NULL,
	"thn_njoptkp" char(4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pengurangan_pengenaan_jpb" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"thn_pengenaan_jpb" char(4) NOT NULL,
	"jns_sk" char(1) NOT NULL,
	"no_sk" char(30) NOT NULL,
	"pct_pengurangan_jpb" numeric(5, 2) NOT NULL,
	CONSTRAINT "pengurangan_pengenaan_jpb_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
CREATE TABLE "pengurangan_permanen" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"thn_peng_permanen_awal" char(4) NOT NULL,
	"thn_peng_permanen_akhir" char(4) DEFAULT '9999' NOT NULL,
	"jns_sk" char(1) NOT NULL,
	"no_sk" char(30) NOT NULL,
	"status_sk_peng_permanen" char(1) NOT NULL,
	"pct_pengurangan_permanen" numeric(5, 2) NOT NULL,
	CONSTRAINT "pengurangan_permanen_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
CREATE TABLE "pengurangan_pst" (
	"kd_kanwil" char(2) NOT NULL,
	"kd_kppbb" char(2) NOT NULL,
	"thn_pelayanan" char(4) NOT NULL,
	"bundel_pelayanan" char(4) NOT NULL,
	"no_urut_pelayanan" char(3) NOT NULL,
	"kd_propinsi_pemohon" char(2) NOT NULL,
	"kd_dati2_pemohon" char(2) NOT NULL,
	"kd_kecamatan_pemohon" char(3) NOT NULL,
	"kd_kelurahan_pemohon" char(3) NOT NULL,
	"kd_blok_pemohon" char(3) NOT NULL,
	"no_urut_pemohon" char(4) NOT NULL,
	"kd_jns_op_pemohon" char(1) NOT NULL,
	"thn_peng_pst" char(4) NOT NULL,
	"jns_sk" char(1) NOT NULL,
	"no_sk" char(30) NOT NULL,
	"status_sk_peng_pst" char(1) NOT NULL,
	"pct_pengurangan_pst" numeric(5, 2) NOT NULL,
	CONSTRAINT "pengurangan_pst_kd_kanwil_kd_kppbb_thn_pelayanan_bundel_pelayanan_no_urut_pelayanan_kd_propinsi_pemohon_kd_dati2_pemohon_kd_kecamatan_pemohon_kd_kelurahan_pemohon_kd_blok_pemohon_no_urut_pemohon_kd_jns_op_pemohon_pk" PRIMARY KEY("kd_kanwil","kd_kppbb","thn_pelayanan","bundel_pelayanan","no_urut_pelayanan","kd_propinsi_pemohon","kd_dati2_pemohon","kd_kecamatan_pemohon","kd_kelurahan_pemohon","kd_blok_pemohon","no_urut_pemohon","kd_jns_op_pemohon")
);
--> statement-breakpoint
ALTER TABLE "pst_detail" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "pst_lampiran" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "pst_permohonan" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
CREATE UNIQUE INDEX "dat_nilai_individu_formulir_idx" ON "dat_nilai_individu" USING btree ("no_formulir_individu","kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op","no_bng");--> statement-breakpoint
CREATE INDEX "dat_subjek_pajak_njoptkp_nop_idx" ON "dat_subjek_pajak_njoptkp" USING btree ("kd_propinsi","kd_dati2","kd_kecamatan","kd_kelurahan","kd_blok","no_urut","kd_jns_op");