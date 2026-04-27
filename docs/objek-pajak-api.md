# 🚀 SimPBB / Traxia API Documentation

Selamat datang di pusat komando data **SimPBB (Traxia)**. Dokumentasi ini dirancang untuk para engineer yang ingin berinteraksi dengan core system manajemen Pajak Bumi dan Bangunan secara efisien dan *type-safe*.

Sistem ini menggunakan **oRPC**, sebuah protokol RPC modern yang memastikan integritas data antara server dan client. Meskipun dioptimalkan untuk TypeScript, Anda tetap bisa mengaksesnya menggunakan `fetch` atau `curl` standar.

---

## 🛠️ Base Configuration

| Parameter | Value |
| :--- | :--- |
| **Base URL** | `https://simpbb.technosmart.id/api/rpc` |
| **Protocol** | oRPC (Over HTTP POST) |
| **Auth Strategy** | PUBLIC (Untuk router di bawah ini) |
| **Content-Type** | `application/json` |

---

## 📡 Protocol Specification

Setiap request wajib mengikuti struktur wrapper oRPC:

### Request Wrapper
```json
{
  "json": {
    "param1": "value",
    "param2": 123
  }
}
```

### Response Wrapper
```json
{
  "json": {
    "data": [...],
    "message": "Success"
  }
}
```

---

## 🏗️ Objek Pajak Router (`objekPajak`)

Router utama untuk pengelolaan data SPOP (Surat Pemberitahuan Objek Pajak) dan Subjek Pajak (WP).

### 1. `search`
Mencari NOP atau Nama Wajib Pajak untuk autocompletion UI.
- **Path**: `/api/rpc/objekPajak/search`
- **Input**: `{ "json": { "query": string, "limit"?: number } }`

**Example (cURL):**
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/objekPajak/search \
  -H "Content-Type: application/json" \
  -d '{"json": {"query": "BUDI EMBER", "limit": 5}}'
```

### 2. `listDetails`
Menampilkan daftar NOP dengan agregasi luas bumi dan bangunan. Sangat berguna untuk tabel utama.
- **Path**: `/api/rpc/objekPajak/listDetails`
- **Input**: `{ "json": { "kdPropinsi"?: string, "kdDati2"?: string, "limit": number, "offset": number, "search"?: string } }`

**Example (cURL):**
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/objekPajak/listDetails \
  -H "Content-Type: application/json" \
  -d '{"json": {"kdPropinsi": "32", "limit": 10, "offset": 0}}'
```

### 3. `getByNop`
Mengambil profil lengkap satu NOP, termasuk data Subjek Pajak dan status keanggotaan (Induk/Anggota).
- **Path**: `/api/rpc/objekPajak/getByNop`
- **Input**: `NOP_OBJECT` (Lihat [Format NOP](#format-nop))

**Example (cURL):**
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/objekPajak/getByNop \
  -H "Content-Type: application/json" \
  -d '{"json": {"kdPropinsi":"32","kdDati2":"04","kdKecamatan":"010","kdKelurahan":"001","kdBlok":"001","noUrut":"0001","kdJnsOp":"0"}}'
```

### 4. `save` (Upsert)
Menyimpan atau memperbarui data SPOP dan Subjek Pajak dalam satu transaksi.
- **Path**: `/api/rpc/objekPajak/save`
- **Input**: `{ "json": { "spop": {...}, "subjekPajak": {...}, "anggota"?: {...} } }`

**Example (cURL):**
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/objekPajak/save \
  -H "Content-Type: application/json" \
  -d '{
    "json": {
      "spop": {
        "kdPropinsi": "32", "kdDati2": "04", "kdKecamatan": "010", "kdKelurahan": "001", "kdBlok": "001", "noUrut": "0001", "kdJnsOp": "0",
        "subjekPajakId": "32040100010010001",
        "jalanOp": "JL. KENANGAN PAHIT NO. 45",
        "luasBumi": 250,
        "nilaiSistemBumi": 500000000,
        "kdStatusWp": "1",
        "jnsBumi": "1",
        "jnsTransaksiOp": "1"
      },
      "subjekPajak": {
        "subjekPajakId": "32040100010010001",
        "nmWp": "BUDI EMBER BOCOR",
        "jalanWp": "JL. EMBER BOCOR NO. 12",
        "statusPekerjaanWp": "1"
      }
    }
  }'
```

### 5. `getSpptHistory`
Melihat histori tagihan SPPT dari tahun ke tahun untuk satu NOP.
- **Path**: `/api/rpc/objekPajak/getSpptHistory`
- **Input**: `NOP_OBJECT`

### 6. `getTunggakan`
Mengambil daftar SPPT yang belum lunas (status 0).
- **Path**: `/api/rpc/objekPajak/getTunggakan`
- **Input**: `NOP_OBJECT`

---

## 🏢 LSPOP Router (`lspop`)

Manajemen data bangunan (Lampiran SPOP).

### 1. `listByNop`
Mengambil semua daftar bangunan yang terdaftar pada satu NOP beserta detail JPB-nya.
- **Path**: `/api/rpc/lspop/listByNop`
- **Input**: `NOP_OBJECT`

### 2. `getBuilding`
Detail spesifik satu bangunan.
- **Path**: `/api/rpc/lspop/getBuilding`
- **Input**: `NOP_OBJECT` + `"noBng": number`

### 3. `listFasilitas`
Daftar fasilitas pada satu bangunan (AC, Lift, Kolam Renang, dll).
- **Path**: `/api/rpc/lspop/listFasilitas`
- **Input**: `NOP_OBJECT` + `"noBng": number`

---

## 🗺️ Wilayah Router (`wilayah`)

Helper untuk data referensi wilayah geografis.

### 1. `listPropinsi`
- **Path**: `/api/rpc/wilayah/listPropinsi`
- **Input**: `{ "json": {} }`

### 2. `listDati2` (Kabupaten/Kota)
- **Path**: `/api/rpc/wilayah/listDati2`
- **Input**: `{ "json": { "kdPropinsi": "32" } }`

### 3. `listKecamatan`
- **Path**: `/api/rpc/wilayah/listKecamatan`
- **Input**: `{ "json": { "kdPropinsi": "32", "kdDati2": "04" } }`

### 4. `listKelurahan`
- **Path**: `/api/rpc/wilayah/listKelurahan`
- **Input**: `{ "json": { "kdPropinsi": "32", "kdDati2": "04", "kdKecamatan": "010" } }`

### 5. `listBlok`
Mengambil daftar Blok yang tersedia di suatu Kelurahan.
- **Path**: `/api/rpc/wilayah/listBlok`
- **Input**: `{ "json": { "kdPropinsi": "32", "kdDati2": "04", "kdKecamatan": "010", "kdKelurahan": "001" } }`

---

## 💰 SPPT Router (`sppt`)

Akses ke data tagihan dan histori pembayaran pajak.

### 1. `listByNop`
Histori tagihan pajak untuk satu NOP dari tahun ke tahun.
- **Path**: `/api/rpc/sppt/listByNop`
- **Input**: `NOP_OBJECT`

### 2. `get`
Detail tagihan satu tahun pajak tertentu.
- **Path**: `/api/rpc/sppt/get`
- **Input**: `NOP_OBJECT` + `"thnPajakSppt": number`

### 3. `list`
Pencarian SPPT massal dengan filter tahun, wilayah, atau status bayar.
- **Path**: `/api/rpc/sppt/list`
- **Input**: `{ "json": { "thnPajak": 2024, "kdPropinsi": "32", "statusPembayaran": "0", "limit": 20, "offset": 0 } }`

---

## 🔑 Helper & ID Generators

Endpoint untuk membantu pengisian formulir data baru.

### 1. `getNextNoUrut`
Mendapatkan nomor urut NOP berikutnya yang tersedia di satu Blok.
- **Path**: `/api/rpc/objekPajak/getNextNoUrut`
- **Input**: `{ "json": { "kdPropinsi": "32", "kdDati2": "04", "kdKecamatan": "010", "kdKelurahan": "001", "kdBlok": "001" } }`

### 2. `getNextNoFormulir`
Mendapatkan nomor formulir SPOP berikutnya untuk tahun berjalan.
- **Path**: `/api/rpc/objekPajak/getNextNoFormulir`
- **Input**: `{ "json": {} }`

### 3. `nextNoBng`
Mendapatkan nomor bangunan berikutnya untuk satu NOP.
- **Path**: `/api/rpc/lspop/nextNoBng`
- **Input**: `NOP_OBJECT`


## 📐 Format Data (Penting!)

### Format NOP
Hampir semua endpoint membutuhkan `NOP_OBJECT` sebagai input. Pastikan format string tepat (leading zero wajib ada).

```json
{
  "kdPropinsi": "32",
  "kdDati2": "04",
  "kdKecamatan": "010",
  "kdKelurahan": "001",
  "kdBlok": "001",
  "noUrut": "0001",
  "kdJnsOp": "0"
}
```

### Tips Implementasi
- **Leading Zeros**: Selalu kirim kode wilayah sebagai string dengan jumlah digit yang sesuai (misal: `"001"` bukan `"1"`).
- **Numbers**: Luas bumi, luas bangunan, dan nilai (NJOP) dikirim sebagai tipe data `number`.

---

## 💡 Contoh Implementasi Fetch (TS/JS)

```typescript
const fetchNopData = async (nop: any) => {
  const response = await fetch('https://simpbb.technosmart.id/api/rpc/objekPajak/getByNop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ json: nop })
  });
  
  const result = await response.json();
  return result.json; // Akses data di dalam field json
};
```

Selamat membangun masa depan pajak yang lebih transparan! Jika ada kendala, hubungi tim senior engineer di sebelah Anda. ☕

