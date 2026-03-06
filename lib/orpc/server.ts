import { os } from "@orpc/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apikey, type Session, type User } from "@/lib/db/schema/auth";

export type Context = {
  user: User | null;
  session: Session | null;
};

// Base builder with context type
const base = os.$context<Context>();

// Public procedure - no auth required
export const publicProcedure = base;

// Protected procedure - requires authentication
export const protectedProcedure = base.use(({ context, next }) => {
  if (!(context.user && context.session)) {
    throw new Error("Unauthorized");
  }

  return next({
    context: {
      user: context.user,
      session: context.session,
    },
  });
});

// Helper to create context from request headers
export async function createContext(): Promise<Context> {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  // 1. Try Session Auth (Better Auth)
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (session) {
    return {
      user: session.user as User,
      session: session.session as Session,
    };
  }

  // 2. Try API Key Auth
  if (authHeader?.startsWith("Bearer ")) {
    const key = authHeader.replace("Bearer ", "");

    // Check DB for API Key
    const apiKey = await db.query.apikey.findFirst({
      where: eq(apikey.key, key),
      with: { user: true },
    });

    if (apiKey?.enabled) {
      // Create a synthetic session for API Key access to satisfy protectedProcedure
      const syntheticSession: Session = {
        id: `apikey_${apiKey.id}`,
        userId: apiKey.userId,
        token: key,
        expiresAt:
          apiKey.expiresAt || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year fallback
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: headersList.get("x-forwarded-for") || "unknown",
        userAgent: headersList.get("user-agent"),
      };

      return {
        user: apiKey.user as User,
        session: syntheticSession,
      };
    }
  }

  return { user: null, session: null };
}
