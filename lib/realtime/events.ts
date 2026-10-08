import { EventEmitter } from "node:events";

/**
 * In-memory pub-sub used to push order/kitchen updates over SSE without
 * standing up Socket.io/Pusher (see project notes — SSE was chosen as the
 * free, Vercel-native realtime option for Phase 1).
 *
 * Caveat: this only broadcasts within a single Node process. It's correct
 * for a single long-running server (a VPS, or Vercel's Node runtime with one
 * instance). If you later scale to multiple serverless instances, replace
 * this with a shared pub-sub (Redis, Ably, etc.) — the publish()/subscribe()
 * call sites below won't need to change, only this file's internals.
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(0); // many kitchen/admin tablets can stay connected
  }
}

export const eventBus = new EventBus();

export function publish<T>(channel: string, payload: T) {
  eventBus.emit(channel, payload);
}

export function subscribe<T>(channel: string, handler: (payload: T) => void) {
  eventBus.on(channel, handler);
  return () => eventBus.off(channel, handler);
}
