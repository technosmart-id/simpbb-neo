"use client"

import * as React from "react"
import { withMask } from "use-mask-input"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { NopParts } from "@/lib/utils/nop"
import { parseNop, formatNop, validateNop, formatNopRaw } from "@/lib/utils/nop"
import { orpcClient } from "@/lib/orpc/client"

interface NopInputProps {
  value?: string | NopParts
  onChange?: (value: string, parts: NopParts | null) => void
  onValidChange?: (valid: boolean) => void
  disabled?: boolean
  className?: string
  /** If true, locks the first 4 segments (Propinsi, Dati2, Kecamatan, Kelurahan) */
  lockRegion?: boolean
}

/**
 * High-quality 18-digit NOP input using use-mask-input for standard masking.
 * Format: XX.XX.XXX.XXX.XXX-XXXX.X
 * Includes async validation for region (Propinsi, Dati2, Kec, Kel).
 */
export function NopInput({
  value,
  onChange,
  onValidChange,
  disabled,
  className,
  lockRegion = false,
}: NopInputProps) {
  const [mounted, setMounted] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState<string>(() => {
    if (!value) return ""
    if (typeof value === "string") return value
    return formatNop(value)
  })
  const [wilayahError, setWilayahError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Sync external value changes
  React.useEffect(() => {
    if (value !== undefined) {
      const v = typeof value === "string" ? value : formatNop(value)
      const rawV = v.replace(/[\.\-\s]/g, "")
      const rawInternal = internalValue.replace(/[\.\-\s]/g, "")
      
      if (rawV !== rawInternal) {
        setInternalValue(v)
      }
    }
  }, [value, internalValue])

  const validateWilayahAsync = async (rawVal: string) => {
    const parts = parseNop(rawVal)
    if (parts) {
      try {
        const result = await orpcClient.wilayah.validateWilayah({
          kdPropinsi: parts.kdPropinsi,
          kdDati2: parts.kdDati2,
          kdKecamatan: parts.kdKecamatan,
          kdKelurahan: parts.kdKelurahan,
        })
        
        if (!result.valid) {
          setWilayahError("Wilayah (Prop/Kota/Kec/Kel) tidak ditemukan")
          onValidChange?.(false)
        } else {
          setWilayahError(null)
          onValidChange?.(true)
        }
      } catch (err) {
        console.error("NOP Wilayah Validation Error:", err)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value
    const rawVal = newVal.replace(/[\.\-]/g, "")
    
    setInternalValue(newVal)
    
    // Clear error while typing
    if (rawVal.length < 18) {
      setWilayahError(null)
    }

    const formatCheck = validateNop(rawVal)
    const validFormat = rawVal.length === 18 && formatCheck.valid
    
    if (validFormat) {
      validateWilayahAsync(rawVal)
    } else {
      onValidChange?.(false)
    }
    
    if (onChange) {
      onChange(rawVal, validFormat ? parseNop(rawVal) : null)
    }
  }

  const maskRef = withMask("99.99.999.999.999-9999.9", {
    placeholder: "0",
    showMaskOnHover: false,
  })

  return (
    <div className={cn("group/nop-input flex flex-col gap-1.5 w-full", className)}>
      <Input
        ref={mounted ? maskRef : null}
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        readOnly={lockRegion}
        className={cn(
            "font-mono tracking-wider",
            lockRegion && "bg-muted cursor-not-allowed opacity-80",
            wilayahError && "border-destructive focus-visible:ring-destructive/20"
        )}
      />
      {/* Show Format Error if exists */}
      {internalValue.replace(/[\.\-0]/g, "").length > 0 && 
       internalValue.replace(/[\.\-\s]/g, "").length === 18 && 
       !validateNop(internalValue.replace(/[\.\-]/g, "")).valid && (
        <p className="text-[10px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">
          {validateNop(internalValue.replace(/[\.\-]/g, "")).error}
        </p>
      )}
      {/* Show Wilayah Error if exists */}
      {wilayahError && (
        <p className="text-[10px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">
          {wilayahError}
        </p>
      )}
    </div>
  )
}
