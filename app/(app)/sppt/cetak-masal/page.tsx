"use client";

import { Files, Filter, Printer } from "lucide-react";
import { useRef, useState } from "react";
import {
  formatCurrency,
  getPrintStyles,
  SpptDocument,
  SpptDotMatrix,
} from "@/components/sppt/sppt-document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SpptData } from "@/lib/orpc/routers/sppt";

// Mock data generator for batch
function generateMockSpptBatch(count: number, tahun: number): SpptData[] {
  const kelurahanList = ["SUKAJADI", "SUKAMAJU", "PASTEUR", "SEKELOA", "LEBAK"];
  const kecamatanList = ["CICENDO", "SUKAJADI", "COBLONG"];
  const namaList = [
    "PT ABADI JAYA",
    "CV SENTOSA MAKMUR",
    "BUDI SANTOSO",
    "SITI RAHAYU",
    "H. AHMAD YANI",
    "TOKO SEJAHTERA",
    "UD MAJU BERSAMA",
  ];

  return Array.from({ length: count }, (_, i) => {
    const luasTanah = 100 + Math.floor(Math.random() * 500);
    const luasBangunan = 50 + Math.floor(Math.random() * 300);
    const njopTanahPerM2 = 500_000 + Math.floor(Math.random() * 3_000_000);
    const njopBangunanPerM2 = 1_000_000 + Math.floor(Math.random() * 3_000_000);
    const njopTanah = luasTanah * njopTanahPerM2;
    const njopBangunan = luasBangunan * njopBangunanPerM2;
    const njopTotal = njopTanah + njopBangunan;
    const njoptkp = 12_000_000;
    const njopKenaPajak = Math.max(0, njopTotal - njoptkp);
    const tarif = njopTotal > 1_000_000_000 ? 0.2 : 0.1;
    const pbbTerutang = Math.round((njopKenaPajak * tarif) / 100);

    const kelurahan =
      kelurahanList[Math.floor(Math.random() * kelurahanList.length)];
    const kecamatan =
      kecamatanList[Math.floor(Math.random() * kecamatanList.length)];

    return {
      tahunPajak: tahun,
      kabupaten: "KOTA BANDUNG",
      provinsi: "JAWA BARAT",
      nop: {
        full: `32.71.010.001.${String(i + 1).padStart(3, "0")}.${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}.0`,
        provinsi: "32",
        kabupaten: "71",
        kecamatan: "010",
        kelurahan: "001",
        blok: String(i + 1).padStart(3, "0"),
        noUrut: String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0"),
        jenisOP: "0",
      },
      letakOP: {
        alamat: `JL. ${["SUDIRMAN", "ASIA AFRIKA", "DAGO", "PASTEUR", "SUKAJADI"][i % 5]} NO. ${i + 1}`,
        rtRw: `00${(i % 9) + 1}/00${(i % 5) + 1}`,
        kelurahan,
        kecamatan,
      },
      wajibPajak: {
        nama: namaList[i % namaList.length],
        alamat: `JL. CONTOH NO. ${i + 100}`,
        kotaKodePos: "BANDUNG 40115",
      },
      objekPajak: {
        luasTanah,
        luasBangunan,
        njopTanahPerM2,
        njopBangunanPerM2,
        kelasTanah: `A${20 + (i % 10)}`,
        kelasBangunan: `A${10 + (i % 10)}`,
      },
      perhitungan: {
        njopTanah,
        njopBangunan,
        njopTotal,
        njoptkp,
        njopKenaPajak,
        tarif,
        pbbTerutang,
      },
      jatuhTempo: `30 September ${tahun}`,
      tanggalTerbit: `02 Januari ${tahun}`,
      nomorUrut: String(i + 1).padStart(6, "0"),
      tempatPembayaran: [
        "Bank BJB",
        "Bank BNI",
        "Bank Mandiri",
        "Tokopedia",
        "Kantor Pos",
        "Indomaret/Alfamart",
      ],
    };
  });
}

export default function SpptCetakMasalPage() {
  const [tahun, setTahun] = useState("2024");
  const [kecamatan, setKecamatan] = useState("semua");
  const [kelurahan, setKelurahan] = useState("semua");
  const [statusCetak, setStatusCetak] = useState("semua");
  const [printMode, setPrintMode] = useState<"pdf" | "dotmatrix">("pdf");
  const [spptList, setSpptList] = useState<SpptData[]>([]);
  const [selectedNops, setSelectedNops] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    setIsLoading(true);
    // Simulate API call - in production this would call oRPC
    setTimeout(() => {
      const mockData = generateMockSpptBatch(20, Number.parseInt(tahun));
      setSpptList(mockData);
      setSelectedNops(new Set());
      setIsLoading(false);
    }, 500);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNops(new Set(spptList.map((s) => s.nop.full)));
    } else {
      setSelectedNops(new Set());
    }
  };

  const handleSelectOne = (nop: string, checked: boolean) => {
    const newSelected = new Set(selectedNops);
    if (checked) {
      newSelected.add(nop);
    } else {
      newSelected.delete(nop);
    }
    setSelectedNops(newSelected);
  };

  const selectedSpptList = spptList.filter((s) => selectedNops.has(s.nop.full));

  const handlePrint = () => {
    if (selectedSpptList.length === 0) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = getPrintStyles(printMode);

    // Generate HTML for all selected SPPTs
    const spptHtml = selectedSpptList
      .map((sppt, index) => {
        const isLast = index === selectedSpptList.length - 1;
        const pageBreak = isLast ? "" : 'class="page-break"';

        if (printMode === "pdf") {
          return `<div ${pageBreak}>${renderSpptDocumentHtml(sppt)}</div>`;
        }
        return `<div ${pageBreak}>${renderSpptDotMatrixHtml(sppt)}</div>`;
      })
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak Masal SPPT PBB ${tahun} - ${selectedSpptList.length} lembar</title>
          ${styles}
        </head>
        <body>
          ${spptHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // Helper to render SPPT document as HTML string (for print)
  function renderSpptDocumentHtml(data: SpptData): string {
    return `
      <div style="max-width: 210mm; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; font-size: 12px; color: black; background: white;">
        <div style="text-align: center; border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 10px;">
          <p style="font-weight: bold; font-size: 11px;">PEMERINTAH ${data.kabupaten}</p>
          <p style="font-size: 10px;">PROVINSI ${data.provinsi}</p>
          <h1 style="margin-top: 8px; font-size: 14px; font-weight: bold;">SURAT PEMBERITAHUAN PAJAK TERUTANG</h1>
          <h2 style="font-size: 12px; font-weight: bold;">PAJAK BUMI DAN BANGUNAN PERDESAAN DAN PERKOTAAN</h2>
          <p style="margin-top: 5px;">TAHUN ${data.tahunPajak}</p>
        </div>
        <table style="width: 100%; font-size: 11px; margin-bottom: 10px;">
          <tr><td style="width: 100px;">NOP</td><td>:</td><td><strong style="font-family: monospace; letter-spacing: 1px;">${data.nop.full}</strong></td></tr>
        </table>
        <div style="display: flex; gap: 10px; font-size: 10px;">
          <div style="flex: 1; border: 1px solid black; padding: 8px;">
            <p style="font-weight: bold; border-bottom: 1px solid black; padding-bottom: 4px; margin-bottom: 4px;">LETAK OBJEK PAJAK</p>
            <table style="width: 100%;"><tr><td style="width: 60px;">Alamat</td><td>: ${data.letakOP.alamat}</td></tr><tr><td>RT/RW</td><td>: ${data.letakOP.rtRw}</td></tr><tr><td>Kelurahan</td><td>: ${data.letakOP.kelurahan}</td></tr><tr><td>Kecamatan</td><td>: ${data.letakOP.kecamatan}</td></tr></table>
          </div>
          <div style="flex: 1; border: 1px solid black; padding: 8px;">
            <p style="font-weight: bold; border-bottom: 1px solid black; padding-bottom: 4px; margin-bottom: 4px;">NAMA DAN ALAMAT WAJIB PAJAK</p>
            <table style="width: 100%;"><tr><td style="width: 50px;">Nama</td><td>: ${data.wajibPajak.nama}</td></tr><tr><td>Alamat</td><td>: ${data.wajibPajak.alamat}</td></tr><tr><td></td><td>${data.wajibPajak.kotaKodePos}</td></tr></table>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px;">
          <thead><tr style="background: #f0f0f0; border: 1px solid black;"><th style="border: 1px solid black; padding: 4px; text-align: left;">URAIAN</th><th style="border: 1px solid black; padding: 4px; text-align: center;">LUAS (M²)</th><th style="border: 1px solid black; padding: 4px; text-align: center;">KELAS</th><th style="border: 1px solid black; padding: 4px; text-align: right;">NJOP/M² (Rp)</th><th style="border: 1px solid black; padding: 4px; text-align: right;">NJOP (Rp)</th></tr></thead>
          <tbody>
            <tr><td style="border: 1px solid black; padding: 4px;">BUMI / TANAH</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${formatCurrency(data.objekPajak.luasTanah)}</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${data.objekPajak.kelasTanah}</td><td style="border: 1px solid black; padding: 4px; text-align: right;">${formatCurrency(data.objekPajak.njopTanahPerM2)}</td><td style="border: 1px solid black; padding: 4px; text-align: right;">${formatCurrency(data.perhitungan.njopTanah)}</td></tr>
            <tr><td style="border: 1px solid black; padding: 4px;">BANGUNAN</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${formatCurrency(data.objekPajak.luasBangunan)}</td><td style="border: 1px solid black; padding: 4px; text-align: center;">${data.objekPajak.kelasBangunan}</td><td style="border: 1px solid black; padding: 4px; text-align: right;">${formatCurrency(data.objekPajak.njopBangunanPerM2)}</td><td style="border: 1px solid black; padding: 4px; text-align: right;">${formatCurrency(data.perhitungan.njopBangunan)}</td></tr>
          </tbody>
        </table>
        <div style="display: flex; gap: 10px; margin-top: 10px; font-size: 10px;">
          <div style="flex: 1; border: 1px solid black; padding: 8px;">
            <p style="font-weight: bold; border-bottom: 1px solid black; padding-bottom: 4px; margin-bottom: 4px;">PERHITUNGAN PBB</p>
            <table style="width: 100%;"><tr><td>NJOP Bumi</td><td style="text-align: right;">Rp ${formatCurrency(data.perhitungan.njopTanah)}</td></tr><tr><td>NJOP Bangunan</td><td style="text-align: right;">Rp ${formatCurrency(data.perhitungan.njopBangunan)}</td></tr><tr style="border-top: 1px solid black; font-weight: bold;"><td>NJOP</td><td style="text-align: right;">Rp ${formatCurrency(data.perhitungan.njopTotal)}</td></tr><tr><td>NJOPTKP</td><td style="text-align: right;">Rp ${formatCurrency(data.perhitungan.njoptkp)}</td></tr><tr style="font-weight: bold;"><td>NJOP Kena Pajak</td><td style="text-align: right;">Rp ${formatCurrency(data.perhitungan.njopKenaPajak)}</td></tr></table>
          </div>
          <div style="flex: 1; border: 1px solid black; padding: 8px; text-align: center;">
            <p style="font-weight: bold; border-bottom: 1px solid black; padding-bottom: 4px; margin-bottom: 8px;">PBB YANG HARUS DIBAYAR</p>
            <p style="font-size: 18px; font-weight: bold;">Rp ${formatCurrency(data.perhitungan.pbbTerutang)}</p>
          </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 10px; font-size: 10px;">
          <div style="flex: 1; border: 1px solid black; padding: 8px; text-align: center;"><p style="font-weight: bold;">JATUH TEMPO</p><p style="font-size: 12px; font-weight: bold;">${data.jatuhTempo}</p></div>
          <div style="flex: 1; border: 1px solid black; padding: 8px;"><p style="font-weight: bold;">TEMPAT PEMBAYARAN</p><p style="font-size: 9px;">${data.tempatPembayaran.join(", ")}</p></div>
        </div>
        <div style="margin-top: 15px; text-align: right; font-size: 10px;">
          <p>${data.kabupaten}, ${data.tanggalTerbit}</p>
          <p style="margin-top: 40px;">KEPALA BADAN PENDAPATAN DAERAH</p>
          <p style="margin-top: 50px; font-weight: bold;">____________________</p>
        </div>
      </div>
    `;
  }

  function renderSpptDotMatrixHtml(data: SpptData): string {
    const pad = (str: string, len: number) =>
      str.padEnd(len, " ").slice(0, len);
    const padStart = (str: string, len: number) =>
      str.padStart(len, " ").slice(-len);
    const line = (char = "=") => char.repeat(80);

    const content = `
${line()}
${pad("", 20)}PEMERINTAH ${data.kabupaten}
${pad("", 25)}PROVINSI ${data.provinsi}
${line()}
${pad("", 15)}SURAT PEMBERITAHUAN PAJAK TERUTANG (SPPT)
${pad("", 10)}PAJAK BUMI DAN BANGUNAN PERDESAAN DAN PERKOTAAN
${pad("", 30)}TAHUN ${data.tahunPajak}
${line()}

NOP : ${data.nop.full}

${line("-")}
LETAK OBJEK PAJAK                    | NAMA DAN ALAMAT WAJIB PAJAK
${line("-")}
Alamat    : ${pad(data.letakOP.alamat, 23)} | Nama   : ${data.wajibPajak.nama}
RT/RW     : ${pad(data.letakOP.rtRw, 23)} | Alamat : ${data.wajibPajak.alamat}
Kelurahan : ${pad(data.letakOP.kelurahan, 23)} |          ${data.wajibPajak.kotaKodePos}
Kecamatan : ${pad(data.letakOP.kecamatan, 23)} |
${line("-")}

${line("-")}
URAIAN          | LUAS (M2) | KELAS | NJOP/M2 (Rp)    | NJOP (Rp)
${line("-")}
BUMI / TANAH    | ${padStart(formatCurrency(data.objekPajak.luasTanah), 9)} | ${pad(data.objekPajak.kelasTanah, 5)} | ${padStart(formatCurrency(data.objekPajak.njopTanahPerM2), 15)} | ${padStart(formatCurrency(data.perhitungan.njopTanah), 18)}
BANGUNAN        | ${padStart(formatCurrency(data.objekPajak.luasBangunan), 9)} | ${pad(data.objekPajak.kelasBangunan, 5)} | ${padStart(formatCurrency(data.objekPajak.njopBangunanPerM2), 15)} | ${padStart(formatCurrency(data.perhitungan.njopBangunan), 18)}
${line("-")}

PBB YANG HARUS DIBAYAR       : Rp ${padStart(formatCurrency(data.perhitungan.pbbTerutang), 20)}
JATUH TEMPO PEMBAYARAN       : ${data.jatuhTempo}
${line()}
    `.trim();

    return `<pre style="font-family: 'Courier New', monospace; font-size: 10pt; line-height: 1.2; white-space: pre;">${content}</pre>`;
  }

  const totalPbb = selectedSpptList.reduce(
    (sum, s) => sum + s.perhitungan.pbbTerutang,
    0
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Filter Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Files className="size-5" />
            Cetak Masal SPPT
          </CardTitle>
          <CardDescription>
            Cetak SPPT dalam jumlah banyak berdasarkan filter wilayah
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <FieldGroup className="w-32">
              <Field>
                <FieldLabel htmlFor="tahun">Tahun</FieldLabel>
                <Select onValueChange={setTahun} value={tahun}>
                  <SelectTrigger id="tahun">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup className="w-40">
              <Field>
                <FieldLabel htmlFor="kecamatan">Kecamatan</FieldLabel>
                <Select onValueChange={setKecamatan} value={kecamatan}>
                  <SelectTrigger id="kecamatan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="cicendo">Cicendo</SelectItem>
                    <SelectItem value="sukajadi">Sukajadi</SelectItem>
                    <SelectItem value="coblong">Coblong</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup className="w-40">
              <Field>
                <FieldLabel htmlFor="kelurahan">Kelurahan</FieldLabel>
                <Select onValueChange={setKelurahan} value={kelurahan}>
                  <SelectTrigger id="kelurahan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="sukajadi">Sukajadi</SelectItem>
                    <SelectItem value="pasteur">Pasteur</SelectItem>
                    <SelectItem value="sekeloa">Sekeloa</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <FieldGroup className="w-40">
              <Field>
                <FieldLabel htmlFor="status">Status Cetak</FieldLabel>
                <Select onValueChange={setStatusCetak} value={statusCetak}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="belum">Belum Cetak</SelectItem>
                    <SelectItem value="sudah">Sudah Cetak</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <Button disabled={isLoading} onClick={handleSearch}>
              <Filter className="mr-2 size-4" />
              {isLoading ? "Memuat..." : "Filter Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {spptList.length > 0 ? (
        <>
          {/* Print Options & Summary */}
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-sm">
                  Mode Cetak:
                </span>
                <Tabs
                  onValueChange={(v) => setPrintMode(v as "pdf" | "dotmatrix")}
                  value={printMode}
                >
                  <TabsList>
                    <TabsTrigger value="pdf">PDF / Modern</TabsTrigger>
                    <TabsTrigger value="dotmatrix">
                      Dot Matrix / Text
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Dipilih</p>
                  <p className="font-semibold">
                    {selectedNops.size} dari {spptList.length}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-xs">Total PBB</p>
                  <p className="font-semibold text-primary">
                    Rp {formatCurrency(totalPbb)}
                  </p>
                </div>
                <Button
                  disabled={selectedNops.size === 0}
                  onClick={handlePrint}
                >
                  <Printer className="mr-2 size-4" />
                  Cetak {selectedNops.size} SPPT
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar SPPT</CardTitle>
              <CardDescription>
                Pilih SPPT yang akan dicetak (total: {spptList.length} data)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedNops.size === spptList.length &&
                          spptList.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>NOP</TableHead>
                    <TableHead>Nama WP</TableHead>
                    <TableHead>Kelurahan</TableHead>
                    <TableHead className="text-right">Luas (m²)</TableHead>
                    <TableHead className="text-right">NJOP</TableHead>
                    <TableHead className="text-right">PBB</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spptList.map((sppt) => (
                    <TableRow
                      className="cursor-pointer"
                      key={sppt.nop.full}
                      onClick={() =>
                        handleSelectOne(
                          sppt.nop.full,
                          !selectedNops.has(sppt.nop.full)
                        )
                      }
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedNops.has(sppt.nop.full)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(sppt.nop.full, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {sppt.nop.full}
                      </TableCell>
                      <TableCell>{sppt.wajibPajak.nama}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sppt.letakOP.kelurahan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(
                          sppt.objekPajak.luasTanah +
                            sppt.objekPajak.luasBangunan
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(sppt.perhitungan.njopTotal)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(sppt.perhitungan.pbbTerutang)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Preview (hidden, used for reference) */}
          <div className="hidden" ref={printRef}>
            {selectedSpptList.map((sppt) =>
              printMode === "pdf" ? (
                <div className="page-break" key={sppt.nop.full}>
                  <SpptDocument data={sppt} />
                </div>
              ) : (
                <div className="page-break" key={sppt.nop.full}>
                  <SpptDotMatrix data={sppt} />
                </div>
              )
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
