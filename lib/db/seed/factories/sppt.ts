import { randNumber } from "@ngneat/falso";
import { randIdName, randIdStreetAddress } from "./id-falso";
import { sppt } from "../../schema";

export function createSppt(
  nop: any,
  thnPajak: number,
  luasBumi: number,
  luasBng: number,
  overrides: Partial<typeof sppt.$inferInsert> = {}
) {
  const njopBumi = luasBumi * 1000000;
  const njopBng = luasBng * 5000000;
  const njopTotal = njopBumi + njopBng;
  const njoptkp = 15000000;
  const pbbTerhutang = Math.max(0, Math.round((njopTotal - njoptkp) * 0.001));

  return {
    kdPropinsi: nop.kdPropinsi,
    kdDati2: nop.kdDati2,
    kdKecamatan: nop.kdKecamatan,
    kdKelurahan: nop.kdKelurahan,
    kdBlok: nop.kdBlok,
    noUrut: nop.noUrut,
    kdJnsOp: nop.kdJnsOp,
    thnPajakSppt: thnPajak.toString(),
    siklusSppt: 1,
    kdKanwilBank: "01",
    kdKppbbBank: "01",
    kdBankTunggal: "01",
    kdBankPersepsi: "01",
    kdTp: "01",
    nmWpSppt: randIdName().toUpperCase().substring(0, 30),
    jlnWpSppt: randIdStreetAddress().toUpperCase().substring(0, 30),
    luasBumiSppt: luasBumi,
    luasBngSppt: luasBng,
    njopBumiSppt: njopBumi,
    njopBngSppt: njopBng,
    njopSppt: njopTotal,
    njoptkpSppt: njoptkp,
    njkpSppt: njopTotal - njoptkp,
    pbbTerhutangSppt: pbbTerhutang,
    faktorPengurangSppt: 0,
    pbbYgHarusDibayarSppt: pbbTerhutang,
    statusPembayaranSppt: randNumber({ min: 0, max: 1 }),
    statusTagihanSppt: 0,
    statusCetakSppt: 1,
    tglTerbitSppt: new Date(`${thnPajak}-01-01`),
    tglCetakSppt: new Date(`${thnPajak}-01-02`),
    ...overrides,
  } as typeof sppt.$inferInsert;
}
