"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * Number input formatted as Indonesian Rupiah (Rp)
 * Displays with thousand separators, stores as raw number
 */
export function CurrencyInput({
  value,
  onChange,
  disabled,
  className,
  placeholder = "0",
}: CurrencyInputProps) {
  const formatDisplay = (num: number | undefined): string => {
    if (num == null || isNaN(num)) return ""
    if (num === 0) return ""
    return num.toLocaleString("id-ID")
  }

  const [displayValue, setDisplayValue] = React.useState(() => formatDisplay(value))

  React.useEffect(() => {
    setDisplayValue(formatDisplay(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "")
    if (raw === "") {
      setDisplayValue("")
      onChange?.(0)
      return
    }

    const num = parseInt(raw, 10)
    if (isNaN(num)) return

    setDisplayValue(num.toLocaleString("id-ID"))
    onChange?.(num)
  }

  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        Rp
      </span>
      <Input
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className="pl-9 font-mono text-right"
        inputMode="numeric"
      />
    </div>
  )
}
