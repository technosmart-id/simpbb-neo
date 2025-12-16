import type { SpptData } from "@/lib/orpc/routers/sppt";

// Format number with Indonesian locale
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

// Terbilang (number to Indonesian words)
export function terbilang(n: number): string {
  const satuan = [
    "",
    "satu",
    "dua",
    "tiga",
    "empat",
    "lima",
    "enam",
    "tujuh",
    "delapan",
    "sembilan",
    "sepuluh",
    "sebelas",
  ];

  if (n < 12) return satuan[n];
  if (n < 20) return `${satuan[n - 10]} belas`;
  if (n < 100)
    return `${satuan[Math.floor(n / 10)]} puluh ${satuan[n % 10]}`.trim();
  if (n < 200) return `seratus ${terbilang(n - 100)}`.trim();
  if (n < 1000)
    return `${satuan[Math.floor(n / 100)]} ratus ${terbilang(n % 100)}`.trim();
  if (n < 2000) return `seribu ${terbilang(n - 1000)}`.trim();
  if (n < 1_000_000)
    return `${terbilang(Math.floor(n / 1000))} ribu ${terbilang(n % 1000)}`.trim();
  if (n < 1_000_000_000)
    return `${terbilang(Math.floor(n / 1_000_000))} juta ${terbilang(n % 1_000_000)}`.trim();
  if (n < 1_000_000_000_000)
    return `${terbilang(Math.floor(n / 1_000_000_000))} milyar ${terbilang(n % 1_000_000_000)}`.trim();
  return `${terbilang(Math.floor(n / 1_000_000_000_000))} trilyun ${terbilang(n % 1_000_000_000_000)}`.trim();
}

// PDF/Modern printer SPPT component
export function SpptDocument({ data }: { data: SpptData }) {
  return (
    <div className="mx-auto w-full max-w-[210mm] bg-white p-8 text-black print:p-4">
      {/* Header */}
      <div className="mb-4 border-black border-b-2 pb-4 text-center">
        <p className="font-bold text-xs">PEMERINTAH {data.kabupaten}</p>
        <p className="text-[10px]">PROVINSI {data.provinsi}</p>
        <h1 className="mt-2 font-bold text-lg">
          SURAT PEMBERITAHUAN PAJAK TERUTANG
        </h1>
        <h2 className="font-bold text-base">
          PAJAK BUMI DAN BANGUNAN PERDESAAN DAN PERKOTAAN
        </h2>
        <p className="mt-1 text-sm">TAHUN {data.tahunPajak}</p>
      </div>

      {/* NOP */}
      <div className="mb-4">
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <td className="w-32 py-1">NOP</td>
              <td className="py-1">:</td>
              <td className="py-1">
                <span className="font-bold font-mono tracking-wider">
                  {data.nop.full}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        {/* Left column - Letak Objek Pajak */}
        <div className="border border-black p-2">
          <p className="mb-2 border-black border-b pb-1 font-bold">
            LETAK OBJEK PAJAK
          </p>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-20 py-0.5">Alamat</td>
                <td className="py-0.5">: {data.letakOP.alamat}</td>
              </tr>
              <tr>
                <td className="py-0.5">RT/RW</td>
                <td className="py-0.5">: {data.letakOP.rtRw}</td>
              </tr>
              <tr>
                <td className="py-0.5">Kelurahan</td>
                <td className="py-0.5">: {data.letakOP.kelurahan}</td>
              </tr>
              <tr>
                <td className="py-0.5">Kecamatan</td>
                <td className="py-0.5">: {data.letakOP.kecamatan}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right column - Wajib Pajak */}
        <div className="border border-black p-2">
          <p className="mb-2 border-black border-b pb-1 font-bold">
            NAMA DAN ALAMAT WAJIB PAJAK
          </p>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="w-20 py-0.5">Nama</td>
                <td className="py-0.5">: {data.wajibPajak.nama}</td>
              </tr>
              <tr>
                <td className="py-0.5">Alamat</td>
                <td className="py-0.5">: {data.wajibPajak.alamat}</td>
              </tr>
              <tr>
                <td className="py-0.5" />
                <td className="py-0.5">{data.wajibPajak.kotaKodePos}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Objek Pajak */}
      <div className="mt-4 border border-black text-xs">
        <table className="w-full">
          <thead>
            <tr className="border-black border-b bg-gray-100">
              <th className="border-black border-r p-1 text-left">URAIAN</th>
              <th className="border-black border-r p-1 text-center">
                LUAS (M²)
              </th>
              <th className="border-black border-r p-1 text-center">KELAS</th>
              <th className="border-black border-r p-1 text-right">
                NJOP/M² (Rp)
              </th>
              <th className="p-1 text-right">NJOP (Rp)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-black border-b">
              <td className="border-black border-r p-1">BUMI / TANAH</td>
              <td className="border-black border-r p-1 text-center">
                {formatCurrency(data.objekPajak.luasTanah)}
              </td>
              <td className="border-black border-r p-1 text-center">
                {data.objekPajak.kelasTanah}
              </td>
              <td className="border-black border-r p-1 text-right">
                {formatCurrency(data.objekPajak.njopTanahPerM2)}
              </td>
              <td className="p-1 text-right">
                {formatCurrency(data.perhitungan.njopTanah)}
              </td>
            </tr>
            <tr className="border-black border-b">
              <td className="border-black border-r p-1">BANGUNAN</td>
              <td className="border-black border-r p-1 text-center">
                {formatCurrency(data.objekPajak.luasBangunan)}
              </td>
              <td className="border-black border-r p-1 text-center">
                {data.objekPajak.kelasBangunan}
              </td>
              <td className="border-black border-r p-1 text-right">
                {formatCurrency(data.objekPajak.njopBangunanPerM2)}
              </td>
              <td className="p-1 text-right">
                {formatCurrency(data.perhitungan.njopBangunan)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Perhitungan Pajak */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="border border-black p-2">
          <p className="mb-2 border-black border-b pb-1 font-bold">
            PERHITUNGAN PBB TERUTANG
          </p>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-0.5">NJOP Bumi</td>
                <td className="py-0.5 text-right">
                  Rp {formatCurrency(data.perhitungan.njopTanah)}
                </td>
              </tr>
              <tr>
                <td className="py-0.5">NJOP Bangunan</td>
                <td className="py-0.5 text-right">
                  Rp {formatCurrency(data.perhitungan.njopBangunan)}
                </td>
              </tr>
              <tr className="border-black border-t font-bold">
                <td className="py-0.5">NJOP</td>
                <td className="py-0.5 text-right">
                  Rp {formatCurrency(data.perhitungan.njopTotal)}
                </td>
              </tr>
              <tr>
                <td className="py-0.5">NJOPTKP</td>
                <td className="py-0.5 text-right">
                  Rp {formatCurrency(data.perhitungan.njoptkp)}
                </td>
              </tr>
              <tr className="font-bold">
                <td className="py-0.5">NJOP Kena Pajak</td>
                <td className="py-0.5 text-right">
                  Rp {formatCurrency(data.perhitungan.njopKenaPajak)}
                </td>
              </tr>
              <tr>
                <td className="py-0.5">Tarif</td>
                <td className="py-0.5 text-right">{data.perhitungan.tarif}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border border-black p-2">
          <p className="mb-2 border-black border-b pb-1 font-bold">
            PBB YANG HARUS DIBAYAR
          </p>
          <div className="flex h-full flex-col justify-center">
            <p className="text-center font-bold text-2xl">
              Rp {formatCurrency(data.perhitungan.pbbTerutang)}
            </p>
            <p className="mt-2 text-center text-[10px] italic">
              ({terbilang(data.perhitungan.pbbTerutang)} rupiah)
            </p>
          </div>
        </div>
      </div>

      {/* Jatuh Tempo & Tempat Pembayaran */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="border border-black p-2">
          <p className="mb-2 border-black border-b pb-1 font-bold">
            JATUH TEMPO PEMBAYARAN
          </p>
          <p className="text-center font-bold text-lg">{data.jatuhTempo}</p>
        </div>

        <div className="border border-black p-2">
          <p className="mb-2 border-black border-b pb-1 font-bold">
            TEMPAT PEMBAYARAN
          </p>
          <p className="text-[10px]">{data.tempatPembayaran.join(", ")}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-[10px] text-gray-600">
            * SPPT ini merupakan surat pemberitahuan dan bukan merupakan bukti
            kepemilikan hak
          </p>
        </div>
        <div className="text-right">
          <p>
            {data.kabupaten}, {data.tanggalTerbit}
          </p>
          <p className="mt-8">KEPALA BADAN PENDAPATAN DAERAH</p>
          <p className="mt-12 font-bold">____________________</p>
          <p>NIP. ____________________</p>
        </div>
      </div>
    </div>
  );
}

// Dot Matrix / Text-only SPPT
export function SpptDotMatrix({ data }: { data: SpptData }) {
  const pad = (str: string, len: number, char = " ") =>
    str.padEnd(len, char).slice(0, len);
  const padStart = (str: string, len: number, char = " ") =>
    str.padStart(len, char).slice(-len);
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

PERHITUNGAN PBB TERUTANG:
${line("-")}
NJOP Bumi                    : Rp ${padStart(formatCurrency(data.perhitungan.njopTanah), 20)}
NJOP Bangunan                : Rp ${padStart(formatCurrency(data.perhitungan.njopBangunan), 20)}
                               ${line("-").slice(0, 26)}
NJOP                         : Rp ${padStart(formatCurrency(data.perhitungan.njopTotal), 20)}
NJOPTKP                      : Rp ${padStart(formatCurrency(data.perhitungan.njoptkp), 20)}
                               ${line("-").slice(0, 26)}
NJOP Kena Pajak              : Rp ${padStart(formatCurrency(data.perhitungan.njopKenaPajak), 20)}
Tarif                        : ${padStart(`${data.perhitungan.tarif}%`, 23)}
${line("=")}
PBB YANG HARUS DIBAYAR       : Rp ${padStart(formatCurrency(data.perhitungan.pbbTerutang), 20)}
${line("=")}
Terbilang: ${terbilang(data.perhitungan.pbbTerutang)} rupiah

JATUH TEMPO PEMBAYARAN : ${data.jatuhTempo}

TEMPAT PEMBAYARAN:
${data.tempatPembayaran.join(", ")}

${line("-")}
* SPPT ini merupakan surat pemberitahuan dan bukan bukti kepemilikan hak

${pad("", 50)}${data.kabupaten}, ${data.tanggalTerbit}
${pad("", 50)}KEPALA BADAN PENDAPATAN DAERAH



${pad("", 50)}____________________
${pad("", 50)}NIP. ____________________
${line()}
`.trim();

  return (
    <pre className="overflow-x-auto whitespace-pre bg-white p-4 font-mono text-[11px] text-black leading-tight print:text-[10px]">
      {content}
    </pre>
  );
}

// Print styles helper
export function getPrintStyles(mode: "pdf" | "dotmatrix"): string {
  return mode === "pdf"
    ? `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; }
        @page { size: A4; margin: 10mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-after: always; }
        }
      </style>
    `
    : `
      <style>
        * { margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; }
        pre { white-space: pre; font-size: 10pt; line-height: 1.2; }
        @page { size: A4; margin: 5mm; }
        @media print {
          .page-break { page-break-after: always; }
        }
      </style>
    `;
}
