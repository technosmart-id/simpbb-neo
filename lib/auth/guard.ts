import { os } from "@/lib/orpc/context"
import { db } from "@/lib/db"
import { pbbUserProfile } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { hasPermission, type ModuleName, type Operation } from "./permissions"

/**
 * oRPC middleware: requires authenticated session
 */
export const requireAuth = os.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new Error("Unauthorized: Login diperlukan")
  }
  return next({ context: { ...context, user: context.session.user } })
})

/**
 * oRPC middleware: requires specific role-based permission
 * Checks the PBB user profile's hakAkses against the permissions map
 */
export function requireRole(module: ModuleName, operation: Operation = "read") {
  return os.middleware(async ({ context, next }) => {
    if (!context.session?.user) {
      throw new Error("Unauthorized: Login diperlukan")
    }

    const userId = context.session.user.id

    // Look up PBB user profile linked to this Better Auth user
    const [profile] = await db
      .select({ hakAkses: pbbUserProfile.hakAkses })
      .from(pbbUserProfile)
      .where(eq(pbbUserProfile.userId, userId))
      .limit(1)

    if (!profile) {
      throw new Error("Unauthorized: Profil PBB tidak ditemukan. Hubungi administrator.")
    }

    if (!hasPermission(profile.hakAkses, module, operation)) {
      throw new Error(
        `Forbidden: Anda tidak memiliki akses ${operation} pada modul ${module}`,
      )
    }

    return next({
      context: {
        ...context,
        user: context.session.user,
        hakAkses: profile.hakAkses,
      },
    })
  })
}
