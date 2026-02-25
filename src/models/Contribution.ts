import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ContributionDocument extends Document {
  book: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  amount: number;
  reward?: string;
  contributorName?: string;
  isPublic: boolean;
  status: "pending" | "paid" | "refunded";
  paymentMethod?: "stripe" | "paypal" | "mobile_money";
  paymentReference?: string;
  transactionId?: string;
}

const ContributionSchema = new Schema<ContributionDocument>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true, min: 1 },
    reward: { type: String },
    contributorName: { type: String },
    isPublic: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending"
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "mobile_money"]
    },
    paymentReference: { type: String },
    transactionId: { type: String }
  },
  { timestamps: true }
);

const ContributionModel: Model<ContributionDocument> =
  mongoose.models.Contribution ||
  mongoose.model<ContributionDocument>("Contribution", ContributionSchema);

export default ContributionModel;
