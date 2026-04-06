import { z } from "zod"
import { db } from "@/lib/db"
import { notifications, notificationPreferences } from "@/lib/db/schema"
import { eq, desc, sql } from "drizzle-orm"

import { createNotification } from "@/lib/services/notifications"
import { StorageService } from "@/lib/services/storage"
import {
	performBackup,
	listBackups,
	generateBackupFilename,
} from "@/lib/services/backup"
import * as fs from "fs/promises"
import * as path from "path"

// Shared oRPC context — re-export for backwards compatibility
export { os } from "./context"
import { os } from "./context"

// Domain routers
import { wilayahRouter } from "./routers/wilayah"
import { wilayahCrudRouter } from "./routers/wilayah-crud"
import { referensiRouter } from "./routers/referensi"
import { klasifikasiRouter } from "./routers/klasifikasi"
import { klasifikasiCrudRouter } from "./routers/klasifikasi-crud"
import { konfigurasiRouter } from "./routers/konfigurasi"
import { penggunaRouter } from "./routers/pengguna"
import { groupAksesRouter } from "./routers/group-akses"
import { logRouter } from "./routers/log"
import { objekPajakRouter } from "./routers/objek-pajak"
import { lspopRouter } from "./routers/lspop"
import { spptRouter } from "./routers/sppt"
import { pembayaranRouter } from "./routers/pembayaran"
import { pelayananRouter } from "./routers/pelayanan"
import { dashboardRouter } from "./routers/dashboard"
import { tunggakanRouter } from "./routers/tunggakan"
import { updateMasalRouter } from "./routers/update-masal"
import { pemekaranRouter } from "./routers/pemekaran"

export const router = os.router({
  hello: os
    .input(z.object({ name: z.string().optional() }))
    .handler(async ({ input }) => {
      return {
        message: `Hello ${input.name ?? 'Ariefan'}! oRPC v1.x is officially alive.`,
      }
    }),

  // Domain routers
  wilayah: wilayahRouter,
  wilayahCrud: wilayahCrudRouter,
  referensi: referensiRouter,
  klasifikasi: klasifikasiRouter,
  klasifikasiCrud: klasifikasiCrudRouter,
  konfigurasi: konfigurasiRouter,
  pengguna: penggunaRouter,
  groupAkses: groupAksesRouter,
  log: logRouter,
  objekPajak: objekPajakRouter,
  lspop: lspopRouter,
  sppt: spptRouter,
  pembayaran: pembayaranRouter,
  pelayanan: pelayananRouter,
  dashboard: dashboardRouter,
  tunggakan: tunggakanRouter,
  updateMasal: updateMasalRouter,
  pemekaran: pemekaranRouter,

  notifications: os.router({
    list: os
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        const rows = await db.select()
          .from(notifications)
          .where(eq(notifications.userId, context.session.user.id))
          .orderBy(desc(notifications.createdAt))
          .limit(input.limit)
          .offset(input.offset)

        const [totalResult] = await db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(eq(notifications.userId, context.session.user.id))

        return {
          rows,
          total: totalResult?.count ?? 0,
        }
      }),

    unreadCount: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          return { count: 0 }
        }

        const [result] = await db.select({ count: sql<number>`count(*)` })
          .from(notifications)
          .where(
            sql`${notifications.userId} = ${context.session.user.id} AND ${notifications.isRead} = false`
          )

        return { count: result?.count ?? 0 }
      }),

    markAsRead: os
      .input(z.object({ id: z.string().optional() })) // if empty, mark all as read
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        if (input.id) {
          await db.update(notifications)
            .set({ isRead: true })
            .where(
              sql`${notifications.id} = ${input.id} AND ${notifications.userId} = ${context.session.user.id}`
            )
        } else {
          await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, context.session.user.id))
        }

        return { success: true }
      }),

    delete: os
      .input(z.object({ id: z.string() }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        await db.delete(notifications)
          .where(
            sql`${notifications.id} = ${input.id} AND ${notifications.userId} = ${context.session.user.id}`
          )

        return { success: true }
      }),

    test: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        return await createNotification({
          userId: context.session.user.id,
          title: "Real-time Test Alert",
          message: "This successful test notification was triggered via oRPC! SSE is working beautifully using native Next.js 16 WebStreams.",
          type: "success",
        })
      }),

    getPreferences: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        let [prefs] = await db.select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, context.session.user.id))

        if (!prefs) {
          // Create default preferences
          const id = crypto.randomUUID()
          await db.insert(notificationPreferences).values({
            id,
            userId: context.session.user.id,
            inAppEnabled: true,
            toastsEnabled: true,
            successEnabled: true,
            warningEnabled: true,
            errorEnabled: true,
            infoEnabled: true,
          })
          
          const [newPrefs] = await db.select()
            .from(notificationPreferences)
            .where(eq(notificationPreferences.id, id))
          prefs = newPrefs
        }

        return prefs
      }),

    updatePreferences: os
      .input(z.object({
        inAppEnabled: z.boolean().optional(),
        toastsEnabled: z.boolean().optional(),
        successEnabled: z.boolean().optional(),
        warningEnabled: z.boolean().optional(),
        errorEnabled: z.boolean().optional(),
        infoEnabled: z.boolean().optional(),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        await db.update(notificationPreferences)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(notificationPreferences.userId, context.session.user.id))

        return { success: true }
      }),
  }),

  files: os.router({
    list: os
      .input(z.object({
        path: z.string().optional().default(""),
      }).optional())
      .handler(async ({ input }) => {
        console.log(`[ORPC] files.list: path="${input?.path}"`)
        return await StorageService.listFiles(input?.path ?? "")
      }),

    createFolder: os
      .input(z.object({
        parentPath: z.string(),
        name: z.string().min(1),
      }))
      .handler(async ({ input }) => {
        await StorageService.createFolder(input.parentPath, input.name)
        return { success: true }
      }),

    delete: os
      .input(z.object({
        path: z.string(),
      }))
      .handler(async ({ input }) => {
        await StorageService.deleteFile(input.path)
        return { success: true }
      }),

    stats: os
      .handler(async () => {
        return await StorageService.getStorageStats()
      }),

    submit: os
      .input(z.object({
        tempPaths: z.array(z.string()),
      }))
      .handler(async ({ input }) => {
        const movedPaths = await StorageService.moveToUploads(input.tempPaths)
        await StorageService.cleanupTemp()
        return { movedPaths }
      }),
  }),

  backups: os.router({
    getConfig: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        return {
          enabled: process.env.BACKUP_ENABLED !== "false",
          retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || "30", 10),
          schedule: process.env.BACKUP_SCHEDULE || "0 2 * * *",
          runOnStart: process.env.BACKUP_RUN_ON_START === "true",
          backupDir: process.env.BACKUP_DIR || path.join(process.cwd(), "backups"),
        }
      }),

    list: os
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        const allBackups = await listBackups()
        const total = allBackups.length
        const rows = allBackups.slice(input.offset, input.offset + input.limit)

        return {
          rows,
          total,
        }
      }),

    create: os
      .handler(async ({ context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        const result = await performBackup({
          onProgress: () => {},
        })

        if (!result.success) {
          throw new Error(result.error ?? "Backup failed")
        }

        return {
          success: true,
          backupPath: result.backupPath,
          size: result.size,
          duration: result.duration,
        }
      }),

    delete: os
      .input(z.object({ filename: z.string() }))
      .handler(async ({ input, context }) => {
        if (!context.session?.user) {
          throw new Error("Unauthorized")
        }

        const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(process.cwd(), "backups"))
        const safeFilename = path.basename(input.filename)
        const filePath = path.join(backupDir, safeFilename)

        // Security check: ensure filename is just a filename, not a path
        if (safeFilename !== input.filename || !filePath.startsWith(backupDir)) {
          throw new Error("Invalid filename")
        }

        try {
          await fs.unlink(filePath)
        } catch (e) {
          throw new Error("Failed to delete backup")
        }

        return { success: true }
      }),
  }),
})

export type AppRouter = typeof router
