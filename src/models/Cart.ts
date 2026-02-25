import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface CartItem {
  book: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  title: string;
  slug: string;
  coverImage: string;
  saleType: "direct" | "preorder" | "crowdfunding";
}

export interface CartDocument extends Document {
  user: mongoose.Types.ObjectId;
  items: CartItem[];
}

const CartItemSchema = new Schema<CartItem>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    coverImage: { type: String, required: true },
    saleType: { type: String, enum: ["direct", "preorder", "crowdfunding"], required: true }
  },
  { _id: false }
);

const CartSchema = new Schema<CartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: { type: [CartItemSchema], default: [] }
  },
  { timestamps: true }
);

const CartModel: Model<CartDocument> =
  mongoose.models.Cart || mongoose.model<CartDocument>("Cart", CartSchema);

export default CartModel;
