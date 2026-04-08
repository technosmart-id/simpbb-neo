/**
 * Seed default User role for existing organizations
 */

import { db } from "../lib/db/index.js"
import { orgRoles, organization, member } from "../lib/db/schema/index.js"
import { eq } from "drizzle-orm"
import { DEFAULT_USER_PERMISSIONS } from "../lib/services/authorization-constants.js"

async function main() {
	console.log("🌱 Seeding default User role for existing organizations...")

	// Get all organizations
	const orgs = await db.select().from(organization)
	console.log(`Found ${orgs.length} organizations`)

	let createdCount = 0
	let skippedCount = 0

	for (const org of orgs) {
		// Check if User role already exists
		const [existing] = await db
			.select()
			.from(orgRoles)
			.where(eq(orgRoles.slug, "user"))
			.limit(1)

		if (existing) {
			console.log(`  ✓ User role already exists for org: ${org.name}`)
			skippedCount++
			continue
		}

		// Get the owner user ID for createdBy
		const [ownerMember] = await db
			.select()
			.from(member)
			.where(eq(member.organizationId, org.id))
			.limit(1)

		const roleId = crypto.randomUUID()

		await db.insert(orgRoles).values({
			id: roleId,
			organizationId: org.id,
			name: "User",
			slug: "user",
			description: "Default member role with standard permissions",
			isDefaultRole: true,
			createdAt: new Date(),
			updatedAt: new Date(),
			createdBy: ownerMember?.userId || org.id, // Fallback to org ID if no members
		})

		console.log(`  ✓ Created User role for org: ${org.name}`)
		createdCount++
	}

	console.log(`\n✅ Done! Created ${createdCount} roles, skipped ${skippedCount}`)
	process.exit(0)
}

main().catch((err) => {
	console.error("❌ Error:", err)
	process.exit(1)
})
