import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

// Plugin imports - importing from better-auth/plugins
import {
	twoFactor,
	username,
	phoneNumber,
	emailOTP,
	admin,
	mcp,
	organization,
	captcha,
	openAPI,
	lastLoginMethod,
	magicLink,
	anonymous,
	bearer,
} from "better-auth/plugins";

// Import external services
import {
	sendPasswordResetEmail,
	sendEmailVerification,
	sendTwoFactorOTP,
	sendEmailOTP,
	sendMagicLink,
} from "../services/email";
import {
	sendPhoneVerificationOTP,
	sendPhoneLoginOTP,
} from "../services/sms";

/**
 * Better Auth Configuration
 *
 * This file configures Better Auth with all 13 plugins and external service integrations.
 */
export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "mysql",
		schema,
	}),
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					// Find all organizations with autoJoin enabled
					const autoJoinOrgs = await db.select()
						.from(schema.organization)
						.where(eq(schema.organization.autoJoin, true));

					if (autoJoinOrgs.length > 0) {
						// Add user to each organization as a 'member'
						await Promise.all(autoJoinOrgs.map(org => 
							db.insert(schema.member).values({
								id: crypto.randomUUID(),
								organizationId: org.id,
								userId: user.id,
								role: "member",
								createdAt: new Date(),
							}).catch(err => {
								console.error(`Failed to auto-join user ${user.id} to org ${org.id}:`, err);
							})
						));
					}
				}
			}
		}
	},

	// Advanced email/password with rate limiting and email verification
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }: { user: { email: string; name?: string }; url: string }) => {
			await sendPasswordResetEmail(user.email, url, user.name || "");
		},
		sendVerificationEmail: async ({ user, url }: { user: { email: string; name?: string }; url: string }) => {
			await sendEmailVerification(user.email, url, user.name || "");
		},
	},

	// Social providers
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			enabled: !!process.env.GOOGLE_CLIENT_ID,
		},
	},

	// Rate limiting to prevent abuse
	rateLimit: {
		window: 10, // 10 seconds
		max: 5, // 5 requests per window
	},

	plugins: [
		// 1. Two-Factor Authentication - TOTP authenticator + OTP backup codes
		twoFactor({
			issuer: "SimpBB Neo",
			totpOptions: {
				digits: 6,
				period: 30,
			},
			otpOptions: {
				sendOTP: async ({ user, otp }) => {
					await sendTwoFactorOTP(user.email, otp, 5);
				},
				period: 5, // 5 minutes
				digits: 6,
			},
			backupCodeOptions: {
				amount: 10,
				length: 10,
			},
		}),

		// 2. Username - Username-based login
		username(),

		// 3. Phone Number - Phone number authentication
		phoneNumber({
			// Send SMS OTP using our SMS service
			sendOTP: async ({ phoneNumber: phone, code }: { phoneNumber: string; code: string }) => {
				await sendPhoneVerificationOTP(phone, code, 5);
			},
		}),

		// 4. Email OTP - Email OTP login/verification
		emailOTP({
			sendVerificationOTP: async ({ email, otp }: { email: string; otp: string; type: string }) => {
				await sendEmailOTP(email, otp, 5);
			},
			expiresIn: 300, // 5 minutes
		}),

		// NOTE: passkey plugin does NOT exist in better-auth v1.5.5
		// Uncomment when upgrading to a version that supports it
		// passkey({
		// 	rp: {
		// 		name: "SimpBB Neo",
		// 		id: process.env.PASSKEY_ID || "localhost",
		// 	},
		// 	origin: process.env.BETTER_AUTH_URL || "http://localhost:3000",
		// }),

		// 5. Admin - Admin panel and user management
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		admin({
			// Default role for new users
			defaultRole: "user",
			// Role that grants admin access
			adminRole: "admin",
		}),

		// NOTE: apiKey plugin does NOT exist in better-auth v1.5.5
		// Use bearer token authentication instead

		// 6. MCP - Model Context Protocol integration
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		mcp({ oidcConfig: {} }),

		// 7. Organization - Multi-tenant org/team management
		organization({
			allowUserToCreateOrganization: true,
			organizationLimit: 5,
			membershipLimit: 100,
			teams: {
				enabled: true,
			},
			// Removing custom roles config for now
		}),

		// 8. Captcha
		captcha({
			provider: "google-recaptcha",
			secretKey: process.env.RECAPTCHA_SECRET_KEY!,
		}),

		// 9. OpenAPI - API documentation
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		openAPI({
			path: "/reference",
		}),

		// NOTE: i18n plugin does NOT exist in better-auth v1.5.5
		// Internationalization should be handled at the UI level

		// 10. Last Login Method - Track how users logged in
		lastLoginMethod(),

		// 11. Magic Link - Passwordless login via email link
		magicLink({
			sendMagicLink: async ({ email, url }: { email: string; url: string; token: string }) => {
				await sendMagicLink(email, url, "");
			},
			expiresIn: 60 * 60 * 24, // 24 hours
		}),

		// 12. Anonymous - Allow anonymous users with temporary sessions
		anonymous(),

		// 13. Bearer - API bearer token authentication
		bearer(),
	],

	// Base URL for authentication endpoints
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

	// Secret for signing tokens and sessions
	secret: process.env.BETTER_AUTH_SECRET || "default_secret_for_development_purposes_only_1234567890",

	// Session configuration
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 5, // 5 seconds
		},
	},

	// Advanced security options
	advanced: {
		csrf: {
			enabled: true,
		},
		useSecureCookies: process.env.NODE_ENV === "production",
		cookiePrefix: "simpbb",
	},
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session["user"];
