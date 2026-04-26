# Objek Pajak API Documentation

Selamat datang, para pejuang kode! Dokumentasi ini dibuat khusus untuk mempermudah kalian memahami bagaimana sistem **Traxia/SimPBB** mengelola data Objek Pajak (NOP). 

Sistem ini menggunakan **oRPC**, yang berarti semua endpoint sudah type-safe. 

## Base Configuration

- **Base URL**: `https://simpbb.technosmart.id/api/rpc`
- **Protocol**: oRPC (Over HTTP POST)
- **Status**: **PUBLIC** (Tidak memerlukan login untuk router yang dijelaskan di bawah ini).

---

## HTTP Protocol Details

Meskipun kalian disarankan menggunakan client `useORPC`, kalian tetap bisa memanggil API ini menggunakan `fetch` atau `curl` standar. 

### Aturan Main:
1. **HTTP Method**: Selalu gunakan **POST**.
2. **Content-Type**: Harus `application/json`.
3. **URL Pattern**: `https://simpbb.technosmart.id/api/rpc/[RouterName]/[ProcedureName]`
4. **Request Body**: Input harus dibungkus dalam key `"json"`.
5. **Response Body**: Data hasil akan dibungkus dalam key `"json"`.

---

## 🏗️ Objek Pajak Router (`objekPajak`)

Router utama untuk mengelola data SPOP (Surat Pemberitahuan Objek Pajak).

### `search`
Mencari NOP atau Nama Wajib Pajak untuk fitur autocompletion.
- **Method**: `POST`
- **Path**: `/api/rpc/objekPajak/search`
- **Input**: `{ "json": { "query": string, "limit"?: number } }`
- **Example**:
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/objekPajak/search \
  -H "Content-Type: application/json" \
  -d '{"json": {"query": "ARIEFAN"}}'
```

### `listDetails`
Menampilkan daftar NOP dengan detail luas bumi dan bangunan.
- **Method**: `POST`
- **Path**: `/api/rpc/objekPajak/listDetails`
- **Input**: `{ "json": { "kdPropinsi"?: string, "kdDati2"?: string, "limit": number, "offset": number } }`
- **Example**:
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/objekPajak/listDetails \
  -H "Content-Type: application/json" \
  -d '{"json": {"limit": 10, "offset": 0}}'
```

### `getByNop`
Mengambil data lengkap satu NOP.
- **Method**: `POST`
- **Path**: `/api/rpc/objekPajak/getByNop`
- **Input**: `{ "json": { "kdPropinsi": "32", "kdDati2": "04", ... } }`
- **Example**:
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/objekPajak/getByNop \
  -H "Content-Type: application/json" \
  -d '{"json": {"kdPropinsi":"32","kdDati2":"04","kdKecamatan":"010","kdKelurahan":"001","kdBlok":"001","noUrut":"0001","kdJnsOp":"0"}}'
```

### `save`
Menyimpan atau memperbarui data SPOP dan Subjek Pajak.
- **Method**: `POST`
- **Path**: `/api/rpc/objekPajak/save`
- **Input**: `{ "json": { "spop": {...}, "subjekPajak": {...} } }`

---

## 🏢 LSPOP Router (`lspop`)

Mengelola data Bangunan.

### `listByNop`
Mengambil semua daftar bangunan di satu NOP.
- **Method**: `POST`
- **Path**: `/api/rpc/lspop/listByNop`
- **Input**: `{ "json": { "kdPropinsi": "32", ... } }`
- **Example**:
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/lspop/listByNop \
  -H "Content-Type: application/json" \
  -d '{"json": {"kdPropinsi":"32","kdDati2":"04","kdKecamatan":"010","kdKelurahan":"001","kdBlok":"001","noUrut":"0001","kdJnsOp":"0"}}'
```

---

## 🗺️ Wilayah Router (`wilayah`)

Helper untuk dropdown wilayah.

### `listPropinsi`
- **Method**: `POST`
- **Path**: `/api/rpc/wilayah/listPropinsi`
- **Input**: `{ "json": {} }`
- **Example**:
```bash
curl -X POST https://simpbb.technosmart.id/api/rpc/wilayah/listPropinsi \
  -H "Content-Type: application/json" \
  -d '{"json": {}}'
```

### `listDati2`
- **Method**: `POST`
- **Path**: `/api/rpc/wilayah/listDati2`
- **Input**: `{ "json": { "kdPropinsi": "32" } }`

---

## 💰 SPPT Router (`sppt`)

Histori tagihan pajak.

### `listByNop`
- **Method**: `POST`
- **Path**: `/api/rpc/sppt/listByNop`
- **Input**: `{ "json": { "kdPropinsi": "32", ... } }`

---

## 💡 Contoh Standard Fetch (JS/TS)

```javascript
const response = await fetch('https://simpbb.technosmart.id/api/rpc/objekPajak/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    json: {
      query: "ARIEFAN",
      limit: 10
    }
  })
});
const { json: data } = await response.json();
console.log(data); // Hasil array ada di sini
```

---

## Aturan Penting (Jangan Dilanggar!)

1. **JSON Wrapper**: Semua input wajib dibungkus dalam field `json`. Respon juga akan dibungkus dalam field `json`.
2. **Format NOP**: Gunakan 18 digit angka murni (tanpa titik/strip) dalam input string.
3. **Data Types**: Pastikan angka dikirim sebagai `number`, bukan string yang berisi angka.

Selamat coding, jangan lupa ngopi!
