import { requireAdmin, UnauthorizedError } from "@/lib/auth/guards";
import { subscribeKitchenEvents } from "@/lib/realtime/kitchen-events";

export const dynamic = "force-dynamic";

/**
 * Same event channel as the admin Live Orders stream (see kitchen-events.ts)
 * — the kitchen tablet filters client-side to just placed/accepted/preparing.
 * It authenticates the same way the admin dashboard does: sign in once via
 * /admin/login on the kitchen device, the session cookie then covers both.
 * A dedicated staff-PIN login for kitchen/counter devices is a later phase.
 */
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

      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": ping\n\n"));
      }, 25000);

      unsubscribe = subscribeKitchenEvents(session.restaurantId, send);

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
