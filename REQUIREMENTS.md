# Dokumen Kebutuhan Sistem (Software Requirements Specification)
# SIM-PBB — Sistem Informasi Manajemen Pajak Bumi dan Bangunan

**Versi:** 1.0
**Tanggal:** 20 Maret 2026
**Status:** Draft untuk Migrasi Sistem
**Referensi:** Legacy SIM-PBB v3.9.10.41 (VB.NET / Windows Forms)

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Gambaran Umum Sistem](#2-gambaran-umum-sistem)
3. [Pemangku Kepentingan dan Pengguna](#3-pemangku-kepentingan-dan-pengguna)
4. [Kebutuhan Fungsional](#4-kebutuhan-fungsional)
   - 4.1 Autentikasi & Manajemen Pengguna
   - 4.2 Berkas / Pelayanan
   - 4.3 SPOP
   - 4.4 LSPOP
   - 4.5 Pembayaran
   - 4.6 Peta
   - 4.7 Dashboard
   - 4.8 Cetak SPPT
   - 4.9 Tunggakan OP
   - 4.10 Info OP
   - 4.11 Laporan
   - 4.12 DHKP
   - 4.13 Klasifikasi Kelas Bumi/Bangunan
   - 4.14 Referensi
   - 4.15 Pengguna
   - 4.16 Group
   - 4.17 Konfigurasi
   - 4.18 Update Masal
   - 4.19 DBKB
   - 4.20 Pemekaran
   - 4.21 Penghapusan
   - 4.22 Jalan
   - 4.23 Tarif
   - 4.24 Jenis SPPT
5. [Kebutuhan Non-Fungsional](#5-kebutuhan-non-fungsional)
6. [Model Data](#6-model-data)
7. [Aturan Bisnis](#7-aturan-bisnis)
8. [Antarmuka Eksternal](#8-antarmuka-eksternal)
9. [Asumsi dan Ketergantungan](#9-asumsi-dan-ketergantungan)
10. [Glosarium](#10-glosarium)

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini merupakan Spesifikasi Kebutuhan Perangkat Lunak (Software Requirements Specification / SRS) untuk migrasi sistem SIM-PBB dari aplikasi desktop berbasis VB.NET / Windows Forms ke platform baru. Dokumen ini mendeskripsikan seluruh kebutuhan fungsional dan non-fungsional yang harus dipenuhi oleh sistem baru.

### 1.2 Ruang Lingkup

SIM-PBB (Sistem Informasi Manajemen Pajak Bumi dan Bangunan) adalah sistem yang digunakan oleh pemerintah daerah tingkat kabupaten/kota untuk mengelola:

- Pendataan objek dan subjek pajak (tanah dan bangunan)
- Penerbitan SPPT (Surat Pemberitahuan Pajak Terutang)
- Pencatatan pembayaran pajak
- Pelaporan dan analisis data perpajakan
- Administrasi pelayanan wajib pajak

Sistem ini beroperasi di lingkungan Badan Pendapatan Daerah (Bapenda) atau Dinas Pendapatan Daerah yang berwenang mengelola PBB-P2 (Pajak Bumi dan Bangunan Perdesaan dan Perkotaan).

### 1.3 Referensi

- Undang-Undang Nomor 28 Tahun 2009 tentang Pajak Daerah dan Retribusi Daerah
- Peraturan Pemerintah terkait PBB-P2 yang berlaku
- Legacy system SIM-PBB v3.9.10.41 (VB.NET, .NET Framework 4.0)
- Database MySQL schema `simpbb`

### 1.4 Singkatan dan Akronim

| Singkatan | Kepanjangan |
|-----------|-------------|
| PBB | Pajak Bumi dan Bangunan |
| PBB-P2 | PBB Perdesaan dan Perkotaan |
| SPPT | Surat Pemberitahuan Pajak Terutang |
| SPOP | Surat Pemberitahuan Objek Pajak |
| LSPOP | Lampiran Surat Pemberitahuan Objek Pajak |
| NOP | Nomor Objek Pajak |
| NJOP | Nilai Jual Objek Pajak |
| NJOPTKP | NJOP Tidak Kena Pajak |
| NJKP | Nilai Jual Kena Pajak |
| DHKP | Daftar Himpunan Ketetapan Pajak |
| DHR | Daftar Himpunan Realisasi |
| DBKB | Daftar Biaya Komponen Bangunan |
| OP | Objek Pajak |
| WP | Wajib Pajak |

---

## 2. Gambaran Umum Sistem

### 2.1 Konteks Sistem

SIM-PBB adalah sistem manajemen pajak yang digunakan oleh petugas pajak di dinas pendapatan daerah. Sistem mengelola seluruh siklus perpajakan PBB mulai dari pendaftaran objek pajak, penilaian, penerbitan ketetapan, pemungutan, hingga pelaporan.

### 2.2 Alur Kerja Utama

```
Pendaftaran OP → SPOP/LSPOP → Penilaian NJOP → Penetapan SPPT → Cetak SPPT
       ↓                                                                ↓
   Pelayanan                                                    Pembayaran
       ↓                                                                ↓
   Verifikasi                                                    Pelaporan
```

### 2.3 Struktur NOP (Nomor Objek Pajak)

NOP terdiri dari 18 digit dengan struktur:

```
[KD_PROPINSI 2] [KD_DATI2 2] [KD_KECAMATAN 3] [KD_KELURAHAN 3] [KD_BLOK 3] [NO_URUT 4] [KD_JNS_OP 1]
```

Contoh: `35.17.010.001.001.0001.0`

- `KD_PROPINSI` — Kode provinsi (2 digit)
- `KD_DATI2` — Kode kabupaten/kota (2 digit)
- `KD_KECAMATAN` — Kode kecamatan (3 digit)
- `KD_KELURAHAN` — Kode kelurahan/desa (3 digit)
- `KD_BLOK` — Kode blok (3 digit)
- `NO_URUT` — Nomor urut objek (4 digit)
- `KD_JNS_OP` — Kode jenis objek pajak (1 digit)

---

## 3. Pemangku Kepentingan dan Pengguna

### 3.1 Pemangku Kepentingan

| Pemangku Kepentingan | Kepentingan |
|----------------------|-------------|
| Bapenda / Dispenda | Pengelola utama sistem |
| Pemerintah Daerah | Pengguna laporan dan realisasi |
| Wajib Pajak | Penerima pelayanan |
| Auditor Internal/Eksternal | Pemeriksaan kepatuhan |

### 3.2 Peran Pengguna

| Peran | Deskripsi Akses |
|-------|-----------------|
| Administrator | Akses penuh ke semua modul termasuk konfigurasi sistem |
| Operator Data | Akses ke pendataan, SPOP, LSPOP, dan pelayanan berkas |
| Petugas Pelayanan | Akses ke modul berkas, verifikasi, dan informasi OP |
| Petugas Cetak | Akses ke modul cetak SPPT dan laporan |
| Bendahara | Akses ke modul pembayaran dan laporan keuangan |
| Supervisor | Akses ke laporan dan dashboard, tanpa edit data |
| Petugas Lapangan | Akses terbatas untuk verifikasi dan info OP |

---

## 4. Kebutuhan Fungsional

---

### 4.1 Autentikasi & Manajemen Sesi

#### 4.1.1 Login

**Deskripsi:** Pengguna harus masuk ke sistem menggunakan kredensial yang valid sebelum dapat mengakses fitur apapun.

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| AUTH-01 | Sistem harus menampilkan halaman login dengan kolom username dan password |
| AUTH-02 | Sistem harus memvalidasi username dan password terhadap data pengguna di database |
| AUTH-03 | Password harus disimpan menggunakan algoritma hash yang aman (minimal bcrypt atau Argon2; **bukan MD5**) |
| AUTH-04 | Setelah login berhasil, sistem harus memuat informasi pengguna: username, NIP, nama lengkap, dan group akses |
| AUTH-05 | Sistem harus menampilkan pesan kesalahan yang sesuai jika login gagal, tanpa mengungkap informasi spesifik (apakah username atau password yang salah) |
| AUTH-06 | Setelah 5 kali percobaan login gagal berturut-turut, akun harus dikunci sementara selama 15 menit |
| AUTH-07 | Sistem harus mencatat log waktu login dan logout setiap pengguna |
| AUTH-08 | Sistem harus mendukung mekanisme "Lupa Password" melalui reset oleh administrator |
| AUTH-09 | Sesi pengguna harus berakhir otomatis setelah periode tidak aktif yang dapat dikonfigurasi (default: 30 menit) |
| AUTH-10 | Sistem harus menampilkan informasi pengguna yang sedang login (nama, jabatan, tanggal/waktu) pada header atau sidebar |

#### 4.1.2 Logout

| ID | Kebutuhan |
|----|-----------|
| AUTH-11 | Pengguna harus dapat logout dari sistem kapan saja |
| AUTH-12 | Sistem harus menghapus sesi dan mengalihkan ke halaman login setelah logout |
| AUTH-13 | Sistem harus menampilkan konfirmasi sebelum logout jika ada data yang belum disimpan |

---

### 4.2 Berkas / Pelayanan

Modul Berkas/Pelayanan adalah inti dari operasional front-office perpajakan PBB. Modul ini mengelola seluruh siklus permohonan layanan dari wajib pajak, mulai dari penerimaan berkas di loket, penelitian, penetapan perubahan, hingga konfirmasi kepada wajib pajak.

---

#### 4.2.0 Jenis Pelayanan

Sistem mendukung tepat **15 jenis pelayanan** yang disimpan di tabel referensi `ref_jns_pelayanan`:

| Kode | Nama Jenis Pelayanan | Deskripsi Singkat |
|------|----------------------|-------------------|
| 01 | Pendaftaran Data Baru | Pendaftaran objek pajak baru yang belum pernah terdaftar |
| 02 | Mutasi Objek/Subjek | Perubahan kepemilikan atau data objek pajak |
| 03 | Pembetulan SPPT/SKP/STP | Koreksi kesalahan pada data SPPT, SKP, atau STP yang sudah terbit |
| 04 | Pembatalan SPPT/SKP | Pembatalan SPPT atau SKP yang tidak seharusnya terbit |
| 05 | Salinan SPPT/SKP | Permintaan duplikat/salinan SPPT atau SKP yang hilang/rusak |
| 06 | Keberatan Penunjukan Wajib Pajak | Keberatan atas penetapan identitas/penunjukan sebagai WP |
| 07 | Keberatan atas Pajak Terhutang | Keberatan atas besaran nilai pajak yang ditetapkan |
| 08 | Pengurangan atas Besarnya Pajak Terhutang | Permohonan pengurangan nilai PBB yang harus dibayar |
| 09 | Restitusi dan Kompensasi | Pengembalian atau kompensasi kelebihan bayar pajak |
| 10 | Pengurangan Denda Administrasi | Permohonan pengurangan/penghapusan denda keterlambatan |
| 11 | Penentuan Kembali Tanggal Jatuh Tempo | Perubahan tanggal batas waktu pembayaran SPPT |
| 12 | Penundaan Tanggal Jatuh Tempo SPOP | Penundaan batas waktu penyampaian SPOP |
| 13 | Pemberian Informasi PBB | Permintaan keterangan/informasi seputar data PBB |
| 14 | Pembetulan SK Keberatan | Koreksi atas Surat Keputusan Keberatan yang sudah diterbitkan |
| 15 | Mutasi Pemecahan | Pemecahan satu NOP menjadi beberapa NOP baru |

> **Catatan:** Pada beberapa daerah tertentu, kode 12 dapat dikonfigurasi ulang menjadi "Verifikasi NOP BPHTB".

---

#### 4.2.1 Pendaftaran Berkas

**Deskripsi:** Petugas loket mencatat permohonan pelayanan yang diajukan wajib pajak dan mendaftarkannya ke dalam sistem.

**Data yang Dicatat:**

| Field | Keterangan |
|-------|------------|
| No. Pelayanan | Nomor unik berkas, dapat di-generate otomatis atau manual |
| Tanggal Pelayanan | Tanggal penerimaan berkas di loket |
| Tanggal Perkiraan Selesai | Default: T+5 hari kerja, dapat diubah |
| NOP | Nomor Objek Pajak yang berkaitan (18 digit) |
| Nama Pemohon | Nama wajib pajak atau kuasanya |
| Alamat Pemohon | Alamat pemohon |
| Letak OP | Alamat lokasi objek pajak |
| Kecamatan / Kelurahan | Wilayah OP |
| Kode Jenis Pelayanan | Salah satu dari 15 jenis (kode 01–15) |
| Nama / NIP AR | Account Representative yang menangani |
| Catatan / Keterangan | Informasi tambahan |
| Kolektif | Flag apakah permohonan ini kolektif (multi-NOP) |

**Checklist Dokumen (15 jenis dokumen):**

| No. | Dokumen |
|-----|---------|
| 1 | Pengajuan Permohonan |
| 2 | Surat Kuasa (jika dikuasakan) |
| 3 | Fotokopi KTP Pemohon |
| 4 | Fotokopi Sertifikat Tanah |
| 5 | Asli SPPT |
| 6 | Fotokopi IMB (Izin Mendirikan Bangunan) |
| 7 | Fotokopi Akta Jual Beli / Akta Hibah |
| 8 | Fotokopi SK Pensiun |
| 9 | Fotokopi SPPT / SSPD |
| 10 | Asli SSPD (Surat Setoran Pajak Daerah) |
| 11 | Fotokopi SK Pengurangan |
| 12 | Fotokopi SK Keberatan |
| 13 | Fotokopi SSPD BPHTB |
| 14 | Surat Pernyataan Kepemilikan |
| 15 | Dokumen Lain-Lain |

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-01 | Sistem harus menyediakan formulir pendaftaran berkas dengan semua field di atas |
| BRK-02 | Sistem harus mendukung seluruh 15 jenis pelayanan sesuai tabel `ref_jns_pelayanan` |
| BRK-03 | Sistem harus dapat men-generate nomor pelayanan secara otomatis, dengan opsi untuk menonaktifkan auto-generate |
| BRK-04 | Sistem harus menampilkan data NOP secara otomatis (nama WP, alamat) ketika NOP diinput |
| BRK-05 | Sistem harus memvalidasi format NOP 18 digit sebelum menyimpan |
| BRK-06 | Sistem harus menampilkan checklist 15 dokumen yang dapat dicentang sesuai dokumen yang diserahkan |
| BRK-07 | Sistem harus menetapkan tanggal perkiraan selesai default T+5 hari dari tanggal pelayanan |
| BRK-08 | Sistem harus mencatat NIP dan nama petugas penerima (otomatis dari sesi login) |
| BRK-09 | Sistem harus mendukung pencarian berkas berdasarkan nomor pelayanan, NOP, nama pemohon, jenis pelayanan, status, dan rentang tanggal |
| BRK-10 | Sistem harus menampilkan daftar berkas dengan kolom: No. Pelayanan, Tanggal, NOP, Nama Pemohon, Jenis Pelayanan, Status, AR |
| BRK-11 | Sistem harus memeriksa apakah NOP sudah mengalami pemekaran dan menampilkan notifikasi beserta NOP baru jika ya |

---

#### 4.2.2 Lampiran Kolektif

**Deskripsi:** Untuk pelayanan yang melibatkan beberapa NOP sekaligus dalam satu permohonan (misalnya: mutasi massal dari satu pengembang, atau pendataan sekelompok kavling baru), sistem menyediakan mekanisme kolektif.

**Kapan Digunakan:**
- Pendaftaran data baru untuk beberapa kavling sekaligus
- Mutasi kepemilikan dari satu blok perumahan
- Pemecahan satu NOP induk menjadi beberapa NOP baru

**Struktur Data Kolektif:**

Satu **No. Pelayanan Master** dapat memiliki banyak item di tabel `pelayanan_lampiran_kolektif`:

| Field | Keterangan |
|-------|------------|
| No. Pelayanan | Mengacu ke berkas master |
| NOP | NOP masing-masing item |
| Nama WP | Nama wajib pajak per item |
| Alamat | Alamat per item |
| Luas Tanah (LT) | Dalam m² |
| Luas Bangunan (LB) | Dalam m² |
| Keterangan | Catatan per item |

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-12 | Sistem harus menyediakan flag "Kolektif" pada form pendaftaran berkas |
| BRK-13 | Jika kolektif diaktifkan, sistem harus menampilkan sub-form untuk input daftar NOP beserta data pendukungnya |
| BRK-14 | Sistem harus memungkinkan penambahan, pengeditan, dan penghapusan item dalam daftar kolektif |
| BRK-15 | Sistem harus menampilkan jumlah total item kolektif yang terdaftar |
| BRK-16 | Sistem harus mendukung pencetakan daftar lampiran kolektif sebagai bagian dari berkas pelayanan |
| BRK-17 | Berkas kolektif harus dapat diproses dan diverifikasi per item maupun secara keseluruhan |

---

#### 4.2.3 Cetak Berkas

**Deskripsi:** Mencetak tanda terima atau formulir berkas pelayanan yang diberikan kepada wajib pajak sebagai bukti penerimaan permohonan.

**Isi Cetakan:**
- Kop instansi (logo, nama dinas, alamat)
- Nomor dan tanggal pelayanan
- Identitas pemohon (nama, alamat)
- NOP dan lokasi objek pajak
- Jenis pelayanan yang diajukan
- Daftar dokumen yang diserahkan (tercentang)
- Tanggal perkiraan selesai
- Tanda tangan petugas penerima dan Account Representative
- Kolom tanda terima untuk pemohon

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-18 | Sistem harus dapat mencetak berkas pelayanan setelah pendaftaran berhasil disimpan |
| BRK-19 | Cetakan harus memuat semua elemen di atas termasuk logo dan tanda tangan yang dikonfigurasi |
| BRK-20 | Sistem harus mendukung pratinjau cetak sebelum dikirim ke printer |
| BRK-21 | Sistem harus mendukung ekspor cetakan ke format PDF |
| BRK-22 | Sistem harus mendukung cetak ulang berkas yang sudah ada (tanpa mengubah data) |
| BRK-23 | Tanda tangan yang muncul di cetakan (kiri: AR / kanan: Kepala) harus dapat dikonfigurasi secara terpusat |

---

#### 4.2.4 Berita Acara

**Deskripsi:** Dokumen resmi yang merangkum hasil pemrosesan/penelitian berkas pelayanan, dibuat oleh petugas setelah proses selesai dan sebelum perubahan data diterapkan.

**Isi Berita Acara:**
- Nomor dan tanggal berita acara (nomor agenda)
- Periode berita acara (rentang tanggal)
- Daftar berkas yang dibahas (filter per jenis pelayanan, kecamatan, kelurahan)
- Ringkasan hasil: perubahan apa yang disetujui/ditolak
- Tanda tangan dua pihak: kiri dan kanan (jabatan, nama, NIP)

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-24 | Sistem harus dapat membuat berita acara untuk satu atau lebih berkas dalam periode tertentu |
| BRK-25 | Sistem harus mendukung filter pembuatan berita acara berdasarkan: rentang tanggal, jenis pelayanan (multi-pilih), kecamatan, dan kelurahan |
| BRK-26 | Sistem harus mendukung input nomor agenda berita acara secara manual |
| BRK-27 | Berita acara harus dapat dicetak dan diekspor ke PDF |
| BRK-28 | Sistem harus mendukung konfigurasi dua kolom tanda tangan (kiri dan kanan) masing-masing dengan jabatan, nama, dan NIP |
| BRK-29 | Sistem harus menyimpan referensi berita acara pada setiap berkas yang diikutsertakan |

---

#### 4.2.5 Berita Acara Detail

**Deskripsi:** Laporan yang lebih rinci dari berita acara, memuat perubahan data sebelum dan sesudah untuk setiap berkas yang diproses (khususnya untuk jenis mutasi, pembetulan, dan pembatalan).

**Isi Berita Acara Detail:**
- Semua informasi berita acara standar
- Per berkas: NOP sebelum → NOP sesudah (untuk mutasi)
- Per berkas: Nama WP sebelum → sesudah
- Per berkas: Luas tanah (LT) sebelum → sesudah
- Per berkas: Luas bangunan (LB) sebelum → sesudah
- Per berkas: Nilai PBB sebelum → sesudah

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-30 | Sistem harus menghasilkan berita acara detail yang mencantumkan data sebelum dan sesudah perubahan untuk setiap berkas |
| BRK-31 | Data "sebelum" dan "sesudah" harus diambil dari tabel `histori_mutasi` yang diisi saat proses verifikasi |
| BRK-32 | Berita acara detail harus dapat dicetak dan diekspor ke PDF |
| BRK-33 | Berita acara detail harus memiliki tampilan perbandingan yang jelas antara data lama dan data baru |

---

#### 4.2.6 Status Pelayanan

**Deskripsi:** Memantau posisi setiap berkas dalam alur proses pelayanan.

**Alur Status (6 Status):**

```
[1] STATUS MASUK
   Berkas diterima di loket oleh petugas penerima.
   Dicatat: Tanggal masuk, NIP penerima.
        |
        v
[2] MASUK PENILAI
   Berkas diserahkan kepada penilai/peneliti untuk diperiksa.
   Dicatat: Tanggal masuk penilai, NIP penilai.
        |
        v
[3] MASUK PENETAPAN
   Hasil penelitian diserahkan ke bagian penetapan untuk diproses ke sistem.
   Dicatat: Tanggal masuk penetapan, NIP petugas penetapan.
        |
        v
[4] BERKAS SELESAI
   Perubahan data sudah diterapkan di sistem. Berkas selesai diproses.
   Dicatat: Tanggal selesai, NIP petugas.
        |
        v
[5] TERKONFIRMASI WP
   Wajib pajak sudah dihubungi/datang mengambil hasil pelayanan.
   Dicatat: Tanggal konfirmasi, NIP petugas.

[6] BERKAS DITUNDA  (dapat terjadi dari status manapun)
   Berkas ditangguhkan karena dokumen kurang lengkap atau alasan lain.
   Dicatat: Tanggal ditunda, keterangan penundaan.
```

**Diagram Transisi Status:**

```
    ┌─────────────────────────────────────────────┐
    │                                             │
[1] STATUS MASUK ──► [2] MASUK PENILAI ──► [3] MASUK PENETAPAN ──► [4] BERKAS SELESAI ──► [5] TERKONFIRMASI WP
         │                    │                      │                      │
         └────────────────────┴──────────────────────┴──────────────────────┘
                                             [6] BERKAS DITUNDA
                                         (dapat dikembalikan ke status sebelumnya)
```

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-34 | Sistem harus menampilkan status terkini setiap berkas dengan label dan warna berbeda per status |
| BRK-35 | Sistem harus menyediakan tombol aksi untuk mengubah status sesuai alur: Masuk Penilai, Masuk Penetapan, Selesai, Konfirmasi WP, Tunda |
| BRK-36 | Setiap perubahan status harus menyimpan: tanggal perubahan dan NIP petugas yang mengubah |
| BRK-37 | Perubahan status harus dibatasi sesuai hak akses pengguna (misal: hanya petugas penetapan yang bisa mengubah ke status 3) |
| BRK-38 | Sistem harus menampilkan histori lengkap perubahan status suatu berkas beserta tanggal dan petugas |
| BRK-39 | Sistem harus menampilkan peringatan visual (highlight warna merah) untuk berkas yang melewati tanggal perkiraan selesai |
| BRK-40 | Sistem harus mendukung filter daftar berkas berdasarkan status, jenis pelayanan, wilayah, dan rentang tanggal |
| BRK-41 | Sistem harus menampilkan jumlah berkas per status sebagai ringkasan (summary count) di bagian atas daftar |

---

#### 4.2.7 Verifikasi Pelayanan

**Deskripsi:** Proses tinjauan dan persetujuan oleh petugas berwenang (penilai atau kepala seksi) atas perubahan data yang diusulkan dari berkas pelayanan, sebelum perubahan tersebut diterapkan ke data master.

**Proses Verifikasi per Jenis Pelayanan:**

| Jenis | Yang Diverifikasi |
|-------|------------------|
| 01 - Pendaftaran Baru | Validasi data SPOP/LSPOP baru, kewajaran nilai NJOP |
| 02 - Mutasi Objek/Subjek | Keabsahan dokumen kepemilikan baru, perubahan identitas WP |
| 03 - Pembetulan | Identifikasi kesalahan data, data yang benar |
| 04 - Pembatalan | Alasan pembatalan, keabsahan permohonan |
| 05 - Salinan | Identitas pemohon sesuai WP terdaftar |
| 06, 07 - Keberatan | Kajian materiil keberatan, dokumen pendukung |
| 08 - Pengurangan | Syarat pengurangan terpenuhi, persentase yang disetujui |
| 09 - Restitusi | Perhitungan kelebihan bayar, rekening tujuan |
| 10 - Pengurangan Denda | Alasan pengurangan denda, persentase yang disetujui |
| 11 - Penentuan Jatuh Tempo | Tanggal jatuh tempo baru |
| 15 - Mutasi Pemecahan | NOP baru yang akan dibentuk, luas masing-masing pecahan |

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-42 | Sistem harus menyediakan halaman verifikasi yang menampilkan semua data berkas dan OP terkait secara lengkap |
| BRK-43 | Petugas verifikasi harus dapat menyetujui permohonan, yang akan secara otomatis menerapkan perubahan ke data terkait |
| BRK-44 | Petugas verifikasi harus dapat menolak permohonan dengan wajib mengisi alasan penolakan |
| BRK-45 | Hanya pengguna dengan role verifikasi yang dapat mengakses halaman dan melakukan tindakan verifikasi |
| BRK-46 | Untuk jenis mutasi, sistem harus menampilkan form input data "sebelum" dan "sesudah" yang akan masuk ke histori |
| BRK-47 | Untuk jenis pengurangan, sistem harus memvalidasi persentase pengurangan tidak melebihi batas yang dikonfigurasi |
| BRK-48 | Setelah verifikasi disetujui, sistem harus mencatat perubahan di `histori_mutasi` dan memperbarui `histori_sppt` |

---

#### 4.2.8 Edit Riwayat

**Deskripsi:** Menampilkan dan memungkinkan koreksi terhadap histori perubahan data yang sudah tercatat di sistem, untuk kasus-kasus di mana terjadi kesalahan input.

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-49 | Sistem harus menampilkan riwayat perubahan data suatu NOP secara kronologis |
| BRK-50 | Riwayat harus menampilkan: tanggal, No. Pelayanan/Berkas terkait, jenis perubahan, field yang diubah, nilai sebelum, nilai sesudah, dan petugas yang melakukan |
| BRK-51 | Pengguna dengan hak akses khusus dapat mengedit keterangan atau membatalkan entri riwayat yang salah |
| BRK-52 | Setiap tindakan edit riwayat harus menghasilkan entri log audit tersendiri (siapa yang mengedit, kapan, apa yang diubah) |
| BRK-53 | Sistem harus mencegah penghapusan riwayat yang menjadi satu-satunya referensi perubahan data |

---

#### 4.2.9 Penelitian Kantor

**Deskripsi:** Proses pemeriksaan administratif yang dilakukan oleh penilai di kantor berdasarkan dokumen yang diserahkan wajib pajak, tanpa survei ke lapangan. Menghasilkan Berita Acara Penelitian Kantor.

**Alur Penelitian Kantor:**

```
Berkas Masuk Penilai
        |
        v
Penilai membuka form Penelitian Kantor
        |
        v
Sistem menampilkan data OP saat ini (SPOP, LSPOP, nilai NJOP)
        |
        v
Penilai mengisi:
  - Hasil pemeriksaan dokumen (checklist)
  - Temuan di lapangan (jika ada survei mini)
  - Usulan perubahan data (nilai lahan, luas, klasifikasi)
  - Rekomendasi: Setuju / Tidak Setuju / Perlu Cek Lapangan
        |
        v
Sistem menyimpan hasil penelitian (terhubung ke No. Pelayanan)
        |
        v
Cetak Berita Acara Penelitian Kantor
        |
        v
Berkas diteruskan ke Penetapan
```

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-54 | Sistem harus menyediakan form penelitian kantor yang terhubung ke nomor pelayanan |
| BRK-55 | Form harus menampilkan data OP eksisting (SPOP dan LSPOP) sebagai referensi penelitian |
| BRK-56 | Penilai harus dapat mencatat hasil penelitian: temuan, usulan data baru, dan rekomendasi keputusan |
| BRK-57 | Sistem harus menyimpan hasil penelitian dan menghubungkannya ke berkas pelayanan terkait |
| BRK-58 | Sistem harus dapat mencetak Berita Acara Penelitian Kantor dengan format resmi yang mencakup: nomor agenda, data OP sebelum dan sesudah, tanda tangan penilai dan kepala seksi |
| BRK-59 | Penelitian kantor yang sudah selesai harus memperbarui status berkas menjadi "Masuk Penetapan" secara otomatis |

---

#### 4.2.10 Alur Lengkap Pelayanan per Jenis

##### Jenis 01 — Pendaftaran Data Baru

```
WP mengajukan berkas → Loket mencatat berkas → [STATUS: 1 - Masuk]
→ Penilai memeriksa dokumen kepemilikan dan mengisi data SPOP/LSPOP
→ Penelitian Kantor dilakukan → [STATUS: 2 - Masuk Penilai]
→ Data SPOP/LSPOP baru diinput ke sistem → [STATUS: 3 - Masuk Penetapan]
→ SPPT baru diterbitkan → [STATUS: 4 - Selesai]
→ WP dihubungi untuk mengambil SPPT → [STATUS: 5 - Terkonfirmasi]
```

##### Jenis 02 — Mutasi Objek/Subjek

```
WP baru mengajukan perubahan kepemilikan → Loket mencatat → [STATUS: 1]
→ Penilai memverifikasi Akta Jual Beli / Akta Hibah
→ Data "sebelum" dicatat (nama WP lama, LT, LB, PBB)
→ Data "sesudah" disiapkan (nama WP baru, data terbaru) → [STATUS: 2]
→ Perubahan nama WP dan data OP diterapkan ke SPOP → [STATUS: 3]
→ SPPT baru diterbitkan atas nama WP baru → [STATUS: 4]
→ WP baru konfirmasi → [STATUS: 5]
```

##### Jenis 03 — Pembetulan SPPT/SKP/STP

```
WP melaporkan kesalahan data → Loket mencatat → [STATUS: 1]
→ Penilai mengidentifikasi field yang salah (nama, luas, kelas)
→ Pembetulan data SPOP/LSPOP dilakukan → [STATUS: 2]
→ SPPT dihitung ulang (recalculate) dengan data yang benar → [STATUS: 3]
→ SPPT baru (siklus baru) diterbitkan → [STATUS: 4]
→ WP menerima SPPT yang sudah dibetulkan → [STATUS: 5]
```

##### Jenis 04 — Pembatalan SPPT/SKP

```
Permohonan pembatalan diterima → [STATUS: 1]
→ Penilai memeriksa alasan pembatalan (OP tidak ada, double penerbitan, dll.)
→ Rekomendasi pembatalan dibuat → [STATUS: 2]
→ Status SPPT diubah menjadi "Dibatalkan" di sistem → [STATUS: 3]
→ Berita Acara Pembatalan diterbitkan → [STATUS: 4]
→ WP dikonfirmasi → [STATUS: 5]
```

##### Jenis 05 — Salinan SPPT/SKP

```
WP mengajukan permintaan salinan → [STATUS: 1]
→ Penilai memverifikasi identitas WP (KTP sesuai nama di SPPT)
→ [STATUS: 2]
→ Salinan SPPT dicetak dari sistem → [STATUS: 3]
→ [STATUS: 4 - Selesai]
→ WP menerima salinan → [STATUS: 5]
```

##### Jenis 06 — Keberatan Penunjukan Wajib Pajak

```
WP keberatan ditunjuk sebagai WP → [STATUS: 1]
→ Penilai memeriksa dasar hukum kepemilikan → [STATUS: 2]
→ Jika keberatan valid: data WP diubah ke pihak yang tepat → [STATUS: 3]
→ Surat Keputusan Keberatan diterbitkan → [STATUS: 4]
→ WP dikonfirmasi hasil SK → [STATUS: 5]
```

##### Jenis 07 — Keberatan atas Pajak Terhutang

```
WP mengajukan keberatan nilai pajak → [STATUS: 1]
→ Penilai melakukan kajian materiil: memeriksa luas, kelas, NJOP
→ Penelitian lapangan dapat dilakukan → [STATUS: 2]
→ Jika nilai NJOP perlu direvisi: data diperbarui → [STATUS: 3]
→ SPPT dihitung ulang, SK Keberatan diterbitkan → [STATUS: 4]
→ WP menerima hasil → [STATUS: 5]
```

##### Jenis 08 — Pengurangan atas Besarnya Pajak Terhutang

```
WP mengajukan pengurangan (mis: veteran, pensiunan, bencana alam) → [STATUS: 1]
→ Penilai memverifikasi syarat: dokumen SK Pensiun / Surat Keterangan
→ Menentukan persentase pengurangan yang disetujui → [STATUS: 2]
→ Status pengurangan dicatat di `status_pbb` → [STATUS: 3]
→ SPPT dihitung ulang dengan faktor pengurang → [STATUS: 4]
→ WP menerima SPPT yang sudah dikurangi → [STATUS: 5]
```

##### Jenis 09 — Restitusi dan Kompensasi

```
WP melaporkan kelebihan bayar → [STATUS: 1]
→ Penilai memverifikasi data pembayaran vs ketetapan → [STATUS: 2]
→ Selisih kelebihan bayar dihitung → [STATUS: 3]
→ Proses pengembalian/kompensasi dilakukan (di luar sistem) → [STATUS: 4]
→ WP dikonfirmasi → [STATUS: 5]
```

##### Jenis 10 — Pengurangan Denda Administrasi

```
WP mengajukan keringanan denda → [STATUS: 1]
→ Penilai memverifikasi alasan: force majeure, kurang mampu, dll. → [STATUS: 2]
→ Persentase pengurangan denda diputuskan → [STATUS: 3]
→ Nilai denda diperbarui di sistem → [STATUS: 4]
→ WP dikonfirmasi → [STATUS: 5]
```

##### Jenis 11 — Penentuan Kembali Tanggal Jatuh Tempo

```
WP mengajukan perpanjangan jatuh tempo → [STATUS: 1]
→ Penilai memeriksa alasan → [STATUS: 2]
→ Tanggal jatuh tempo baru diputuskan → [STATUS: 3]
→ Field TGL_JATUH_TEMPO di SPPT diperbarui → [STATUS: 4]
→ WP dikonfirmasi → [STATUS: 5]
```

##### Jenis 15 — Mutasi Pemecahan

```
Pemilik mengajukan pecah NOP (mis: kavling dijual sebagian) → [STATUS: 1]
→ Penilai memverifikasi sertifikat pecah, IMB → [STATUS: 2]
→ NOP induk dinonaktifkan, NOP-NOP baru dibentuk
→ SPOP baru diisi untuk masing-masing NOP pecahan → [STATUS: 3]
→ SPPT baru diterbitkan untuk setiap NOP baru → [STATUS: 4]
→ WP menerima SPPT-SPPT baru → [STATUS: 5]
```

---

#### 4.2.11 Konfigurasi Tanda Tangan Berkas

Sistem mendukung konfigurasi fleksibel untuk penanda tangan pada dokumen berkas dan berita acara:

| Parameter Konfigurasi | Keterangan |
|-----------------------|------------|
| `BERKAS_KIRI_SESUAI_LOGIN` | Kolom kiri menggunakan data pengguna yang sedang login |
| `BERKAS_KIRI_NIP` | NIP penanda tangan kiri (jika bukan sesuai login) |
| `BERKAS_KIRI_NAMA` | Nama penanda tangan kiri |
| `BERKAS_KIRI_JABATAN` | Jabatan penanda tangan kiri |
| `BERKAS_KANAN_SESUAI_LOGIN` | Kolom kanan menggunakan data pengguna login |
| `BERKAS_KANAN_NIP` | NIP penanda tangan kanan |
| `BERKAS_KANAN_NAMA` | Nama penanda tangan kanan |
| `BERKAS_KANAN_JABATAN` | Jabatan penanda tangan kanan |
| `AR_SESUAI_LOGIN` | Account Representative diisi dari data login |
| `NIP_ACCOUNT_REPRESENTATIVE` | NIP AR tetap (jika bukan sesuai login) |
| `NAMA_ACCOUNT_REPRESENTATIVE` | Nama AR tetap |
| `BERITA_KIRI_*` | Tanda tangan kiri khusus Berita Acara |
| `BERITA_KANAN_*` | Tanda tangan kanan khusus Berita Acara |

**Kebutuhan Fungsional:**

| ID | Kebutuhan |
|----|-----------|
| BRK-60 | Sistem harus menyediakan halaman konfigurasi tanda tangan berkas yang dapat diisi oleh Administrator |
| BRK-61 | Sistem harus mendukung pilihan "gunakan data login saat ini" atau "gunakan data tetap" untuk setiap kolom tanda tangan |
| BRK-62 | Konfigurasi tanda tangan harus terpisah antara berkas pelayanan dan berita acara |

---

### 4.3 SPOP (Surat Pemberitahuan Objek Pajak)

**Deskripsi:** Modul untuk mengelola data objek pajak (tanah) yang dilaporkan wajib pajak. SPOP adalah formulir induk yang menyimpan data identitas wajib pajak, lokasi objek, dan data tanah. SPOP menjadi dasar penerbitan SPPT.

---

#### 4.3.1 Struktur Data SPOP

##### A. Identitas NOP (Nomor Objek Pajak)

NOP terdiri dari 18 digit yang merupakan kunci primer komposit:

| Komponen | Field | Panjang | Keterangan |
|----------|-------|---------|------------|
| Kode Provinsi | KD_PROPINSI | 2 digit | Kode BPS provinsi |
| Kode Kab/Kota | KD_DATI2 | 2 digit | Kode BPS kabupaten/kota |
| Kode Kecamatan | KD_KECAMATAN | 3 digit | Kode kecamatan |
| Kode Kelurahan | KD_KELURAHAN | 3 digit | Kode kelurahan/desa |
| Kode Blok | KD_BLOK | 3 digit | Kode blok kawasan |
| Nomor Urut | NO_URUT | 4 digit | Urutan OP dalam blok |
| Jenis OP | KD_JNS_OP | 1 digit | Jenis objek pajak |

Contoh: `35.17.010.001.001.0001.0`

##### B. Data Wajib Pajak (Subjek Pajak)

Data WP disimpan terpisah di tabel `dat_subjek_pajak` dan dihubungkan via `SUBJEK_PAJAK_ID`:

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| SUBJEK_PAJAK_ID | varchar(30) | Ya | ID unik wajib pajak |
| NM_WP | varchar(30) | Ya | Nama wajib pajak |
| JALAN_WP | text | Ya | Alamat jalan WP |
| BLOK_KAV_NO_WP | varchar | Tidak | Nomor blok/kavling WP |
| RW_WP | varchar | Tidak | RW alamat WP |
| RT_WP | varchar | Tidak | RT alamat WP |
| KELURAHAN_WP | varchar | Tidak | Kelurahan alamat WP |
| KOTA_WP | varchar | Tidak | Kota alamat WP |
| KD_POS_WP | varchar(5) | Tidak | Kode pos WP |
| TELP_WP | varchar | Tidak | Nomor telepon WP |
| NPWP | varchar | Tidak | NPWP wajib pajak |
| EMAIL_WP | varchar | Tidak | Alamat email WP |
| STATUS_PEKERJAAN_WP | varchar(1) | Ya | Kode pekerjaan WP |

> Satu `SUBJEK_PAJAK_ID` dapat dimiliki oleh banyak NOP (satu WP, banyak properti).

##### C. Data Lokasi Objek Pajak

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| JALAN_OP | varchar(100) | Ya | Nama jalan lokasi OP |
| BLOK_KAV_NO_OP | varchar(15) | Tidak | Nomor blok/kavling OP |
| RT_OP | varchar(3) | Tidak | RT lokasi OP |
| RW_OP | varchar(2) | Tidak | RW lokasi OP |
| KELURAHAN_OP | varchar(30) | Tidak | Kelurahan lokasi OP |

##### D. Data Tanah (Bumi)

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| LUAS_BUMI | bigint | Ya | Luas tanah dalam m² |
| JNS_BUMI | varchar(1) | Ya | Jenis/penggunaan tanah (dari ref_kategori) |
| NILAI_SISTEM_BUMI | bigint | Ya | Nilai total tanah dalam rupiah |
| KD_ZNT | varchar(2) | Tidak | Kode Zona Nilai Tanah |

##### E. Data Formulir & Transaksi

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| NO_FORMULIR_SPOP | varchar(50) | Tidak | Nomor formulir fisik SPOP |
| JNS_TRANSAKSI_OP | varchar(1) | Ya | Jenis transaksi (lihat tabel di bawah) |
| KD_STATUS_WP | varchar(1) | Ya | Status wajib pajak |
| TGL_PENDATAAN_OP | datetime | Ya | Tanggal pengisian SPOP |
| NM_PENDATAAN_OP | varchar(100) | Tidak | Nama petugas pendataan |
| NIP_PENDATA | varchar(40) | Tidak | NIP petugas pendataan |
| TGL_PEMERIKSAAN_OP | datetime | Ya | Tanggal pemeriksaan lapangan |
| NM_PEMERIKSAAN_OP | varchar(100) | Tidak | Nama pemeriksa |
| NIP_PEMERIKSA_OP | varchar(40) | Tidak | NIP pemeriksa |

##### F. Jenis Transaksi OP (`JNS_TRANSAKSI_OP`)

| Kode | Keterangan |
|------|------------|
| 1 | Perekaman (Pendaftaran baru) |
| 2 | Pemutakhiran (Update data) |
| 3 | Penghapusan |

##### G. Data OP Bersama (untuk properti dengan kepemilikan bersama / strata title)

Diisi jika objek pajak merupakan bagian dari properti induk bersama (mis: unit apartemen, ruko dalam satu kavling):

| Field | Keterangan |
|-------|------------|
| KD_PROPINSI_BERSAMA ... KD_JNS_OP_BERSAMA | NOP dari properti induk |
| LUAS_BUMI_BEBAN | Porsi luas tanah yang menjadi beban OP ini |
| LUAS_BNG_BEBAN | Porsi luas bangunan yang menjadi beban OP ini |
| NILAI_SISTEM_BUMI_BEBAN | Nilai tanah yang menjadi beban OP ini |
| NILAI_SISTEM_BNG_BEBAN | Nilai bangunan yang menjadi beban OP ini |

> Data ini disimpan di tabel `dat_op_anggota` dan `dat_op_induk`.

---

#### 4.3.2 Kalkulasi NJOP Tanah

**Formula:**

```
Nilai per m² = NILAI_SISTEM_BUMI ÷ LUAS_BUMI

→ Cocokkan nilai per m² ke tabel kelas_bumi:
  Cari baris di mana: NILAI_MINIMUM ≤ (nilai per m²) ≤ NILAI_MAKSIMUM
  → Dapatkan: KELAS_BUMI dan NJOP_BUMI (per m², dalam ribuan rupiah)

NJOP_BUMI_TOTAL = NJOP_BUMI × 1000 × LUAS_BUMI
```

**Contoh:**
- LUAS_BUMI = 200 m²
- NILAI_SISTEM_BUMI = Rp 500.000.000
- Nilai per m² = 500.000.000 ÷ 200 = Rp 2.500.000/m²
- Cocok ke kelas_bumi: KELAS_BUMI = "B", NJOP_BUMI = 2.400 (ribuan) = Rp 2.400.000/m²
- NJOP_BUMI_TOTAL = 2.400.000 × 200 = **Rp 480.000.000**

> NJOP_BUMI di database disimpan dalam satuan ribuan (÷1000 saat simpan, ×1000 saat baca).

---

#### 4.3.3 Alur Entry Data SPOP

```
1. Pilih mode: Baru (Perekaman) / Edit (Pemutakhiran) / Hapus
       |
2. Input NOP (18 digit) atau pilih dari peta wilayah
       |
3. Sistem memvalidasi:
   - Format NOP 18 digit
   - Jika Perekaman: NOP belum boleh ada di database
   - Jika Pemutakhiran: NOP harus sudah ada
   - Cek apakah NOP terdampak pemekaran wilayah
       |
4. Input / Edit SUBJEK_PAJAK_ID
   → Sistem otomatis memuat data WP dari dat_subjek_pajak
   → Jika ID baru: isi form data WP secara manual
       |
5. Input alamat lokasi objek pajak
       |
6. Input data tanah:
   - Luas Bumi (m²)
   - Jenis Bumi (dropdown dari ref_kategori)
   - Nilai Sistem Bumi (Rp)
   → Sistem otomatis menghitung dan menampilkan:
     - Kelas Bumi (dari kelas_bumi)
     - NJOP Bumi per m²
     - Total NJOP Bumi
       |
7. (Opsional) Input data OP Bersama jika properti strata title
       |
8. Input data petugas pendataan dan pemeriksaan
       |
9. Simpan
   → Sistem menyimpan ke tabel spop dan dat_subjek_pajak
   → Sistem memanggil insert_dhrd() untuk membuat record DHRD
   → Sistem mencatat di histori_sppt
```

---

#### 4.3.4 Kebutuhan Fungsional SPOP

| ID | Kebutuhan |
|----|-----------|
| SPOP-01 | Sistem harus menyediakan form SPOP yang mencakup semua field pada tabel A–G di atas |
| SPOP-02 | Sistem harus mendukung tiga jenis transaksi: Perekaman (baru), Pemutakhiran (edit), dan Penghapusan |
| SPOP-03 | Sistem harus memvalidasi NOP berformat tepat 18 digit sebelum menyimpan |
| SPOP-04 | Sistem harus mencegah Perekaman jika NOP sudah ada, dan mencegah Pemutakhiran jika NOP belum ada |
| SPOP-05 | Ketika SUBJEK_PAJAK_ID diinput, sistem harus otomatis memuat seluruh data WP dari `dat_subjek_pajak` |
| SPOP-06 | Sistem harus menampilkan daftar NOP lain yang dimiliki WP yang sama saat SUBJEK_PAJAK_ID diisi |
| SPOP-07 | Sistem harus menghitung dan menampilkan secara real-time: kelas bumi, NJOP per m², dan total NJOP bumi saat NILAI_SISTEM_BUMI atau LUAS_BUMI diubah |
| SPOP-08 | Sistem harus menyediakan dropdown Jenis Bumi yang terisi dari tabel referensi `ref_kategori` kategori "SPOP JENIS TANAH" |
| SPOP-09 | Sistem harus menyediakan dropdown Status WP yang terisi dari `ref_kategori` kategori "SPOP STATUS" |
| SPOP-10 | Sistem harus menyediakan dropdown Status Pekerjaan WP dari `ref_kategori` kategori "SPOP PEKERJAAN" |
| SPOP-11 | Sistem harus memeriksa apakah NOP terdampak pemekaran wilayah dan menampilkan notifikasi NOP baru |
| SPOP-12 | Sistem harus mendukung input OP Bersama (strata title) dengan mengisi NOP induk dan porsi luas/nilai yang menjadi beban |
| SPOP-13 | Setelah simpan, sistem harus otomatis memanggil prosedur pembentukan record DHRD |
| SPOP-14 | Sistem harus mendukung pencarian SPOP berdasarkan NOP, nama WP, SUBJEK_PAJAK_ID, dan alamat |
| SPOP-15 | Sistem harus mendukung pencetakan formulir SPOP |
| SPOP-16 | Sistem harus mencatat nama dan NIP petugas pendataan serta pemeriksa |
| SPOP-17 | Sistem harus menampilkan informasi SPPT Khusus (jenis_sppt) yang berlaku untuk NOP tersebut jika ada |

---

### 4.4 LSPOP (Lampiran Surat Pemberitahuan Objek Pajak)

**Deskripsi:** Lampiran SPOP yang memuat detail data setiap bangunan yang berdiri di atas objek pajak. Satu NOP dapat memiliki satu atau lebih bangunan. Nilai bangunan dihitung berdasarkan komponen material, fasilitas, dan jenis penggunaan bangunan melalui formula DBKB yang dieksekusi oleh stored procedure `cav_sismiop.HITUNG_BNG`.

---

#### 4.4.1 Struktur Data per Bangunan

##### A. Identitas Bangunan

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| NOP (KD_PROPINSI ... KD_JNS_OP) | komposit | Ya | FK ke SPOP |
| NO_BNG | int | Ya | Nomor urut bangunan dalam satu NOP (1, 2, 3, ...) |
| NO_FORMULIR_LSPOP | varchar(11) | Tidak | Nomor formulir fisik LSPOP |
| AKTIF | boolean | Ya | Status aktif/nonaktif bangunan |

##### B. Data Fisik Bangunan

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| LUAS_BNG | bigint | Ya | Luas bangunan dalam m² |
| JML_LANTAI_BNG | int | Ya | Jumlah lantai |
| THN_DIBANGUN_BNG | varchar(4) | Ya | Tahun dibangun (format: YYYY) |
| THN_RENOVASI_BNG | varchar(4) | Tidak | Tahun renovasi terakhir |
| KONDISI_BNG | varchar(1) | Tidak | Kondisi bangunan (kode dari ref_kategori) |
| JNS_KONSTRUKSI_BNG | varchar(1) | Tidak | Jenis konstruksi (beton, baja, kayu, dsb.) |
| KD_JPB | varchar(2) | Ya | Kode Jenis Penggunaan Bangunan (lihat tabel) |

##### C. Komponen Material Bangunan

| Field | Keterangan |
|-------|------------|
| JNS_ATAP_BNG | Jenis atap (kode dari ref_kategori "LSPOP JENIS ATAP") |
| KD_DINDING | Material dinding (kode dari ref_kategori "LSPOP DINDING") |
| KD_LANTAI | Material lantai (kode dari ref_kategori "LSPOP LANTAI") |
| KD_LANGIT_LANGIT | Material plafon/langit-langit |

##### D. Data Nilai Bangunan

| Field | Tipe | Keterangan |
|-------|------|------------|
| NILAI_SISTEM_BNG | bigint | Nilai bangunan hasil kalkulasi formula DBKB (otomatis) |
| NILAI_FORMULA | bigint | Nilai antara hasil formula sebelum dibulatkan |
| NILAI_INDIVIDU | bigint | Nilai manual yang menggantikan NILAI_SISTEM_BNG jika diisi (>0) |

##### E. Data Petugas

| Field | Keterangan |
|-------|------------|
| TGL_PENDATAAN_BNG | Tanggal pengisian LSPOP |
| NM_PENDATAAN_OP | Nama petugas pendataan |
| NIP_PENDATA_BNG | NIP petugas pendataan |
| TGL_PEMERIKSAAN_BNG | Tanggal pemeriksaan bangunan |
| NM_PEMERIKSAAN_OP | Nama pemeriksa |
| NIP_PEMERIKSA_BNG | NIP pemeriksa |
| TGL_KUNJUNGAN_KEMBALI | Jadwal kunjungan ulang jika diperlukan |

---

#### 4.4.2 Jenis Penggunaan Bangunan (KD_JPB)

Setiap bangunan dikategorikan berdasarkan fungsi/penggunaannya. Setiap jenis memiliki parameter tambahan yang berbeda:

| Kode | Nama Penggunaan | Parameter Tambahan |
|------|-----------------|--------------------|
| 01 | Rumah Tinggal | Tidak ada parameter tambahan khusus |
| 02 | Toko / Ruko / Ruang Kantor | KLS_JPB2 (kelas, dari tabel "JPB2 JPB9 KELAS") |
| 03 | Pabrik / Gudang Industri | TING_KOLOM_JPB3 (tinggi kolom, cm), LBR_BENT_JPB3 (lebar bentang, cm), DAYA_DUKUNG_LANTAI_JPB3 (kg/m²), KELILING_DINDING_JPB3 (m), LUAS_MEZZANINE_JPB3 (m²) |
| 04 | Apartemen / Flat | KLS_JPB4 (kelas) |
| 05 | Hotel / Penginapan | KLS_JPB5 (kelas) |
| 06 | Parkir / Garasi Komersial | KLS_JPB6 (kelas) |
| 07 | Hotel Berbintang | JNS_JPB7 (jenis), BINTANG_JPB7 (jumlah bintang), JML_KMR_JPB7 (jumlah kamar), LUAS_KMR_JPB7_DGN_AC_SENT (luas kamar ber-AC sentral, m²), LUAS_KMR_LAIN_JPB7_DGN_AC_SENT (luas kamar lain ber-AC, m²) |
| 08–12 | Jenis lainnya | Sesuai ketentuan DBKB |
| 13 | Fasilitas Olahraga / Rekreasi | KLS_JPB13 (kelas), kuantitas, luas ber-AC |
| 14–15 | Jenis lainnya | Sesuai ketentuan DBKB |
| 16 | Fasilitas Olahraga Khusus | KLS_JPB16 (kelas) |

---

#### 4.4.3 Fasilitas Bangunan

Setiap bangunan dapat memiliki fasilitas tambahan yang meningkatkan nilai NJOP. Fasilitas disimpan di tabel `dat_fasilitas_bangunan` dengan referensi ke tabel master `fasilitas`.

##### Struktur `dat_fasilitas_bangunan`:

| Field | Keterangan |
|-------|------------|
| NOP + NO_BNG | Kunci FK ke bangunan |
| KD_FASILITAS | Kode fasilitas (FK ke tabel `fasilitas`) |
| JML_SATUAN | Jumlah/kuantitas fasilitas |

##### Struktur tabel master `fasilitas`:

| Field | Keterangan |
|-------|------------|
| KD_FASILITAS | Kode unik fasilitas |
| NM_FASILITAS | Nama fasilitas |
| SATUAN_FASILITAS | Satuan (unit, buah, m², kVA, dsb.) |
| NILAI_FASILITAS | Nilai kontribusi per satuan terhadap NJOP |
| STATUS_FASILITAS | Status aktif/nonaktif |
| KETERGANTUNGAN | Flag ketergantungan antar fasilitas |

##### Daftar Fasilitas yang Didukung:

| Kategori | Fasilitas | Satuan Input |
|----------|-----------|--------------|
| **Listrik & Infrastruktur** | Daya listrik | kVA |
| | Sumur artesis | unit |
| **Pendingin Udara** | AC split | unit |
| | AC windows | unit |
| | AC sentral | ada/tidak (checkbox) |
| **Kolam Renang** | Kolam renang diplester | unit |
| | Kolam renang berlapis | unit |
| **Perkerasan Jalan Internal** | Perkerasan ringan | m² |
| | Perkerasan sedang | m² |
| | Perkerasan berat | m² |
| | Perkerasan penutup (overlay) | m² |
| **Lapangan Tenis** | Beton 1 lampu | lapangan |
| | Aspal 1 lampu | lapangan |
| | Tanah liat 1 lampu | lapangan |
| | Beton tanpa lampu | lapangan |
| | Aspal tanpa lampu | lapangan |
| | Tanah liat tanpa lampu | lapangan |
| | (varian L = dengan lampu tambahan) | lapangan |
| **Lift & Eskalator** | Lift penumpang | unit |
| | Lift kapsul | unit |
| | Lift barang | unit |
| | Eskalator < 8m | unit |
| | Eskalator ≥ 8m | unit |
| **Pagar** | Pagar baja | m |
| | Pagar bata | m |
| **Pemadam Kebakaran** | Hidran | ada/tidak |
| | Sprinkler | ada/tidak |
| | Fire alarm | ada/tidak |
| **Telekomunikasi** | Jalur telepon PABX | saluran |

---

#### 4.4.4 Kalkulasi NJOP Bangunan

##### A. Nilai Sistem (NILAI_SISTEM_BNG)

Nilai bangunan dihitung secara otomatis menggunakan stored procedure `cav_sismiop.HITUNG_BNG` di database terpisah `cav_sismiop`. Formula ini merupakan implementasi DBKB (Daftar Biaya Komponen Bangunan) resmi.

```
Input ke stored procedure:
  - Identitas NOP (KD_PROPINSI, KD_DATI2, ... KD_JNS_OP)
  - NO_BNG (nomor bangunan)
  - KD_JPB (jenis penggunaan bangunan)
  - LUAS_BNG (luas dalam m²)
  - JML_LANTAI_BNG (jumlah lantai)
  - Tahun (tahun pajak berjalan)
  - Komponen material: atap, dinding, lantai, plafon, konstruksi
  - Fasilitas: AC, lift, kolam, pagar, dsb.
  - Parameter khusus per JPB (tinggi kolom, kelas, jumlah bintang, dsb.)

Output:
  - NILAI_SISTEM_BNG (nilai total bangunan dalam rupiah)
```

Sebelum memanggil HITUNG_BNG, sistem memanggil `cav_sismiop.insert(...)` untuk mempersiapkan data bangunan di database perhitungan.

##### B. Nilai Individu (NILAI_INDIVIDU)

Jika NILAI_INDIVIDU > 0, maka nilai ini digunakan **menggantikan** NILAI_SISTEM_BNG untuk kalkulasi NJOP bangunan. Digunakan ketika:
- Nilai hasil formula DBKB dianggap tidak wajar
- Terdapat penilaian khusus dari penilai bersertifikat
- Objek pajak memiliki karakteristik unik yang tidak ter-cover formula

##### C. Penentuan Kelas dan NJOP Bangunan

```
Nilai yang digunakan = NILAI_INDIVIDU jika > 0, selainnya NILAI_SISTEM_BNG

Nilai per m² = Nilai yang digunakan ÷ LUAS_BNG

→ Cocokkan ke tabel kelas_bangunan:
  Cari baris di mana: NILAI_MINIMUM ≤ (nilai per m²) ≤ NILAI_MAKSIMUM
  → Dapatkan: KELAS_BANGUNAN dan NJOP_BANGUNAN (per m², dalam ribuan)

NJOP_BNG_TOTAL = NJOP_BANGUNAN × 1000 × LUAS_BNG
```

##### D. Agregasi Semua Bangunan

```
NJOP_BNG_SPPT = Σ NJOP_BNG_TOTAL dari semua bangunan dengan AKTIF = true
```

Bangunan yang di-nonaktifkan (AKTIF = false) tidak ikut dalam perhitungan NJOP.

---

#### 4.4.5 Alur Entry Data LSPOP

```
1. Pilih NOP dari daftar atau input manual
   → Sistem memuat daftar bangunan yang sudah ada untuk NOP tersebut
       |
2. Tambah bangunan baru atau pilih bangunan yang akan diedit
       |
3. Input data fisik bangunan:
   - Luas bangunan (m²)
   - Jumlah lantai
   - Tahun dibangun / renovasi
   - Kondisi bangunan
   - Jenis konstruksi
       |
4. Pilih Jenis Penggunaan Bangunan (KD_JPB)
   → Sistem menampilkan form tambahan sesuai JPB yang dipilih:
     JPB 01: tidak ada tambahan
     JPB 02: input kelas
     JPB 03: input tinggi kolom, lebar bentang, daya dukung
     JPB 07: input bintang, jumlah kamar, luas kamar ber-AC
     dst.
       |
5. Pilih komponen material:
   - Jenis atap
   - Material dinding
   - Material lantai
   - Material plafon
       |
6. Input fasilitas bangunan:
   - Sistem menampilkan daftar semua fasilitas
   - User mengisi kuantitas per fasilitas (0 = tidak ada)
       |
7. Sistem menghitung NILAI_SISTEM_BNG secara otomatis:
   → Panggil cav_sismiop.insert(...)
   → Panggil cav_sismiop.HITUNG_BNG(...)
   → Tampilkan: Kelas Bangunan, NJOP per m², Total NJOP Bangunan
       |
8. (Opsional) Override dengan NILAI_INDIVIDU jika diperlukan
   → Sistem menghitung ulang kelas dan NJOP berdasarkan nilai individu
       |
9. Input data petugas pendataan dan pemeriksaan
       |
10. Simpan bangunan
    → Data tersimpan di lspop dan dat_fasilitas_bangunan
    → Sistem memperbarui total NJOP bangunan untuk NOP tersebut
       |
11. Ulangi langkah 2–10 untuk bangunan berikutnya (jika ada)
       |
12. Nonaktifkan bangunan yang sudah tidak ada (ubah AKTIF = false)
    → Bangunan tidak dihapus dari database, hanya ditandai nonaktif
```

---

#### 4.4.6 Kebutuhan Fungsional LSPOP

| ID | Kebutuhan |
|----|-----------|
| LSPOP-01 | Sistem harus mendukung pendataan satu atau lebih bangunan per NOP dengan nomor urut bangunan (NO_BNG) |
| LSPOP-02 | Sistem harus menampilkan daftar bangunan yang sudah ada untuk suatu NOP beserta status aktif dan NJOP masing-masing |
| LSPOP-03 | Sistem harus menyediakan dropdown Jenis Penggunaan Bangunan (KD_JPB) dengan 16 jenis sesuai standar DBKB |
| LSPOP-04 | Sistem harus menampilkan form input parameter tambahan yang berbeda-beda sesuai KD_JPB yang dipilih |
| LSPOP-05 | Sistem harus menyediakan dropdown komponen material: atap, dinding, lantai, plafon, jenis konstruksi |
| LSPOP-06 | Sistem harus menyediakan form input fasilitas bangunan mencakup seluruh 30+ jenis fasilitas pada tabel 4.4.3 |
| LSPOP-07 | Sistem harus menghitung NILAI_SISTEM_BNG secara otomatis dengan memanggil stored procedure `cav_sismiop.HITUNG_BNG` |
| LSPOP-08 | Sistem harus menampilkan secara real-time: kelas bangunan, NJOP per m², dan total NJOP bangunan setelah kalkulasi |
| LSPOP-09 | Sistem harus mendukung input NILAI_INDIVIDU sebagai override nilai sistem, dengan indikator visual bahwa nilai manual sedang digunakan |
| LSPOP-10 | Sistem harus mendukung menonaktifkan bangunan (soft-delete: ubah AKTIF = false) tanpa menghapus data historis |
| LSPOP-11 | Sistem harus menghitung dan menampilkan total NJOP bangunan dari semua bangunan berstatus aktif pada satu NOP |
| LSPOP-12 | Sistem harus mencatat nama dan NIP petugas pendataan dan pemeriksa per bangunan |
| LSPOP-13 | Sistem harus mendukung pencetakan formulir LSPOP per bangunan |
| LSPOP-14 | Bangunan yang dihapus fisik harus diizinkan hanya oleh pengguna dengan hak akses khusus, dengan konfirmasi |
| LSPOP-15 | Sistem harus menjaga integritas referensial: bangunan tidak dapat dihapus jika masih ada referensi di SPPT aktif |

---

#### 4.4.7 Hubungan SPOP ↔ LSPOP ↔ SPPT

```
spop (1) ──────────────── (N) lspop (dat_op_bangunan)
  │  NOP = PK komposit         │  NOP + NO_BNG = PK
  │                            │
  │                            └──── (N) dat_fasilitas_bangunan
  │                                       NOP + NO_BNG + KD_FASILITAS
  │
  └── Data tanah (LUAS_BUMI, NILAI_SISTEM_BUMI)
        ↓ klasifikasi ke kelas_bumi
        → NJOP_BUMI

  lspop (semua bangunan aktif)
        ↓ kalkulasi via cav_sismiop.HITUNG_BNG
        → NJOP_BNG per bangunan
        → Σ NJOP_BNG semua bangunan aktif

  NJOP_TOTAL = NJOP_BUMI + Σ NJOP_BNG
        ↓
  sppt (ketetapan pajak tahunan)
        PBB = f(NJOP_TOTAL, NJOPTKP, tarif, pengurangan)
```

---

### 4.5 Pembayaran

**Deskripsi:** Modul pencatatan dan pengelolaan pembayaran pajak.

| ID | Kebutuhan |
|----|-----------|
| PAY-01 | Sistem harus dapat mencatat pembayaran SPPT dengan informasi: NOP, tahun pajak, tanggal bayar, jumlah bayar, channel pembayaran, nomor referensi/bukti bayar |
| PAY-02 | Sistem harus memvalidasi bahwa jumlah bayar sesuai dengan nominal SPPT yang harus dibayar |
| PAY-03 | Sistem harus memperbarui status pembayaran SPPT secara otomatis setelah pembayaran tercatat |
| PAY-04 | Sistem harus mendukung pembayaran tunggakan (pembayaran tahun sebelumnya) |
| PAY-05 | Sistem harus menghitung dan menampilkan denda keterlambatan pembayaran berdasarkan aturan yang berlaku |
| PAY-06 | Sistem harus dapat mencetak bukti pembayaran / struk |
| PAY-07 | Sistem harus mencatat nama petugas yang melakukan input pembayaran |
| PAY-08 | Sistem harus mendukung pencarian riwayat pembayaran berdasarkan NOP, nama WP, atau periode |
| PAY-09 | Sistem harus mendukung pembatalan pembayaran oleh pengguna dengan hak akses khusus, dengan alasan yang dicatat |
| PAY-10 | Sistem harus mendukung rekonsiliasi data pembayaran |
| PAY-11 | Sistem harus menampilkan status SPPT: belum bayar, sudah bayar, kurang bayar, lebih bayar |

---

### 4.6 Peta

**Deskripsi:** Visualisasi geospasial objek pajak pada peta.

| ID | Kebutuhan |
|----|-----------|
| MAP-01 | Sistem harus menampilkan peta interaktif yang menunjukkan lokasi objek pajak |
| MAP-02 | Sistem harus mendukung panning, zooming, dan pencarian lokasi pada peta |
| MAP-03 | Sistem harus menampilkan informasi objek pajak ketika pengguna mengklik titik/poligon di peta |
| MAP-04 | Peta harus dapat difilter berdasarkan kecamatan, kelurahan, atau blok |
| MAP-05 | Sistem harus menampilkan status pembayaran objek pajak dengan warna berbeda pada peta |
| MAP-06 | Sistem harus mendukung import data koordinat dari file GeoJSON atau SHP |
| MAP-07 | Sistem harus mendukung overlay batas wilayah administratif (kecamatan, kelurahan, blok) |
| MAP-08 | Sistem harus menyediakan fungsi untuk menghubungkan NOP dengan koordinat/poligon di peta |

---

### 4.7 Dashboard

**Deskripsi:** Halaman utama yang menampilkan ringkasan dan indikator kinerja sistem secara real-time.

| ID | Kebutuhan |
|----|-----------|
| DASH-01 | Dashboard harus menampilkan total objek pajak terdaftar |
| DASH-02 | Dashboard harus menampilkan total ketetapan PBB tahun berjalan (total SPPT) |
| DASH-03 | Dashboard harus menampilkan realisasi pembayaran (jumlah dan persentase terhadap ketetapan) untuk tahun berjalan |
| DASH-04 | Dashboard harus menampilkan total tunggakan (kumulatif tahun-tahun sebelumnya) |
| DASH-05 | Dashboard harus menampilkan grafik tren pembayaran per bulan |
| DASH-06 | Dashboard harus menampilkan distribusi objek pajak per kecamatan |
| DASH-07 | Dashboard harus menampilkan jumlah berkas pelayanan: masuk, diproses, selesai, untuk hari/bulan ini |
| DASH-08 | Dashboard harus menampilkan SPPT yang belum dicetak |
| DASH-09 | Dashboard harus dapat difilter berdasarkan tahun pajak |
| DASH-10 | Data dashboard harus dapat di-refresh secara manual atau otomatis pada interval tertentu |

---

### 4.8 Cetak SPPT

**Deskripsi:** Modul untuk mencetak SPPT (Surat Pemberitahuan Pajak Terutang) secara individual maupun massal.

| ID | Kebutuhan |
|----|-----------|
| SPPT-01 | Sistem harus mendukung pencetakan SPPT per NOP secara individual |
| SPPT-02 | Sistem harus mendukung pencetakan SPPT secara massal dengan filter: provinsi, kabupaten/kota, kecamatan, kelurahan, blok, RT/RW |
| SPPT-03 | Sistem harus mendukung beberapa jenis/format SPPT: Normal, Kelompok, Kolektif, Khusus |
| SPPT-04 | Sistem harus menampilkan pratinjau SPPT sebelum dicetak |
| SPPT-05 | Sistem harus menandai SPPT yang sudah dicetak (status cetak) dan mencatat tanggal cetak |
| SPPT-06 | SPPT yang sudah dicetak harus dapat dicetak ulang dengan konfirmasi |
| SPPT-07 | Sistem harus mendukung penyertaan QR Code pada SPPT yang memuat informasi: NOP, nama WP, tahun pajak, jumlah bayar |
| SPPT-08 | Sistem harus mendukung penyertaan barcode pada SPPT |
| SPPT-09 | Sistem harus mendukung penyertaan tanda tangan digital (gambar) pejabat yang berwenang |
| SPPT-10 | Sistem harus menampilkan progress ketika mencetak massal |
| SPPT-11 | Sistem harus dapat mencetak SPPT ke file PDF |
| SPPT-12 | Sistem harus dapat memilih tahun pajak yang akan dicetak |
| SPPT-13 | Sistem harus mendukung filter pencetakan berdasarkan jenis SPPT dan status cetak (belum cetak / sudah cetak) |

---

### 4.9 Tunggakan OP

**Deskripsi:** Menampilkan dan mengelola daftar objek pajak yang memiliki tunggakan (SPPT yang belum dibayar dari tahun sebelumnya).

| ID | Kebutuhan |
|----|-----------|
| TNG-01 | Sistem harus menampilkan daftar NOP yang memiliki tunggakan beserta total nilai tunggakan |
| TNG-02 | Sistem harus menampilkan rincian tunggakan per tahun pajak untuk setiap NOP |
| TNG-03 | Sistem harus dapat memfilter tunggakan berdasarkan wilayah (kecamatan, kelurahan), tahun, dan rentang nilai |
| TNG-04 | Sistem harus menghitung denda keterlambatan secara otomatis |
| TNG-05 | Sistem harus mendukung ekspor daftar tunggakan ke format Excel atau PDF |
| TNG-06 | Sistem harus menampilkan total tunggakan per kecamatan/kelurahan sebagai ringkasan |
| TNG-07 | Sistem harus mendukung cetak surat tagihan tunggakan |

---

### 4.10 Info OP (Informasi Objek Pajak)

**Deskripsi:** Menampilkan informasi lengkap suatu objek pajak berdasarkan NOP.

| ID | Kebutuhan |
|----|-----------|
| INFO-01 | Sistem harus dapat menampilkan informasi lengkap OP berdasarkan pencarian NOP |
| INFO-02 | Informasi yang ditampilkan meliputi: data SPOP (nama WP, alamat WP, alamat OP, luas tanah), data bangunan (per bangunan), nilai NJOP, nilai SPPT tahun berjalan dan historis |
| INFO-03 | Sistem harus menampilkan status pembayaran untuk setiap tahun pajak |
| INFO-04 | Sistem harus menampilkan riwayat perubahan data OP |
| INFO-05 | Sistem harus mendukung pencarian OP berdasarkan nama WP, alamat, atau NOP sebagian |
| INFO-06 | Pengguna harus dapat mencetak kartu informasi OP dari modul ini |
| INFO-07 | Sistem harus menampilkan foto objek pajak jika tersedia |

---

### 4.11 Laporan

#### 4.11.1 Laporan Pembayaran

| ID | Kebutuhan |
|----|-----------|
| LAP-PAY-01 | Sistem harus menghasilkan laporan pembayaran yang dapat difilter berdasarkan: periode (harian, bulanan, tahunan), wilayah, dan channel pembayaran |
| LAP-PAY-02 | Laporan harus menampilkan: NOP, nama WP, tahun pajak, tanggal bayar, jumlah bayar, nomor referensi, petugas |
| LAP-PAY-03 | Laporan harus menyajikan subtotal per kelurahan/kecamatan dan total keseluruhan |
| LAP-PAY-04 | Sistem harus mendukung ekspor laporan ke PDF dan Excel |

#### 4.11.2 Laporan Realisasi Pembayaran

| ID | Kebutuhan |
|----|-----------|
| LAP-REAL-01 | Sistem harus menghasilkan laporan realisasi yang membandingkan ketetapan vs pembayaran |
| LAP-REAL-02 | Laporan harus menampilkan: total ketetapan, total pembayaran, sisa tunggakan, persentase realisasi |
| LAP-REAL-03 | Laporan harus dapat di-breakdown per kecamatan dan kelurahan |
| LAP-REAL-04 | Sistem harus mendukung pilihan periode laporan (bulanan, tahunan) |

#### 4.11.3 Laporan Kurang/Lebih Bayar

| ID | Kebutuhan |
|----|-----------|
| LAP-KLB-01 | Sistem harus menampilkan daftar objek pajak yang pembayarannya kurang dari nilai SPPT |
| LAP-KLB-02 | Sistem harus menampilkan daftar objek pajak yang pembayarannya lebih dari nilai SPPT |
| LAP-KLB-03 | Laporan harus mencantumkan selisih antara jumlah dibayar dan jumlah SPPT |

#### 4.11.4 Laporan Tunggakan

| ID | Kebutuhan |
|----|-----------|
| LAP-TNG-01 | Sistem harus menghasilkan laporan tunggakan per tahun pajak |
| LAP-TNG-02 | Laporan harus dapat di-breakdown per kecamatan, kelurahan, dan blok |
| LAP-TNG-03 | Laporan harus mencakup: jumlah OP tunggak, total nilai tunggakan, dan persentase terhadap ketetapan |

#### 4.11.5 Laporan Mutasi

**Deskripsi:** Laporan mengenai perubahan kepemilikan atau data objek pajak.

| ID | Kebutuhan |
|----|-----------|
| LAP-MUT-01 | Sistem harus menghasilkan laporan mutasi yang mencatat semua perubahan pada data WP atau OP |
| LAP-MUT-02 | Laporan harus memuat: NOP, jenis mutasi, data lama, data baru, tanggal mutasi, petugas |
| LAP-MUT-03 | Laporan harus dapat difilter berdasarkan jenis mutasi dan periode waktu |

#### 4.11.6 Laporan Pengurangan

**Deskripsi:** Laporan objek pajak yang mendapatkan pengurangan PBB.

| ID | Kebutuhan |
|----|-----------|
| LAP-PNG-01 | Sistem harus menghasilkan laporan pengurangan yang memuat: NOP, nama WP, nilai SPPT asal, persentase pengurangan, nilai setelah pengurangan, dasar pengurangan |
| LAP-PNG-02 | Laporan harus dapat difilter berdasarkan tahun pajak dan wilayah |
| LAP-PNG-03 | Laporan harus menampilkan total nilai pengurangan yang diberikan |

#### 4.11.7 Laporan Penyalinan

**Deskripsi:** Laporan mengenai proses penyalinan / duplikasi SPPT.

| ID | Kebutuhan |
|----|-----------|
| LAP-SAL-01 | Sistem harus mencatat dan melaporkan semua transaksi penyalinan SPPT |
| LAP-SAL-02 | Laporan harus memuat: NOP, tahun pajak, tanggal penyalinan, petugas |

#### 4.11.8 Laporan Pembatalan

**Deskripsi:** Laporan SPPT yang dibatalkan.

| ID | Kebutuhan |
|----|-----------|
| LAP-BTL-01 | Sistem harus menghasilkan laporan SPPT yang dibatalkan dengan alasan pembatalan |
| LAP-BTL-02 | Laporan harus memuat: NOP, tahun pajak, nilai SPPT, tanggal pembatalan, alasan, petugas |

#### 4.11.9 Laporan Pembetulan

**Deskripsi:** Laporan SPPT yang mengalami pembetulan data.

| ID | Kebutuhan |
|----|-----------|
| LAP-PBT-01 | Sistem harus menghasilkan laporan pembetulan yang menunjukkan perubahan data SPPT |
| LAP-PBT-02 | Laporan harus mencantumkan data sebelum dan sesudah pembetulan |

#### 4.11.10 Laporan Keberatan

**Deskripsi:** Laporan pengajuan keberatan dari wajib pajak.

| ID | Kebutuhan |
|----|-----------|
| LAP-KBT-01 | Sistem harus menghasilkan laporan keberatan yang memuat: NOP, nama WP, tanggal pengajuan, jenis keberatan, status keberatan (diproses/selesai/ditolak) |
| LAP-KBT-02 | Laporan harus mencantumkan hasil keputusan keberatan jika sudah diputuskan |

#### 4.11.11 Laporan Jumlah Pembayaran

**Deskripsi:** Laporan agregasi jumlah pembayaran dalam format ringkasan.

| ID | Kebutuhan |
|----|-----------|
| LAP-JML-01 | Sistem harus menghasilkan laporan jumlah (count) SPPT yang sudah/belum dibayar per wilayah |
| LAP-JML-02 | Laporan harus menampilkan nilai rupiah total dan jumlah objek per kategori status pembayaran |

#### 4.11.12 Laporan Khusus

**Deskripsi:** Laporan untuk objek pajak dengan tarif/perlakuan khusus.

| ID | Kebutuhan |
|----|-----------|
| LAP-KHS-01 | Sistem harus menghasilkan laporan khusus untuk objek pajak yang mendapat tarif khusus |
| LAP-KHS-02 | Laporan harus memuat detail perlakuan khusus yang diberikan dan dasar hukumnya |

#### 4.11.13 Laporan DHKP Perubahan

**Deskripsi:** Laporan perubahan dalam Daftar Himpunan Ketetapan Pajak.

| ID | Kebutuhan |
|----|-----------|
| LAP-DHKP-01 | Sistem harus menghasilkan laporan DHKP Perubahan yang mencatat semua perubahan ketetapan dalam periode tertentu |
| LAP-DHKP-02 | Laporan harus dikelompokkan per kecamatan dan kelurahan |
| LAP-DHKP-03 | Laporan harus menampilkan total ketetapan awal, perubahan, dan ketetapan akhir |

#### 4.11.14 Laporan DHR (Daftar Himpunan Realisasi)

| ID | Kebutuhan |
|----|-----------|
| LAP-DHR-01 | Sistem harus menghasilkan DHR yang merangkum realisasi pembayaran per wilayah |
| LAP-DHR-02 | DHR harus dapat dicetak dan diekspor ke PDF dan Excel |
| LAP-DHR-03 | DHR harus dikelompokkan per kecamatan dan kelurahan dengan subtotal |

#### 4.11.15 Laporan Penetapan

**Deskripsi:** Laporan ketetapan PBB (DHKP) yang menunjukkan seluruh objek pajak dan nilai ketetapannya.

| ID | Kebutuhan |
|----|-----------|
| LAP-PNT-01 | Sistem harus menghasilkan laporan penetapan yang memuat semua SPPT per wilayah dengan nilai ketetapan |
| LAP-PNT-02 | Laporan harus dikelompokkan per kecamatan, kelurahan, dan blok |
| LAP-PNT-03 | Laporan harus menampilkan total ketetapan per wilayah |
| LAP-PNT-04 | Laporan harus dapat dicetak sebagai DHKP resmi |

---

### 4.12 DHKP (Daftar Himpunan Ketetapan Pajak)

**Deskripsi:** Dokumen resmi yang memuat seluruh ketetapan pajak dalam satu periode, dikelompokkan per wilayah.

| ID | Kebutuhan |
|----|-----------|
| DHKP-01 | Sistem harus menghasilkan DHKP untuk tahun pajak yang dipilih |
| DHKP-02 | DHKP harus memuat: nomor urut, NOP, nama WP, alamat OP, luas tanah, luas bangunan, NJOP, nilai PBB terutang |
| DHKP-03 | DHKP harus dapat difilter dan dicetak per kecamatan dan kelurahan |
| DHKP-04 | Sistem harus menyediakan halaman cover DHKP dengan informasi instansi dan pejabat berwenang |
| DHKP-05 | Sistem harus mendukung DHKP dalam beberapa varian: Awal (ketetapan pertama), Perubahan (setelah ada pembetulan), Pembatalan |
| DHKP-06 | Sistem harus mendukung cetak DHKP ke PDF |
| DHKP-07 | Sistem harus mendukung ekspor DHKP ke Excel |
| DHKP-08 | Sistem harus menyediakan DHKP Rekap (ringkasan per kelurahan/kecamatan) |

---

### 4.13 Klasifikasi Kelas Bumi/Bangunan

**Deskripsi:** Mengelola tabel klasifikasi yang digunakan untuk menentukan NJOP berdasarkan nilai properti.

#### 4.13.1 Kelas Bumi

| ID | Kebutuhan |
|----|-----------|
| KLS-BUM-01 | Sistem harus menampilkan daftar kelas bumi (tanah) yang berisi: kode kelas, nilai minimum NJOP per m², nilai maksimum NJOP per m², nilai NJOP yang digunakan |
| KLS-BUM-02 | Pengguna harus dapat menambah, mengedit, dan menghapus kelas bumi |
| KLS-BUM-03 | Sistem harus memvalidasi bahwa rentang nilai antar kelas tidak tumpang tindih |
| KLS-BUM-04 | Perubahan kelas bumi harus memperbarui nilai NJOP bumi pada SPPT yang menggunakannya (atau ditandai untuk recalculate) |
| KLS-BUM-05 | Sistem harus mendukung pencarian kelas bumi berdasarkan rentang nilai |

#### 4.13.2 Kelas Bangunan

| ID | Kebutuhan |
|----|-----------|
| KLS-BNG-01 | Sistem harus menampilkan daftar kelas bangunan yang berisi: kode kelas, nilai minimum NJOP per m², nilai maksimum NJOP per m², nilai NJOP yang digunakan |
| KLS-BNG-02 | Pengguna harus dapat menambah, mengedit, dan menghapus kelas bangunan |
| KLS-BNG-03 | Sistem harus memvalidasi konsistensi rentang nilai antar kelas |

---

### 4.14 Referensi

**Deskripsi:** Mengelola data referensi/master data wilayah administratif yang digunakan di seluruh sistem.

| ID | Kebutuhan |
|----|-----------|
| REF-01 | Sistem harus mengelola data provinsi (kode, nama) |
| REF-02 | Sistem harus mengelola data kabupaten/kota (kode, nama, kode provinsi) |
| REF-03 | Sistem harus mengelola data kecamatan (kode, nama, kode kabupaten) |
| REF-04 | Sistem harus mengelola data kelurahan/desa (kode, nama, kode kecamatan) |
| REF-05 | Sistem harus mengelola data blok (kode, nama, kode kelurahan) |
| REF-06 | Sistem harus mengelola data status PBB (kode pengurangan/pembebasan dan persentasenya) |
| REF-07 | Setiap tabel referensi harus mendukung operasi CRUD (Create, Read, Update, Delete) |
| REF-08 | Penghapusan data referensi yang sedang digunakan harus dicegah dengan pesan error |
| REF-09 | Sistem harus mendukung impor data referensi dari file Excel atau CSV |

---

### 4.15 Pengguna

**Deskripsi:** Mengelola akun pengguna sistem.

| ID | Kebutuhan |
|----|-----------|
| USR-01 | Administrator harus dapat melihat daftar semua pengguna sistem |
| USR-02 | Administrator harus dapat membuat akun pengguna baru dengan informasi: username, password, NIP, nama lengkap, jabatan, group akses |
| USR-03 | Administrator harus dapat mengedit informasi pengguna |
| USR-04 | Administrator harus dapat menonaktifkan (bukan menghapus) akun pengguna |
| USR-05 | Administrator harus dapat mereset password pengguna |
| USR-06 | Sistem harus memvalidasi keunikan username |
| USR-07 | Sistem harus mencatat log aktivitas penting setiap pengguna |
| USR-08 | Pengguna harus dapat mengubah password sendiri (setelah memasukkan password lama) |
| USR-09 | Sistem harus mendukung penetapan wilayah kerja per pengguna (pembatasan akses berdasarkan kecamatan) |

---

### 4.16 Group (Grup Akses)

**Deskripsi:** Mengelola grup/peran yang menentukan hak akses pengguna ke fitur-fitur sistem.

| ID | Kebutuhan |
|----|-----------|
| GRP-01 | Administrator harus dapat membuat group akses baru dengan nama dan deskripsi |
| GRP-02 | Administrator harus dapat menentukan hak akses per group: modul mana yang dapat diakses, operasi apa (baca, tulis, hapus, cetak) yang diizinkan |
| GRP-03 | Sistem harus mendukung hierarki izin (fitur tertentu hanya dapat diakses group tertentu) |
| GRP-04 | Administrator harus dapat menetapkan pengguna ke group |
| GRP-05 | Satu pengguna hanya boleh berada di satu group pada satu waktu |
| GRP-06 | Sistem harus menampilkan daftar pengguna per group |
| GRP-07 | Perubahan hak akses group harus berlaku segera (sesi aktif pengguna diperbarui pada request berikutnya) |
| GRP-08 | Sistem harus memiliki group default yang tidak dapat dihapus: Administrator dan Operator |

---

### 4.17 Konfigurasi

**Deskripsi:** Mengelola pengaturan sistem yang memengaruhi perhitungan pajak dan tampilan dokumen.

| ID | Kebutuhan |
|----|-----------|
| CFG-01 | Sistem harus memungkinkan konfigurasi informasi instansi: nama dinas, nama kabupaten/kota, logo, nama kepala dinas, NIP kepala dinas |
| CFG-02 | Sistem harus memungkinkan konfigurasi tarif PBB: tarif normal (persentase), tarif kondisional minimum dan maksimum, ambang batas kondisional |
| CFG-03 | Sistem harus memungkinkan konfigurasi NJOPTKP per tahun |
| CFG-04 | Sistem harus memungkinkan konfigurasi nilai PBB minimum yang harus dibayar |
| CFG-05 | Sistem harus memungkinkan konfigurasi tanggal jatuh tempo pembayaran SPPT |
| CFG-06 | Sistem harus memungkinkan konfigurasi apakah NJOPTKP hanya berlaku jika ada bangunan aktif |
| CFG-07 | Sistem harus memungkinkan upload tanda tangan digital pejabat (untuk dicetak di SPPT) |
| CFG-08 | Sistem harus memungkinkan konfigurasi koneksi database |
| CFG-09 | Setiap perubahan konfigurasi harus dicatat dalam log audit (siapa yang mengubah, kapan, nilai lama vs baru) |
| CFG-10 | Konfigurasi harus dapat dikunci oleh administrator agar tidak dapat diubah sembarangan |

---

### 4.18 Update Masal

**Deskripsi:** Memperbarui nilai data objek pajak secara massal untuk suatu wilayah tertentu.

| ID | Kebutuhan |
|----|-----------|
| UPM-01 | Sistem harus mendukung update massal nilai tanah (NJOP bumi) berdasarkan filter wilayah |
| UPM-02 | Sistem harus mendukung update massal kelas bumi berdasarkan rentang nilai tanah |
| UPM-03 | Sistem harus menampilkan jumlah record yang akan terpengaruh sebelum proses update dijalankan |
| UPM-04 | Sistem harus meminta konfirmasi eksplisit sebelum menjalankan update massal |
| UPM-05 | Proses update massal harus dapat dipantau progresnya |
| UPM-06 | Sistem harus mencatat log update massal: siapa, kapan, wilayah mana, berapa record yang diubah |
| UPM-07 | Sistem harus mendukung update massal penetapan SPPT (recalculate) berdasarkan wilayah dan tahun pajak |
| UPM-08 | Setelah update massal, sistem harus menyediakan opsi untuk langsung melakukan generate ulang SPPT |

---

### 4.19 DBKB (Daftar Biaya Komponen Bangunan)

**Deskripsi:** Mengelola daftar komponen bangunan beserta biaya per unit yang digunakan untuk menilai bangunan.

| ID | Kebutuhan |
|----|-----------|
| DBKB-01 | Sistem harus menampilkan daftar komponen bangunan yang dikelompokkan berdasarkan kategori (struktur utama, atap, lantai, dinding, dll.) |
| DBKB-02 | Setiap komponen harus memiliki: kode komponen, nama komponen, satuan, biaya per satuan |
| DBKB-03 | Pengguna harus dapat menambah, mengedit, dan menghapus komponen DBKB |
| DBKB-04 | Sistem harus memvalidasi bahwa penghapusan komponen DBKB yang sedang digunakan tidak diizinkan |
| DBKB-05 | Perubahan nilai komponen DBKB harus dapat diterapkan secara retrospektif melalui recalculate massal |
| DBKB-06 | Sistem harus mendukung impor data DBKB dari file Excel |

---

### 4.20 Pemekaran

**Deskripsi:** Mengelola perubahan batas wilayah administratif yang mengakibatkan perubahan NOP.

| ID | Kebutuhan |
|----|-----------|
| PEK-01 | Sistem harus mendukung pendataan peristiwa pemekaran wilayah dengan tanggal berlaku |
| PEK-02 | Sistem harus mendukung pemetaan NOP lama ke NOP baru untuk setiap objek pajak yang terdampak |
| PEK-03 | Sistem harus memperingatkan pengguna ketika NOP yang dicari sudah mengalami pemekaran dan menampilkan NOP baru |
| PEK-04 | Sistem harus mendukung import data pemetaan NOP lama-baru dari file Excel |
| PEK-05 | Sistem harus mendukung proses migrasi data secara massal dari NOP lama ke NOP baru |
| PEK-06 | Sistem harus menjaga integritas data historis (data di NOP lama tidak dihapus, hanya ditandai tidak aktif) |

---

### 4.21 Penghapusan

**Deskripsi:** Mengelola proses penghapusan atau pembatalan data objek pajak dari sistem.

| ID | Kebutuhan |
|----|-----------|
| HPS-01 | Sistem harus mendukung penghapusan (soft-delete) objek pajak berdasarkan NOP |
| HPS-02 | Penghapusan harus melalui proses persetujuan multi-level jika dikonfigurasi |
| HPS-03 | Sistem harus mencatat alasan penghapusan dan referensi berkas pelayanan terkait |
| HPS-04 | Data yang dihapus tidak benar-benar dihilangkan dari database, melainkan ditandai sebagai tidak aktif |
| HPS-05 | Sistem harus mendukung pemulihan data yang telah dihapus oleh administrator |
| HPS-06 | Sistem harus memvalidasi bahwa objek pajak yang akan dihapus tidak memiliki tunggakan pembayaran |
| HPS-07 | Sistem harus menghasilkan laporan penghapusan yang memuat alasan dan petugas yang menghapus |

---

### 4.22 Jalan

**Deskripsi:** Mengelola data referensi nama jalan yang digunakan untuk standardisasi alamat objek pajak.

| ID | Kebutuhan |
|----|-----------|
| JLN-01 | Sistem harus mengelola daftar nama jalan per wilayah (kecamatan/kelurahan) |
| JLN-02 | Pengguna harus dapat menambah, mengedit, dan menghapus data jalan |
| JLN-03 | Data jalan harus dapat digunakan sebagai dropdown/autocomplete pada form input alamat |
| JLN-04 | Sistem harus mendukung import data jalan dari file Excel |

---

### 4.23 Tarif

**Deskripsi:** Mengelola tabel tarif pajak PBB yang berlaku berdasarkan rentang nilai NJOP dan periode berlaku.

| ID | Kebutuhan |
|----|-----------|
| TAR-01 | Sistem harus menampilkan daftar tarif PBB yang berlaku beserta periode berlakunya (tahun awal – tahun akhir) |
| TAR-02 | Setiap tarif harus memiliki: rentang NJOP (min-max), persentase tarif |
| TAR-03 | Pengguna harus dapat menambah, mengedit, dan menonaktifkan tarif |
| TAR-04 | Sistem harus memvalidasi bahwa rentang NJOP pada tarif yang aktif tidak tumpang tindih untuk periode yang sama |
| TAR-05 | Sistem harus mendukung tarif progresif (tarif berbeda berdasarkan nilai NJOP) |
| TAR-06 | Perubahan tarif harus dicatat dalam log audit |

---

### 4.24 Jenis SPPT

**Deskripsi:** Mengelola jenis-jenis SPPT yang ada di sistem.

| ID | Kebutuhan |
|----|-----------|
| JSPPT-01 | Sistem harus menampilkan daftar jenis SPPT yang terdaftar |
| JSPPT-02 | Setiap jenis SPPT harus memiliki: kode, nama/deskripsi, tarif khusus (jika ada) |
| JSPPT-03 | Pengguna harus dapat menambah, mengedit, dan menonaktifkan jenis SPPT |
| JSPPT-04 | Jenis SPPT tertentu harus dapat dikonfigurasi dengan tarif tetap (mis. 0.5% untuk SPPT khusus) |
| JSPPT-05 | Sistem harus memastikan jenis SPPT yang sedang digunakan tidak dapat dihapus |

---

## 5. Kebutuhan Non-Fungsional

### 5.1 Performa

| ID | Kebutuhan |
|----|-----------|
| NF-PERF-01 | Halaman dengan daftar data (grid/tabel) harus memuat dalam waktu ≤ 3 detik untuk data hingga 10.000 record |
| NF-PERF-02 | Pencarian berdasarkan NOP atau nama WP harus memberikan hasil dalam ≤ 2 detik |
| NF-PERF-03 | Proses generate SPPT massal untuk 1.000 record harus selesai dalam ≤ 5 menit |
| NF-PERF-04 | Proses cetak laporan harus selesai dalam ≤ 30 detik untuk laporan hingga 1.000 baris |
| NF-PERF-05 | Sistem harus mendukung minimal 50 pengguna simultan tanpa penurunan performa signifikan |

### 5.2 Keamanan

| ID | Kebutuhan |
|----|-----------|
| NF-SEC-01 | Semua komunikasi antara client dan server harus menggunakan HTTPS/TLS |
| NF-SEC-02 | Password harus disimpan menggunakan algoritma hash yang kuat dengan salt (bcrypt, Argon2, atau PBKDF2) |
| NF-SEC-03 | Sistem harus mencegah SQL Injection dengan menggunakan parameterized queries / ORM |
| NF-SEC-04 | Sistem harus mencegah XSS (Cross-Site Scripting) jika berbasis web |
| NF-SEC-05 | Seluruh aksi sensitif (delete, approve, konfigurasi) harus memerlukan konfirmasi ulang |
| NF-SEC-06 | Sistem harus memiliki mekanisme audit log yang mencatat: siapa, apa yang dilakukan, kapan, pada data apa |
| NF-SEC-07 | Tidak boleh ada backdoor atau developer mode tersembunyi di sistem produksi |
| NF-SEC-08 | Kredensial database tidak boleh dikodekan secara hardcode di source code |
| NF-SEC-09 | Sistem harus mendukung pembatasan akses berdasarkan IP address atau VPN jika diperlukan |
| NF-SEC-10 | Token/sesi harus di-invalidate di server saat logout |

### 5.3 Ketersediaan dan Keandalan

| ID | Kebutuhan |
|----|-----------|
| NF-AVAIL-01 | Sistem harus memiliki uptime minimal 99% pada hari kerja (Senin–Jumat, 07.00–17.00) |
| NF-AVAIL-02 | Sistem harus memiliki mekanisme backup database otomatis minimal sekali sehari |
| NF-AVAIL-03 | Sistem harus menampilkan pesan yang jelas ketika terjadi gangguan koneksi database |
| NF-AVAIL-04 | Sistem harus dapat melakukan pemulihan dari backup dalam waktu ≤ 4 jam |

### 5.4 Kemudahan Penggunaan (Usability)

| ID | Kebutuhan |
|----|-----------|
| NF-UX-01 | Antarmuka harus responsif dan dapat digunakan pada layar minimal 1366×768 piksel |
| NF-UX-02 | Formulir input yang panjang harus dibagi ke dalam tab atau langkah-langkah yang logis |
| NF-UX-03 | Sistem harus menampilkan konfirmasi sebelum operasi yang tidak dapat dibalik (hapus, update massal) |
| NF-UX-04 | Pesan error harus deskriptif dan memandu pengguna untuk menyelesaikan masalah |
| NF-UX-05 | Sistem harus mendukung keyboard shortcut untuk operasi yang sering dilakukan |
| NF-UX-06 | Antarmuka harus tersedia dalam Bahasa Indonesia |

### 5.5 Pemeliharaan

| ID | Kebutuhan |
|----|-----------|
| NF-MAINT-01 | Kode sumber harus terdokumentasi dengan baik dan mengikuti konvensi yang konsisten |
| NF-MAINT-02 | Sistem harus menyediakan halaman log/monitoring untuk administrator |
| NF-MAINT-03 | Konfigurasi sistem harus dipisahkan dari kode dan dapat diubah tanpa deploy ulang |
| NF-MAINT-04 | Sistem harus mendukung proses migrasi database yang terstruktur (migration scripts) |

### 5.6 Skalabilitas

| ID | Kebutuhan |
|----|-----------|
| NF-SCALE-01 | Sistem harus dapat menangani database hingga 1 juta record SPPT |
| NF-SCALE-02 | Arsitektur sistem harus memungkinkan horizontal scaling jika diperlukan |

---

## 6. Model Data

### 6.1 Entitas Utama

#### 6.1.1 Objek Pajak (SPOP)

```
spop
├── KD_PROPINSI (char 2, PK)
├── KD_DATI2 (char 2, PK)
├── KD_KECAMATAN (char 3, PK)
├── KD_KELURAHAN (char 3, PK)
├── KD_BLOK (char 3, PK)
├── NO_URUT (char 4, PK)
├── KD_JNS_OP (char 1, PK)
├── SUBJEK_PAJAK_ID (varchar, FK → dat_subjek_pajak)
├── NM_WP (varchar) — Nama Wajib Pajak
├── JALAN_WP (varchar) — Alamat WP: Jalan
├── BLOK_KAV_NO_WP (varchar)
├── RW_WP, RT_WP (char)
├── KELURAHAN_WP, KOTA_WP (varchar)
├── KD_POS_WP (char 5)
├── TELP_WP (varchar)
├── NPWP (varchar)
├── LUAS_BUMI (decimal) — Luas Tanah (m²)
├── JNS_BUMI (char) — Jenis Tanah
├── NILAI_SISTEM_BUMI (decimal) — Nilai Tanah per m²
├── JNS_TRANSAKSI_OP (char) — Jenis Transaksi
├── NO_PERSIL (varchar)
├── TGL_PENDATAAN_OP (date)
├── NIP_PENDATA (varchar) — FK → login
└── (kolom wilayah lokasi OP: JALAN_OP, BLOK_OP, dsb.)
```

#### 6.1.2 Bangunan (LSPOP)

```
dat_op_bangunan
├── KD_PROPINSI ... KD_JNS_OP (FK → spop, composite)
├── NO_BNG (tinyint, PK) — Nomor Urut Bangunan
├── LUAS_BNG_SPOP (decimal) — Luas Bangunan (m²)
├── JML_LANTAI_BNG (tinyint)
├── THN_DIBANGUN_BNG (year)
├── THN_DIRENOVASI_BNG (year)
├── KONDISI_BNG (char)
├── KD_KLS_BNG (char, FK → kelas_bangunan) — Kelas Bangunan
├── NILAI_SISTEM_BNG (decimal) — Nilai per m² hasil DBKB
├── NILAI_INDIVIDU_BNG (decimal) — Override nilai manual
└── STATUS_BNG (char) — A=Aktif, N=Nonaktif
```

#### 6.1.3 SPPT (Ketetapan Pajak)

```
sppt
├── KD_PROPINSI ... KD_JNS_OP (FK → spop, composite)
├── THN_PAJAK_SPPT (year, PK)
├── SIKLUS_SPPT (tinyint) — Versi/iterasi penetapan
├── KD_KLS_TANAH (char, FK → kelas_bumi)
├── KD_KLS_BNG (char, FK → kelas_bangunan)
├── TGL_JATUH_TEMPO (date)
├── LUAS_BUMI (decimal)
├── LUAS_BNG (decimal)
├── NJOP_BUMI (decimal) — NJOP Tanah = Kelas × Luas
├── NJOP_BNG (decimal) — NJOP Bangunan = Kelas × Luas
├── NJOP_SPPT (decimal) — NJOP Total = Bumi + Bangunan
├── NJOPTKP_SPPT (decimal) — Nilai Tidak Kena Pajak
├── NJKP_SPPT (decimal) — NJOP - NJOPTKP
├── PBB_TERHUTANG_SPPT (decimal) — Tarif × NJKP
├── FAKTOR_PENGURANG_SPPT (decimal) — Nilai pengurangan
├── PBB_YG_HARUS_DIBAYAR_SPPT (decimal) — Nilai akhir dibayar
├── STATUS_PEMBAYARAN_SPPT (char) — 0=Belum, 1=Lunas
├── STATUS_TAGIHAN_SPPT (char)
├── STATUS_CETAK_SPPT (char)
├── TGL_TERBIT (date)
└── TGL_CETAK (date)
```

#### 6.1.4 Pembayaran

```
pembayaran_sppt
├── KD_PROPINSI ... KD_JNS_OP (FK → sppt)
├── THN_PAJAK_SPPT (year)
├── PEMBAYARAN_KE (tinyint, PK) — Urutan pembayaran
├── TGL_PEMBAYARAN_SPPT (date)
├── JML_SPPT_YG_DIBAYAR (decimal) — Jumlah dibayar
├── DENDA_SPPT (decimal)
├── JML_BAYAR (decimal) — Total termasuk denda
├── NAMA_BAYAR (varchar) — Nama pembayar
├── CHANNEL_PEMBAYARAN (varchar)
├── NO_REFERENSI (varchar) — Nomor bukti/referensi
└── NIP_PETUGAS (varchar, FK → login)
```

#### 6.1.5 Pengguna

```
login
├── USERNAME (varchar, PK)
├── PASSWORD (varchar) — Hash (bcrypt/Argon2)
├── NIP (varchar) — Nomor Induk Pegawai
├── NAMA (varchar)
├── JABATAN (varchar)
├── HAK_AKSES (varchar, FK → group_akses)
├── STATUS_AKTIF (boolean)
├── LAST_LOGIN (datetime)
└── FAILED_ATTEMPTS (tinyint)
```

#### 6.1.6 Berkas Pelayanan

```
berkas_pelayanan
├── NO_BERKAS (varchar, PK)
├── TGL_MASUK (date)
├── NOP (varchar, FK → spop) — NOP terkait
├── NAMA_PEMOHON (varchar)
├── JNS_PELAYANAN (char) — Kode jenis pelayanan
├── STATUS_BERKAS (char) — 1=Diterima, 2=Proses, 3=Verifikasi, 4=Selesai, 5=Ditolak
├── KET_BERKAS (text)
├── TGL_SELESAI (date)
└── NIP_PETUGAS (varchar, FK → login)
```

---

## 7. Aturan Bisnis

### 7.1 Kalkulasi SPPT

**BR-01: Penghitungan NJOP**
```
NJOP = NJOP_Bumi + NJOP_Bangunan
  NJOP_Bumi     = Kelas_Bumi.NJOP × LUAS_BUMI
  NJOP_Bangunan = Kelas_Bangunan.NJOP × LUAS_BNG (total semua bangunan aktif)
```

**BR-02: NJOPTKP (Nilai Tidak Kena Pajak)**
- NJOPTKP hanya diberikan pada satu objek pajak dengan NJOP tertinggi per wajib pajak per tahun.
- Jika dikonfigurasi, NJOPTKP hanya diberikan jika ada bangunan aktif pada OP tersebut.
- Nilai NJOPTKP ditetapkan melalui konfigurasi sistem per tahun.

**BR-03: NJKP (Nilai Jual Kena Pajak)**
```
NJKP = NJOP - NJOPTKP
Jika NJKP < 0 maka NJKP = 0
```

**BR-04: Tarif**
- Jika tarif kondisional diaktifkan:
  - Jika NJKP < Ambang_Batas: Gunakan Tarif_Minimum
  - Jika NJKP ≥ Ambang_Batas: Gunakan Tarif_Maksimum
- Jika objek memiliki SPPT khusus (jenis_sppt tertentu): Gunakan tarif tetap yang dikonfigurasi pada jenis SPPT
- Selain itu: Gunakan tarif standar dari konfigurasi

**BR-05: PBB Terhutang**
```
PBB_Terhutang = Tarif × NJKP
```

**BR-06: Pengurangan**
```
Faktor_Pengurang = PBB_Terhutang × (Persentase_Pengurangan / 100)
PBB_YgHarusDibayar = PBB_Terhutang - Faktor_Pengurang
```

**BR-07: Nilai Minimum**
```
Jika PBB_YgHarusDibayar < PBB_Minimum_Konfigurasi:
    PBB_YgHarusDibayar = PBB_Minimum_Konfigurasi
```

**BR-08: Siklus SPPT**
- Setiap kali SPPT diperbarui/dihitung ulang, nomor siklus (SIKLUS_SPPT) bertambah 1.
- Riwayat setiap siklus disimpan di tabel HISTORI_SPPT.

### 7.2 Pembayaran

**BR-09: Status Pembayaran**
- Jika JML_BAYAR ≥ PBB_YgHarusDibayar: Status = Lunas
- Jika JML_BAYAR > 0 AND JML_BAYAR < PBB_YgHarusDibayar: Status = Bayar Sebagian
- Jika JML_BAYAR = 0: Status = Belum Bayar

**BR-10: Denda Keterlambatan**
- Denda dihitung dari tanggal jatuh tempo SPPT
- Rumus denda sesuai peraturan daerah yang berlaku (biasanya 2% per bulan, maks 48%)

### 7.3 Integritas Data

**BR-11:** SPPT tidak dapat dihapus jika sudah ada record pembayaran.
**BR-12:** Bangunan tidak dapat dihapus fisik; hanya bisa dinonaktifkan (soft-delete).
**BR-13:** NOP yang sudah pernah digunakan tidak dapat didaur ulang.
**BR-14:** Perubahan data SPOP/LSPOP yang mempengaruhi nilai NJOP harus memicu recalculate SPPT.

---

## 8. Antarmuka Eksternal

### 8.1 Antarmuka Pengguna

- Platform target: **Web Browser** (direkomendasikan untuk menggantikan Windows Forms)
- Browser yang didukung: Chrome, Firefox, Edge (versi terbaru)
- Desain responsif untuk layar minimal 1366×768 px
- Dukungan cetak langsung ke printer dan ekspor ke PDF

### 8.2 Antarmuka Database

- Database: MySQL 8.0 atau PostgreSQL 14+
- Seluruh query menggunakan parameterized query / ORM (tidak ada string concatenation untuk query)
- Koneksi database menggunakan connection pooling

### 8.3 Ekspor dan Import

| Format | Digunakan Untuk |
|--------|----------------|
| PDF | Cetak SPPT, laporan, DHKP |
| Excel (.xlsx) | Ekspor laporan, import data referensi dan DBKB |
| CSV | Import/export data massal |
| GeoJSON / SHP | Import data koordinat peta |

### 8.4 Integrasi (Opsional / Fase Berikutnya)

- **BPHTB System** — integrasi data mutasi
- **Portal WP** — pengecekan SPPT dan pembayaran online
- **SISMIOP/BPKAD** — sinkronisasi data induk

---

## 9. Asumsi dan Ketergantungan

### 9.1 Asumsi

1. Sistem baru akan menggantikan sepenuhnya sistem desktop lama (tidak beroperasi bersamaan)
2. Data dari database lama akan dimigrasikan sebelum sistem baru diluncurkan
3. Instansi memiliki infrastruktur server yang memadai untuk menjalankan sistem berbasis web
4. Petugas yang menggunakan sistem sudah terbiasa dengan proses bisnis PBB
5. Tahun pajak aktif adalah satu tahun sekali (Januari–Desember)

### 9.2 Batasan

1. Sistem ini tidak menggantikan sistem pembayaran bank/loket; hanya mencatat hasil pembayaran
2. Fitur GIS/Peta bergantung pada ketersediaan data koordinat yang sudah ada
3. Cetak dokumen bergantung pada printer yang terpasang di perangkat pengguna

### 9.3 Risiko Migrasi

| Risiko | Dampak | Mitigasi |
|--------|--------|---------|
| Data tidak konsisten di DB lama | Tinggi | Audit dan cleansing data sebelum migrasi |
| Pengguna tidak familiar sistem baru | Sedang | Pelatihan pengguna dan panduan sistem |
| Perbedaan kalkulasi pajak | Tinggi | Pengujian paralel (jalankan keduanya selama masa transisi) |
| Kehilangan laporan historis | Tinggi | Migrasikan seluruh data historis termasuk histori SPPT |

---

## 10. Glosarium

| Istilah | Definisi |
|---------|----------|
| Bapenda | Badan Pendapatan Daerah |
| DHKP | Daftar Himpunan Ketetapan Pajak — Dokumen resmi daftar seluruh ketetapan PBB |
| DHR | Daftar Himpunan Realisasi — Rekap realisasi pembayaran |
| DBKB | Daftar Biaya Komponen Bangunan — Tabel biaya per komponen bangunan |
| Ketetapan | Jumlah pajak yang ditetapkan untuk suatu objek pajak pada tahun tertentu |
| NJKP | Nilai Jual Kena Pajak — Dasar pengenaan pajak setelah dikurangi NJOPTKP |
| NJOP | Nilai Jual Objek Pajak — Nilai pasar wajar tanah dan bangunan |
| NJOPTKP | NJOP Tidak Kena Pajak — Batas nilai yang tidak dikenai pajak |
| NOP | Nomor Objek Pajak — Identitas unik setiap objek pajak (18 digit) |
| NIP | Nomor Induk Pegawai |
| OP | Objek Pajak |
| PBB | Pajak Bumi dan Bangunan |
| PBB-P2 | PBB Perdesaan dan Perkotaan (dikelola oleh pemerintah daerah) |
| SPOP | Surat Pemberitahuan Objek Pajak — Formulir pendataan objek pajak |
| SPPT | Surat Pemberitahuan Pajak Terutang — Dokumen ketetapan pajak tahunan |
| Tarif Kondisional | Skema tarif di mana tarif berbeda berdasarkan nilai NJKP |
| Tunggakan | SPPT tahun lalu yang belum dibayar |
| WP | Wajib Pajak |

---

*Dokumen ini dibuat berdasarkan analisis kode sumber SIM-PBB versi 3.9.10.41 (VB.NET / Windows Forms) dan dimaksudkan sebagai acuan lengkap untuk proses migrasi ke platform baru.*

*Versi berikutnya dari dokumen ini akan mencakup wireframe / mockup antarmuka dan ERD (Entity Relationship Diagram) yang lebih detail.*
