import { RPCHandler } from "@orpc/server/fetch";
import { router } from "@/lib/orpc/router";
import { createContext } from "@/lib/orpc/server";

const handler = new RPCHandler(router);

async function handleRequest(request: Request) {
  const context = await createContext();

  const { response } = await handler.handle(request, {
    prefix: "/api/v1",
    context,
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const GET = handleRequest;
export const POST = handleRequest;
