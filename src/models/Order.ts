import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface OrderItem {
  book: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
}

export interface OrderDocument extends Document {
  user: mongoose.Types.ObjectId;
  items: OrderItem[];
  total: number;
  email: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  saleType: "direct" | "preorder";
  paymentProvider: "fedapay" | "paypal";
  transactionId?: string;
  paymentReference?: string;
  promoCode?: string;
  invoiceNumber: string;
  invoicePdfBase64?: string;
  paidAt?: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [OrderItemSchema], default: [] },
    total: { type: Number, required: true, min: 0 },
    email: { type: String, required: true, match: /.+@.+\..+/ },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "refunded"],
      default: "pending"
    },
    saleType: {
      type: String,
      enum: ["direct", "preorder"],
      required: true
    },
    paymentProvider: {
      type: String,
      enum: ["fedapay", "paypal"],
      required: true
    },
    transactionId: { type: String },
    paymentReference: { type: String },
    promoCode: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
    invoicePdfBase64: { type: String },
    paidAt: { type: Date }
  },
  { timestamps: true }
);

const OrderModel: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>("Order", OrderSchema);

export default OrderModel;
