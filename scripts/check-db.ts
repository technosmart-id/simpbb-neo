import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function check() {
	const users = await db
		.select({
			id: user.id,
			email: user.email,
			role: user.role,
		})
		.from(user)
		.limit(5);

	console.log("Users in DB:");
	console.table(users);

	const accounts = await db
		.select({
			email: user.email,
			password: account.password,
			providerId: account.providerId,
		})
		.from(account)
		.innerJoin(user, eq(account.accountId, user.id))
		.where(eq(account.providerId, "credential"));

	console.log("\nPassword hashes in DB:");
	for (const acc of accounts) {
		const hash = acc.password || "";
		console.log(`Email: ${acc.email}`);
		console.log(`  Format: ${hash.includes(":") ? "hex:hex" : hash.includes("$") ? "hex$hex" : "base64.base64"}`);
		console.log(`  Start: ${hash.substring(0, 40)}...`);
	}

	process.exit(0);
}

check().catch(console.error);
