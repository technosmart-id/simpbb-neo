import { EventEmitter } from "events";

/**
 * Global SSE Emitter singleton.
 * Using a global variable ensures it survives HMR in development.
 */
declare global {
  var sseEmitter: EventEmitter | undefined;
}

export const sseEmitter = global.sseEmitter ?? new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  global.sseEmitter = sseEmitter;
}

// Max listeners logic to prevent leaks
sseEmitter.setMaxListeners(100);
