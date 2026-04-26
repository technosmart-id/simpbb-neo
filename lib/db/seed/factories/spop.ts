import {
  randNumber,
  randPastDate,
} from "@ngneat/falso";
import { randIdName, randIdStreetAddress } from "./id-falso";
import { spop } from "../../schema";

export function createSpop(
  subjekPajakId: string,
  region: { kdPropinsi: string; kdDati2: string; kdKecamatan: string; kdKelurahan: string },
  noUrut: number,
  overrides: Partial<typeof spop.$inferInsert> = {}
) {
  const luasBumi = randNumber({ min: 50, max: 2000 });
  const nilaiSistemBumi = luasBumi * randNumber({ min: 500000, max: 5000000 });

  return {
    ...region,
    kdBlok: randNumber({ min: 1, max: 99 }).toString().padStart(3, "0"),
    noUrut: noUrut.toString().padStart(4, "0"),
    kdJnsOp: "0",
    subjekPajakId,
    noFormulirSpop: randNumber({ min: 10000000000, max: 99999999999 }).toString().substring(0, 50),
    jnsTransaksiOp: "1",
    jalanOp: randIdStreetAddress().toUpperCase().substring(0, 30),
    blokKavNoOp: `BLOK ${String.fromCharCode(65 + randNumber({ min: 0, max: 5 }))} / ${randNumber({ min: 1, max: 100 })}`.substring(0, 15),
    rwOp: randNumber({ min: 1, max: 20 }).toString().padStart(2, "0"),
    rtOp: randNumber({ min: 1, max: 50 }).toString().padStart(3, "0"),
    kelurahanOp: ("KELURAHAN " + randNumber({ min: 1, max: 10 })).substring(0, 30),
    kdStatusWp: "1",
    luasBumi,
    kdZnt: "AA",
    jnsBumi: "1",
    nilaiSistemBumi,
    tglPendataanOp: randPastDate(),
    nmPendataanOp: randIdName().toUpperCase().substring(0, 30),
    nipPendata: randNumber({ min: 100000000, max: 999999999 }).toString(),
    tglPemeriksaanOp: randPastDate(),
    nmPemeriksaanOp: randIdName().toUpperCase().substring(0, 30),
    nipPemeriksaOp: randNumber({ min: 100000000, max: 999999999 }).toString(),
    ...overrides,
  } as typeof spop.$inferInsert;
}
