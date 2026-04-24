/**
 * Production seed - Admin user + Default Org
 * Run: npm run db:seed:prod
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
// Simple scrypt implementation or just use a placeholder for now since we're seeding
// Better: use a mock for the seed if we can't get scrypt to load
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { account, member, organization, user, orgRoles, memberRoles } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCasbinSyncService } from "@/lib/services/casbin-sync";
import { ORG_ROLES } from "@/lib/services/authorization-constants";
import { DEFAULT_USER_PERMISSIONS } from "@/lib/services/authorization-constants";
import { seedReferensi } from "./referensi";
import { seedMasterData } from "./master-data";

const ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
const ADMIN_NAME = process.env.DEFAULT_ADMIN_NAME || "Admin User";
const ADMIN_PASSWORD = "Password123#";


export async function seedProd() {
	console.log("🌱 Production seed (Casbin-first architecture)\n");

	// Admin user
	const existing = await db.select().from(user).where(eq(user.email, ADMIN_EMAIL)).limit(1);
	let userId = existing[0]?.id;

	if (!userId) {
		console.log("👑 Seeding admin user...");
		userId = crypto.randomUUID();
		const passwordHash = await hashPassword(ADMIN_PASSWORD);

		await db.insert(user).values({
			id: userId,
			name: ADMIN_NAME,
			email: ADMIN_EMAIL,
			username: "admin",
			emailVerified: true,
			role: "admin",
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
		const passwordHash = await hashPassword(ADMIN_PASSWORD);
		await db.update(account)
			.set({ password: passwordHash, updatedAt: new Date() })
			.where(eq(account.userId, userId));
		console.log(`  ✓ Updated admin password hash`);
	}

	// Default Org - always ensure admin is a member
	const existingOrg = await db.select().from(organization).where(eq(organization.slug, "default-org")).limit(1);
	let orgId = existingOrg[0]?.id;

	if (!orgId) {
		console.log("🏢 Seeding default organization...");
		orgId = crypto.randomUUID();

		await db.insert(organization).values({
			id: orgId,
			name: "Default Organization",
			slug: "default-org",
			createdAt: new Date(),
		});

		console.log(`  ✓ Created default organization`);
	} else {
		console.log(`  ✓ Default organization exists`);
	}

	// Check if admin is already a member
	const existingMember = await db.select().from(member)
		.where(and(eq(member.organizationId, orgId), eq(member.userId, userId)))
		.limit(1);

	let memberId = existingMember[0]?.id;

	if (!existingMember.length) {
		console.log("👤 Adding admin to default organization...");
		memberId = crypto.randomUUID();
		await db.insert(member).values({
			id: memberId,
			organizationId: orgId,
			userId: userId,
			role: ORG_ROLES.OWNER, // Legacy field kept for compatibility
			createdAt: new Date(),
		});
		console.log(`  ✓ Admin added as owner`);
	} else {
		console.log(`  ✓ Admin already a member of default organization`);
		memberId = existingMember[0].id;
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
		console.log("🔑 Assigning owner role via junction table...");
		await db.insert(memberRoles).values({
			id: crypto.randomUUID(),
			memberId: memberId,
			roleId: ORG_ROLES.OWNER,
			roleType: "system",
			createdBy: userId,
		});

		// Sync to Casbin
		const casbinSync = getCasbinSyncService();
		await casbinSync.assignRoleToMember(memberId, ORG_ROLES.OWNER, "system", orgId);

		console.log("  ✓ Owner role assigned");
	}

	// Create default User role metadata (permissions stored in Casbin)
	const existingUserRole = await db.select().from(orgRoles)
		.where(and(eq(orgRoles.organizationId, orgId), eq(orgRoles.slug, "user")))
		.limit(1);

	let userRoleId = existingUserRole[0]?.id;

	if (!existingUserRole.length) {
		console.log("🔑 Creating default User role metadata...");
		userRoleId = crypto.randomUUID();
		await db.insert(orgRoles).values({
			id: userRoleId,
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
	} else {
		console.log("  ✓ Default User role metadata exists");
		userRoleId = existingUserRole[0].id;
	}

	// Initialize Casbin policies
	console.log("🔐 Initializing Casbin policies...");
	const casbinSync = getCasbinSyncService();

	// Initialize global policies
	await casbinSync.initializeGlobalPolicies();

	// Assign global_admin role to admin user for full system access
	await casbinSync.assignGlobalRole(userId, "global_admin");
	console.log("  ✓ Admin assigned global_admin role");

	// Initialize org policies (owner gets *, user gets defaults)
	await casbinSync.initializeOrgPolicies(orgId);

	console.log("  ✓ Casbin policies initialized");

	// Seed domain data
	console.log("📦 Seeding domain data...");
	await seedReferensi();
	await seedMasterData();

	console.log("\n✅ Production seed complete");
	console.log(`   Email: ${ADMIN_EMAIL}`);
	console.log(`   Password: ${ADMIN_PASSWORD}`);
	console.log(`   Organization: Default Organization (owner)`);
	console.log(`   Architecture: Casbin-first`);
	console.log("");
}
