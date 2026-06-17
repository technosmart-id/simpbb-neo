import { db } from "../index";
import { pbbUserProfile, groupAkses, akses } from "../schema/pengguna";
import { legacyAkses, legacyGroupAkses, legacyLogin } from "./legacy-data";
import { sql } from "drizzle-orm";

export async function seedLegacyData() {
    console.log("📜 Seeding legacy tables (login, group_akses, akses)...");

    console.log("  - Seeding akses...");
    for (const item of legacyAkses) {
        await db.insert(akses).values(item).onDuplicateKeyUpdate({ set: { aktif: item.aktif } });
    }

    console.log("  - Seeding group_akses...");
    const chunks = [];
    const chunkSize = 100;
    for (let i = 0; i < legacyGroupAkses.length; i += chunkSize) {
        chunks.push(legacyGroupAkses.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
        // Use a dummy update to handle duplicates in junction table
        await db.insert(groupAkses).values(chunk).onDuplicateKeyUpdate({ 
            set: { hakAkses: sql`HAK_AKSES` } 
        });
    }

    console.log("  - Seeding login (pbbUserProfile)...");
    for (const item of legacyLogin) {
        const { tandaTangan, ...loginData } = item as any;
        await db.insert(pbbUserProfile).values(loginData).onDuplicateKeyUpdate({ set: { username: item.username } });
    }

    console.log("  ✓ Legacy tables seeded");
}
