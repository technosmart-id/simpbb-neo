'use client'

import * as React from 'react'
import Link from 'next/link'
import { LogIn, Building2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Enhanced Canvas for Fireflies and Mouse Trail
 */
function VisualEffects() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const mouseRef = React.useRef({ x: -1000, y: -1000 })
  const trailRef = React.useRef<{ x: number; y: number }[]>([])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      opacitySpeed: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = Math.random() * 0.4 - 0.2
        this.speedY = Math.random() * 0.4 - 0.2
        this.opacity = Math.random()
        this.opacitySpeed = Math.random() * 0.015 + 0.005
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.opacity += this.opacitySpeed

        if (this.opacity > 1 || this.opacity < 0) {
          this.opacitySpeed *= -1
        }

        if (this.x > canvas!.width) this.x = 0
        if (this.x < 0) this.x = canvas!.width
        if (this.y > canvas!.height) this.y = 0
        if (this.y < 0) this.y = canvas!.height
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 240, 150, ${this.opacity * 0.4})`
        ctx.shadowBlur = 4
        ctx.shadowColor = 'rgba(255, 240, 150, 0.3)'
        ctx.fill()
      }
    }

    const init = () => {
      particles = []
      for (let i = 0; i < 120; i++) {
        particles.push(new Particle())
      }
    }

    const drawTrail = () => {
      if (trailRef.current.length < 2) return

      // Draw the outer glow
      ctx.beginPath()
      ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y)
      for (let i = 1; i < trailRef.current.length; i++) {
        ctx.lineTo(trailRef.current[i].x, trailRef.current[i].y)
      }
      
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)' // Red-500 equivalent
      ctx.lineWidth = 8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowBlur = 20
      ctx.shadowColor = 'rgba(239, 68, 68, 0.8)'
      ctx.stroke()

      // Draw the inner neon line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.lineWidth = 2
      ctx.shadowBlur = 10
      ctx.stroke()
      
      ctx.shadowBlur = 0
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update trail
      trailRef.current.push({ ...mouseRef.current })
      if (trailRef.current.length > 25) {
        trailRef.current.shift()
      }

      drawTrail()

      particles.forEach((p) => {
        p.update()
        p.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)

    resize()
    init()
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
    />
  )
}

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-center">
      {/* Background Image - STATIC as requested */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/images/bali-bg.jpg")',
          filter: 'brightness(0.4) saturate(0.8)',
        }}
      />

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/60 via-transparent to-black/70" />

      {/* Interactive Visual Effects (Fireflies + Glowing Trail) */}
      <VisualEffects />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 max-w-4xl">
        {/* Minimalist Header */}
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="h-[1px] w-12 bg-white/20" />
            <span className="text-base font-bold uppercase tracking-[0.6em] text-white">
              Bapenda Kota Denpasar
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-8xl font-black tracking-tighter text-white sm:text-9xl">
              SIM<span className="text-red-600">PBB</span>
            </h1>
            <p className="text-xl font-medium uppercase tracking-[0.2em]">
              Sistem Informasi Manajemen<br />Pajak Bumi dan Bangunan
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col items-center gap-8">
          <Button
            size="lg"
            className="group relative h-16 px-16 bg-white text-black hover:bg-red-600 hover:text-white transition-all duration-500 hover:tracking-widest rounded-full shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            asChild
          >
            <Link href="/sign-in">
              <span className="relative z-10 flex items-center gap-3 font-black text-lg uppercase">
                Masuk Sistem
                <LogIn className="size-4" />
              </span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Minimalist Logo Watermark */}
      <div className="absolute bottom-12 opacity-5">
        <Building2 className="size-32 text-white" strokeWidth={0.5} />
      </div>

      {/* Technical Metadata */}
      <div className="absolute top-12 left-12 flex flex-col gap-1 items-start text-[8px] font-mono text-white/10 uppercase tracking-widest hidden sm:flex">
        <span>sys_status: operational</span>
        <span>auth_type: encrypted</span>
        <span>node: bali-01</span>
      </div>
    </main>
  )
}
