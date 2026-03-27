'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Plus, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

const JENIS_PENGHAPUSAN: Record<number, string> = {
  1: 'Fasilitas Umum', 2: 'Pemecahan/Pemisahan', 3: 'Penggabungan',
  4: 'Kesalahan Administrasi', 5: 'Lainnya', 6: 'Piutang Kadaluarsa',
}

const STATUS_BADGE: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: 'Menunggu', variant: 'secondary' },
  approved: { label: 'Disetujui', variant: 'default' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

export default function PenghapusanPage() {
  const orpc = useORPC()
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | undefined>(undefined)
  const [approveId, setApproveId] = useState<number | null>(null)
  const [rejectId, setRejectId] = useState<number | null>(null)
  const [catatan, setCatatan] = useState('')

  const { data, isLoading } = useQuery(
    orpc.penghapusan.list.queryOptions({ input: { status: statusFilter, page: 1, limit: 50 } })
  )

  const invalidate = () => qc.invalidateQueries({ queryKey: orpc.penghapusan.key() })

  const approveMutation = useMutation({
    ...orpc.penghapusan.approve.mutationOptions(),
    onSuccess: () => {
      toast.success('Penghapusan disetujui')
      setApproveId(null)
      setCatatan('')
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const rejectMutation = useMutation({
    ...orpc.penghapusan.reject.mutationOptions(),
    onSuccess: () => {
      toast.success('Penghapusan ditolak')
      setRejectId(null)
      setCatatan('')
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Penghapusan NOP</h1>
          <p className="text-sm text-muted-foreground">Ajukan dan kelola permohonan penghapusan objek pajak</p>
        </div>
        <Button asChild>
          <Link href="/penghapusan/baru">
            <Plus className="mr-2 h-4 w-4" /> Ajukan Penghapusan
          </Link>
        </Button>
      </div>

      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map((s) => (
          <Button
            key={s}
            variant={statusFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(statusFilter === s ? undefined : s)}
          >
            {STATUS_BADGE[s].label}
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NOP</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Alasan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tgl Pengajuan</TableHead>
            <TableHead>Pengaju</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Memuat...
              </TableCell>
            </TableRow>
          ) : (data?.rows ?? []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Tidak ada data
              </TableCell>
            </TableRow>
          ) : (
            (data?.rows ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm">
                  {`${row.kdPropinsi}.${row.kdDati2}.${row.kdKecamatan}.${row.kdKelurahan}.${row.kdBlok}.${row.noUrut}.${row.kdJnsOp}`}
                </TableCell>
                <TableCell>{JENIS_PENGHAPUSAN[row.jenisPenghapusan] ?? row.jenisPenghapusan}</TableCell>
                <TableCell className="max-w-48 truncate">{row.alasan}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[row.status]?.variant ?? 'secondary'}>
                    {STATUS_BADGE[row.status]?.label ?? row.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {row.tglPengajuan
                    ? format(new Date(row.tglPengajuan), 'dd MMM yyyy', { locale: localeId })
                    : '-'}
                </TableCell>
                <TableCell>{row.userPengaju}</TableCell>
                <TableCell>
                  {row.status === 'pending' && (
                    <div className="flex gap-1">
                      <AlertDialog open={approveId === row.id} onOpenChange={(o) => !o && setApproveId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="outline" onClick={() => setApproveId(row.id)}>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Setujui Penghapusan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus data SPPT dan mengubah status SPOP secara permanen.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Textarea placeholder="Catatan (opsional)" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-green-600 hover:bg-green-700"
                              disabled={approveMutation.isPending}
                              onClick={() => approveMutation.mutate({ id: row.id, catatan: catatan || undefined })}
                            >
                              Setujui
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog open={rejectId === row.id} onOpenChange={(o) => !o && setRejectId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="outline" onClick={() => setRejectId(row.id)}>
                            <XCircle className="h-4 w-4 text-red-600" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tolak Penghapusan?</AlertDialogTitle>
                          </AlertDialogHeader>
                          <Textarea placeholder="Alasan penolakan (wajib)" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              disabled={rejectMutation.isPending || !catatan}
                              onClick={() => rejectMutation.mutate({ id: row.id, catatan })}
                            >
                              Tolak
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
