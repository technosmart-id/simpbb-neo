"use client"

import * as React from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useORPC } from "@/lib/orpc/react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { SortableHeader } from "@/components/data-table/column-helpers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { z } from "zod"

// ─── Types ───────────────────────────────────────────────────────

type KonfigurasiRow = {
  nama: string
  nilai: string | null
}

// ─── Validation ──────────────────────────────────────────────────

const configSchema = z.object({
  nama: z.string().min(1, "Nama konfigurasi wajib diisi"),
  nilai: z.string().min(1, "Nilai wajib diisi"),
})

// ─── Page ────────────────────────────────────────────────────────

export default function KonfigurasiPage() {
  const orpc = useORPC()
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [editingRow, setEditingRow] = React.useState<KonfigurasiRow | null>(null)
  const [deletingNama, setDeletingNama] = React.useState<string>("")
  const [formNama, setFormNama] = React.useState("")
  const [formNilai, setFormNilai] = React.useState("")
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({})

  const listQuery = useQuery(orpc.konfigurasi.list.queryOptions())

  const setMutation = useMutation(
    orpc.konfigurasi.set.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.konfigurasi.key() })
        toast.success(
          editingRow ? "Konfigurasi berhasil diperbarui" : "Konfigurasi berhasil ditambahkan",
        )
        handleCloseDialog()
      },
      onError: (error: Error) => {
        toast.error("Gagal menyimpan konfigurasi: " + error.message)
      },
    }),
  )

  const deleteMutation = useMutation(
    orpc.konfigurasi.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.konfigurasi.key() })
        toast.success("Konfigurasi berhasil dihapus")
        setDeleteDialogOpen(false)
        setDeletingNama("")
      },
      onError: (error: Error) => {
        toast.error("Gagal menghapus konfigurasi: " + error.message)
      },
    }),
  )

  const handleOpenAdd = () => {
    setEditingRow(null)
    setFormNama("")
    setFormNilai("")
    setFormErrors({})
    setDialogOpen(true)
  }

  const handleOpenEdit = (row: KonfigurasiRow) => {
    setEditingRow(row)
    setFormNama(row.nama)
    setFormNilai(row.nilai ?? "")
    setFormErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingRow(null)
    setFormNama("")
    setFormNilai("")
    setFormErrors({})
  }

  const handleSubmit = () => {
    const result = configSchema.safeParse({ nama: formNama, nilai: formNilai })
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as string] = issue.message
      })
      setFormErrors(errors)
      return
    }
    setMutation.mutate({ nama: formNama, nilai: formNilai })
  }

  const handleConfirmDelete = () => {
    if (deletingNama) {
      deleteMutation.mutate({ nama: deletingNama })
    }
  }

  // ─── Columns (defined here so we can reference handlers) ───────

  const columns: ColumnDef<KonfigurasiRow>[] = React.useMemo(
    () => [
      {
        accessorKey: "nama",
        header: ({ column }) => <SortableHeader column={column} label="Nama" />,
        cell: ({ row }) => (
          <code className="text-sm bg-muted px-2 py-1 rounded">
            {row.original.nama}
          </code>
        ),
      },
      {
        accessorKey: "nilai",
        header: ({ column }) => <SortableHeader column={column} label="Nilai" />,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.nilai ?? (
              <span className="text-muted-foreground italic">null</span>
            )}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Aksi</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleOpenEdit(row.original)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => {
                setDeletingNama(row.original.nama)
                setDeleteDialogOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Konfigurasi</h1>
        <p className="text-muted-foreground">
          Pengaturan konfigurasi sistem berupa pasangan kunci-nilai.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={listQuery.data ?? []}
        isLoading={listQuery.isLoading}
        searchColumn="nama"
        searchPlaceholder="Cari konfigurasi..."
        emptyMessage="Tidak ada data konfigurasi."
        actions={
          <Button onClick={handleOpenAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Konfigurasi
          </Button>
        }
      />

      {/* ── Add / Edit Dialog ──────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRow ? "Edit Konfigurasi" : "Tambah Konfigurasi"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama</label>
              <Input
                value={formNama}
                onChange={(e) => setFormNama(e.target.value)}
                placeholder="Contoh: APP_NAMA_PEMDA"
                disabled={!!editingRow}
              />
              {formErrors.nama && (
                <p className="text-sm text-destructive">{formErrors.nama}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nilai</label>
              <Input
                value={formNilai}
                onChange={(e) => setFormNilai(e.target.value)}
                placeholder="Masukkan nilai..."
              />
              {formErrors.nilai && (
                <p className="text-sm text-destructive">{formErrors.nilai}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={setMutation.isPending}>
              {setMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Konfigurasi</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus konfigurasi{" "}
            <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">
              {deletingNama}
            </code>
            ? Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingNama("")
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
