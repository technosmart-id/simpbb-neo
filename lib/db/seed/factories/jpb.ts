import { randNumber } from "@ngneat/falso";
import {
  datJpb2,
  datJpb3,
  datJpb4,
  datJpb5,
  datJpb6,
  datJpb7,
  datJpb8,
  datJpb9,
  datJpb12,
  datJpb13,
  datJpb14,
  datJpb15,
  datJpb16
} from "../../schema";

const randItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

export function createJpbData(nop: any, noBng: number, kdJpb: string) {
  const base = {
    kdPropinsi: nop.kdPropinsi,
    kdDati2: nop.kdDati2,
    kdKecamatan: nop.kdKecamatan,
    kdKelurahan: nop.kdKelurahan,
    kdBlok: nop.kdBlok,
    noUrut: nop.noUrut,
    kdJnsOp: nop.kdJnsOp,
    noBng,
  };

  switch (kdJpb) {
    case '02':
    case '09':
      return {
        ...base,
        klsJpb2: randNumber({ min: 1, max: 4 }).toString(),
      };
    case '03':
      return {
        ...base,
        typeKonstruksi: '1',
        tingKolomJpb3: randNumber({ min: 4, max: 12 }).toString(),
        lbrBentJpb3: randNumber({ min: 6, max: 30 }).toString(),
        luasMezzanineJpb3: randNumber({ min: 0, max: 100 }).toString(),
        kelilingDindingJpb3: randNumber({ min: 20, max: 200 }).toString(),
        dayaDukungLantaiJpb3: randNumber({ min: 1, max: 4 }).toString(),
      };
    case '04':
      return {
        ...base,
        klsJpb4: randNumber({ min: 1, max: 3 }).toString(),
      };
    case '05':
      return {
        ...base,
        klsJpb5: randNumber({ min: 1, max: 4 }).toString(),
        luasJpb5DgnAcSent: '0',
        luasJpb5LainDgnAcSent: '0',
      };
    case '06':
      return {
        ...base,
        klsJpb6: randNumber({ min: 1, max: 2 }).toString(),
      };
    case '07':
      return {
        ...base,
        jnsJpb7: randNumber({ min: 1, max: 2 }).toString(),
        bintangJpb7: randNumber({ min: 0, max: 5 }).toString(),
        jmlKmrJpb7: randNumber({ min: 10, max: 200 }),
        luasKmrJpb7DgnAcSent: randNumber({ min: 0, max: 5000 }).toString(),
        luasKmrLainJpb7DgnAcSent: randNumber({ min: 0, max: 2000 }).toString(),
      };
    case '08':
      return {
        ...base,
        typeKonstruksi: '1',
        tingKolomJpb8: randNumber({ min: 4, max: 8 }).toString(),
        lbrBentJpb8: randNumber({ min: 6, max: 20 }).toString(),
        luasMezzanineJpb8: randNumber({ min: 0, max: 50 }).toString(),
        kelilingDindingJpb8: randNumber({ min: 20, max: 100 }).toString(),
        dayaDukungLantaiJpb8: randNumber({ min: 1, max: 4 }).toString(),
      };
    case '12':
      return {
        ...base,
        typeKonstruksiJpb12: randItem(['1', '2', '3']),
      };
    case '13':
      return {
        ...base,
        klsJpb13: randNumber({ min: 1, max: 4 }).toString(),
        jmlJpb13: randNumber({ min: 1, max: 10 }).toString(),
        luasJpb13DgnAcSent: '0',
        luasJpb13Lain_DGN_AC_SENT: '0',
      };
    case '14':
      return {
        ...base,
        luasKanopiJpb14: randNumber({ min: 20, max: 100 }).toString(),
      };
    case '15':
      return {
        ...base,
        letakTangkiJpb15: randItem(['1', '2']),
        kapasitasTangkiJpb15: randNumber({ min: 1000, max: 100000 }).toString(),
      };
    case '16':
      return {
        ...base,
        klsJpb16: randNumber({ min: 1, max: 2 }).toString(),
      };
    default:
      return null;
  }
}
