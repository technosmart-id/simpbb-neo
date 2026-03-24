import { db } from "../lib/db/index.js"
import { orgRoles } from "../lib/db/schema/org-roles.js"

async function main() {
	try {
		const roles = await db.select().from(orgRoles)
		console.log(`Found ${roles.length} org_roles:`)
		for (const role of roles) {
			console.log(`  - ${role.name} (${role.slug}) - isDefault: ${role.isDefaultRole}`)
		}
	} catch (error) {
		console.error("Error:", error)
	}
	process.exit(0)
}

main()
