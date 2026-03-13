/**
 * Next.js Middleware - Route Protection with Better Auth
 *
 * Protects routes by validating Better Auth sessions directly from cookies.
 *
 * Protected: /(app)/* (dashboard, settings, etc.)
 * Public: /(auth)/*, /api/auth/*, /api/reference, /
 *
 * Note: Next.js 16 is transitioning from middleware.ts to proxy.ts, but
 * the standard middleware pattern is still fully supported.
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Route configuration
 */
const PROTECTED_ROUTES = ["/(app)"];
const AUTH_ROUTES = ["/(auth)", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const PUBLIC_API = ["/api/auth", "/api/reference"];

/**
 * Check if path is an authentication page
 */
function isAuthPath(pathname: string): boolean {
	return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if path is public API
 */
function isPublicAPI(pathname: string): boolean {
	return PUBLIC_API.some((route) => pathname.startsWith(route));
}

/**
 * Check if path requires authentication
 */
function isProtectedPath(pathname: string): boolean {
	// Check against protected route patterns (handle route groups)
	const normalizedPath = pathname
		.replace(/\(app\)/g, "")
		.replace(/\(auth\)/g, "");

	return PROTECTED_ROUTES.some((route) => {
		const normalizedRoute = route.replace(/[()]/g, "");
		return normalizedPath.startsWith(normalizedRoute) || pathname.includes(route);
	});
}

/**
 * Proxy function (Next.js 16 replacement for middleware)
 *
 * Validates sessions using Better Auth for route protection.
 * This reads from cookies directly without internal HTTP requests.
 */
export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow public API routes without auth check
	if (isPublicAPI(pathname)) {
		return NextResponse.next();
	}

	// Allow static assets and public pages
	if (pathname === "/" || pathname.startsWith("/_next") || pathname.includes(".")) {
		return NextResponse.next();
	}

	// Validate session using Better Auth (reads from cookie directly)
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	const isAuthenticated = !!session?.user;
	const isAuthPage = isAuthPath(pathname);
	const isProtected = isProtectedPath(pathname);

	// Redirect authenticated users away from auth pages
	if (isAuthenticated && isAuthPage) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Redirect unauthenticated users to login
	if (!isAuthenticated && isProtected) {
		const redirectUrl = pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
		return NextResponse.redirect(new URL(`/login${redirectUrl}`, request.url));
	}

	// Check admin role for admin routes
	if (isAuthenticated && pathname.includes("/admin")) {
		if ('role' in session.user && session.user.role !== "admin") {
			return NextResponse.redirect(new URL("/dashboard?error=unauthorized", request.url));
		}
	}

	return NextResponse.next();
}

/**
 * Route matcher configuration
 *
 * Controls which routes the middleware applies to.
 * Excludes static files, images, and Next.js internals.
 */
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - Static assets (images, fonts, etc.)
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
	],
};
