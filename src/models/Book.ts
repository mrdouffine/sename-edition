import mongoose, { Schema, type Document, type Model } from "mongoose";

export type SaleType = "direct" | "preorder" | "crowdfunding";

export interface StaticReview {
  name: string;
  role?: string;
  content: string;
  rating: number;
  order: number;
}

export interface BookDocument extends Document {
  title: string;
  subtitle?: string;
  slug: string;
  description: string;
  price: number;
  saleType: SaleType;
  releaseDate?: Date;
  coverImage: string;
  galleryImages: string[];
  isbn?: string;
  pages?: number;
  stock?: number;
  fundingGoal?: number;
  fundingRaised?: number;
  excerptUrl?: string;
  authorName?: string;
  tags?: string[];
  staticReviews?: StaticReview[];
  preorderNotifiedAt?: Date;
  campaignEndNotifiedAt?: Date;
}

const BookSchema = new Schema<BookDocument>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    saleType: {
      type: String,
      enum: ["direct", "preorder", "crowdfunding"],
      required: true
    },
    releaseDate: { type: Date },
    coverImage: { type: String, required: true },
    galleryImages: { type: [String], default: [] },
    isbn: { type: String },
    pages: { type: Number, min: 1 },
    stock: { type: Number, min: 0 },
    fundingGoal: { type: Number, min: 0 },
    fundingRaised: { type: Number, min: 0, default: 0 },
    excerptUrl: { type: String },
    authorName: { type: String },
    tags: { type: [String], default: [] },
    staticReviews: {
      type: [
        {
          name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
          role: { type: String, trim: true, maxlength: 100 },
          content: { type: String, required: true, minlength: 2, maxlength: 1000 },
          rating: { type: Number, required: true, min: 1, max: 5 },
          order: { type: Number, required: true }
        }
      ],
      default: []
    },
    preorderNotifiedAt: { type: Date },
    campaignEndNotifiedAt: { type: Date }
  },
  { timestamps: true }
);

const BookModel: Model<BookDocument> =
  mongoose.models.Book || mongoose.model<BookDocument>("Book", BookSchema);

export default BookModel;
