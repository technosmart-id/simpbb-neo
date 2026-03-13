import { auth } from "@/lib/auth";
import { sseEmitter } from "@/lib/sse";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * SSE Route Handler using native WebStreams.
 * Keeps an HTTP connection open to stream notifications to the client.
 */
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keep-alive/comment
      controller.enqueue(encoder.encode(": connected\n\n"));

      const onNotification = (data: any) => {
        // Only send if the notification is for this user
        if (data.userId === userId) {
          const payload = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        }
      };

      // Subscribe to the global emitter
      sseEmitter.on("notification", onNotification);

      // Keep-alive interval to prevent timeout
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(": keep-alive\n\n"));
      }, 30000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        sseEmitter.off("notification", onNotification);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // Bypass Nginx buffering
    },
  });
}
