import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { oz } from "../oz";
import { zSingleResourceResponse } from "../schemas/response-envelope";
import { protectedProcedure } from "../server";

const parseNop = (nop: string) => {
  const clean = nop.replace(/[^0-9]/g, "");
  if (clean.length !== 18) {
    throw new Error("Invalid NOP format: length must be 18 digits");
  }
  return {
    kdPropinsi: clean.substring(0, 2),
    kdDati2: clean.substring(2, 4),
    kdKecamatan: clean.substring(4, 7),
    kdKelurahan: clean.substring(7, 10),
    kdBlok: clean.substring(10, 13),
    noUrut: clean.substring(13, 17),
    kdJnsOp: clean.substring(17, 18),
  };
};

export const assessmentRouter = {
  // calculate: POST /assessment/calculate
  calculate: protectedProcedure
    .route({
      method: "POST",
      path: "/assessment/calculate",
      summary: "Hitung Penetapan PBB (Assessment)",
    })
    .input(
      z.object({
        nop: oz.openapi(z.string().length(18), {
          example: "320101000100100010",
        }),
        tahun: oz.openapi(z.string().length(4), {
          example: new Date().getFullYear().toString(),
        }),
        tarif: oz.openapi(z.number().optional().default(0.1), {
          description: "Tax rate in percentage (e.g., 0.1 for 0.1%)",
        }),
        njoptkp: oz.openapi(z.number().optional().default(12_000_000), {
          description: "Non-taxable NJOP threshold",
        }),
        jatuhTempo: oz.openapi(z.coerce.date().optional(), {
          description: "Due date (default: 6 months from now)",
        }),
      })
    )
    .output(zSingleResourceResponse(z.any()))
    .handler(async ({ input }) => {
      let parsed: ReturnType<typeof parseNop>;
      try {
        parsed = parseNop(input.nop);
      } catch (e) {
        throw new Error(`Invalid NOP: ${input.nop}`);
      }

      const jatuhTempo =
        input.jatuhTempo ||
        new Date(new Date().setMonth(new Date().getMonth() + 6));

      // Call Stored Procedure
      // Signature: penetapan_massal(nop_parts..., tahun, njoptkp, tarif, bank_parts..., jatuh_tempo, nip)

      // Defaults for Bank/Office data (hardcoded for MVP)
      const kdKanwil = "01";
      const kdKppbb = "01";
      const kdBankTunggal = "01";
      const kdBankPersepsi = "01";
      const kdTp = "01";
      const nip = "SYSTEM";

      await db.execute(sql`
        CALL penetapan_massal(
          ${parsed.kdPropinsi}, 
          ${parsed.kdDati2}, 
          ${parsed.kdKecamatan}, 
          ${parsed.kdKelurahan}, 
          ${parsed.kdBlok}, 
          ${parsed.noUrut}, 
          ${parsed.kdJnsOp},
          ${input.tahun},
          ${input.njoptkp},
          ${input.tarif},
          ${kdKanwil},
          ${kdKppbb},
          ${kdBankTunggal},
          ${kdBankPersepsi},
          ${kdTp},
          ${jatuhTempo},
          ${nip}
        )
      `);

      // Refetch result from SPPT to confirm
      const result = await db.execute(sql`
        SELECT * FROM sppt 
        WHERE kd_propinsi = ${parsed.kdPropinsi}
          AND kd_dati2 = ${parsed.kdDati2}
          AND kd_kecamatan = ${parsed.kdKecamatan}
          AND kd_kelurahan = ${parsed.kdKelurahan}
          AND kd_blok = ${parsed.kdBlok}
          AND no_urut = ${parsed.noUrut}
          AND kd_jns_op = ${parsed.kdJnsOp}
          AND thn_pajak_sppt = ${input.tahun}
      `);

      const spptData = result.rows[0];

      return {
        data: {
          message: "Assessment calculated successfully",
          sppt: spptData,
        },
      };
    }),
};
