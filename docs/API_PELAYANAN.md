# SIM-PBB Neo: Pelayanan (Service Registration) API Documentation

This document describes the API endpoints exposed by `simpbb-neo` for service registration (`pelayanan`), document checks, status updates, and file uploads. It is intended for external organizations or developers who want to build a frontend or integrate their systems with the `simpbb-neo` back office.

---

## 1. Architectural Overview
`simpbb-neo` exposes its backend features using **oRPC (Object RPC)** and traditional **REST endpoints**.

* **oRPC Endpoint URL**: `http://<domain>/api/rpc`
* **Protocol**: HTTP `POST` requests. Procedure names are mapped dynamically to paths (e.g., `pelayanan.create` maps to `/api/rpc/pelayanan/create`).
* **Content-Type**: `application/json`
* **OpenAPI Specs**: A complete OpenAPI JSON spec is dynamically generated and available at:
  `http://<domain>/api/rpc/openapi`

---

## 2. Authentication
All protected endpoints verify sessions via cookies or the `Authorization` header mapping to Better Auth.

* **Format**: Pass session details in headers if consuming as a separate application, or ensure session cookies are sent with requests.

---

## 3. Pelayanan (Service Registration) Endpoints

### 3.1. Create Service Registration (Pelayanan)
Creates a new service registration in the database and registers the document checklist requirements.

* **Method**: `POST`
* **URL**: `/api/rpc/pelayanan/create`
* **Request Body (JSON)**:
```json
{
  "noPelayanan": "202606.0004",
  "kdPropinsi": "51",
  "kdDati2": "02",
  "kdKecamatan": "010",
  "kdKelurahan": "001",
  "kdBlok": "001",
  "noUrut": "0001",
  "kdJnsOp": "0",
  "kdJnsPelayanan": "01",
  "tanggalPelayanan": "2026-06-15T00:00:00.000Z",
  "namaPemohon": "I Wayan Sudarsana",
  "alamatPemohon": "Jl. Gajah Mada No. 10",
  "letakOp": "Sanggulan",
  "catatan": "Optional notes from applicant",
  "nipPetugasPenerima": "19890101XXXXXXXXXX",
  "namaPetugasPenerima": "Staff Backoffice",
  "isKolektif": 0,
  "dokumenIds": [1, 2, 3]
}
```

* **Response (JSON)**:
```json
{
  "success": true
}
```

---

### 3.2. List Service Registrations
Queries all registrations with search terms, pagination, and filters.

* **Method**: `POST`
* **URL**: `/api/rpc/pelayanan/list`
* **Request Body (JSON)**:
```json
{
  "limit": 20,
  "offset": 0,
  "statusPelayanan": 1,
  "kdJnsPelayanan": "01",
  "dateFrom": "2026-06-01",
  "dateTo": "2026-06-30",
  "search": "Wayan"
}
```

* **Response (JSON)**:
```json
{
  "rows": [
    {
      "noPelayanan": "202606.0004",
      "kdPropinsi": "51",
      "kdDati2": "02",
      "kdKecamatan": "010",
      "kdKelurahan": "001",
      "kdBlok": "001",
      "noUrut": "0001",
      "kdJnsOp": "0",
      "kdJnsPelayanan": "01",
      "tanggalPelayanan": "2026-06-15T00:00:00.000Z",
      "namaPemohon": "I Wayan Sudarsana",
      "alamatPemohon": "Jl. Gajah Mada No. 10",
      "letakOp": "Sanggulan",
      "statusPelayanan": 1,
      "catatan": "Optional notes from applicant",
      "keterangan": null
    }
  ],
  "total": 1
}
```

---

### 3.3. Get Service Details by Number
Fetches a single registration record by its unique number, including checklist documents, collective attachments, and mutasi history.

* **Method**: `POST`
* **URL**: `/api/rpc/pelayanan/getByNo`
* **Request Body (JSON)**:
```json
{
  "noPelayanan": "202606.0004"
}
```

* **Response (JSON)**:
```json
{
  "noPelayanan": "202606.0004",
  "kdPropinsi": "51",
  "kdDati2": "02",
  "kdKecamatan": "010",
  "kdKelurahan": "001",
  "kdBlok": "001",
  "noUrut": "0001",
  "kdJnsOp": "0",
  "kdJnsPelayanan": "01",
  "tanggalPelayanan": "2026-06-15T00:00:00.000Z",
  "namaPemohon": "I Wayan Sudarsana",
  "alamatPemohon": "Jl. Gajah Mada No. 10",
  "letakOp": "Sanggulan",
  "statusPelayanan": 1,
  "catatan": "Optional notes",
  "dokumen": [
    {
      "noPelayanan": "202606.0004",
      "dokumenId": 1,
      "file_name": "ktp_wayan.pdf",
      "file_path": "/uploads/pelayanan/13/1_1781494673_ktp.pdf",
      "file_size": 245000,
      "uploaded_at": "2026-06-15T03:30:00.000Z"
    }
  ],
  "lampiran": [],
  "mutasi": []
}
```

---

### 3.4. Update Service Status
Performs status transitions in back office workflow (e.g., moving from received to penilai).

* **Method**: `POST`
* **URL**: `/api/rpc/pelayanan/updateStatus`
* **Request Body (JSON)**:
```json
{
  "noPelayanan": "202606.0004",
  "newStatus": 2,
  "nipPetugas": "19890101XXXXXXXXXX",
  "catatan": "Moving to valuation phase"
}
```

* **Response (JSON)**:
```json
{
  "success": true
}
```

---

### 3.5. Generate Next Service Number
Generates the next sequential service registration number based on a year-month prefix (e.g., `YYYYMM.`).

* **Method**: `POST`
* **URL**: `/api/rpc/pelayanan/nextNoPelayanan`
* **Request Body (JSON)**:
```json
{
  "prefix": "202606."
}
```

* **Response (JSON)**:
```json
{
  "nextNo": "202606.0005"
}
```

---

## 4. File Management & Upload REST Endpoints

### 4.1. Upload Files
Uploads physical documents to the backend's storage service.

* **Method**: `POST`
* **URL**: `/api/upload`
* **Headers**:
  * `Content-Type`: `multipart/form-data`
* **Request Payload (Multipart)**:
  * `files`: File raw binary (supports multiple files)
* **Response (JSON)**:
```json
[
  {
    "name": "ktp_wayan.pdf",
    "path": "temp/2026/06/15/d7d8e8-ktp_wayan.pdf",
    "size": 245000
  }
]
```

---

### 4.2. Retrieve Files
Serves/Downloads files stored in the backend directory.

* **Method**: `GET`
* **URL**: `/api/files/{file_path}`
* **Response**: Serves raw binary stream with appropriate `Content-Type` header (e.g., `application/pdf`, `image/jpeg`).

---

## 5. Reference Code Mappings

### 5.1. Status Pelayanan (STATUS_PELAYANAN)
| Code | Status Label | Description |
|---|---|---|
| `1` | Diterima | Berkas masuk / pendaftaran awal |
| `2` | Masuk Penilai | Berkas diserahkan to tim penilai objek pajak |
| `3` | Masuk Penetapan | Berkas masuk dalam penetapan tarif/NJOP |
| `4` | Selesai | Proses pelayanan selesai & SPPT diterbitkan |
| `5` | Terkonfirmasi WP | Konfirmasi/kesepakatan sudah disetujui WP |
| `6` | Ditunda | Berkas ditangguhkan (alasan terdapat di `ALASAN_DITUNDA`) |

### 5.2. Jenis Pelayanan (KD_JNS_PELAYANAN)
| Code | Description |
|---|---|
| `01` | Pendaftaran Data Baru |
| `02` | Mutasi Objek/Subjek |
| `03` | Pembetulan SPPT/SKP/STP |
| `04` | Pembatalan SPPT/SKP |
| `05` | Salinan SPPT/SKP |
| `06` | Keberatan Penunjukan Wajib Pajak |
| `07` | Keberatan Atas Pajak Terhutang |
| `08` | Pengurangan Atas Besarnya Pajak Terhutang |
| `09` | Restitusi dan Kompensasi |
| `10` | Pengurangan Denda Administrasi |
| `11` | Penentuan Kembali Tanggal Jatuh Tempo |
| `12` | Penundaan Tanggal Jatuh Tempo SPOP |
| `13` | Pemberian Informasi PBB |
| `14` | Pembetulan SK Keberatan |
| `15` | Mutasi Pemecahan |
