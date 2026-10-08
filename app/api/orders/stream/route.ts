import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { subscribeOrderEvents } from "@/lib/realtime/order-events";

export const dynamic = "force-dynamic";

/** Server-Sent Events feed for the admin Live Orders board — see project notes on why SSE over Socket.io/Pusher. */
export async function GET() {
  let session;
  try {
    session = await requireAdmin();
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return new Response("Unauthorized", { status: 401 });
    }
    throw err;
  }

  const encoder = new TextEncoder();
  let heartbeat: ReturnType<typeof setInterval>;
  let unsubscribe: () => void;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Heartbeat keeps proxies/load balancers from idling the connection out.
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 25000);

      unsubscribe = subscribeOrderEvents(session.restaurantId, send);

      controller.enqueue(encoder.encode(`: connected\n\n`));
    },
    cancel() {
      clearInterval(heartbeat);
      unsubscribe?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
