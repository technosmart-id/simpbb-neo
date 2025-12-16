"use client";

import { FileText, Printer, Search } from "lucide-react";
import { useRef, useState } from "react";
import {
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SpptData } from "@/lib/orpc/routers/sppt";

// Mock SPPT data - in production this comes from oRPC
const mockSpptData: SpptData = {
  tahunPajak: 2024,
  kabupaten: "KOTA BANDUNG",
  provinsi: "JAWA BARAT",
  nop: {
    full: "32.71.010.001.001.0001.0",
    provinsi: "32",
    kabupaten: "71",
    kecamatan: "010",
    kelurahan: "001",
    blok: "001",
    noUrut: "0001",
    jenisOP: "0",
  },
  letakOP: {
    alamat: "JL. SUDIRMAN NO. 456",
    rtRw: "001/002",
    kelurahan: "SUKAJADI",
    kecamatan: "CICENDO",
  },
  wajibPajak: {
    nama: "PT ABADI JAYA",
    alamat: "JL. GATOT SUBROTO NO. 123",
    kotaKodePos: "JAKARTA SELATAN 12930",
  },
  objekPajak: {
    luasTanah: 500,
    luasBangunan: 350,
    njopTanahPerM2: 2_500_000,
    njopBangunanPerM2: 3_000_000,
    kelasTanah: "A25",
    kelasBangunan: "A10",
  },
  perhitungan: {
    njopTanah: 1_250_000_000,
    njopBangunan: 1_050_000_000,
    njopTotal: 2_300_000_000,
    njoptkp: 12_000_000,
    njopKenaPajak: 2_288_000_000,
    tarif: 0.2,
    pbbTerutang: 4_576_000,
  },
  jatuhTempo: "30 September 2024",
  tanggalTerbit: "02 Januari 2024",
  nomorUrut: "000001",
  tempatPembayaran: [
    "Bank BJB",
    "Bank BNI",
    "Bank Mandiri",
    "Tokopedia",
    "Kantor Pos",
    "Indomaret/Alfamart",
  ],
};

export default function SpptCetakPage() {
  const [nop, setNop] = useState("");
  const [tahun, setTahun] = useState("2024");
  const [printMode, setPrintMode] = useState<"pdf" | "dotmatrix">("pdf");
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    // In production, this would call oRPC to fetch SPPT data
    setShowPreview(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const styles = getPrintStyles(printMode);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>SPPT PBB ${tahun} - ${nop || mockSpptData.nop.full}</title>
          ${styles}
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" />
            Cetak SPPT
          </CardTitle>
          <CardDescription>
            Cetak Surat Pemberitahuan Pajak Terutang PBB-P2
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <FieldGroup className="flex-1">
              <Field>
                <FieldLabel htmlFor="nop">NOP (Nomor Objek Pajak)</FieldLabel>
                <Input
                  id="nop"
                  onChange={(e) => setNop(e.target.value)}
                  placeholder="32.71.010.001.001.0001.0"
                  value={nop}
                />
              </Field>
            </FieldGroup>

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
                    <SelectItem value="2021">2021</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>

            <Button onClick={handleSearch}>
              <Search className="mr-2 size-4" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview and Print Options */}
      {showPreview ? (
        <>
          {/* Print Options */}
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
                <Badge variant="outline">
                  {printMode === "pdf"
                    ? "Untuk printer inkjet/laser"
                    : "Untuk printer dot matrix"}
                </Badge>
              </div>

              <Button onClick={handlePrint}>
                <Printer className="mr-2 size-4" />
                Cetak SPPT
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview SPPT</CardTitle>
              <CardDescription>
                {printMode === "pdf"
                  ? "Format untuk printer modern (PDF)"
                  : "Format text untuk printer dot matrix (continuous form)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto bg-gray-100 p-4">
              <div ref={printRef}>
                {printMode === "pdf" ? (
                  <SpptDocument data={mockSpptData} />
                ) : (
                  <SpptDotMatrix data={mockSpptData} />
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
