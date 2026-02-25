import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "client" | "admin";
  wishlist: mongoose.Types.ObjectId[];
  rewardPoints: number;
  referredBy?: string;
}

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["client", "admin"], default: "client" },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    rewardPoints: { type: Number, min: 0, default: 0 },
    referredBy: { type: String, trim: true }
  },
  { timestamps: true }
);

const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;
