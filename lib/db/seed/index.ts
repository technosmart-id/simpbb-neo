/**
 * Seed entry point
 * Run: npm run db:seed
 */

import { seedProd } from "./prod";
import { seedDev } from "./dev";

const IS_DEV = process.env.NODE_ENV === "development";

async function main() {
	await seedProd();
	if (IS_DEV) await seedDev();
	process.exit(0);
}

main().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
