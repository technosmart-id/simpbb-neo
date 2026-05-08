"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Building2 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 self-center text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md">
            <Building2 className="size-6 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/40">
              Badan Pendapatan Daerah
            </p>
            <p className="text-xl font-bold text-white">SIM-PBB</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
