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
    kdJpb: (Math.floor(Math.random() * 16) + 1).toString().padStart(2, '0'),
    luasBng,
    jmlLantaiBng: randNumber({ min: 1, max: 3 }),
    thnDibangunBng: (2020 - randNumber({ min: 0, max: 30 })).toString(),
    kondisiBng: randNumber({ min: 1, max: 4 }).toString(),
    jnsKonstruksiBng: randNumber({ min: 1, max: 4 }).toString(),
    jnsAtapBng: randNumber({ min: 1, max: 5 }).toString(),
    kdDinding: randNumber({ min: 1, max: 6 }).toString(),
    kdLantai: randNumber({ min: 1, max: 5 }).toString(),
    kdLangitLangit: randNumber({ min: 1, max: 3 }).toString(),
    tglPendataanBng: new Date(),
    nmPendataanOp: "ADMIN_SEEDER",
    nipPendataBng: "198001012000011001",
    jnsTransaksiBng: "1",
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
