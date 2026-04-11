import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Button } from "@/components/ui/button"
import { LogIn, Building2, MapPin, FileText, BarChart3 } from "lucide-react"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/dashboard")

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex flex-col">
      {/* Header strip */}
      <div className="bg-red-600 h-2 w-full" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Logo / emblem area */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <div className="flex size-24 items-center justify-center rounded-full border-4 border-yellow-400/60 bg-white/10 backdrop-blur-sm shadow-2xl">
              <Building2 className="size-12 text-yellow-400" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-red-600 border-2 border-white/20">
              <MapPin className="size-4 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* System identity */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-yellow-400/80">
              Badan Pendapatan Daerah
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              SIM-PBB
            </h1>
            <p className="text-base text-blue-200 max-w-sm">
              Sistem Informasi Manajemen<br />
              <span className="font-semibold text-white">Pajak Bumi dan Bangunan</span>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-48">
            <div className="flex-1 h-px bg-white/20" />
            <div className="size-1.5 rounded-full bg-yellow-400/60" />
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 max-w-xs">
            {[
              { icon: FileText, label: "SPPT & SPOP" },
              { icon: BarChart3, label: "Laporan & DHKP" },
              { icon: MapPin, label: "Peta Objek Pajak" },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur-sm"
              >
                <Icon className="size-3 text-yellow-400" />
                {label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <Button
            size="lg"
            className="h-12 px-10 text-base bg-yellow-400 hover:bg-yellow-300 text-blue-950 font-bold shadow-lg shadow-yellow-400/20 border-0"
            asChild
          >
            <Link href="/sign-in">
              <LogIn className="mr-2 size-4" />
              Masuk ke Sistem
            </Link>
          </Button>

          <p className="text-xs text-blue-300/60">
            Akses terbatas untuk petugas yang berwenang
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-blue-400/50 border-t border-white/5">
        &copy; {new Date().getFullYear()} Badan Pendapatan Daerah &mdash; SIM-PBB v4.0
      </footer>
    </div>
  )
}
