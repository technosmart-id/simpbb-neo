import { randCity, randNumber } from "@ngneat/falso";
import {
  refPropinsi,
  refDati2,
  refKecamatan,
  refKelurahan,
} from "../../schema";

export const SAMPLE_REGIONS = [
  {
    kdPropinsi: "51",
    nmPropinsi: "BALI",
    dati2: [
      {
        kdDati2: "71",
        nmDati2: "KOTA DENPASAR",
        kecamatan: [
          {
            kdKecamatan: "010",
            nmKecamatan: "DENPASAR SELATAN",
            kelurahan: [
              { kdKelurahan: "001", nmKelurahan: "SIDAKARYA" },
              { kdKelurahan: "002", nmKelurahan: "SESETAN" },
            ],
          },
          {
            kdKecamatan: "020",
            nmKecamatan: "DENPASAR TIMUR",
            kelurahan: [
              { kdKelurahan: "001", nmKelurahan: "DANGIN PURI" },
              { kdKelurahan: "002", nmKelurahan: "SUMERTA" },
            ],
          },
        ],
      },
      {
        kdDati2: "72",
        nmDati2: "KABUPATEN BADUNG",
        kecamatan: [
          {
            kdKecamatan: "010",
            nmKecamatan: "KUTA",
            kelurahan: [
              { kdKelurahan: "001", nmKelurahan: "TUBAN" },
              { kdKelurahan: "002", nmKelurahan: "LEGIAN" },
            ],
          },
        ],
      },
    ],
  },
];

export function getBaseWilayahData() {
  const propinsis: (typeof refPropinsi.$inferInsert)[] = [];
  const dati2s: (typeof refDati2.$inferInsert)[] = [];
  const kecamatans: (typeof refKecamatan.$inferInsert)[] = [];
  const kelurahans: (typeof refKelurahan.$inferInsert)[] = [];

  for (const p of SAMPLE_REGIONS) {
    propinsis.push({
      kdPropinsi: p.kdPropinsi,
      nmPropinsi: p.nmPropinsi,
    });

    for (const d of p.dati2) {
      dati2s.push({
        kdPropinsi: p.kdPropinsi,
        kdDati2: d.kdDati2,
        nmDati2: d.nmDati2,
      });

      for (const k of d.kecamatan) {
        kecamatans.push({
          kdPropinsi: p.kdPropinsi,
          kdDati2: d.kdDati2,
          kdKecamatan: k.kdKecamatan,
          nmKecamatan: `${d.nmDati2} ${k.nmKecamatan}`,
          nmKecamatanOnly: k.nmKecamatan,
        });

        for (const kel of k.kelurahan) {
          kelurahans.push({
            kdPropinsi: p.kdPropinsi,
            kdDati2: d.kdDati2,
            kdKecamatan: k.kdKecamatan,
            kdKelurahan: kel.kdKelurahan,
            nmKelurahan: `${k.nmKecamatan} ${kel.nmKelurahan}`,
            nmKelurahanOnly: kel.nmKelurahan,
            noKelurahan: parseInt(kel.kdKelurahan),
            kdSektor: "01",
          });
        }
      }
    }
  }

  return { propinsis, dati2s, kecamatans, kelurahans };
}

export function getRandomRegion() {
  const p = SAMPLE_REGIONS[randNumber({ min: 0, max: SAMPLE_REGIONS.length - 1 })];
  const d = p.dati2[randNumber({ min: 0, max: p.dati2.length - 1 })];
  const k = d.kecamatan[randNumber({ min: 0, max: d.kecamatan.length - 1 })];
  const kel = k.kelurahan[randNumber({ min: 0, max: k.kelurahan.length - 1 })];

  return {
    kdPropinsi: p.kdPropinsi,
    kdDati2: d.kdDati2,
    kdKecamatan: k.kdKecamatan,
    kdKelurahan: kel.kdKelurahan,
  };
}
