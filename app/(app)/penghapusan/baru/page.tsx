'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { parseNop } from '@/lib/utils/nop'

const schema = z.object({
  nop: z.string().length(18, 'NOP harus 18 karakter'),
  jenisPenghapusan: z.coerce.number().int().min(1).max(6),
  alasan: z.string().min(10, 'Alasan minimal 10 karakter'),
})

const JENIS_OPTIONS = [
  { value: 1, label: 'Fasilitas Umum' },
  { value: 2, label: 'Pemecahan/Pemisahan' },
  { value: 3, label: 'Penggabungan' },
  { value: 4, label: 'Kesalahan Administrasi' },
  { value: 5, label: 'Lainnya' },
  { value: 6, label: 'Piutang Kadaluarsa (> 5 tahun)' },
]

export default function PenghapusanBaruPage() {
  const orpc = useORPC()
  const router = useRouter()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const createMutation = useMutation({
    ...orpc.penghapusan.create.mutationOptions(),
    onSuccess: () => {
      toast.success('Pengajuan penghapusan berhasil dikirim')
      router.push('/penghapusan')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  function onSubmit(data: z.infer<typeof schema>) {
    const nopParts = parseNop(data.nop)
    if (!nopParts) {
      toast.error('Format NOP tidak valid')
      return
    }
    createMutation.mutate({
      ...nopParts,
      jenisPenghapusan: data.jenisPenghapusan,
      alasan: data.alasan,
    })
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ajukan Penghapusan NOP</h1>
        <p className="text-sm text-muted-foreground">Isi formulir di bawah untuk mengajukan penghapusan objek pajak</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Field>
          <FieldLabel>NOP (18 karakter tanpa titik)</FieldLabel>
          <Input
            {...register('nop')}
            placeholder="180102001001000001"
            maxLength={18}
            className="font-mono"
          />
          <FieldError>{errors.nop?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Jenis Penghapusan</FieldLabel>
          <Select onValueChange={(v) => setValue('jenisPenghapusan', Number(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis" />
            </SelectTrigger>
            <SelectContent>
              {JENIS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{errors.jenisPenghapusan?.message}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Alasan Penghapusan</FieldLabel>
          <Textarea
            {...register('alasan')}
            rows={4}
            placeholder="Jelaskan alasan penghapusan..."
          />
          <FieldError>{errors.alasan?.message}</FieldError>
        </Field>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
          <Button type="submit" disabled={createMutation.isPending}>
            Ajukan Penghapusan
          </Button>
        </div>
      </form>
    </div>
  )
}
