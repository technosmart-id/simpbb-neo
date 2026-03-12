import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LayoutDashboardIcon, LogInIcon, SparklesIcon } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function Page() {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background font-sans antialiased">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] h-[30%] w-[30%] rounded-full bg-secondary/20 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <main className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm font-medium backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SparklesIcon className="size-4 text-primary" />
          <span>Something revolutionary is coming</span>
        </div>

        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight sm:text-7xl">
            Build your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Neo Vision</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
            A high-performance boilerplate for modern applications. Scalable, modular, and ready for your 100+ tables.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20" asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <LayoutDashboardIcon className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base backdrop-blur-sm" asChild>
            <Link href="/login">
              Sign In
              <LogInIcon className="ml-2 size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-12 flex gap-8 animate-in fade-in duration-1000 delay-500">
            <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">100+</span>
                <span className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] font-semibold">Modular Tables</span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">Drizzle</span>
                <span className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] font-semibold">ORM Ready</span>
            </div>
            <div className="h-10 w-px bg-border" />
            <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold">Auth</span>
                <span className="text-sm text-muted-foreground uppercase tracking-widest text-[10px] font-semibold">Secure by Default</span>
            </div>
        </div>
      </main>

      <footer className="absolute bottom-8 left-0 right-0 z-10 flex flex-col items-center gap-2 text-xs text-muted-foreground">
        <span>&copy; 2026 Technosmart Neo. All rights reserved.</span>
        <div className="flex items-center gap-1">
            (Press <kbd className="rounded border bg-muted px-1">d</kbd> to toggle dark mode)
        </div>
      </footer>
    </div>
  )
}
