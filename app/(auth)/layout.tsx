"use client"

import { ModeToggle } from "@/components/mode-toggle"

// Use a static seed to prevent hydration mismatch
const BG_IMAGE = "url(\"https://picsum.photos/seed/simpbb-auth/1920/1080\")"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: BG_IMAGE }}
    >
      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-md" />

      <div className="relative z-10">
        <div className="absolute top-4 right-4 z-50">
          <ModeToggle />
        </div>
        {children}
      </div>
    </div>
  )
}
