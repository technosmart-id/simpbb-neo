import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Button } from "@/components/ui/button"
import { LogIn, Building2 } from "lucide-react"
import Image from "next/image"

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) redirect("/dashboard")

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/bali-bg.jpg"
        alt="Bali"
        fill
        className="object-cover"
        priority
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        {/* Red accent line */}
        <div className="w-16 h-1 bg-red-600 rounded-full" />

        {/* Logo */}
        <div className="flex size-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <Building2 className="size-10 text-white/90" strokeWidth={1.5} />
        </div>

        {/* Branding */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/50">
            Badan Pendapatan Daerah
          </p>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            SIM-PBB
          </h1>
          <p className="text-base text-white/60 max-w-xs mx-auto leading-relaxed">
            Sistem Informasi Manajemen<br />
            <span className="text-white font-medium">Pajak Bumi dan Bangunan</span>
          </p>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="h-12 px-10 text-base bg-white hover:bg-white/90 text-black font-semibold rounded-full shadow-lg shadow-black/20 border-0"
          asChild
        >
          <Link href="/sign-in">
            <LogIn className="mr-2 size-4" />
            Masuk ke Sistem
          </Link>
        </Button>

        <p className="text-xs text-white/30">
          Kota Denpasar &mdash; Akses terbatas untuk petugas yang berwenang
        </p>
      </div>
    </div>
  )
}
