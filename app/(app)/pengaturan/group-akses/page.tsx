'use client'

import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useORPC } from '@/lib/orpc/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Shield, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function GroupAksesPage() {
  const orpc = useORPC()
  const queryClient = useQueryClient()
  const [selectedRole, setSelectedRole] = React.useState<string>('')
  const [selectedAkses, setSelectedAkses] = React.useState<Set<string>>(new Set())

  const rolesQuery = useQuery(orpc.groupAkses.listRoles.queryOptions())
  const aksesQuery = useQuery(orpc.groupAkses.listAkses.queryOptions())

  const permissionsQuery = useQuery({
    ...orpc.groupAkses.listGroupPermissions.queryOptions({ input: { hakAkses: selectedRole } }),
    enabled: !!selectedRole,
  })

  // Sync selected permissions when role changes
  React.useEffect(() => {
    if (permissionsQuery.data) {
      setSelectedAkses(new Set(permissionsQuery.data.map((p) => p.akses)))
    }
  }, [permissionsQuery.data])

  const saveMutation = useMutation(
    orpc.groupAkses.setGroupPermissions.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.groupAkses.key() })
        toast.success('Hak akses berhasil disimpan')
      },
      onError: (err: Error) => toast.error(err.message),
    }),
  )

  const handleToggle = (akses: string) => {
    setSelectedAkses((prev) => {
      const next = new Set(prev)
      if (next.has(akses)) next.delete(akses)
      else next.add(akses)
      return next
    })
  }

  const handleSave = () => {
    if (!selectedRole) return
    saveMutation.mutate({
      hakAkses: selectedRole,
      aksesItems: Array.from(selectedAkses),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Group Akses</h1>
        <p className="text-muted-foreground">Kelola hak akses per role</p>
      </div>

      <div className="flex items-end gap-4">
        <div className="space-y-1 min-w-[200px]">
          <label className="text-sm font-medium">Pilih Role</label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih role..." />
            </SelectTrigger>
            <SelectContent>
              {rolesQuery.data?.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedRole && (
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Simpan
          </Button>
        )}
      </div>

      {selectedRole && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Hak Akses: {selectedRole}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aksesQuery.isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
              </div>
            ) : (
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {aksesQuery.data?.map((a) => (
                  <label
                    key={a.akses}
                    className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedAkses.has(a.akses)}
                      onCheckedChange={() => handleToggle(a.akses)}
                    />
                    <span className="text-sm">{a.akses}</span>
                    {!a.aktif && <Badge variant="outline" className="text-xs">Non-aktif</Badge>}
                  </label>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
