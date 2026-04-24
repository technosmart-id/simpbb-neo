import { randNumber } from "@ngneat/falso";
import { randIdName, randIdStreetAddress } from "./id-falso";
import { sppt } from "../../schema";

export function createSppt(
  nop: any,
  thnPajak: string,
  luasBumi: number,
  luasBng: number,
  overrides: Partial<typeof sppt.$inferInsert> = {}
) {
  const njopBumi = luasBumi * 1000000;
  const njopBng = luasBng * 5000000;
  const njopSppt = njopBumi + njopBng;
  const njoptkpSppt = 10000000;
  const njkpSppt = Math.max(0, njopSppt - njoptkpSppt);
  const pbbTerhutang = Math.round(njkpSppt * 0.001);

  return {
    kdPropinsi: nop.kdPropinsi,
    kdDati2: nop.kdDati2,
    kdKecamatan: nop.kdKecamatan,
    kdKelurahan: nop.kdKelurahan,
    kdBlok: nop.kdBlok,
    noUrut: nop.noUrut,
    kdJnsOp: nop.kdJnsOp,
    thnPajakSppt: thnPajak,
    siklusSppt: 1,
    kdKanwilBank: "01",
    kdKppbbBank: "01",
    kdBankTunggal: "01",
    kdBankPersepsi: "01",
    kdTp: "01",
    nmWp: randIdName().toUpperCase(),
    jalanWp: randIdStreetAddress().toUpperCase(),
    luasBumi,
    luasBng,
    njopBumi,
    njopBng,
    njopSppt,
    njoptkpSppt,
    njkpSppt,
    pbbTerhutangSppt: pbbTerhutang.toString(),
    faktorPengurangSppt: "0",
    pbbYgHarusDibayarSppt: pbbTerhutang.toString(),
    statusPembayaranSppt: randNumber({ min: 0, max: 2 }).toString(),
    statusTagihanSppt: "0",
    statusCetakSppt: "1",
    tglTerbitSppt: new Date(`${thnPajak}-01-01`),
    tglCetakSppt: new Date(`${thnPajak}-01-02`),
    ...overrides,
  } as typeof sppt.$inferInsert;
}
