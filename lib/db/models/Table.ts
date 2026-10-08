import mongoose, { Schema, type Document, type Model } from "mongoose";

export type TableStatus = "empty" | "occupied" | "reserved";

export interface ITable extends Document {
  restaurantId: string;
  label: string; // e.g. "Table 4"
  capacity: number;
  status: TableStatus;
  qrSignature: string; // HMAC signature baked into the printed QR, verified on scan
  activeOrderId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    restaurantId: { type: String, required: true, index: true },
    label: { type: String, required: true },
    capacity: { type: Number, required: true, default: 4 },
    status: {
      type: String,
      enum: ["empty", "occupied", "reserved"],
      default: "empty",
    },
    qrSignature: { type: String, required: true },
    activeOrderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

// A restaurant can't have two tables with the same label.
TableSchema.index({ restaurantId: 1, label: 1 }, { unique: true });

export const Table: Model<ITable> =
  mongoose.models.Table || mongoose.model<ITable>("Table", TableSchema);

export default Table;
