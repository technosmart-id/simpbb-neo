import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  datObjekPajak,
  datOpBangunan,
  datOpBumi,
  datSubjekPajak,
  refDati2,
  refJpb,
  refKecamatan,
  refKelurahan,
  refPropinsi,
} from "@/lib/db/schema/pbb";

// Parse NOP string format: 32.71.010.001.001.0001.0
function parseNop(nopString: string) {
  const decoded = decodeURIComponent(nopString);
  const parts = decoded.split(".");

  if (parts.length !== 7) {
    return null;
  }

  return {
    kdPropinsi: parts[0],
    kdDati2: parts[1],
    kdKecamatan: parts[2],
    kdKelurahan: parts[3],
    kdBlok: parts[4],
    noUrut: parts[5],
    kdJnsOp: parts[6],
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nop: string }> }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { nop: nopParam } = await params;
  const nop = parseNop(nopParam);

  if (!nop) {
    return NextResponse.json(
      { error: "Invalid NOP format. Expected: XX.XX.XXX.XXX.XXX.XXXX.X" },
      { status: 400 }
    );
  }

  const nopConditions = and(
    eq(datObjekPajak.kdPropinsi, nop.kdPropinsi),
    eq(datObjekPajak.kdDati2, nop.kdDati2),
    eq(datObjekPajak.kdKecamatan, nop.kdKecamatan),
    eq(datObjekPajak.kdKelurahan, nop.kdKelurahan),
    eq(datObjekPajak.kdBlok, nop.kdBlok),
    eq(datObjekPajak.noUrut, nop.noUrut),
    eq(datObjekPajak.kdJnsOp, nop.kdJnsOp)
  );

  // Fetch main objek pajak data
  const objekPajak = await db
    .select()
    .from(datObjekPajak)
    .where(nopConditions)
    .limit(1);

  if (objekPajak.length === 0) {
    return NextResponse.json(
      { error: "Objek pajak not found" },
      { status: 404 }
    );
  }

  const op = objekPajak[0];

  // Fetch subjek pajak (taxpayer) data
  const subjekPajak = await db
    .select()
    .from(datSubjekPajak)
    .where(eq(datSubjekPajak.subjekPajakId, op.subjekPajakId))
    .limit(1);

  // Fetch bumi (land) data
  const bumiData = await db
    .select()
    .from(datOpBumi)
    .where(
      and(
        eq(datOpBumi.kdPropinsi, nop.kdPropinsi),
        eq(datOpBumi.kdDati2, nop.kdDati2),
        eq(datOpBumi.kdKecamatan, nop.kdKecamatan),
        eq(datOpBumi.kdKelurahan, nop.kdKelurahan),
        eq(datOpBumi.kdBlok, nop.kdBlok),
        eq(datOpBumi.noUrut, nop.noUrut),
        eq(datOpBumi.kdJnsOp, nop.kdJnsOp)
      )
    );

  // Fetch bangunan (building) data
  const bangunanData = await db
    .select()
    .from(datOpBangunan)
    .where(
      and(
        eq(datOpBangunan.kdPropinsi, nop.kdPropinsi),
        eq(datOpBangunan.kdDati2, nop.kdDati2),
        eq(datOpBangunan.kdKecamatan, nop.kdKecamatan),
        eq(datOpBangunan.kdKelurahan, nop.kdKelurahan),
        eq(datOpBangunan.kdBlok, nop.kdBlok),
        eq(datOpBangunan.noUrut, nop.noUrut),
        eq(datOpBangunan.kdJnsOp, nop.kdJnsOp)
      )
    );

  // Fetch reference data for region names
  const propinsi = await db
    .select()
    .from(refPropinsi)
    .where(eq(refPropinsi.kdPropinsi, nop.kdPropinsi))
    .limit(1);

  const dati2 = await db
    .select()
    .from(refDati2)
    .where(
      and(
        eq(refDati2.kdPropinsi, nop.kdPropinsi),
        eq(refDati2.kdDati2, nop.kdDati2)
      )
    )
    .limit(1);

  const kecamatan = await db
    .select()
    .from(refKecamatan)
    .where(
      and(
        eq(refKecamatan.kdPropinsi, nop.kdPropinsi),
        eq(refKecamatan.kdDati2, nop.kdDati2),
        eq(refKecamatan.kdKecamatan, nop.kdKecamatan)
      )
    )
    .limit(1);

  const kelurahan = await db
    .select()
    .from(refKelurahan)
    .where(
      and(
        eq(refKelurahan.kdPropinsi, nop.kdPropinsi),
        eq(refKelurahan.kdDati2, nop.kdDati2),
        eq(refKelurahan.kdKecamatan, nop.kdKecamatan),
        eq(refKelurahan.kdKelurahan, nop.kdKelurahan)
      )
    )
    .limit(1);

  // Fetch JPB (building type) references for buildings
  const jpbCodes = [...new Set(bangunanData.map((b) => b.kdJpb))];
  const jpbRefs = jpbCodes.length > 0 ? await db.select().from(refJpb) : [];

  const jpbMap = new Map(jpbRefs.map((j) => [j.kdJpb.trim(), j.nmJpb]));

  // Build response with enriched data
  const response = {
    nop: `${nop.kdPropinsi}.${nop.kdDati2}.${nop.kdKecamatan}.${nop.kdKelurahan}.${nop.kdBlok}.${nop.noUrut}.${nop.kdJnsOp}`,
    objekPajak: op,
    subjekPajak: subjekPajak[0] || null,
    wilayah: {
      propinsi: propinsi[0]?.nmPropinsi || null,
      dati2: dati2[0]?.nmDati2 || null,
      kecamatan: kecamatan[0]?.nmKecamatan || null,
      kelurahan: kelurahan[0]?.nmKelurahan || null,
    },
    bumi: bumiData.map((b) => ({
      noBumi: b.noBumi,
      kdZnt: b.kdZnt,
      luasBumi: b.luasBumi,
      jnsBumi: b.jnsBumi,
      nilaiSistemBumi: b.nilaiSistemBumi,
    })),
    bangunan: bangunanData.map((b) => ({
      noBng: b.noBng,
      kdJpb: b.kdJpb,
      nmJpb: jpbMap.get(b.kdJpb.trim()) || "Unknown",
      noFormulirLspop: b.noFormulirLspop,
      thnDibangunBng: b.thnDibangunBng,
      thnRenovasiBng: b.thnRenovasiBng,
      luasBng: b.luasBng,
      jmlLantaiBng: b.jmlLantaiBng,
      kondisiBng: b.kondisiBng,
      jnsKonstruksiBng: b.jnsKonstruksiBng,
      jnsAtapBng: b.jnsAtapBng,
      kdDinding: b.kdDinding,
      kdLantai: b.kdLantai,
      kdLangitLangit: b.kdLangitLangit,
      nilaiSistemBng: b.nilaiSistemBng,
    })),
    summary: {
      totalLuasBumi: op.totalLuasBumi,
      totalLuasBng: op.totalLuasBng,
      njopBumi: op.njopBumi,
      njopBng: op.njopBng,
      njopTotal: op.njopBumi + op.njopBng,
    },
  };

  return NextResponse.json(response);
}
