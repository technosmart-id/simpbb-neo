"use client";

import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for pending data entries
const mockPendataan = [
  {
    id: "PD-2024-001",
    nop: "32.71.010.001.001.0004.0",
    nama: "AHMAD HIDAYAT",
    alamat: "Jl. Braga No. 56",
    status: "draft",
    tanggal: "2024-01-15",
    petugas: "Andi Wijaya",
  },
  {
    id: "PD-2024-002",
    nop: "32.71.010.001.001.0005.0",
    nama: "CV MAJU BERSAMA",
    alamat: "Jl. Dago No. 120",
    status: "verifikasi",
    tanggal: "2024-01-14",
    petugas: "Budi Santoso",
  },
  {
    id: "PD-2024-003",
    nop: "32.71.010.001.001.0006.0",
    nama: "DEWI SARTIKA",
    alamat: "Jl. Riau No. 88",
    status: "selesai",
    tanggal: "2024-01-13",
    petugas: "Citra Dewi",
  },
];

const statusVariant = {
  draft: "secondary",
  verifikasi: "outline",
  selesai: "default",
} as const;

const statusLabel = {
  draft: "Draft",
  verifikasi: "Verifikasi",
  selesai: "Selesai",
};

export default function PendataanPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pendataan Bulan Ini</CardDescription>
            <CardTitle className="text-3xl">24</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Menunggu Verifikasi</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Selesai</CardDescription>
            <CardTitle className="text-3xl">16</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Data Entry List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Pendataan</CardTitle>
            <CardDescription>
              Data objek pajak baru yang sedang dalam proses pendataan
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 size-4" />
            Pendataan Baru
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>NOP</TableHead>
                <TableHead>Nama WP</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Petugas</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPendataan.map((item) => (
                <TableRow className="cursor-pointer" key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.nop}
                  </TableCell>
                  <TableCell>{item.nama}</TableCell>
                  <TableCell>{item.alamat}</TableCell>
                  <TableCell>{item.petugas}</TableCell>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        statusVariant[item.status as keyof typeof statusVariant]
                      }
                    >
                      {statusLabel[item.status as keyof typeof statusLabel]}
                    </Badge>
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
