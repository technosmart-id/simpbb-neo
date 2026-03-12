async function main() {
  console.log("Seed started...");
  // Add your seeding logic here
  // await db.insert(schema.users).values({ name: "Admin", email: "admin@example.com" });
  console.log("Seed finished!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed!");
  console.error(err);
  process.exit(1);
});
