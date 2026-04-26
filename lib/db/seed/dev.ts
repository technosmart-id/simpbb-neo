/**
 * Development seed - Dev user + Dev org + Sample data
 * Run: npm run db:seed:dev
 *
 * Casbin-first architecture:
 * - member_roles junction table for role assignments
 * - Casbin (casbin_rule) as single source of truth for permissions
 */

// import { scryptAsync } from "@noble/hashes/scrypt";
// import { hex } from "@better-auth/utils/hex";
const hex = {
	encode: (buf: Uint8Array) => Array.from(buf).map((b) => b.toString(16).padStart(2, "0")).join(""),
};
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { account, member, organization, user, orgRoles, memberRoles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCasbinSyncService } from "@/lib/services/casbin-sync";
import { ORG_ROLES } from "@/lib/services/authorization-constants";
import { seedSampleSpop } from "./sample-spop";

const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
const ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "Admin User";
const ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "admin123456";


export async function seedDev() {
	console.log("🛠️  Development seed (Casbin-first architecture)\n");

	// Dev user
	const existing = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL)).limit(1);
	let userId = existing[0]?.id;

	if (!userId) {
		console.log("👤 Seeding admin user...");
		userId = crypto.randomUUID();
		const passwordHash = await hashPassword(ADMIN_PASSWORD);

		await db.insert(user).values({
			id: userId,
			name: ADMIN_NAME,
			email: ADMIN_EMAIL,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		await db.insert(account).values({
			id: crypto.randomUUID(),
			accountId: ADMIN_EMAIL,
			providerId: "credential",
			userId: userId,
			password: passwordHash,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		console.log(`  ✓ Created admin user (${ADMIN_EMAIL})`);
	} else {
		console.log(`  ✓ Admin user exists (${ADMIN_EMAIL})`);
		// Update password hash to correct format
		const passwordHashUpdate = await hashPassword(ADMIN_PASSWORD);
		await db.update(account)
			.set({ password: passwordHashUpdate, updatedAt: new Date() })
			.where(eq(account.userId, userId));
		console.log(`  ✓ Updated admin password hash`);
	}

	// Default org
	const existingOrg = await db.select().from(organization).where(eq(organization.slug, "default-org")).limit(1);
	let orgId = existingOrg[0]?.id;
	let memberId = existingOrg[0]?.id;

	if (!orgId) {
		console.log("🏢 Seeding default org...");
		orgId = crypto.randomUUID();

		await db.insert(organization).values({
			id: orgId,
			name: "Default Organization",
			slug: "default-org",
			createdAt: new Date(),
		});

		memberId = crypto.randomUUID();
		await db.insert(member).values({
			id: memberId,
			organizationId: orgId,
			userId: userId,
			role: ORG_ROLES.OWNER, // Legacy field kept for compatibility
			createdAt: new Date(),
		});

		console.log("  ✓ Created default org");
	} else {
		console.log("  ✓ Default org exists");

		// Get existing member
		const [existingMember] = await db.select().from(member)
			.where(and(eq(member.organizationId, orgId), eq(member.userId, userId)))
			.limit(1);
		memberId = existingMember?.id || memberId;
	}

	// Assign owner role via member_roles junction table
	const existingOwnerRole = await db.select().from(memberRoles)
		.where(and(
			eq(memberRoles.memberId, memberId),
			eq(memberRoles.roleId, ORG_ROLES.OWNER),
			eq(memberRoles.roleType, "system")
		))
		.limit(1);

	if (!existingOwnerRole.length) {
		await db.insert(memberRoles).values({
			id: crypto.randomUUID(),
			memberId: memberId,
			roleId: ORG_ROLES.OWNER,
			roleType: "system",
			createdBy: userId,
		});
	}

	// Create default User role metadata
	const existingUserRole = await db.select().from(orgRoles)
		.where(and(eq(orgRoles.organizationId, orgId), eq(orgRoles.slug, "user")))
		.limit(1);

	if (!existingUserRole.length) {
		console.log("🔑 Creating default User role metadata...");
		await db.insert(orgRoles).values({
			id: crypto.randomUUID(),
			organizationId: orgId,
			name: "User",
			slug: "user",
			description: "Default member role with standard permissions",
			isDefaultRole: true,
			// No permissions column - stored in Casbin!
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: userId,
		});
		console.log("  ✓ Default User role metadata created");
	}

	// Initialize Casbin policies
	console.log("🔐 Initializing default org Casbin policies...");
	const casbinSync = getCasbinSyncService();

	// Initialize global policies
	await casbinSync.initializeGlobalPolicies();

	// Assign global_admin role to admin user for full system access
	await casbinSync.assignGlobalRole(userId, "global_admin");
	console.log("  ✓ Admin assigned global_admin role");

	// Initialize org policies
	await casbinSync.initializeOrgPolicies(orgId);

	// Sync owner role assignment to Casbin
	await casbinSync.assignRoleToMember(memberId, ORG_ROLES.OWNER, "system", orgId);

	console.log("  ✓ Done\n");

	// Sample SPOP data for development
	await seedSampleSpop();
}

// Allow direct execution
if (process.argv[1]?.includes("seed/dev")) {
	seedDev()
		.then(() => process.exit(0))
		.catch((err) => {
			console.error("❌ Dev seed failed:", err);
			process.exit(1);
		});
}
