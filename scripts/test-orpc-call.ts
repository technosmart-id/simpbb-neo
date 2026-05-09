import { createORPCClient } from "@orpc/client";
import { RPCHandler } from "@orpc/server/fetch";
import { router } from "../lib/orpc/server";

async function test() {
    // We can test the router directly without a server
    const handler = new RPCHandler(router);

    console.log("🚀 Calling system.resetDb directly...");
    const response = await handler.handle(new Request("http://localhost/system/resetDb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeDevSeed: true })
    }), { prefix: "/", context: {} as any });

    console.log("Status:", response.response?.status);
    const data = await response.response?.json();
    console.log("Data:", JSON.stringify(data, null, 2));
}

test();
