import { BeritaAcaraClient } from './client'
import { db } from '@/lib/db'
import { pelayanan, pelayananDokumen, konfigurasi as konfigurasiTable, historiMutasi } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { formatNop } from '@/lib/utils/nop'
import { notFound } from 'next/navigation'
import type { BeritaAcaraData } from '@/lib/utils/pdf/berita-acara-generator'

const DOKUMEN_NAMES: Record<number, string> = {
  1: 'Fotokopi KTP Pemohon',
  2: 'Fotokopi SPPT PBB',
  3: 'Fotokopi STTS/Bukti Bayar PBB',
  4: 'Fotokopi Sertifikat/Surat Tanah',
  5: 'Fotokopi IMB',
  6: 'Surat Kuasa (jika dikuasakan)',
  7: 'Fotokopi Akta Jual Beli',
  8: 'Fotokopi Akta Hibah',
  9: 'Fotokopi Akta Waris',
  10: 'Surat Keterangan Ahli Waris',
  11: 'Fotokopi BPHTB',
  12: 'Gambar Situasi/Denah Bangunan',
  13: 'Surat Permohonan',
  14: 'SPOP Terisi',
  15: 'LSPOP Terisi',
}

function blobToString(val: unknown): string {
  if (val instanceof Buffer) return val.toString('utf8')
  if (val instanceof Uint8Array) return Buffer.from(val).toString('utf8')
  if (typeof val === 'string') return val
  return String(val ?? '')
}

export default async function BeritaAcaraPage({
  params,
}: {
  params: Promise<{ no: string }>
}) {
  const { no } = await params

  const [pel] = await db
    .select()
    .from(pelayanan)
    .where(eq(pelayanan.noPelayanan, no))
    .limit(1)

  if (!pel) notFound()

  const dokumenRows = await db
    .select()
    .from(pelayananDokumen)
    .where(eq(pelayananDokumen.noPelayanan, no))

  const dokumen = Object.entries(DOKUMEN_NAMES).map(([id, name]) => ({
    dokumenId: Number(id),
    namaDokumen: name,
    ada: dokumenRows.some((d) => d.dokumenId === Number(id)),
  }))

  const [mutasiRow] = await db
    .select()
    .from(historiMutasi)
    .where(eq(historiMutasi.noPelayanan, no))
    .orderBy(desc(historiMutasi.tglMutasi))
    .limit(1)

  // Get instansi config — konfigurasi PK column is `nama`
  const [nmRow] = await db
    .select()
    .from(konfigurasiTable)
    .where(eq(konfigurasiTable.nama, 'NM_INSTANSI'))
    .limit(1)

  const [alamatRow] = await db
    .select()
    .from(konfigurasiTable)
    .where(eq(konfigurasiTable.nama, 'ALAMAT_INSTANSI'))
    .limit(1)

  // Build NOP string if all NOP parts are present
  const nopStr =
    pel.kdPropinsi && pel.kdDati2 && pel.kdKecamatan && pel.kdKelurahan && pel.kdBlok && pel.noUrut && pel.kdJnsOp
      ? formatNop({
          kdPropinsi: pel.kdPropinsi,
          kdDati2: pel.kdDati2,
          kdKecamatan: pel.kdKecamatan,
          kdKelurahan: pel.kdKelurahan,
          kdBlok: pel.kdBlok,
          noUrut: pel.noUrut,
          kdJnsOp: pel.kdJnsOp,
        })
      : undefined

  const tanggalStr = pel.tanggalPelayanan
    ? pel.tanggalPelayanan instanceof Date
      ? pel.tanggalPelayanan.toISOString().slice(0, 10)
      : String(pel.tanggalPelayanan).slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  const data: BeritaAcaraData = {
    pelayanan: {
      noPelayanan: pel.noPelayanan,
      namaJenisPelayanan: pel.kdJnsPelayanan ?? '',
      tanggalPelayanan: tanggalStr,
      namaPemohon: pel.namaPemohon ?? '',
      alamatPemohon: typeof pel.alamatPemohon === 'string' ? pel.alamatPemohon : '',
      letakOp: pel.letakOp ?? '',
      nop: nopStr,
      keterangan: typeof pel.keterangan === 'string' ? pel.keterangan : '',
      namaPetugasPenerima: pel.namaPetugasPenerima ?? '',
      nipPetugasPenerima: pel.nipPetugasPenerima ?? '',
      ttdKiriJabatan: pel.ttdKiriJabatan ?? '',
      ttdKiriNama: pel.ttdKiriNama ?? '',
      ttdKiriNip: pel.ttdKiriNip ?? '',
      ttdKananJabatan: pel.ttdKananJabatan ?? '',
      ttdKananNama: pel.ttdKananNama ?? '',
      ttdKananNip: pel.ttdKananNip ?? '',
    },
    dokumen,
    mutasi: mutasiRow ? {
      ltSebelum: Number(mutasiRow.ltSebelum ?? 0),
      lbSebelum: Number(mutasiRow.lbSebelum ?? 0),
      pbbSebelum: Number(mutasiRow.pbbSebelum ?? 0),
      ltSesudah: Number(mutasiRow.ltSesudah ?? 0),
      lbSesudah: Number(mutasiRow.lbSesudah ?? 0),
      pbbSesudah: Number(mutasiRow.pbbSesudah ?? 0),
    } : undefined,
    instansi: {
      nmInstansi: nmRow ? blobToString(nmRow.nilai) || 'Badan Pendapatan Daerah' : 'Badan Pendapatan Daerah',
      alamatInstansi: alamatRow ? blobToString(alamatRow.nilai) : '',
    },
  }

  return <BeritaAcaraClient {...data} />
}
