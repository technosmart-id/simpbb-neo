import { randNumber } from "@ngneat/falso";
import { datOpBangunan, datFasilitasBangunan } from "../../schema";

export function createDatOpBangunan(
  nop: any,
  noBng: number,
  overrides: Partial<typeof datOpBangunan.$inferInsert> = {}
) {
  const luasBng = randNumber({ min: 36, max: 500 });
  const nilaiSistemBng = luasBng * randNumber({ min: 2000000, max: 10000000 });

  return {
    kdPropinsi: nop.kdPropinsi,
    kdDati2: nop.kdDati2,
    kdKecamatan: nop.kdKecamatan,
    kdKelurahan: nop.kdKelurahan,
    kdBlok: nop.kdBlok,
    noUrut: nop.noUrut,
    kdJnsOp: nop.kdJnsOp,
    noBng,
    kdJpb: "01",
    luasBng,
    jmlLantaiBng: randNumber({ min: 1, max: 3 }),
    thnDibangunBng: (2020 - randNumber({ min: 0, max: 30 })).toString(),
    kondisiBng: randNumber({ min: 1, max: 4 }).toString(),
    jnsKonstruksiBng: "1",
    jnsAtapBng: "1",
    kdDinding: "1",
    kdLantai: "1",
    kdLangitLangit: "1",
    nilaiSistemBng,
    nilaiIndividu: 0,
    aktif: 1,
    ...overrides,
  } as typeof datOpBangunan.$inferInsert;
}

export function createFasilitasBangunan(
  nop: any,
  noBng: number,
  kdFasilitas: string,
  overrides: Partial<typeof datFasilitasBangunan.$inferInsert> = {}
) {
  return {
    kdPropinsi: nop.kdPropinsi,
    kdDati2: nop.kdDati2,
    kdKecamatan: nop.kdKecamatan,
    kdKelurahan: nop.kdKelurahan,
    kdBlok: nop.kdBlok,
    noUrut: nop.noUrut,
    kdJnsOp: nop.kdJnsOp,
    noBng,
    kdFasilitas,
    jmlSatuan: randNumber({ min: 1, max: 10 }),
    ...overrides,
  } as typeof datFasilitasBangunan.$inferInsert;
}
