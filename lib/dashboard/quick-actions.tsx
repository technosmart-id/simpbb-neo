import * as React from 'react'
import {
  Plus,
  Search,
  ClipboardList,
  CreditCard,
  Printer,
  AlertTriangle,
  Database,
  BarChart3,
  BookOpen,
  RefreshCw,
  GitBranch,
  Users,
  Shield,
  Settings,
  Archive,
  ScrollText,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react'

export interface QuickAction {
  title: string
  description: string
  url: string
  icon: React.ReactNode
}

// HAK_AKSES → curated shortcuts for that role's most common tasks.
// Codes match lib/auth/permissions.ts ROLE_PERMISSIONS keys.
const ACTIONS_BY_HAK_AKSES: Record<string, QuickAction[]> = {
  ADMIN: [
    {
      title: 'Pengguna',
      description: 'Kelola user & akses',
      url: '/pengaturan/pengguna',
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Group Akses',
      description: 'Atur hak per role',
      url: '/pengaturan/group-akses',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      title: 'Konfigurasi',
      description: 'Parameter sistem',
      url: '/pengaturan/konfigurasi',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: 'Backups',
      description: 'Cadangan database',
      url: '/backups',
      icon: <Archive className="h-4 w-4" />,
    },
    {
      title: 'Log Aktivitas',
      description: 'Audit trail sistem',
      url: '/log',
      icon: <ScrollText className="h-4 w-4" />,
    },
  ],

  PETUGAS_PELAYANAN: [
    {
      title: 'Pelayanan Baru',
      description: 'Buat berkas pelayanan',
      url: '/pelayanan/baru',
      icon: <Plus className="h-4 w-4" />,
    },
    {
      title: 'Daftar Pelayanan',
      description: 'Cari & proses berkas',
      url: '/pelayanan',
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      title: 'Cari Objek Pajak',
      description: 'Lookup data SPOP',
      url: '/objek-pajak',
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: 'Cetak SPPT',
      description: 'Cetak ulang SPPT',
      url: '/cetak-sppt',
      icon: <Printer className="h-4 w-4" />,
    },
    {
      title: 'Verifikasi SPPT',
      description: 'Validasi via QR / NOP',
      url: '/verifikasi-sppt',
      icon: <ShieldCheck className="h-4 w-4" />,
    },
  ],

  // Petugas Input SPOP / LSPOP
  OPERATOR_DATA: [
    {
      title: 'Daftar Objek Pajak',
      description: 'SPOP & LSPOP',
      url: '/objek-pajak',
      icon: <Database className="h-4 w-4" />,
    },
    {
      title: 'Cari Objek Pajak',
      description: 'Lookup data',
      url: '/objek-pajak',
      icon: <Search className="h-4 w-4" />,
    },
    {
      title: 'Update Masal',
      description: 'Perubahan kolektif',
      url: '/update-masal',
      icon: <RefreshCw className="h-4 w-4" />,
    },
    {
      title: 'Pemekaran',
      description: 'Pisah objek pajak',
      url: '/pemekaran',
      icon: <GitBranch className="h-4 w-4" />,
    },
  ],

  // Kepala Bidang
  SUPERVISOR: [
    {
      title: 'Laporan',
      description: 'Realisasi, mutasi, dll',
      url: '/laporan',
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: 'DHKP',
      description: 'Buku himpunan WP',
      url: '/dhkp',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: 'Tunggakan',
      description: 'Pantau piutang PBB',
      url: '/tunggakan',
      icon: <AlertTriangle className="h-4 w-4" />,
    },
    {
      title: 'Cetak SPPT',
      description: 'Cetak massal SPPT',
      url: '/cetak-sppt',
      icon: <Printer className="h-4 w-4" />,
    },
    {
      title: 'Log Aktivitas',
      description: 'Audit pengguna',
      url: '/log',
      icon: <ScrollText className="h-4 w-4" />,
    },
  ],
}

// Used when the user has no PBB profile yet, or hakAkses doesn't match any
// curated set above (e.g. PETUGAS_CETAK, BENDAHARA, PETUGAS_LAPANGAN).
const DEFAULT_ACTIONS: QuickAction[] = [
  {
    title: 'Dashboard',
    description: 'Ringkasan data',
    url: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: 'Objek Pajak',
    description: 'Cari data SPOP',
    url: '/objek-pajak',
    icon: <Database className="h-4 w-4" />,
  },
  {
    title: 'Pembayaran',
    description: 'Terima pembayaran',
    url: '/pembayaran',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: 'Cetak SPPT',
    description: 'Cetak dokumen SPPT',
    url: '/cetak-sppt',
    icon: <Printer className="h-4 w-4" />,
  },
  {
    title: 'Tunggakan',
    description: 'Daftar piutang',
    url: '/tunggakan',
    icon: <AlertTriangle className="h-4 w-4" />,
  },
]

export function getQuickActions(hakAkses: string | null | undefined): QuickAction[] {
  if (!hakAkses) return DEFAULT_ACTIONS
  return ACTIONS_BY_HAK_AKSES[hakAkses.toUpperCase()] ?? DEFAULT_ACTIONS
}

// Human-readable label for the role chip on the dashboard
const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  PETUGAS_PELAYANAN: 'Petugas Pelayanan',
  OPERATOR_DATA: 'Petugas Input SPOP/LSPOP',
  SUPERVISOR: 'Kepala Bidang',
  PETUGAS_CETAK: 'Petugas Cetak',
  BENDAHARA: 'Bendahara',
  PETUGAS_LAPANGAN: 'Petugas Lapangan',
}

export function getRoleLabel(hakAkses: string | null | undefined): string | null {
  if (!hakAkses) return null
  return ROLE_LABELS[hakAkses.toUpperCase()] ?? hakAkses
}
