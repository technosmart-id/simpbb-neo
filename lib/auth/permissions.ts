// Role-based access control permissions map
// Maps group_akses.HAK_AKSES values to module-level operations

export type Operation = "read" | "write" | "delete" | "print"

export type ModulePermission = {
  read?: boolean
  write?: boolean
  delete?: boolean
  print?: boolean
}

// Module identifiers match oRPC router names
export type ModuleName =
  | "dashboard"
  | "spop"
  | "lspop"
  | "pelayanan"
  | "pembayaran"
  | "cetak-sppt"
  | "tunggakan"
  | "info-op"
  | "laporan"
  | "dhkp"
  | "update-masal"
  | "pemekaran"
  | "penghapusan"
  | "peta"
  | "referensi"
  | "klasifikasi"
  | "tarif"
  | "jenis-sppt"
  | "fasilitas"
  | "jalan"
  | "konfigurasi"
  | "pengguna"
  | "group-akses"
  | "log"

// Default role permission definitions
// These are the 7 roles defined in REQUIREMENTS.md
const ROLE_PERMISSIONS: Record<string, Record<ModuleName, ModulePermission>> = {
  ADMIN: Object.fromEntries(
    [
      "dashboard", "spop", "lspop", "pelayanan", "pembayaran", "cetak-sppt",
      "tunggakan", "info-op", "laporan", "dhkp", "update-masal", "pemekaran",
      "penghapusan", "peta", "referensi", "klasifikasi", "tarif", "jenis-sppt",
      "fasilitas", "jalan", "konfigurasi", "pengguna", "group-akses", "log",
    ].map((m) => [m, { read: true, write: true, delete: true, print: true }]),
  ) as Record<ModuleName, ModulePermission>,

  OPERATOR_DATA: {
    dashboard: { read: true },
    spop: { read: true, write: true },
    lspop: { read: true, write: true },
    pelayanan: { read: true },
    pembayaran: { read: true },
    "cetak-sppt": { read: true },
    tunggakan: { read: true },
    "info-op": { read: true },
    laporan: { read: true },
    dhkp: { read: true },
    "update-masal": { read: true, write: true },
    pemekaran: { read: true, write: true },
    penghapusan: { read: true },
    peta: { read: true },
    referensi: { read: true },
    klasifikasi: { read: true },
    tarif: { read: true },
    "jenis-sppt": { read: true },
    fasilitas: { read: true },
    jalan: { read: true },
    konfigurasi: { read: true },
    pengguna: {},
    "group-akses": {},
    log: { read: true },
  },

  PETUGAS_PELAYANAN: {
    dashboard: { read: true },
    spop: { read: true },
    lspop: { read: true },
    pelayanan: { read: true, write: true, print: true },
    pembayaran: { read: true },
    "cetak-sppt": { read: true },
    tunggakan: { read: true },
    "info-op": { read: true },
    laporan: { read: true },
    dhkp: {},
    "update-masal": {},
    pemekaran: {},
    penghapusan: {},
    peta: { read: true },
    referensi: { read: true },
    klasifikasi: { read: true },
    tarif: { read: true },
    "jenis-sppt": { read: true },
    fasilitas: { read: true },
    jalan: { read: true },
    konfigurasi: { read: true },
    pengguna: {},
    "group-akses": {},
    log: {},
  },

  PETUGAS_CETAK: {
    dashboard: { read: true },
    spop: { read: true },
    lspop: { read: true },
    pelayanan: { read: true },
    pembayaran: { read: true },
    "cetak-sppt": { read: true, print: true },
    tunggakan: { read: true },
    "info-op": { read: true },
    laporan: { read: true, print: true },
    dhkp: { read: true, print: true },
    "update-masal": {},
    pemekaran: {},
    penghapusan: {},
    peta: { read: true },
    referensi: { read: true },
    klasifikasi: { read: true },
    tarif: { read: true },
    "jenis-sppt": { read: true },
    fasilitas: { read: true },
    jalan: { read: true },
    konfigurasi: { read: true },
    pengguna: {},
    "group-akses": {},
    log: {},
  },

  BENDAHARA: {
    dashboard: { read: true },
    spop: { read: true },
    lspop: { read: true },
    pelayanan: { read: true },
    pembayaran: { read: true, write: true, print: true },
    "cetak-sppt": { read: true },
    tunggakan: { read: true },
    "info-op": { read: true },
    laporan: { read: true, print: true },
    dhkp: { read: true },
    "update-masal": {},
    pemekaran: {},
    penghapusan: {},
    peta: { read: true },
    referensi: { read: true },
    klasifikasi: { read: true },
    tarif: { read: true },
    "jenis-sppt": { read: true },
    fasilitas: { read: true },
    jalan: { read: true },
    konfigurasi: { read: true },
    pengguna: {},
    "group-akses": {},
    log: {},
  },

  SUPERVISOR: {
    dashboard: { read: true },
    spop: { read: true },
    lspop: { read: true },
    pelayanan: { read: true, write: true },
    pembayaran: { read: true },
    "cetak-sppt": { read: true },
    tunggakan: { read: true },
    "info-op": { read: true },
    laporan: { read: true, print: true },
    dhkp: { read: true, print: true },
    "update-masal": { read: true },
    pemekaran: { read: true },
    penghapusan: { read: true, write: true },
    peta: { read: true },
    referensi: { read: true },
    klasifikasi: { read: true },
    tarif: { read: true },
    "jenis-sppt": { read: true },
    fasilitas: { read: true },
    jalan: { read: true },
    konfigurasi: { read: true },
    pengguna: {},
    "group-akses": {},
    log: { read: true },
  },

  PETUGAS_LAPANGAN: {
    dashboard: { read: true },
    spop: { read: true, write: true },
    lspop: { read: true, write: true },
    pelayanan: { read: true },
    pembayaran: {},
    "cetak-sppt": {},
    tunggakan: { read: true },
    "info-op": { read: true },
    laporan: {},
    dhkp: {},
    "update-masal": {},
    pemekaran: {},
    penghapusan: {},
    peta: { read: true },
    referensi: { read: true },
    klasifikasi: { read: true },
    tarif: { read: true },
    "jenis-sppt": { read: true },
    fasilitas: { read: true },
    jalan: { read: true },
    konfigurasi: {},
    pengguna: {},
    "group-akses": {},
    log: {},
  },
}

/**
 * Check if a role has permission for a specific module operation
 */
export function hasPermission(
  hakAkses: string,
  module: ModuleName,
  operation: Operation,
): boolean {
  const rolePerms = ROLE_PERMISSIONS[hakAkses.toUpperCase()]
  if (!rolePerms) return false
  return rolePerms[module]?.[operation] === true
}

/**
 * Get all permitted modules for a role
 */
export function getPermittedModules(hakAkses: string): ModuleName[] {
  const rolePerms = ROLE_PERMISSIONS[hakAkses.toUpperCase()]
  if (!rolePerms) return []
  return (Object.entries(rolePerms) as [ModuleName, ModulePermission][])
    .filter(([, perms]) => perms.read)
    .map(([module]) => module)
}
