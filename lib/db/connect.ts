import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is missing. Add it to .env.local (see .env.example)."
  );
}

// Narrowed once here; captured as a guaranteed string in the closure below
// (TypeScript doesn't carry the module-level narrowing into nested functions).
const MONGODB_URI: string = process.env.MONGODB_URI;

/**
 * Next.js reloads modules on every request in dev, which would otherwise
 * create a new Mongoose connection per request. We cache the connection
 * (and the in-flight connect promise) on the global object so it survives
 * hot-reloads and is shared across the whole server process.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}

export default connectDB;
