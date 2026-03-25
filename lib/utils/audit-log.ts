import { db } from "@/lib/db"
import { logAktivitas } from "@/lib/db/schema"

/**
 * Record an activity in the audit log
 */
export async function recordActivity(params: {
  username: string
  aksi: string
  modul?: string
  keterangan?: string
  ipAddress?: string
}) {
  await db.insert(logAktivitas).values({
    username: params.username,
    aksi: params.aksi,
    modul: params.modul ?? null,
    keterangan: params.keterangan ?? null,
    ipAddress: params.ipAddress ?? null,
  })
}
