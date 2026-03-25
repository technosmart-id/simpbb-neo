"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { formatNop, type NopParts } from "@/lib/utils/nop"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

interface NopDisplayProps {
  parts: NopParts
  className?: string
  copyable?: boolean
}

/**
 * Read-only formatted NOP display with optional copy button
 */
export function NopDisplay({ parts, className, copyable = true }: NopDisplayProps) {
  const [copied, setCopied] = React.useState(false)
  const formatted = formatNop(parts)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatted)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-sm tracking-wider", className)}>
      {formatted}
      {copyable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      )}
    </span>
  )
}
