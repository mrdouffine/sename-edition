import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface PasswordResetTokenDocument extends Document {
  user: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
}

const PasswordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date }
  },
  { timestamps: true }
);

const PasswordResetTokenModel: Model<PasswordResetTokenDocument> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<PasswordResetTokenDocument>("PasswordResetToken", PasswordResetTokenSchema);

export default PasswordResetTokenModel;
