"use client";

import {
  BarChart3,
  CreditCard,
  Database,
  FileText,
  Home,
  Landmark,
  MapIcon,
  Search,
  Settings,
} from "lucide-react";
import type * as React from "react";

import { AppSwitcher } from "@/components/layouts/app-switcher";
import { NavMain } from "@/components/layouts/nav-main";
import { NavUser } from "@/components/layouts/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// PBB Navigation Data
const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Peta",
    url: "/peta",
    icon: MapIcon,
  },
  {
    title: "Objek Pajak",
    url: "/op",
    icon: Search,
    items: [{ title: "Peta Lokasi", url: "/op/peta" }],
  },
  {
    title: "SPPT",
    url: "/sppt",
    icon: FileText,
    items: [
      { title: "DHKP", url: "/sppt/dhkp" },
      { title: "Rekap SPPT", url: "/sppt/rekap" },
    ],
  },
  {
    title: "Pembayaran",
    url: "/pembayaran",
    icon: CreditCard,
    items: [
      { title: "Input Pembayaran", url: "/pembayaran/input" },
      { title: "Validasi", url: "/pembayaran/validasi" },
      { title: "Laporan", url: "/pembayaran/laporan" },
    ],
  },
  {
    title: "Piutang",
    url: "/piutang",
    icon: Landmark,
  },
  {
    title: "Laporan",
    url: "/laporan",
    icon: BarChart3,
    items: [
      { title: "Penerimaan", url: "/laporan/penerimaan" },
      { title: "Piutang", url: "/laporan/piutang" },
      { title: "Statistik", url: "/laporan/statistik" },
    ],
  },
  {
    title: "Master Data",
    url: "/master",
    icon: Database,
    items: [
      { title: "Wilayah", url: "/master/wilayah" },
      { title: "Kelas Tanah", url: "/master/kelas-tanah" },
      { title: "Kelas Bangunan", url: "/master/kelas-bangunan" },
      { title: "NJOP", url: "/master/njop" },
    ],
  },
  {
    title: "Pengaturan",
    url: "/settings",
    icon: Settings,
    items: [
      { title: "Profil", url: "/settings/profile" },
      { title: "Pengguna", url: "/settings/users" },
      { title: "Sistem", url: "/settings/system" },
    ],
  },
];

// TODO: Replace with real user data from auth
const userData = {
  name: "Admin PBB",
  email: "admin@pbb.go.id",
  avatar: "",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
