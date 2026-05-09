import { randNumber, randPastDate } from "@ngneat/falso";
import { pembayaranSppt } from "../../schema";

export function createPembayaranSppt(
  sppt: any,
  overrides: Partial<typeof pembayaranSppt.$inferInsert> = {}
) {
  const jmlBayar = sppt.pbbYgHarusDibayarSppt;
  
  return {
    kdPropinsi: sppt.kdPropinsi,
    kdDati2: sppt.kdDati2,
    kdKecamatan: sppt.kdKecamatan,
    kdKelurahan: sppt.kdKelurahan,
    kdBlok: sppt.kdBlok,
    noUrut: sppt.noUrut,
    kdJnsOp: sppt.kdJnsOp,
    thnPajakSppt: sppt.thnPajakSppt,
    pembayaranSpptKe: 1,
    kdKanwilBank: sppt.kdKanwilBank || "01",
    kdKppbbBank: sppt.kdKppbbBank || "01",
    kdBankTunggal: sppt.kdBankTunggal || "01",
    kdBankPersepsi: sppt.kdBankPersepsi || "01",
    kdTp: sppt.kdTp || "01",
    tglPembayaranSppt: randPastDate(),
    jmlSpptYgDibayar: jmlBayar,
    dendaSppt: 0,
    tglRekamByrSppt: new Date(),
    nipRekamByrSppt: "ADMIN_SEEDER",
    ...overrides,
  } as typeof pembayaranSppt.$inferInsert;
}
