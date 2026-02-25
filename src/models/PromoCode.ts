import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface PromoCodeDocument extends Document {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: Date;
}

const PromoCodeSchema = new Schema<PromoCodeDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, min: 0, default: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, min: 0, default: 0 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

const PromoCodeModel: Model<PromoCodeDocument> =
  mongoose.models.PromoCode || mongoose.model<PromoCodeDocument>("PromoCode", PromoCodeSchema);

export default PromoCodeModel;
