import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface EmailLogDocument extends Document {
  to: string;
  subject: string;
  template: string;
  payload?: Record<string, unknown>;
  status: "queued" | "sent" | "failed";
  error?: string;
  sentAt?: Date;
}

const EmailLogSchema = new Schema<EmailLogDocument>(
  {
    to: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true },
    template: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    status: { type: String, enum: ["queued", "sent", "failed"], default: "queued" },
    error: { type: String },
    sentAt: { type: Date }
  },
  { timestamps: true }
);

const EmailLogModel: Model<EmailLogDocument> =
  mongoose.models.EmailLog || mongoose.model<EmailLogDocument>("EmailLog", EmailLogSchema);

export default EmailLogModel;
