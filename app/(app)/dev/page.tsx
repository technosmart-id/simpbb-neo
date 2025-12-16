"use client";

import { toast } from "sonner";
import { useCommand } from "@/components/providers/command-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DevPage() {
  const { setOpen } = useCommand();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Toast Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Toast (Sonner)</CardTitle>
            <CardDescription>
              Notifikasi toast dengan berbagai tipe
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              onClick={() => toast.success("Operasi berhasil!")}
              size="sm"
            >
              Success
            </Button>
            <Button
              onClick={() => toast.error("Terjadi kesalahan!")}
              size="sm"
              variant="destructive"
            >
              Error
            </Button>
            <Button
              onClick={() => toast.info("Informasi penting")}
              size="sm"
              variant="outline"
            >
              Info
            </Button>
            <Button
              onClick={() => toast.warning("Perhatian!")}
              size="sm"
              variant="secondary"
            >
              Warning
            </Button>
            <Button
              onClick={() =>
                toast.promise(
                  new Promise((resolve) => setTimeout(resolve, 2000)),
                  {
                    loading: "Memproses...",
                    success: "Selesai!",
                    error: "Gagal!",
                  }
                )
              }
              size="sm"
              variant="outline"
            >
              Promise
            </Button>
          </CardContent>
        </Card>

        {/* Command Palette Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Command Palette</CardTitle>
            <CardDescription>Buka dengan ⌘K atau Ctrl+K</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setOpen(true)} variant="outline">
              Buka Command Palette
            </Button>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>Berbagai varian tombol</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button size="sm">Default</Button>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
            <Button size="sm" variant="destructive">
              Destructive
            </Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
            <Button size="sm" variant="ghost">
              Ghost
            </Button>
            <Button size="sm" variant="link">
              Link
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
