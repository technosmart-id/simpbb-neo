"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth/client"

import { NavMain } from "@/components/layouts/nav-main"
import { NavDeveloper } from "@/components/layouts/nav-developer"
import { NavUser } from "@/components/layouts/nav-user"
import { OrganizationSwitcher } from "@/components/layouts/organization-switcher"
import {
  MapIcon as MapIconLucide,
  LayoutDashboardIcon,
  HardDrive,
  Archive,
  Building2,
  Shield,
  FileText,
  ClipboardList,
  CreditCard,
  Printer,
  AlertTriangle,
  Search,
  BarChart3,
  BookOpen,
  Settings,
  Map as MapIcon,
  RefreshCw,
  GitBranch,
  ScrollText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

interface SessionUser {
  name: string
  email: string
  avatar: string | null
  role?: string | null
}

interface NavItem {
  title: string
  url: string
  icon: React.ReactNode
  items?: {
    title: string
    url: string
  }[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<SessionUser>({
    name: "Loading...",
    email: "",
    avatar: null,
  })

  const [navMain] = useState<NavItem[]>([
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
      title: "Peta",
      url: "/peta",
      icon: <MapIcon />,
    },
    {
      title: "Pengaturan Utama",
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
  ])

  useEffect(() => {
    // Fetch session data on mount
    authClient.getSession({
      fetchOptions: {
        onSuccess: (ctx) => {
          const sessionUser = ctx.data?.user
          if (sessionUser) {
            setUser({
              name: sessionUser.name,
              email: sessionUser.email,
              avatar: sessionUser.image,
              role: sessionUser.role,
            })
          }
        },
      },
    })
  }, [])

  const orgSettings = [
    {
      title: "Organizations",
      url: "/settings/organizations",
      icon: <Building2 />,
    },
    {
      title: "Roles",
      url: "/settings/roles",
      icon: <Shield />,
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDeveloper />
        <div className="mt-4">
          <NavMain items={orgSettings} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
