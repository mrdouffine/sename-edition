import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface PaymentTransactionDocument extends Document {
  orderId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  provider: "stripe" | "paypal";
  kind: "payment" | "refund" | "webhook";
  providerEventId?: string;
  providerReference?: string;
  status: "pending" | "succeeded" | "failed";
  amount?: number;
  currency?: string;
  payload?: Record<string, unknown>;
}

const PaymentTransactionSchema = new Schema<PaymentTransactionDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    provider: {
      type: String,
      enum: ["stripe", "paypal"],
      required: true
    },
    kind: {
      type: String,
      enum: ["payment", "refund", "webhook"],
      required: true
    },
    providerEventId: { type: String },
    providerReference: { type: String },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed"],
      required: true
    },
    amount: { type: Number, min: 0 },
    currency: { type: String },
    payload: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

PaymentTransactionSchema.index(
  { provider: 1, providerEventId: 1 },
  { unique: true, sparse: true }
);

PaymentTransactionSchema.index({ orderId: 1, createdAt: -1 });

const PaymentTransactionModel: Model<PaymentTransactionDocument> =
  mongoose.models.PaymentTransaction ||
  mongoose.model<PaymentTransactionDocument>("PaymentTransaction", PaymentTransactionSchema);

export default PaymentTransactionModel;
