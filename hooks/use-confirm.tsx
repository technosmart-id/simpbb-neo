"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function useConfirm() {
  const [promise, setPromise] = React.useState<{ resolve: (value: boolean) => void } | null>(null)
  const [options, setOptions] = React.useState<ConfirmOptions>({
    title: "Konfirmasi",
    message: "Apakah Anda yakin?",
  })

  const confirm = (opts?: Partial<ConfirmOptions>): Promise<boolean> => {
    if (opts) setOptions((prev) => ({ ...prev, ...opts }))
    return new Promise((resolve) => {
      setPromise({ resolve })
    })
  }

  const handleClose = () => {
    setPromise(null)
  }

  const handleConfirm = () => {
    promise?.resolve(true)
    handleClose()
  }

  const handleCancel = () => {
    promise?.resolve(false)
    handleClose()
  }

  const ConfirmationDialog = () => (
    <AlertDialog open={promise !== null} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {options.cancelText || "Batal"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            variant={options.variant || "default"}
          >
            {options.confirmText || "Ya, Lanjutkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return [ConfirmationDialog, confirm] as const
}
