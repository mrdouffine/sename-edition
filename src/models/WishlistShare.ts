import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface WishlistShareDocument extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
}

const WishlistShareSchema = new Schema<WishlistShareDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

const WishlistShareModel: Model<WishlistShareDocument> =
  mongoose.models.WishlistShare ||
  mongoose.model<WishlistShareDocument>("WishlistShare", WishlistShareSchema);

export default WishlistShareModel;
