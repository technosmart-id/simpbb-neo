import {
  randEmail,
  randPhoneNumber,
  randZipCode,
  randNumber,
  rand,
} from "@ngneat/falso";
import { randIdName, randIdStreetAddress } from "./id-falso";
import { datSubjekPajak } from "../../schema";

const FUNNY_CITIES = ["KOTA REBAHAN", "KABUPATEN NGEGAS"];
const FUNNY_KELURAHANS = ["KASUR EMPUK", "BANTAL GULING", "GORENGAN PANAS", "ES TEH MANIS", "KNALPOT RACING", "SPION KIRI"];

export function createSubjekPajak(overrides: Partial<typeof datSubjekPajak.$inferInsert> = {}) {
  const id = randNumber({ min: 1000000000, max: 9999999999 }).toString();
  
  return {
    subjekPajakId: id,
    nmWp: randIdName().toUpperCase().substring(0, 30),
    jalanWp: randIdStreetAddress().toUpperCase().substring(0, 100),
    blokKavNoWp: `BLOK ${String.fromCharCode(65 + randNumber({ min: 0, max: 5 }))} / ${randNumber({ min: 1, max: 100 })}`.substring(0, 15),
    rwWp: randNumber({ min: 1, max: 20 }).toString().padStart(2, "0"),
    rtWp: randNumber({ min: 1, max: 50 }).toString().padStart(3, "0"),
    kelurahanWp: rand(FUNNY_KELURAHANS),
    kotaWp: rand(FUNNY_CITIES),
    kdPosWp: randZipCode().substring(0, 5),
    telpWp: randPhoneNumber().substring(0, 20),
    npwp: randNumber({ min: 1000000000, max: 9999999999 }).toString().substring(0, 16),
    statusPekerjaanWp: randNumber({ min: 1, max: 5 }).toString(),
    emailWp: randEmail().substring(0, 100),
    ...overrides,
  } as typeof datSubjekPajak.$inferInsert;
}
