import { scryptAsync } from "@noble/hashes/scrypt";
import { hex } from "@better-auth/utils/hex";
import { db } from "@/lib/db";
import { account, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const TARGET_EMAIL = "admin@simpbb.local";
const NEW_PASSWORD = "admin123456";

async function fixPassword() {
	// Get user
	const users = await db
		.select({
			userId: user.id,
			accountId: account.id,
		})
		.from(account)
		.innerJoin(user, eq(account.accountId, user.id))
		.where(eq(user.email, TARGET_EMAIL))
		.limit(1);

	if (!users.length) {
		console.log(`User ${TARGET_EMAIL} not found`);
		process.exit(1);
	}

	const { userId, accountId } = users[0];

	// Generate Better Auth compatible hash
	const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
	const key = await scryptAsync(NEW_PASSWORD.normalize("NFKC"), salt, {
		N: 16384,
		r: 16,
		p: 1,
		dkLen: 64,
	});
	const passwordHash = `${salt}:${hex.encode(key)}`;

	// Update
	await db.update(account)
		.set({ password: passwordHash, updatedAt: new Date() })
		.where(eq(account.id, accountId));

	console.log(`✓ Updated password for ${TARGET_EMAIL}`);
	console.log(`  New password: ${NEW_PASSWORD}`);
	console.log(`  Hash format: ${passwordHash.substring(0, 40)}...`);

	process.exit(0);
}

fixPassword().catch(console.error);
