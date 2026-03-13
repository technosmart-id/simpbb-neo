import { createNotification } from "../lib/services/notifications";
import { db } from "../lib/db";
import { user } from "../lib/db/schema";

async function test() {
  const [targetUser] = await db.select().from(user).limit(1);
  
  if (!targetUser) {
    console.error("No user found in DB to send a notification to!");
    process.exit(1);
  }

  console.log(`Sending live notification to: ${targetUser.email}`);

  await createNotification({
    userId: targetUser.id,
    title: "It's Not a Joke! 🚀",
    message: "SSE is actually this simple. Drink some coffee, Ariefan.",
    type: "success",
    link: "/dashboard"
  });

  console.log("Notification emitted. Check your browser!");
  process.exit(0);
}

test();
