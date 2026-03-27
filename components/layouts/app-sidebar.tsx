"use client"

import * as React from "react"

import { NavMain } from "@/components/layouts/nav-main"
import { NavDeveloper } from "@/components/layouts/nav-developer"
import { NavUser } from "@/components/layouts/nav-user"
import { TeamSwitcher } from "@/components/layouts/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  FileText,
  Building2,
  ClipboardList,
  CreditCard,
  Printer,
  AlertTriangle,
  Search,
  BarChart3,
  BookOpen,
  Settings,
  Users,
  Shield,
  Globe,
  Map,
  RefreshCw,
  GitBranch,
  ScrollText,
  HardDrive,
  Archive,
  Trash2,
} from "lucide-react"

// This is sample data — should be replaced with Better Auth session data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "SIM-PBB",
      logo: <GalleryVerticalEndIcon />,
      plan: "Bapenda",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "SPOP",
      url: "/spop",
      icon: <FileText />,
    },
    {
      title: "LSPOP",
      url: "/lspop",
      icon: <Building2 />,
    },
    {
      title: "Pelayanan",
      url: "/pelayanan",
      icon: <ClipboardList />,
    },
    {
      title: "Pembayaran",
      url: "/pembayaran",
      icon: <CreditCard />,
    },
    {
      title: "Cetak SPPT",
      url: "/cetak-sppt",
      icon: <Printer />,
    },
    {
      title: "Tunggakan",
      url: "/tunggakan",
      icon: <AlertTriangle />,
    },
    {
      title: "Info OP",
      url: "/info-op",
      icon: <Search />,
    },
    {
      title: "Laporan",
      url: "#",
      icon: <BarChart3 />,
      items: [
        { title: "Pembayaran", url: "/laporan/pembayaran" },
        { title: "Realisasi", url: "/laporan/realisasi" },
        { title: "Tunggakan", url: "/laporan/tunggakan" },
        { title: "Mutasi", url: "/laporan/mutasi" },
        { title: "Penetapan", url: "/laporan/penetapan" },
        { title: "Pengurangan", url: "/laporan/pengurangan" },
        { title: "DHKP", url: "/laporan/dhkp" },
      ],
    },
    {
      title: "DHKP",
      url: "/dhkp",
      icon: <BookOpen />,
    },
    {
      title: "Update Masal",
      url: "/update-masal",
      icon: <RefreshCw />,
    },
    {
      title: "Pemekaran",
      url: "/pemekaran",
      icon: <GitBranch />,
    },
    {
      title: "Penghapusan",
      url: "/penghapusan",
      icon: <Trash2 />,
    },
    {
      title: "Peta",
      url: "/peta",
      icon: <Map />,
    },
    {
      title: "Pengaturan",
      url: "#",
      icon: <Settings />,
      items: [
        { title: "Referensi Wilayah", url: "/pengaturan/referensi" },
        { title: "Klasifikasi", url: "/pengaturan/klasifikasi" },
        { title: "Tarif PBB", url: "/pengaturan/tarif" },
        { title: "Jenis SPPT", url: "/pengaturan/jenis-sppt" },
        { title: "Fasilitas", url: "/pengaturan/fasilitas" },
        { title: "Jalan", url: "/pengaturan/jalan" },
        { title: "Konfigurasi", url: "/pengaturan/konfigurasi" },
        { title: "DBKB", url: "/pengaturan/dbkb" },
        { title: "Pengguna", url: "/pengaturan/pengguna" },
        { title: "Group Akses", url: "/pengaturan/group-akses" },
      ],
    },
    {
      title: "Log Aktivitas",
      url: "/log",
      icon: <ScrollText />,
    },
    {
      title: "File Manager",
      url: "/file-manager",
      icon: <HardDrive />,
    },
    {
      title: "Backups",
      url: "/backups",
      icon: <Archive />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDeveloper />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
