import mongoose, { Schema, type Document, type Model } from "mongoose";

interface AbandonedCartItem {
  bookId: string;
  slug: string;
  title: string;
  quantity: number;
  unitPrice: number;
  saleType: "direct" | "preorder" | "crowdfunding";
}

export interface AbandonedCartDocument extends Document {
  user?: mongoose.Types.ObjectId;
  email?: string;
  items: AbandonedCartItem[];
  subtotal: number;
  status: "open" | "recovered";
  recoveredAt?: Date;
}

const AbandonedCartItemSchema = new Schema<AbandonedCartItem>(
  {
    bookId: { type: String, required: true },
    slug: { type: String, required: true },
    title: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    saleType: { type: String, enum: ["direct", "preorder", "crowdfunding"], required: true }
  },
  { _id: false }
);

const AbandonedCartSchema = new Schema<AbandonedCartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String, lowercase: true, trim: true },
    items: { type: [AbandonedCartItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["open", "recovered"], default: "open" },
    recoveredAt: { type: Date }
  },
  { timestamps: true }
);

const AbandonedCartModel: Model<AbandonedCartDocument> =
  mongoose.models.AbandonedCart ||
  mongoose.model<AbandonedCartDocument>("AbandonedCart", AbandonedCartSchema);

export default AbandonedCartModel;
