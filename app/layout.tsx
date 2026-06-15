import { Geist, Geist_Mono, Inter, Roboto } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RPCProvider } from "@/lib/orpc/react"
import { cn } from "@/lib/utils";

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

import { Toaster } from "@/components/ui/sonner"

const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});

export const metadata: Metadata = {
  title: {
    default: "SIM-PBB Neo",
    template: "%s | SIM-PBB Neo",
  },
  description: "Sistem Informasi Manajemen Pajak Bumi dan Bangunan",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", roboto.variable, robotoHeading.variable)}
    >
      <body>
        <RPCProvider>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster />
          </ThemeProvider>
        </RPCProvider>
      </body>
    </html>
  )
}
