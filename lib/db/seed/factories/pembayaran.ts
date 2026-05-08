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
    pembayaranKe: 1,
    kdKanwilBank: sppt.kdKanwilBank,
    kdKppbbBank: sppt.kdKppbbBank,
    kdBankTunggal: sppt.kdBankTunggal,
    kdBankPersepsi: sppt.kdBankPersepsi,
    kdTp: sppt.kdTp,
    tglPembayaranSppt: randPastDate(),
    jmlSpptYgDibayar: jmlBayar.toString(),
    dendaSppt: "0",
    jmlBayar: jmlBayar.toString(),
    ...overrides,
  } as typeof pembayaranSppt.$inferInsert;
}
