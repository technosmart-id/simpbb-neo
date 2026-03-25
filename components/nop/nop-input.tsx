"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { NopParts } from "@/lib/utils/nop"
import { formatNop, parseNop, validateNop } from "@/lib/utils/nop"

interface NopInputProps {
  value?: NopParts
  onChange?: (parts: NopParts) => void
  onValidChange?: (valid: boolean) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * 18-digit NOP input with auto-formatting (XX.XX.XXX.XXX.XXX.XXXX.X)
 */
export function NopInput({
  value,
  onChange,
  onValidChange,
  disabled,
  className,
  placeholder = "00.00.000.000.000.0000.0",
}: NopInputProps) {
  const [rawValue, setRawValue] = React.useState(() =>
    value ? formatNop(value) : "",
  )
  const [error, setError] = React.useState<string>()

  // Sync external value changes
  React.useEffect(() => {
    if (value) {
      setRawValue(formatNop(value))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value

    // Only allow digits and dots
    const digits = input.replace(/[^\d]/g, "")
    if (digits.length > 18) return

    // Auto-format with dots
    let formatted = ""
    const segments = [2, 2, 3, 3, 3, 4, 1]
    let pos = 0
    for (let i = 0; i < segments.length && pos < digits.length; i++) {
      if (i > 0) formatted += "."
      formatted += digits.slice(pos, pos + segments[i])
      pos += segments[i]
    }

    setRawValue(formatted)

    if (digits.length === 18) {
      const result = validateNop(digits)
      if (result.valid) {
        setError(undefined)
        onValidChange?.(true)
        const parts = parseNop(digits)
        if (parts) onChange?.(parts)
      } else {
        setError(result.error)
        onValidChange?.(false)
      }
    } else {
      setError(undefined)
      onValidChange?.(digits.length === 0)
    }
  }

  return (
    <div className={cn("space-y-1", className)}>
      <Input
        value={rawValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className="font-mono tracking-wider"
        maxLength={25} // 18 digits + 6 dots
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
