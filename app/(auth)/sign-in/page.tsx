"use client"

import { LoginForm } from "@/components/auth/login-form"
import { Building2 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 self-center text-center">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Badan Pendapatan Daerah
            </p>
            <p className="text-lg font-bold">SIM-PBB</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
