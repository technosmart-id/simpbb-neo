import { authClient } from "./lib/auth/client"

async function debug() {
  try {
    console.log("Fetching API using local fetch...");
    const res = await fetch("http://localhost:3000/api/rpc/organizations/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({}) // ORPC v1.x usually needs an empty object or form bounds
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}

debug();
