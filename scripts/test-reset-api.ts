async function testReset() {
    console.log("🚀 Simulating button click on Login Page (Calling /api/rpc/system/resetDb)...");
    try {
        const response = await fetch("http://127.0.0.1:3000/api/rpc/system/resetDb", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({})
        });
        
        const data = await response.json();
        console.log("📦 Response Status:", response.status);
        console.log("📜 Response Logs:\n", data.logs?.join("\n"));
        
        if (data.success) {
            console.log("\n✅ Database Reset and Seeded via API Successfully!");
        } else {
            console.error("\n❌ API Reset Failed:", data.message);
        }
    } catch (err: any) {
        console.error("❌ Fetch Error:", err.message);
    }
}

testReset();
