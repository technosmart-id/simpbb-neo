"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for demonstration
const mockData = [
  {
    nop: "32.71.010.001.001.0001.0",
    nama: "PT ABADI JAYA",
    alamat: "Jl. Sudirman No. 123",
    kelurahan: "Sukajadi",
    kecamatan: "Cicendo",
    luasTanah: 500,
    luasBangunan: 350,
  },
  {
    nop: "32.71.010.001.001.0002.0",
    nama: "BUDI SANTOSO",
    alamat: "Jl. Asia Afrika No. 45",
    kelurahan: "Braga",
    kecamatan: "Sumur Bandung",
    luasTanah: 200,
    luasBangunan: 150,
  },
  {
    nop: "32.71.010.001.001.0003.0",
    nama: "SITI RAHAYU",
    alamat: "Jl. Merdeka No. 78",
    kelurahan: "Citarum",
    kecamatan: "Bandung Wetan",
    luasTanah: 150,
    luasBangunan: 100,
  },
];

export default function ObjekPajakPage() {
  const router = useRouter();

  const handleRowClick = (nop: string) => {
    router.push(`/objek-pajak/${encodeURIComponent(nop)}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card>
        <CardHeader>
          <CardTitle>Cari Objek Pajak</CardTitle>
          <CardDescription>
            Cari data objek pajak berdasarkan NOP, nama wajib pajak, atau alamat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              className="max-w-md"
              placeholder="Masukkan NOP atau nama wajib pajak..."
            />
            <Button>
              <Search className="mr-2 size-4" />
              Cari
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hasil Pencarian</CardTitle>
          <CardDescription>
            Menampilkan {mockData.length} data objek pajak
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NOP</TableHead>
                <TableHead>Nama WP</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Kelurahan</TableHead>
                <TableHead>Kecamatan</TableHead>
                <TableHead className="text-right">Luas Tanah</TableHead>
                <TableHead className="text-right">Luas Bangunan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockData.map((item) => (
                <TableRow
                  className="cursor-pointer hover:bg-muted/50"
                  key={item.nop}
                  onClick={() => handleRowClick(item.nop)}
                >
                  <TableCell className="font-mono text-sm">
                    {item.nop}
                  </TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.alamat}</TableCell>
                  <TableCell>{item.kelurahan}</TableCell>
                  <TableCell>{item.kecamatan}</TableCell>
                  <TableCell className="text-right">
                    {item.luasTanah.toLocaleString()} m²
                  </TableCell>
                  <TableCell className="text-right">
                    {item.luasBangunan.toLocaleString()} m²
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
