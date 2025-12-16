"use client";

import { ArrowRightLeft, Plus } from "lucide-react";
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

// Mock data for mutations
const mockMutasi = [
  {
    id: "MT-2024-001",
    nop: "32.71.010.001.001.0001.0",
    jenisMutasi: "Balik Nama",
    namaDari: "PT ABADI JAYA",
    namaKe: "CV SENTOSA MANDIRI",
    tanggal: "2024-01-15",
    status: "proses",
  },
  {
    id: "MT-2024-002",
    nop: "32.71.010.001.001.0002.0",
    jenisMutasi: "Pecah NOP",
    namaDari: "BUDI SANTOSO",
    namaKe: "BUDI SANTOSO (2 NOP)",
    tanggal: "2024-01-14",
    status: "selesai",
  },
  {
    id: "MT-2024-003",
    nop: "32.71.010.001.001.0003.0",
    jenisMutasi: "Gabung NOP",
    namaDari: "SITI RAHAYU (3 NOP)",
    namaKe: "SITI RAHAYU",
    tanggal: "2024-01-13",
    status: "ditolak",
  },
  {
    id: "MT-2024-004",
    nop: "32.71.010.001.001.0007.0",
    jenisMutasi: "Perubahan Data",
    namaDari: "HENDRA KUSUMA",
    namaKe: "HENDRA KUSUMA",
    tanggal: "2024-01-12",
    status: "proses",
  },
];

const statusVariant = {
  proses: "outline",
  selesai: "default",
  ditolak: "destructive",
} as const;

const statusLabel = {
  proses: "Proses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const jenisBadgeVariant = {
  "Balik Nama": "secondary",
  "Pecah NOP": "outline",
  "Gabung NOP": "outline",
  "Perubahan Data": "secondary",
} as const;

export default function MutasiPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Balik Nama</CardDescription>
            <CardTitle className="text-3xl">12</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pecah NOP</CardDescription>
            <CardTitle className="text-3xl">5</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Gabung NOP</CardDescription>
            <CardTitle className="text-3xl">3</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Perubahan Data</CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Mutation List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Mutasi</CardTitle>
            <CardDescription>
              Permohonan mutasi objek pajak (balik nama, pecah, gabung,
              perubahan data)
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 size-4" />
            Mutasi Baru
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>NOP</TableHead>
                <TableHead>Jenis Mutasi</TableHead>
                <TableHead>Dari</TableHead>
                <TableHead className="w-8" />
                <TableHead>Ke</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockMutasi.map((item) => (
                <TableRow className="cursor-pointer" key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.nop}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        jenisBadgeVariant[
                          item.jenisMutasi as keyof typeof jenisBadgeVariant
                        ]
                      }
                    >
                      {item.jenisMutasi}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.namaDari}</TableCell>
                  <TableCell>
                    <ArrowRightLeft className="size-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>{item.namaKe}</TableCell>
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
