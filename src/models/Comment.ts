import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface CommentDocument extends Document {
  book: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  content: string;
  reviewerName?: string;
  reviewerEmail?: string;
  status: "pending" | "approved" | "rejected";
  authorReply?: string;
  reportCount: number;
  reportedBy: mongoose.Types.ObjectId[];
}

const CommentSchema = new Schema<CommentDocument>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true },
    reviewerName: { type: String, trim: true },
    reviewerEmail: { type: String, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    authorReply: { type: String },
    reportCount: { type: Number, default: 0, min: 0 },
    reportedBy: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

const CommentModel: Model<CommentDocument> =
  mongoose.models.Comment ||
  mongoose.model<CommentDocument>("Comment", CommentSchema);

export default CommentModel;
