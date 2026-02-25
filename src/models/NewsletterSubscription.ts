import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface NewsletterSubscriptionDocument extends Document {
  email: string;
  active: boolean;
  source?: string;
}

const NewsletterSubscriptionSchema = new Schema<NewsletterSubscriptionDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    active: { type: Boolean, default: true },
    source: { type: String }
  },
  { timestamps: true }
);

const NewsletterSubscriptionModel: Model<NewsletterSubscriptionDocument> =
  mongoose.models.NewsletterSubscription ||
  mongoose.model<NewsletterSubscriptionDocument>(
    "NewsletterSubscription",
    NewsletterSubscriptionSchema
  );

export default NewsletterSubscriptionModel;
