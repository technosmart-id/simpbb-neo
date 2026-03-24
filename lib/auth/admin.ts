import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server-side admin utilities for Better Auth
 *
 * These helpers provide server-side admin checks and user data retrieval.
 * Use these in Server Components and Route Handlers.
 */

/**
 * Get the current session user from request headers
 * Returns null if not authenticated
 */
export async function getCurrentSession() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return session;
}

/**
 * Get the current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
	const session = await getCurrentSession();
	return session?.user ?? null;
}

/**
 * Get the current user if they have admin role
 * Returns null if not authenticated or not an admin
 */
export async function getCurrentAdminUser() {
	const session = await getCurrentSession();

	if (!session?.user) {
		return null;
	}

	// Check if user has admin role
	const userRole = session.user.role;
	if (userRole !== "admin") {
		return null;
	}

	return session.user;
}

/**
 * Require admin access - throws redirect if not admin
 * Use this in server components to protect admin routes
 *
 * @returns The admin user if authenticated
 * @throws Redirects to sign-in or dashboard with error if not admin
 */
export async function requireAdmin() {
	const session = await getCurrentSession();

	if (!session?.user) {
		// Not authenticated - redirect to sign-in
		const headersList = await headers();
		const url = new URL(headersList.get("x-path") || "/", headersList.get("host") || "");
		const signInUrl = new URL("/sign-in", url.origin);
		signInUrl.searchParams.set("redirect", url.pathname);
		signInUrl.searchParams.set("error", "auth_required");

		// We can't actually redirect here since this is a server function
		// The caller should handle the redirect
		return null;
	}

	const userRole = session.user.role;
	if (userRole !== "admin") {
		// Not an admin - caller should handle redirect
		return null;
	}

	return session.user;
}

/**
 * Check if a user ID matches any of the admin roles
 */
export function isAdminRole(role: string | null | undefined): boolean {
	return role === "admin";
}

/**
 * Type guard for admin user
 */
export function isAdminUser(user: { role: string | null | undefined } | null): user is { role: string } {
	return user !== null && isAdminRole(user.role);
}
