import { db } from "../lib/db"
import { member, organization } from "../lib/db/schema"
import { eq } from "drizzle-orm"

async function testQuery() {
  try {
    const userOrgs = await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        role: member.role,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, "test-user-id"))

    console.log("Success! Result:", userOrgs);
    process.exit(0);
  } catch (err) {
    console.error("Query failed with error:", err);
    process.exit(1);
  }
}

testQuery();
