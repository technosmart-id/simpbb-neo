import { z } from "zod"
import { os } from "../context"
import { db } from "@/lib/db"
import { akses, groupAkses } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"

export const groupAksesRouter = os.router({
  // List all akses (access types/modules)
  listAkses: os.handler(async () => {
    return db.select().from(akses).orderBy(akses.akses)
  }),

  createAkses: os
    .input(z.object({ akses: z.string().min(1).max(50) }))
    .handler(async ({ input }) => {
      await db.insert(akses).values({ akses: input.akses, aktif: 1 })
      return { success: true }
    }),

  toggleAkses: os
    .input(z.object({ akses: z.string(), aktif: z.number().min(0).max(1) }))
    .handler(async ({ input }) => {
      await db.update(akses).set({ aktif: input.aktif }).where(eq(akses.akses, input.akses))
      return { success: true }
    }),

  // List group permissions for a specific role
  listGroupPermissions: os
    .input(z.object({ hakAkses: z.string() }))
    .handler(async ({ input }) => {
      return db
        .select()
        .from(groupAkses)
        .where(eq(groupAkses.hakAkses, input.hakAkses))
        .orderBy(groupAkses.akses)
    }),

  // List all distinct roles (HAK_AKSES values)
  listRoles: os.handler(async () => {
    const rows = await db
      .selectDistinct({ hakAkses: groupAkses.hakAkses })
      .from(groupAkses)
      .orderBy(groupAkses.hakAkses)
    return rows.map((r) => r.hakAkses)
  }),

  // Set permissions for a role (replace all)
  setGroupPermissions: os
    .input(
      z.object({
        hakAkses: z.string(),
        aksesItems: z.array(z.string()),
      }),
    )
    .handler(async ({ input }) => {
      // Delete existing permissions for this role
      await db.delete(groupAkses).where(eq(groupAkses.hakAkses, input.hakAkses))

      // Insert new permissions
      if (input.aksesItems.length > 0) {
        await db.insert(groupAkses).values(
          input.aksesItems.map((a) => ({
            hakAkses: input.hakAkses,
            akses: a,
          })),
        )
      }

      return { success: true }
    }),

  // Add single permission
  addPermission: os
    .input(z.object({ hakAkses: z.string(), akses: z.string() }))
    .handler(async ({ input }) => {
      await db.insert(groupAkses).values({
        hakAkses: input.hakAkses,
        akses: input.akses,
      })
      return { success: true }
    }),

  // Remove single permission
  removePermission: os
    .input(z.object({ hakAkses: z.string(), akses: z.string() }))
    .handler(async ({ input }) => {
      await db
        .delete(groupAkses)
        .where(and(eq(groupAkses.hakAkses, input.hakAkses), eq(groupAkses.akses, input.akses)))
      return { success: true }
    }),
})
