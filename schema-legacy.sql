-- ============================================================
-- SIM-PBB — Sistem Informasi Manajemen Pajak Bumi dan Bangunan
-- Database Schema (MySQL 8.0+)
-- Generated: 2026-03-20
-- Source: Legacy SIM-PBB v3.9.10.41 (VB.NET / Windows Forms)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO';

CREATE DATABASE IF NOT EXISTS simpbb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE simpbb;

-- ============================================================
-- SECTION 1: REFERENSI WILAYAH
-- ============================================================

CREATE TABLE ref_propinsi (
    KD_PROPINSI     CHAR(2)         NOT NULL,
    NM_PROPINSI     VARCHAR(30)     NOT NULL,
    PRIMARY KEY (KD_PROPINSI)
) ENGINE=InnoDB COMMENT='Referensi provinsi';

CREATE TABLE ref_dati2 (
    KD_PROPINSI     CHAR(2)         NOT NULL,
    KD_DATI2        CHAR(2)         NOT NULL,
    NM_DATI2        VARCHAR(30)     NOT NULL,
    PRIMARY KEY (KD_PROPINSI, KD_DATI2),
    CONSTRAINT fk_dati2_propinsi FOREIGN KEY (KD_PROPINSI)
        REFERENCES ref_propinsi (KD_PROPINSI)
) ENGINE=InnoDB COMMENT='Referensi kabupaten/kota';

CREATE TABLE ref_kecamatan (
    KD_PROPINSI         CHAR(2)         NOT NULL,
    KD_DATI2            CHAR(2)         NOT NULL,
    KD_KECAMATAN        CHAR(3)         NOT NULL,
    NM_KECAMATAN        VARCHAR(30)     NULL,
    NM_KECAMATAN_ONLY   VARCHAR(30)     NOT NULL,
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN),
    CONSTRAINT fk_kecamatan_dati2 FOREIGN KEY (KD_PROPINSI, KD_DATI2)
        REFERENCES ref_dati2 (KD_PROPINSI, KD_DATI2)
) ENGINE=InnoDB COMMENT='Referensi kecamatan';

CREATE TABLE ref_kelurahan (
    KD_PROPINSI         CHAR(2)         NOT NULL,
    KD_DATI2            CHAR(2)         NOT NULL,
    KD_KECAMATAN        CHAR(3)         NOT NULL,
    KD_KELURAHAN        CHAR(3)         NOT NULL,
    KD_SEKTOR           CHAR(2)         NOT NULL DEFAULT '00',
    NM_KELURAHAN        VARCHAR(30)     NULL,
    NM_KELURAHAN_ONLY   VARCHAR(30)     NOT NULL,
    NO_KELURAHAN        SMALLINT        NULL,
    KD_POS_KELURAHAN    VARCHAR(5)      NULL,
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_SEKTOR),
    CONSTRAINT fk_kelurahan_kecamatan FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN)
        REFERENCES ref_kecamatan (KD_PROPINSI, KD_DATI2, KD_KECAMATAN)
) ENGINE=InnoDB COMMENT='Referensi kelurahan/desa';

CREATE TABLE jalan (
    ID              INT             NOT NULL AUTO_INCREMENT,
    KD_PROPINSI     CHAR(2)         NOT NULL,
    KD_DATI2        CHAR(2)         NOT NULL,
    KD_KECAMATAN    CHAR(3)         NOT NULL,
    KD_KELURAHAN    CHAR(3)         NOT NULL,
    NM_JALAN        VARCHAR(100)    NOT NULL,
    PRIMARY KEY (ID),
    KEY idx_jalan_wilayah (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN)
) ENGINE=InnoDB COMMENT='Referensi nama jalan';

-- ============================================================
-- SECTION 2: REFERENSI UMUM
-- ============================================================

CREATE TABLE ref_kategori (
    KATEGORI    VARCHAR(100)    NOT NULL COMMENT 'Nama kategori, contoh: SPOP JENIS TANAH',
    KODE        CHAR(2)         NOT NULL COMMENT 'Kode nilai',
    NAMA        VARCHAR(100)    NOT NULL COMMENT 'Label/deskripsi nilai',
    PRIMARY KEY (KATEGORI, KODE)
) ENGINE=InnoDB COMMENT='Referensi umum multi-kategori (dropdown values)';

-- Kategori yang digunakan:
-- SPOP JENIS TANAH         : jenis penggunaan tanah
-- SPOP STATUS              : status wajib pajak
-- SPOP PEKERJAAN           : pekerjaan wajib pajak
-- SPOP JENIS TRANSAKSI     : jenis transaksi OP (1=Perekaman, 2=Pemutakhiran, 3=Penghapusan)
-- LSPOP JENIS PENGGUNAAN BANGUNAN : kode JPB 01-16
-- LSPOP JENIS ATAP
-- LSPOP DINDING
-- LSPOP LANTAI
-- LSPOP LANGIT-LANGIT
-- LSPOP KONDISI BANGUNAN
-- LSPOP KONSTRUKSI
-- JPB2 JPB9 KELAS
-- JPB4 KELAS
-- JPB5 KELAS
-- JPB6 KELAS

CREATE TABLE ref_jns_pelayanan (
    KD_JNS_PELAYANAN    CHAR(2)         NOT NULL,
    NM_JENIS_PELAYANAN  VARCHAR(100)    NOT NULL,
    PRIMARY KEY (KD_JNS_PELAYANAN)
) ENGINE=InnoDB COMMENT='Referensi jenis pelayanan (01-15)';

-- Data awal:
INSERT INTO ref_jns_pelayanan VALUES
('01', 'Pendaftaran Data Baru'),
('02', 'Mutasi Objek/Subjek'),
('03', 'Pembetulan SPPT/SKP/STP'),
('04', 'Pembatalan SPPT/SKP'),
('05', 'Salinan SPPT/SKP'),
('06', 'Keberatan Penunjukan Wajib Pajak'),
('07', 'Keberatan Atas Pajak Terhutang'),
('08', 'Pengurangan Atas Besarnya Pajak Terhutang'),
('09', 'Restitusi dan Kompensasi'),
('10', 'Pengurangan Denda Administrasi'),
('11', 'Penentuan Kembali Tanggal Jatuh Tempo'),
('12', 'Penundaan Tanggal Jatuh Tempo SPOP'),
('13', 'Pemberian Informasi PBB'),
('14', 'Pembetulan SK Keberatan'),
('15', 'Mutasi Pemecahan');

-- ============================================================
-- SECTION 3: PENGGUNA & AKSES
-- ============================================================

CREATE TABLE akses (
    AKSES   VARCHAR(50)     NOT NULL COMMENT 'Nama fitur/modul yang diatur aksesnya',
    AKTIF   TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (AKSES)
) ENGINE=InnoDB COMMENT='Daftar fitur yang dapat dikontrol aksesnya';

CREATE TABLE login (
    ID                      INT             NOT NULL AUTO_INCREMENT,
    USERNAME                VARCHAR(20)     NOT NULL,
    PASSWORD                VARCHAR(255)    NOT NULL COMMENT 'Bcrypt/Argon2 hash',
    HAK_AKSES               VARCHAR(20)     NOT NULL,
    NIP                     VARCHAR(30)     NULL,
    NAMA                    VARCHAR(200)    NULL,
    JABATAN                 VARCHAR(200)    NULL,
    PENANGGUNG_JAWAB_CETAK  TINYINT(1)      NOT NULL DEFAULT 0,
    TANDA_TANGAN            LONGBLOB        NULL COMMENT 'Gambar tanda tangan (binary)',
    STATUS_AKTIF            TINYINT(1)      NOT NULL DEFAULT 1,
    LAST_LOGIN              DATETIME        NULL,
    FAILED_ATTEMPTS         TINYINT         NOT NULL DEFAULT 0,
    LOCKED_UNTIL            DATETIME        NULL,
    CREATED_AT              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID),
    UNIQUE KEY uk_username (USERNAME)
) ENGINE=InnoDB COMMENT='Akun pengguna sistem';

CREATE TABLE group_akses (
    HAK_AKSES   VARCHAR(20)     NOT NULL COMMENT 'Nama grup/role',
    AKSES       VARCHAR(50)     NOT NULL COMMENT 'Fitur yang DINONAKTIFKAN untuk grup ini',
    PRIMARY KEY (HAK_AKSES, AKSES),
    CONSTRAINT fk_group_akses_akses FOREIGN KEY (AKSES)
        REFERENCES akses (AKSES)
) ENGINE=InnoDB COMMENT='Pemetaan grup → fitur yang dinonaktifkan';

-- ============================================================
-- SECTION 4: KONFIGURASI SISTEM
-- ============================================================

CREATE TABLE konfigurasi (
    NAMA    VARCHAR(100)    NOT NULL COMMENT 'Nama parameter konfigurasi',
    NILAI   LONGBLOB        NULL     COMMENT 'Nilai parameter (bisa teks atau binary)',
    PRIMARY KEY (NAMA)
) ENGINE=InnoDB COMMENT='Konfigurasi sistem (key-value store)';

-- Parameter konfigurasi yang digunakan:
-- NAMA_DINAS, NAMA_KOTA, LOGO_INSTANSI
-- NAMA_KEPALA_DINAS, NIP_KEPALA_DINAS, JABATAN_KEPALA_DINAS
-- TARIF_NORMAL, TARIF_BERSYARAT_MIN, TARIF_BERSYARAT_MAX, TARIF_BERSYARAT_AMBANG
-- NJOPTKP, PBB_MINIMUM
-- TGL_JATUH_TEMPO
-- NJOPTKP_HANYA_UNTUK_BANGUNAN (boolean)
-- BERKAS_KIRI_SESUAI_LOGIN, BERKAS_KIRI_NIP, BERKAS_KIRI_NAMA, BERKAS_KIRI_JABATAN
-- BERKAS_KANAN_SESUAI_LOGIN, BERKAS_KANAN_NIP, BERKAS_KANAN_NAMA, BERKAS_KANAN_JABATAN
-- AR_SESUAI_LOGIN, NIP_ACCOUNT_REPRESENTATIVE, NAMA_ACCOUNT_REPRESENTATIVE
-- BERITA_KIRI_JABATAN, BERITA_KIRI_NIP, BERITA_KIRI_NAMA
-- BERITA_KANAN_JABATAN, BERITA_KANAN_NIP, BERITA_KANAN_NAMA
-- SK_NJOP_TTD_KIRI (tanda tangan digital)

-- ============================================================
-- SECTION 5: KLASIFIKASI NILAI
-- ============================================================

CREATE TABLE kelas_bumi (
    KELAS_BUMI      VARCHAR(5)      NOT NULL COMMENT 'Kode kelas (A, B, C1, C2, dst.)',
    NILAI_MINIMUM   DECIMAL(15,2)   NOT NULL COMMENT 'Nilai minimum NJOP per m² (Rp)',
    NILAI_MAKSIMUM  DECIMAL(15,2)   NOT NULL COMMENT 'Nilai maksimum NJOP per m² (Rp)',
    NJOP_BUMI       DECIMAL(15,2)   NOT NULL COMMENT 'NJOP yang digunakan per m² (dalam ribuan Rp)',
    PRIMARY KEY (KELAS_BUMI)
) ENGINE=InnoDB COMMENT='Klasifikasi kelas tanah dan nilai NJOP-nya';

CREATE TABLE kelas_bangunan (
    KELAS_BANGUNAN  VARCHAR(5)      NOT NULL COMMENT 'Kode kelas bangunan',
    NILAI_MINIMUM   DECIMAL(15,2)   NOT NULL COMMENT 'Nilai minimum NJOP per m² (Rp)',
    NILAI_MAKSIMUM  DECIMAL(15,2)   NOT NULL COMMENT 'Nilai maksimum NJOP per m² (Rp)',
    NJOP_BANGUNAN   DECIMAL(15,2)   NOT NULL COMMENT 'NJOP yang digunakan per m² (dalam ribuan Rp)',
    PRIMARY KEY (KELAS_BANGUNAN)
) ENGINE=InnoDB COMMENT='Klasifikasi kelas bangunan dan nilai NJOP-nya';

CREATE TABLE tarif (
    ID          INT             NOT NULL AUTO_INCREMENT,
    THN_AWAL    YEAR            NOT NULL COMMENT 'Tahun mulai berlaku',
    THN_AKHIR   YEAR            NULL     COMMENT 'Tahun berakhir (NULL = masih berlaku)',
    NJOP_MIN    DECIMAL(15,2)   NOT NULL COMMENT 'Batas bawah NJOP',
    NJOP_MAX    DECIMAL(15,2)   NOT NULL COMMENT 'Batas atas NJOP (0 = tidak terbatas)',
    NILAI_TARIF DECIMAL(8,4)    NOT NULL COMMENT 'Tarif dalam persen, contoh: 0.2000 = 0.2%',
    PRIMARY KEY (ID)
) ENGINE=InnoDB COMMENT='Tabel tarif PBB berdasarkan rentang NJOP dan periode';

CREATE TABLE jenis_sppt (
    ID          INT             NOT NULL AUTO_INCREMENT,
    KODE        VARCHAR(10)     NOT NULL,
    NAMA        VARCHAR(100)    NOT NULL,
    TARIF_KHUSUS DECIMAL(8,4)   NULL COMMENT 'Tarif tetap jika ada (misal: 0.5% untuk jenis khusus)',
    AKTIF       TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (ID),
    UNIQUE KEY uk_jenis_sppt_kode (KODE)
) ENGINE=InnoDB COMMENT='Jenis-jenis SPPT yang ada';

-- ============================================================
-- SECTION 6: FASILITAS BANGUNAN
-- ============================================================

CREATE TABLE fasilitas (
    KD_FASILITAS    CHAR(2)         NOT NULL,
    NM_FASILITAS    VARCHAR(63)     NOT NULL,
    SATUAN_FASILITAS VARCHAR(10)    NOT NULL COMMENT 'Satuan: unit, buah, m², kVA, dst.',
    NILAI_FASILITAS DECIMAL(15,2)   NOT NULL DEFAULT 0 COMMENT 'Nilai kontribusi per satuan',
    STATUS_FASILITAS CHAR(1)        NOT NULL DEFAULT '1' COMMENT '1=Aktif, 0=Nonaktif',
    KETERGANTUNGAN  CHAR(1)         NOT NULL DEFAULT '0' COMMENT 'Flag ketergantungan antar fasilitas',
    PRIMARY KEY (KD_FASILITAS)
) ENGINE=InnoDB COMMENT='Master data fasilitas bangunan untuk DBKB';

-- ============================================================
-- SECTION 7: SUBJEK PAJAK (WAJIB PAJAK)
-- ============================================================

CREATE TABLE dat_subjek_pajak (
    SUBJEK_PAJAK_ID     VARCHAR(30)     NOT NULL,
    NM_WP               VARCHAR(30)     NOT NULL   COMMENT 'Nama wajib pajak',
    JALAN_WP            VARCHAR(100)    NOT NULL   COMMENT 'Alamat jalan WP',
    BLOK_KAV_NO_WP      VARCHAR(15)     NULL,
    RW_WP               VARCHAR(2)      NULL,
    RT_WP               VARCHAR(3)      NULL,
    KELURAHAN_WP        VARCHAR(30)     NULL,
    KOTA_WP             VARCHAR(30)     NULL,
    KD_POS_WP           VARCHAR(5)      NULL,
    TELP_WP             VARCHAR(20)     NULL,
    NPWP                VARCHAR(16)     NULL,
    EMAIL_WP            VARCHAR(100)    NULL,
    STATUS_PEKERJAAN_WP CHAR(1)         NOT NULL   COMMENT 'Kode pekerjaan dari ref_kategori',
    PRIMARY KEY (SUBJEK_PAJAK_ID)
) ENGINE=InnoDB COMMENT='Data wajib pajak (subjek pajak)';

-- ============================================================
-- SECTION 8: SPOP (SURAT PEMBERITAHUAN OBJEK PAJAK)
-- ============================================================

CREATE TABLE spop (
    -- Kunci Primer: NOP 18 digit
    KD_PROPINSI         CHAR(2)         NOT NULL,
    KD_DATI2            CHAR(2)         NOT NULL,
    KD_KECAMATAN        CHAR(3)         NOT NULL,
    KD_KELURAHAN        CHAR(3)         NOT NULL,
    KD_BLOK             CHAR(3)         NOT NULL,
    NO_URUT             CHAR(4)         NOT NULL,
    KD_JNS_OP           CHAR(1)         NOT NULL,

    -- Subjek Pajak
    SUBJEK_PAJAK_ID     VARCHAR(30)     NOT NULL,

    -- Data Formulir
    NO_FORMULIR_SPOP    VARCHAR(50)     NULL,
    JNS_TRANSAKSI_OP    CHAR(1)         NOT NULL   COMMENT '1=Perekaman, 2=Pemutakhiran, 3=Penghapusan',

    -- Referensi OP Bersama (untuk strata title / kepemilikan bersama)
    KD_PROPINSI_BERSAMA CHAR(2)         NULL,
    KD_DATI2_BERSAMA    CHAR(2)         NULL,
    KD_KECAMATAN_BERSAMA CHAR(3)        NULL,
    KD_KELURAHAN_BERSAMA CHAR(3)        NULL,
    KD_BLOK_BERSAMA     CHAR(3)         NULL,
    NO_URUT_BERSAMA     CHAR(4)         NULL,
    KD_JNS_OP_BERSAMA   CHAR(1)         NULL,

    -- Referensi OP Asal (untuk pemecahan)
    KD_PROPINSI_ASAL    CHAR(2)         NULL,
    KD_DATI2_ASAL       CHAR(2)         NULL,
    KD_KECAMATAN_ASAL   CHAR(3)         NULL,
    KD_KELURAHAN_ASAL   CHAR(3)         NULL,
    KD_BLOK_ASAL        CHAR(3)         NULL,
    NO_URUT_ASAL        CHAR(4)         NULL,
    KD_JNS_OP_ASAL      CHAR(1)         NULL,

    NO_SPPT_LAMA        CHAR(4)         NULL   COMMENT 'Nomor SPPT lama sebelum migrasi',

    -- Alamat Lokasi Objek Pajak
    JALAN_OP            VARCHAR(100)    NOT NULL,
    BLOK_KAV_NO_OP      VARCHAR(15)     NULL,
    RT_OP               VARCHAR(3)      NULL,
    RW_OP               VARCHAR(2)      NULL,
    KELURAHAN_OP        VARCHAR(30)     NULL,

    -- Status & Data Tanah
    KD_STATUS_WP        CHAR(1)         NOT NULL   COMMENT 'Kode status WP dari ref_kategori',
    LUAS_BUMI           BIGINT          NOT NULL   COMMENT 'Luas tanah dalam m²',
    KD_ZNT              CHAR(2)         NULL       COMMENT 'Kode Zona Nilai Tanah',
    JNS_BUMI            CHAR(1)         NOT NULL   COMMENT 'Jenis tanah dari ref_kategori',
    NILAI_SISTEM_BUMI   BIGINT          NOT NULL   COMMENT 'Nilai total tanah dalam Rp',

    -- Petugas Pendataan
    TGL_PENDATAAN_OP    DATETIME        NOT NULL,
    NM_PENDATAAN_OP     VARCHAR(100)    NULL,
    NIP_PENDATA         VARCHAR(40)     NULL,

    -- Petugas Pemeriksaan
    TGL_PEMERIKSAAN_OP  DATETIME        NOT NULL,
    NM_PEMERIKSAAN_OP   VARCHAR(100)    NULL,
    NIP_PEMERIKSA_OP    VARCHAR(40)     NULL,

    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP),
    CONSTRAINT fk_spop_subjek FOREIGN KEY (SUBJEK_PAJAK_ID)
        REFERENCES dat_subjek_pajak (SUBJEK_PAJAK_ID)
) ENGINE=InnoDB COMMENT='Surat Pemberitahuan Objek Pajak — data induk objek pajak';

-- ============================================================
-- SECTION 9: LSPOP / DAT_OP_BANGUNAN
-- (Lampiran SPOP — data bangunan per objek pajak)
-- ============================================================

CREATE TABLE dat_op_bangunan (
    -- Kunci Primer: NOP + Nomor Bangunan
    KD_PROPINSI             CHAR(2)         NOT NULL,
    KD_DATI2                CHAR(2)         NOT NULL,
    KD_KECAMATAN            CHAR(3)         NOT NULL,
    KD_KELURAHAN            CHAR(3)         NOT NULL,
    KD_BLOK                 CHAR(3)         NOT NULL,
    NO_URUT                 CHAR(4)         NOT NULL,
    KD_JNS_OP               CHAR(1)         NOT NULL,
    NO_BNG                  INT             NOT NULL   COMMENT 'Nomor urut bangunan dalam NOP',

    -- Data Formulir
    NO_FORMULIR_LSPOP       VARCHAR(11)     NULL,
    JNS_TRANSAKSI_BNG       CHAR(1)         NULL,

    -- Jenis Penggunaan Bangunan
    KD_JPB                  CHAR(2)         NULL   COMMENT 'Kode Jenis Penggunaan Bangunan (01-16)',

    -- Dimensi & Fisik
    LUAS_BNG                BIGINT          NOT NULL   DEFAULT 0   COMMENT 'Luas bangunan dalam m²',
    JML_LANTAI_BNG          INT             NOT NULL   DEFAULT 1   COMMENT 'Jumlah lantai',
    THN_DIBANGUN_BNG        CHAR(4)         NULL,
    THN_RENOVASI_BNG        CHAR(4)         NULL,
    KONDISI_BNG             CHAR(1)         NULL   COMMENT 'Kode kondisi dari ref_kategori',
    JNS_KONSTRUKSI_BNG      CHAR(1)         NULL   COMMENT 'Jenis konstruksi',

    -- Komponen Material
    JNS_ATAP_BNG            CHAR(1)         NULL,
    KD_DINDING              CHAR(1)         NULL,
    KD_LANTAI               CHAR(1)         NULL,
    KD_LANGIT_LANGIT        CHAR(1)         NULL,

    -- Parameter Khusus JPB 03 (Industri/Gudang)
    TING_KOLOM_JPB3         BIGINT          NULL   COMMENT 'Tinggi kolom dalam cm',
    LBR_BENT_JPB3           BIGINT          NULL   COMMENT 'Lebar bentang dalam cm',
    DAYA_DUKUNG_LANTAI_JPB3 BIGINT          NULL   COMMENT 'Daya dukung lantai kg/m²',
    KELILING_DINDING_JPB3   BIGINT          NULL   COMMENT 'Keliling dinding dalam m',
    LUAS_MEZZANINE_JPB3     BIGINT          NULL   COMMENT 'Luas mezzanine dalam m²',

    -- Parameter Khusus JPB 02, 09 (Komersial/Kantor)
    KLS_JPB2                BIGINT          NULL   COMMENT 'Kelas untuk toko/ruko/kantor',

    -- Parameter Khusus JPB 04 (Apartemen)
    KLS_JPB4                BIGINT          NULL,

    -- Parameter Khusus JPB 05 (Hotel)
    KLS_JPB5                BIGINT          NULL,

    -- Parameter Khusus JPB 06 (Parkir)
    KLS_JPB6                BIGINT          NULL,

    -- Parameter Khusus JPB 07 (Hotel Berbintang)
    JNS_JPB7                CHAR(1)         NULL,
    BINTANG_JPB7            TINYINT         NULL   COMMENT 'Jumlah bintang hotel',
    JML_KMR_JPB7            INT             NULL   COMMENT 'Jumlah kamar',
    LUAS_KMR_JPB7_DGN_AC_SENT      DECIMAL(12,2) NULL COMMENT 'Luas kamar ber-AC sentral m²',
    LUAS_KMR_LAIN_JPB7_DGN_AC_SENT DECIMAL(12,2) NULL COMMENT 'Luas kamar lain ber-AC m²',

    -- Parameter Khusus JPB 13 & 16 (Olahraga)
    KLS_JPB13               BIGINT          NULL,
    KLS_JPB16               BIGINT          NULL,

    -- Nilai Bangunan
    NILAI_SISTEM_BNG        BIGINT          NOT NULL   DEFAULT 0   COMMENT 'Hasil kalkulasi formula DBKB (cav_sismiop)',
    NILAI_FORMULA           BIGINT          NULL   COMMENT 'Nilai antara sebelum dibulatkan',
    NILAI_INDIVIDU          BIGINT          NOT NULL   DEFAULT 0   COMMENT 'Override nilai manual (0 = gunakan sistem)',

    -- Petugas Pendataan
    TGL_PENDATAAN_BNG       DATETIME        NULL,
    NM_PENDATAAN_OP         VARCHAR(200)    NULL,
    NIP_PENDATA_BNG         VARCHAR(30)     NULL,

    -- Petugas Pemeriksaan
    TGL_PEMERIKSAAN_BNG     DATETIME        NULL,
    NM_PEMERIKSAAN_OP_BNG   VARCHAR(200)    NULL,
    NIP_PEMERIKSA_BNG       VARCHAR(30)     NULL,

    TGL_KUNJUNGAN_KEMBALI   DATETIME        NULL,
    AKTIF                   TINYINT(1)      NOT NULL   DEFAULT 1   COMMENT '1=Aktif, 0=Nonaktif (soft delete)',

    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, NO_BNG),
    CONSTRAINT fk_bangunan_spop FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
        REFERENCES spop (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
) ENGINE=InnoDB COMMENT='Lampiran SPOP — detail bangunan per objek pajak';

CREATE TABLE dat_fasilitas_bangunan (
    KD_PROPINSI     CHAR(2)         NOT NULL,
    KD_DATI2        CHAR(2)         NOT NULL,
    KD_KECAMATAN    CHAR(3)         NOT NULL,
    KD_KELURAHAN    CHAR(3)         NOT NULL,
    KD_BLOK         CHAR(3)         NOT NULL,
    NO_URUT         CHAR(4)         NOT NULL,
    KD_JNS_OP       CHAR(1)         NOT NULL,
    NO_BNG          SMALLINT        NOT NULL,
    KD_FASILITAS    CHAR(2)         NOT NULL,
    JML_SATUAN      BIGINT          NOT NULL   DEFAULT 0   COMMENT 'Kuantitas fasilitas',
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, NO_BNG, KD_FASILITAS),
    CONSTRAINT fk_fas_bangunan FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, NO_BNG)
        REFERENCES dat_op_bangunan (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, NO_BNG),
    CONSTRAINT fk_fas_master FOREIGN KEY (KD_FASILITAS)
        REFERENCES fasilitas (KD_FASILITAS)
) ENGINE=InnoDB COMMENT='Fasilitas per bangunan';

-- ============================================================
-- SECTION 10: OP BERSAMA (Strata Title / Kepemilikan Bersama)
-- ============================================================

CREATE TABLE dat_op_induk (
    KD_PROPINSI     CHAR(2)         NOT NULL COMMENT 'NOP properti induk',
    KD_DATI2        CHAR(2)         NOT NULL,
    KD_KECAMATAN    CHAR(3)         NOT NULL,
    KD_KELURAHAN    CHAR(3)         NOT NULL,
    KD_BLOK         CHAR(3)         NOT NULL,
    NO_URUT         CHAR(4)         NOT NULL,
    KD_JNS_OP       CHAR(1)         NOT NULL,
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP),
    CONSTRAINT fk_op_induk_spop FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
        REFERENCES spop (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
) ENGINE=InnoDB COMMENT='Penanda bahwa NOP ini adalah induk (strata title)';

CREATE TABLE dat_op_anggota (
    -- NOP anggota (member/unit)
    KD_PROPINSI             CHAR(2)         NOT NULL,
    KD_DATI2                CHAR(2)         NOT NULL,
    KD_KECAMATAN            CHAR(3)         NOT NULL,
    KD_KELURAHAN            CHAR(3)         NOT NULL,
    KD_BLOK                 CHAR(3)         NOT NULL,
    NO_URUT                 CHAR(4)         NOT NULL,
    KD_JNS_OP               CHAR(1)         NOT NULL,

    -- NOP induk (parent)
    KD_PROPINSI_INDUK       CHAR(2)         NOT NULL,
    KD_DATI2_INDUK          CHAR(2)         NOT NULL,
    KD_KECAMATAN_INDUK      CHAR(3)         NOT NULL,
    KD_KELURAHAN_INDUK      CHAR(3)         NOT NULL,
    KD_BLOK_INDUK           CHAR(3)         NOT NULL,
    NO_URUT_INDUK           CHAR(4)         NOT NULL,
    KD_JNS_OP_INDUK         CHAR(1)         NOT NULL,

    -- Porsi beban yang ditanggung anggota
    LUAS_BUMI_BEBAN         BIGINT          NULL   COMMENT 'Porsi luas tanah yang menjadi beban (m²)',
    LUAS_BNG_BEBAN          BIGINT          NULL   COMMENT 'Porsi luas bangunan yang menjadi beban (m²)',
    NILAI_SISTEM_BUMI_BEBAN BIGINT          NULL,
    NILAI_SISTEM_BNG_BEBAN  BIGINT          NULL,
    NJOP_BUMI_BEBAN         BIGINT          NULL,
    NJOP_BNG_BEBAN          BIGINT          NULL,

    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP),
    CONSTRAINT fk_anggota_spop FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
        REFERENCES spop (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
) ENGINE=InnoDB COMMENT='Relasi anggota ke induk pada kepemilikan bersama';

CREATE TABLE dat_legalitas_bumi (
    KD_PROPINSI         CHAR(2)         NOT NULL,
    KD_DATI2            CHAR(2)         NOT NULL,
    KD_KECAMATAN        CHAR(3)         NOT NULL,
    KD_KELURAHAN        CHAR(3)         NOT NULL,
    KD_BLOK             CHAR(3)         NOT NULL,
    NO_URUT             CHAR(4)         NOT NULL,
    KD_JNS_OP           CHAR(1)         NOT NULL,
    NO_LEGALITAS_TANAH  VARCHAR(100)    NULL   COMMENT 'Nomor sertifikat/dokumen kepemilikan tanah',
    JNS_LEGALITAS       VARCHAR(50)     NULL   COMMENT 'Jenis dokumen (SHM, SHGB, Girik, dll.)',
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP),
    CONSTRAINT fk_legalitas_spop FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
        REFERENCES spop (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
) ENGINE=InnoDB COMMENT='Data legalitas/sertifikat tanah per objek pajak';

-- ============================================================
-- SECTION 11: SPPT (SURAT PEMBERITAHUAN PAJAK TERUTANG)
-- ============================================================

CREATE TABLE sppt (
    -- Kunci Primer: NOP + Tahun Pajak
    KD_PROPINSI             CHAR(2)         NOT NULL,
    KD_DATI2                CHAR(2)         NOT NULL,
    KD_KECAMATAN            CHAR(3)         NOT NULL,
    KD_KELURAHAN            CHAR(3)         NOT NULL,
    KD_BLOK                 CHAR(3)         NOT NULL,
    NO_URUT                 CHAR(4)         NOT NULL,
    KD_JNS_OP               CHAR(1)         NOT NULL,
    THN_PAJAK_SPPT          YEAR            NOT NULL,

    -- Metadata SPPT
    SIKLUS_SPPT             TINYINT         NOT NULL   DEFAULT 1   COMMENT 'Versi ketetapan, bertambah saat recalculate',
    KD_JNS_SPPT             INT             NULL COMMENT 'FK ke jenis_sppt',

    -- Kelas yang digunakan
    KD_KLS_TANAH            VARCHAR(5)      NULL,
    KD_KLS_BNG              VARCHAR(5)      NULL,

    -- Tanggal
    TGL_JATUH_TEMPO         DATE            NULL,
    TGL_TERBIT              DATE            NULL,
    TGL_CETAK               DATE            NULL,

    -- Data Fisik (snapshot saat penetapan)
    LUAS_BUMI               DECIMAL(12,2)   NOT NULL   DEFAULT 0,
    LUAS_BNG                DECIMAL(12,2)   NOT NULL   DEFAULT 0,

    -- Nilai NJOP
    NJOP_BUMI               DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'NJOP tanah = kelas × luas',
    NJOP_BNG                DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'NJOP bangunan = Σ kelas × luas semua bangunan aktif',
    NJOP_SPPT               DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'Total NJOP = NJOP_BUMI + NJOP_BNG',

    -- Kalkulasi Pajak
    NJOPTKP_SPPT            DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'Nilai Tidak Kena Pajak',
    NJKP_SPPT               DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'NJOP - NJOPTKP (min 0)',
    PBB_TERHUTANG_SPPT      DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'tarif × NJKP',
    FAKTOR_PENGURANG_SPPT   DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'Nilai pengurangan yang diberikan',
    PBB_YG_HARUS_DIBAYAR_SPPT DECIMAL(15,2) NOT NULL  DEFAULT 0   COMMENT 'PBB_TERHUTANG - FAKTOR_PENGURANG (min PBB_MINIMUM)',

    -- Status
    STATUS_PEMBAYARAN_SPPT  CHAR(1)         NOT NULL   DEFAULT '0' COMMENT '0=Belum Bayar, 1=Lunas, 2=Bayar Sebagian',
    STATUS_TAGIHAN_SPPT     CHAR(1)         NOT NULL   DEFAULT '0',
    STATUS_CETAK_SPPT       CHAR(1)         NOT NULL   DEFAULT '0' COMMENT '0=Belum Cetak, 1=Sudah Cetak',
    STATUS_PEMBATALAN       CHAR(1)         NOT NULL   DEFAULT '0' COMMENT '0=Aktif, 1=Dibatalkan',

    -- Data WP (snapshot saat penetapan)
    NM_WP                   VARCHAR(30)     NULL,
    JALAN_WP                VARCHAR(100)    NULL,

    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, THN_PAJAK_SPPT),
    KEY idx_sppt_status_bayar (STATUS_PEMBAYARAN_SPPT),
    KEY idx_sppt_thn (THN_PAJAK_SPPT),
    CONSTRAINT fk_sppt_spop FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
        REFERENCES spop (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
) ENGINE=InnoDB COMMENT='Surat Pemberitahuan Pajak Terutang — ketetapan tahunan';

CREATE TABLE histori_sppt (
    ID                      INT             NOT NULL AUTO_INCREMENT,
    KD_PROPINSI             CHAR(2)         NOT NULL,
    KD_DATI2                CHAR(2)         NOT NULL,
    KD_KECAMATAN            CHAR(3)         NOT NULL,
    KD_KELURAHAN            CHAR(3)         NOT NULL,
    KD_BLOK                 CHAR(3)         NOT NULL,
    NO_URUT                 CHAR(4)         NOT NULL,
    KD_JNS_OP               CHAR(1)         NOT NULL,
    THN_PAJAK_SPPT          YEAR            NOT NULL,
    SIKLUS_SPPT             TINYINT         NOT NULL,
    -- Snapshot nilai SPPT pada siklus ini
    NJOP_BUMI               DECIMAL(15,2)   NULL,
    NJOP_BNG                DECIMAL(15,2)   NULL,
    NJOP_SPPT               DECIMAL(15,2)   NULL,
    NJOPTKP_SPPT            DECIMAL(15,2)   NULL,
    NJKP_SPPT               DECIMAL(15,2)   NULL,
    PBB_TERHUTANG_SPPT      DECIMAL(15,2)   NULL,
    FAKTOR_PENGURANG_SPPT   DECIMAL(15,2)   NULL,
    PBB_YG_HARUS_DIBAYAR_SPPT DECIMAL(15,2) NULL,
    TGL_PERUBAHAN           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NIP_PETUGAS             VARCHAR(40)     NULL,
    KETERANGAN              TEXT            NULL,
    PRIMARY KEY (ID),
    KEY idx_histori_nop (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, THN_PAJAK_SPPT)
) ENGINE=InnoDB COMMENT='Riwayat perubahan SPPT per siklus';

CREATE TABLE sppt_khusus (
    KD_PROPINSI     CHAR(2)         NOT NULL,
    KD_DATI2        CHAR(2)         NOT NULL,
    KD_KECAMATAN    CHAR(3)         NOT NULL,
    KD_KELURAHAN    CHAR(3)         NOT NULL,
    KD_BLOK         CHAR(3)         NOT NULL,
    NO_URUT         CHAR(4)         NOT NULL,
    KD_JNS_OP       CHAR(1)         NOT NULL,
    JENIS_SPPT      INT             NOT NULL   COMMENT 'FK ke jenis_sppt.ID',
    KETERANGAN      VARCHAR(200)    NULL,
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP),
    CONSTRAINT fk_sppt_khusus_jenis FOREIGN KEY (JENIS_SPPT)
        REFERENCES jenis_sppt (ID)
) ENGINE=InnoDB COMMENT='Penanda NOP yang mendapat perlakuan SPPT khusus';

-- ============================================================
-- SECTION 12: STATUS PBB (PENGURANGAN / PEMBEBASAN)
-- ============================================================

CREATE TABLE status_pbb (
    KD_PROPINSI             CHAR(2)         NOT NULL,
    KD_DATI2                CHAR(2)         NOT NULL,
    KD_KECAMATAN            CHAR(3)         NOT NULL,
    KD_KELURAHAN            CHAR(3)         NOT NULL,
    KD_BLOK                 CHAR(3)         NOT NULL,
    NO_URUT                 CHAR(4)         NOT NULL,
    KD_JNS_OP               CHAR(1)         NOT NULL,
    TAHUN_PBB               CHAR(4)         NOT NULL,
    TANGGAL_BAYAR           DATETIME        NULL,
    PERMOHONAN_PENGURANGAN  DOUBLE          NULL   COMMENT 'Persentase pengurangan yang dimohonkan (%)',
    PENGURANGAN_DIBERI      DOUBLE          NULL   COMMENT 'Persentase pengurangan yang disetujui (%)',
    ALASAN_PENGURANGAN      LONGTEXT        NULL,
    ALASAN_KEBERATAN        LONGTEXT        NULL,
    NO_SK_PENGURANGAN       VARCHAR(100)    NULL   COMMENT 'Nomor SK pengurangan',
    TGL_SK                  DATE            NULL,
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, TAHUN_PBB),
    CONSTRAINT fk_status_pbb_spop FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
        REFERENCES spop (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP)
) ENGINE=InnoDB COMMENT='Status pengurangan atau pembebasan PBB per NOP per tahun';

-- ============================================================
-- SECTION 13: PEMBAYARAN SPPT
-- ============================================================

CREATE TABLE pembayaran_sppt (
    KD_PROPINSI             CHAR(2)         NOT NULL,
    KD_DATI2                CHAR(2)         NOT NULL,
    KD_KECAMATAN            CHAR(3)         NOT NULL,
    KD_KELURAHAN            CHAR(3)         NOT NULL,
    KD_BLOK                 CHAR(3)         NOT NULL,
    NO_URUT                 CHAR(4)         NOT NULL,
    KD_JNS_OP               CHAR(1)         NOT NULL,
    THN_PAJAK_SPPT          YEAR            NOT NULL,
    PEMBAYARAN_KE           TINYINT         NOT NULL   COMMENT 'Urutan pembayaran (1, 2, 3...)',
    TGL_PEMBAYARAN_SPPT     DATE            NOT NULL,
    JML_SPPT_YG_DIBAYAR     DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'Jumlah pokok yang dibayar',
    DENDA_SPPT              DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'Denda keterlambatan',
    JML_BAYAR               DECIMAL(15,2)   NOT NULL   DEFAULT 0   COMMENT 'Total = pokok + denda',
    NAMA_BAYAR              VARCHAR(100)    NULL       COMMENT 'Nama yang membayar',
    CHANNEL_PEMBAYARAN      VARCHAR(50)     NULL       COMMENT 'Bank, loket, online, dsb.',
    NO_REFERENSI            VARCHAR(100)    NULL       COMMENT 'Nomor bukti/referensi pembayaran',
    NIP_PETUGAS             VARCHAR(40)     NULL       COMMENT 'NIP petugas yang menginput',
    DIBATALKAN              TINYINT(1)      NOT NULL   DEFAULT 0,
    TGL_BATAL               DATETIME        NULL,
    ALASAN_BATAL            TEXT            NULL,
    PRIMARY KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, THN_PAJAK_SPPT, PEMBAYARAN_KE),
    CONSTRAINT fk_pembayaran_sppt FOREIGN KEY (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, THN_PAJAK_SPPT)
        REFERENCES sppt (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP, THN_PAJAK_SPPT)
) ENGINE=InnoDB COMMENT='Riwayat pembayaran SPPT';

-- ============================================================
-- SECTION 14: PELAYANAN (BERKAS)
-- ============================================================

CREATE TABLE pelayanan (
    NO_PELAYANAN            VARCHAR(30)     NOT NULL   COMMENT 'Nomor unik berkas pelayanan',

    -- NOP terkait (nullable: kolektif pakai nilai dummy)
    KD_PROPINSI             CHAR(2)         NULL,
    KD_DATI2                CHAR(2)         NULL,
    KD_KECAMATAN            CHAR(3)         NULL,
    KD_KELURAHAN            CHAR(3)         NULL,
    KD_BLOK                 CHAR(3)         NULL,
    NO_URUT                 CHAR(4)         NULL,
    KD_JNS_OP               CHAR(1)         NULL,

    -- Jenis & Tanggal
    KD_JNS_PELAYANAN        CHAR(2)         NOT NULL,
    TANGGAL_PELAYANAN       DATE            NOT NULL,
    TANGGAL_PERKIRAAN_SELESAI DATE          NULL       COMMENT 'Default: T+5 hari kerja',

    -- Pemohon
    NAMA_PEMOHON            VARCHAR(100)    NULL,
    ALAMAT_PEMOHON          TEXT            NULL,

    -- Lokasi OP
    LETAK_OP                VARCHAR(200)    NULL,
    KECAMATAN               VARCHAR(50)     NULL,
    KELURAHAN               VARCHAR(50)     NULL,

    -- Status Alur (1-6)
    STATUS_PELAYANAN        SMALLINT        NOT NULL   DEFAULT 1
                            COMMENT '1=Masuk, 2=Masuk Penilai, 3=Masuk Penetapan, 4=Selesai, 5=Terkonfirmasi WP, 6=Ditunda',

    -- Petugas Penerima (Loket)
    NIP_PETUGAS_PENERIMA    VARCHAR(40)     NULL,
    NAMA_PETUGAS_PENERIMA   VARCHAR(100)    NULL,

    -- Account Representative
    NIP_AR                  VARCHAR(40)     NULL,
    NAMA_AR                 VARCHAR(100)    NULL,

    -- Catatan
    CATATAN                 TEXT            NULL,
    KETERANGAN              TEXT            NULL,

    -- Status Masuk Penilai
    TGL_MASUK_PENILAI       DATE            NULL,
    NIP_MASUK_PENILAI       VARCHAR(40)     NULL,

    -- Status Masuk Penetapan
    TGL_MASUK_PENETAPAN     DATE            NULL,
    NIP_MASUK_PENETAPAN     VARCHAR(40)     NULL,

    -- Status Selesai
    TGL_SELESAI             DATE            NULL,
    NIP_SELESAI             VARCHAR(40)     NULL,

    -- Status Terkonfirmasi WP
    TGL_TERKONFIRMASI_WP    DATE            NULL,
    NIP_TERKONFIRMASI_WP    VARCHAR(40)     NULL,

    -- Status Ditunda
    TGL_BERKAS_DITUNDA      DATE            NULL,
    ALASAN_DITUNDA          TEXT            NULL,

    -- Kolektif
    IS_KOLEKTIF             TINYINT(1)      NOT NULL   DEFAULT 0,

    -- Tanda Tangan Berkas
    TTD_KIRI_JABATAN        VARCHAR(100)    NULL,
    TTD_KIRI_NAMA           VARCHAR(100)    NULL,
    TTD_KIRI_NIP            VARCHAR(40)     NULL,
    TTD_KANAN_JABATAN       VARCHAR(100)    NULL,
    TTD_KANAN_NAMA          VARCHAR(100)    NULL,
    TTD_KANAN_NIP           VARCHAR(40)     NULL,

    PRIMARY KEY (NO_PELAYANAN),
    KEY idx_pelayanan_nop (KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN, KD_BLOK, NO_URUT, KD_JNS_OP),
    KEY idx_pelayanan_status (STATUS_PELAYANAN),
    KEY idx_pelayanan_tgl (TANGGAL_PELAYANAN),
    CONSTRAINT fk_pelayanan_jns FOREIGN KEY (KD_JNS_PELAYANAN)
        REFERENCES ref_jns_pelayanan (KD_JNS_PELAYANAN)
) ENGINE=InnoDB COMMENT='Berkas permohonan pelayanan dari wajib pajak';

CREATE TABLE pelayanan_dokumen (
    NO_PELAYANAN    VARCHAR(30)     NOT NULL,
    DOKUMEN_ID      TINYINT         NOT NULL   COMMENT '1-15: kode dokumen yang diserahkan',
    PRIMARY KEY (NO_PELAYANAN, DOKUMEN_ID),
    CONSTRAINT fk_dok_pelayanan FOREIGN KEY (NO_PELAYANAN)
        REFERENCES pelayanan (NO_PELAYANAN)
) ENGINE=InnoDB COMMENT='Checklist dokumen yang diserahkan per berkas pelayanan';

-- Kode DOKUMEN_ID:
-- 1=Pengajuan Permohonan, 2=Surat Kuasa, 3=Fotokopi KTP
-- 4=Fotokopi Sertifikat Tanah, 5=Asli SPPT, 6=Fotokopi IMB
-- 7=Fotokopi Akta Jual Beli/Hibah, 8=Fotokopi SK Pensiun
-- 9=Fotokopi SPPT/SSPD, 10=Asli SSPD, 11=Fotokopi SK Pengurangan
-- 12=Fotokopi SK Keberatan, 13=Fotokopi SSPD BPHTB
-- 14=Surat Pernyataan Kepemilikan, 15=Lain-Lain

CREATE TABLE pelayanan_lampiran_kolektif (
    ID              INT             NOT NULL AUTO_INCREMENT,
    NO_PELAYANAN    VARCHAR(30)     NOT NULL,
    NOP             VARCHAR(18)     NULL       COMMENT 'NOP 18 digit item kolektif',
    NAMA            VARCHAR(100)    NULL,
    ALAMAT          TEXT            NULL,
    LT              DECIMAL(12,2)   NULL       COMMENT 'Luas tanah m²',
    LB              DECIMAL(12,2)   NULL       COMMENT 'Luas bangunan m²',
    KETERANGAN      TEXT            NULL,
    PRIMARY KEY (ID),
    KEY idx_lamp_kol_pelayanan (NO_PELAYANAN),
    CONSTRAINT fk_lamp_kol_pelayanan FOREIGN KEY (NO_PELAYANAN)
        REFERENCES pelayanan (NO_PELAYANAN)
) ENGINE=InnoDB COMMENT='Daftar NOP dalam satu berkas pelayanan kolektif';

CREATE TABLE histori_mutasi (
    ID                  INT             NOT NULL AUTO_INCREMENT,
    NO_PELAYANAN        VARCHAR(30)     NOT NULL,
    NOP_SEBELUM         VARCHAR(18)     NULL,
    NAMA_SEBELUM        VARCHAR(100)    NULL,
    LT_SEBELUM          DECIMAL(12,2)   NULL   COMMENT 'Luas tanah sebelum (m²)',
    LB_SEBELUM          DECIMAL(12,2)   NULL   COMMENT 'Luas bangunan sebelum (m²)',
    PBB_SEBELUM         DECIMAL(15,2)   NULL   COMMENT 'Nilai PBB sebelum',
    NOP_SESUDAH         VARCHAR(18)     NULL,
    NAMA_SESUDAH        VARCHAR(100)    NULL,
    LT_SESUDAH          DECIMAL(12,2)   NULL,
    LB_SESUDAH          DECIMAL(12,2)   NULL,
    PBB_SESUDAH         DECIMAL(15,2)   NULL,
    TGL_MUTASI          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NIP_PETUGAS         VARCHAR(40)     NULL,
    PRIMARY KEY (ID),
    KEY idx_histori_mutasi_pelayanan (NO_PELAYANAN)
) ENGINE=InnoDB COMMENT='Riwayat data sebelum dan sesudah mutasi untuk berita acara';

-- ============================================================
-- SECTION 15: PEMEKARAN WILAYAH
-- ============================================================

CREATE TABLE pemekaran (
    ID              INT             NOT NULL AUTO_INCREMENT,
    NAMA_PEMEKARAN  VARCHAR(100)    NOT NULL   COMMENT 'Nama/keterangan peristiwa pemekaran',
    TGL_BERLAKU     DATE            NOT NULL   COMMENT 'Tanggal mulai berlaku perubahan',
    KETERANGAN      TEXT            NULL,
    PRIMARY KEY (ID)
) ENGINE=InnoDB COMMENT='Peristiwa pemekaran/perubahan batas wilayah';

CREATE TABLE pemekaran_detail (
    ID                  INT             NOT NULL AUTO_INCREMENT,
    PEMEKARAN_ID        INT             NOT NULL,

    -- NOP Lama (sebelum pemekaran)
    KD_PROPINSI_LAMA    CHAR(2)         NOT NULL,
    KD_DATI2_LAMA       CHAR(2)         NOT NULL,
    KD_KECAMATAN_LAMA   CHAR(3)         NOT NULL,
    KD_KELURAHAN_LAMA   CHAR(3)         NOT NULL,
    KD_BLOK_LAMA        CHAR(3)         NOT NULL,
    NO_URUT_LAMA        CHAR(4)         NOT NULL,
    KD_JNS_OP_LAMA      CHAR(1)         NOT NULL,

    -- NOP Baru (setelah pemekaran)
    KD_PROPINSI_BARU    CHAR(2)         NOT NULL,
    KD_DATI2_BARU       CHAR(2)         NOT NULL,
    KD_KECAMATAN_BARU   CHAR(3)         NOT NULL,
    KD_KELURAHAN_BARU   CHAR(3)         NOT NULL,
    KD_BLOK_BARU        CHAR(3)         NOT NULL,
    NO_URUT_BARU        CHAR(4)         NOT NULL,
    KD_JNS_OP_BARU      CHAR(1)         NOT NULL,

    PRIMARY KEY (ID),
    KEY idx_pemekaran_nop_lama (KD_PROPINSI_LAMA, KD_DATI2_LAMA, KD_KECAMATAN_LAMA, KD_KELURAHAN_LAMA, KD_BLOK_LAMA, NO_URUT_LAMA, KD_JNS_OP_LAMA),
    CONSTRAINT fk_pemekaran_detail_induk FOREIGN KEY (PEMEKARAN_ID)
        REFERENCES pemekaran (ID)
) ENGINE=InnoDB COMMENT='Pemetaan NOP lama ke NOP baru akibat pemekaran wilayah';

-- ============================================================
-- SECTION 16: LOG & AUDIT
-- ============================================================

CREATE TABLE log_aktivitas (
    ID          BIGINT          NOT NULL AUTO_INCREMENT,
    USERNAME    VARCHAR(20)     NOT NULL,
    AKSI        VARCHAR(50)     NOT NULL   COMMENT 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT, dsb.',
    MODUL       VARCHAR(50)     NULL       COMMENT 'Nama modul/tabel yang terdampak',
    KETERANGAN  TEXT            NULL       COMMENT 'Detail perubahan atau konteks',
    IP_ADDRESS  VARCHAR(45)     NULL,
    CREATED_AT  DATETIME        NOT NULL   DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ID),
    KEY idx_log_user (USERNAME),
    KEY idx_log_tgl (CREATED_AT)
) ENGINE=InnoDB COMMENT='Log audit aktivitas pengguna';

CREATE TABLE log_delete_pelayanan (
    ID              INT             NOT NULL AUTO_INCREMENT,
    NO_PELAYANAN    VARCHAR(30)     NOT NULL,
    DATA_SNAPSHOT   JSON            NULL       COMMENT 'Snapshot data pelayanan sebelum dihapus',
    DIHAPUS_OLEH    VARCHAR(20)     NULL,
    TGL_HAPUS       DATETIME        NOT NULL   DEFAULT CURRENT_TIMESTAMP,
    ALASAN          TEXT            NULL,
    PRIMARY KEY (ID)
) ENGINE=InnoDB COMMENT='Log penghapusan berkas pelayanan';

-- ============================================================
-- SECTION 17: VIEWS BERGUNA
-- ============================================================

-- View: NOP lengkap sebagai string 18 digit
CREATE OR REPLACE VIEW v_nop AS
SELECT
    CONCAT(KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN,
           KD_BLOK, NO_URUT, KD_JNS_OP) AS NOP,
    KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN,
    KD_BLOK, NO_URUT, KD_JNS_OP,
    SUBJEK_PAJAK_ID, JALAN_OP, LUAS_BUMI, JNS_BUMI, NILAI_SISTEM_BUMI
FROM spop;

-- View: Ringkasan tunggakan per NOP
CREATE OR REPLACE VIEW v_tunggakan AS
SELECT
    CONCAT(s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN,
           s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP) AS NOP,
    s.THN_PAJAK_SPPT,
    s.PBB_YG_HARUS_DIBAYAR_SPPT,
    COALESCE(SUM(p.JML_SPPT_YG_DIBAYAR), 0) AS SUDAH_DIBAYAR,
    s.PBB_YG_HARUS_DIBAYAR_SPPT - COALESCE(SUM(p.JML_SPPT_YG_DIBAYAR), 0) AS SISA_TUNGGAKAN
FROM sppt s
LEFT JOIN pembayaran_sppt p
    ON  s.KD_PROPINSI = p.KD_PROPINSI
    AND s.KD_DATI2    = p.KD_DATI2
    AND s.KD_KECAMATAN= p.KD_KECAMATAN
    AND s.KD_KELURAHAN= p.KD_KELURAHAN
    AND s.KD_BLOK     = p.KD_BLOK
    AND s.NO_URUT     = p.NO_URUT
    AND s.KD_JNS_OP   = p.KD_JNS_OP
    AND s.THN_PAJAK_SPPT = p.THN_PAJAK_SPPT
    AND p.DIBATALKAN  = 0
WHERE s.STATUS_PEMBATALAN = '0'
  AND s.STATUS_PEMBAYARAN_SPPT <> '1'
GROUP BY s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN,
         s.KD_BLOK, s.NO_URUT, s.KD_JNS_OP, s.THN_PAJAK_SPPT;

-- View: Realisasi pembayaran per kelurahan per tahun
CREATE OR REPLACE VIEW v_realisasi_kelurahan AS
SELECT
    s.KD_PROPINSI,
    s.KD_DATI2,
    s.KD_KECAMATAN,
    s.KD_KELURAHAN,
    s.THN_PAJAK_SPPT,
    COUNT(*)                                        AS JML_OP,
    SUM(s.PBB_YG_HARUS_DIBAYAR_SPPT)               AS TOTAL_KETETAPAN,
    SUM(COALESCE(p.TOTAL_BAYAR, 0))                 AS TOTAL_REALISASI,
    SUM(s.PBB_YG_HARUS_DIBAYAR_SPPT) - SUM(COALESCE(p.TOTAL_BAYAR, 0)) AS SISA
FROM sppt s
LEFT JOIN (
    SELECT KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN,
           KD_BLOK, NO_URUT, KD_JNS_OP, THN_PAJAK_SPPT,
           SUM(JML_SPPT_YG_DIBAYAR) AS TOTAL_BAYAR
    FROM pembayaran_sppt
    WHERE DIBATALKAN = 0
    GROUP BY KD_PROPINSI, KD_DATI2, KD_KECAMATAN, KD_KELURAHAN,
             KD_BLOK, NO_URUT, KD_JNS_OP, THN_PAJAK_SPPT
) p ON s.KD_PROPINSI = p.KD_PROPINSI AND s.KD_DATI2 = p.KD_DATI2
    AND s.KD_KECAMATAN = p.KD_KECAMATAN AND s.KD_KELURAHAN = p.KD_KELURAHAN
    AND s.KD_BLOK = p.KD_BLOK AND s.NO_URUT = p.NO_URUT
    AND s.KD_JNS_OP = p.KD_JNS_OP AND s.THN_PAJAK_SPPT = p.THN_PAJAK_SPPT
WHERE s.STATUS_PEMBATALAN = '0'
GROUP BY s.KD_PROPINSI, s.KD_DATI2, s.KD_KECAMATAN, s.KD_KELURAHAN, s.THN_PAJAK_SPPT;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- RINGKASAN TABEL
-- ============================================================
-- Wilayah          : ref_propinsi, ref_dati2, ref_kecamatan, ref_kelurahan, jalan
-- Referensi        : ref_kategori, ref_jns_pelayanan
-- Pengguna         : login, akses, group_akses
-- Konfigurasi      : konfigurasi
-- Klasifikasi      : kelas_bumi, kelas_bangunan, tarif, jenis_sppt, fasilitas
-- Subjek Pajak     : dat_subjek_pajak
-- Objek Pajak      : spop, dat_op_bangunan, dat_fasilitas_bangunan
--                    dat_legalitas_bumi, dat_op_induk, dat_op_anggota
-- Ketetapan        : sppt, histori_sppt, sppt_khusus, status_pbb
-- Pembayaran       : pembayaran_sppt
-- Pelayanan        : pelayanan, pelayanan_dokumen, pelayanan_lampiran_kolektif, histori_mutasi
-- Pemekaran        : pemekaran, pemekaran_detail
-- Audit            : log_aktivitas, log_delete_pelayanan
-- Views            : v_nop, v_tunggakan, v_realisasi_kelurahan
-- Total: 30 tabel, 3 view
-- ============================================================
