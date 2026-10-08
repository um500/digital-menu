import mongoose, { Schema, type Document, type Model } from "mongoose";

/**
 * Generic atomic counter, keyed by restaurant + day. Used to generate
 * human-readable sequential order numbers (e.g. "GC-20260107-014") without
 * a race condition when two orders are placed in the same second.
 */
export interface ICounter extends Document {
  key: string; // `${restaurantId}:${yyyymmdd}`
  seq: number;
}

const CounterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, required: true, default: 0 },
});

export const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>("Counter", CounterSchema);

export default Counter;
