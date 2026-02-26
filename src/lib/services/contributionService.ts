import mongoose from "mongoose";
import { ApiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import BookModel from "@/models/Book";
import ContributionModel from "@/models/Contribution";
import UserModel from "@/models/User";

export async function createContribution(params: {
  bookId: string;
  userId?: string;
  amount: number;
  reward?: string;
  contributorName?: string;
  isPublic: boolean;
}) {
  await connectToDatabase();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book = await BookModel.findById(params.bookId).session(session);
    if (!book) {
      throw new Error("Book not found");
    }
    if (book.saleType !== "crowdfunding") {
      throw new Error("Book is not in crowdfunding mode");
    }

    const contribution = await ContributionModel.create(
      [
        {
          book: book._id,
          user: params.userId,
          amount: params.amount,
          reward: params.reward,
          contributorName: params.contributorName,
          isPublic: params.isPublic,
          status: "paid"
        }
      ],
      { session }
    );

    book.fundingRaised = (book.fundingRaised ?? 0) + params.amount;
    await book.save({ session });
    if (params.userId) {
      await UserModel.findByIdAndUpdate(
        params.userId,
        { $inc: { rewardPoints: Math.max(1, Math.floor(params.amount)) } },
        { session }
      );
    }

    await session.commitTransaction();
    return contribution[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function createPendingContribution(params: {
  bookId: string;
  userId: string;
  amount: number;
  reward?: string;
  contributorName?: string;
  isPublic: boolean;
  paymentMethod: "paypal";
}) {
  await connectToDatabase();

  const book = await BookModel.findById(params.bookId).lean();
  if (!book) {
    throw new ApiError("Book not found", 404);
  }
  if (book.saleType !== "crowdfunding") {
    throw new ApiError("Book is not in crowdfunding mode", 400);
  }

  const contribution = await ContributionModel.create({
    book: params.bookId,
    user: params.userId,
    amount: params.amount,
    reward: params.reward,
    contributorName: params.contributorName,
    isPublic: params.isPublic,
    status: "pending",
    paymentMethod: params.paymentMethod
  });

  return contribution;
}

function isTransactionUnsupportedError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return /Transaction numbers are only allowed on a replica set member or mongos/i.test(error.message);
}

async function runWithOptionalTransaction<T>(
  operation: (session: mongoose.ClientSession | null) => Promise<T>
) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    try {
      const result = await operation(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      if (isTransactionUnsupportedError(error)) {
        return operation(null);
      }
      throw error;
    }
  } finally {
    session.endSession();
  }
}

export async function markContributionAsPaid(params: {
  contributionId: string;
  paymentMethod: "paypal";
  transactionId?: string;
  paymentReference?: string;
}) {
  await connectToDatabase();
  return runWithOptionalTransaction(async (session) => {
    const contributionQuery = ContributionModel.findById(params.contributionId);
    if (session) contributionQuery.session(session);
    const contribution = await contributionQuery;
    if (!contribution) {
      throw new ApiError("Contribution not found", 404);
    }
    if (contribution.status === "paid") {
      return contribution;
    }
    if (contribution.status !== "pending") {
      throw new ApiError("Contribution cannot be paid in its current state", 409);
    }

    const bookQuery = BookModel.findById(contribution.book);
    if (session) bookQuery.session(session);
    const book = await bookQuery;
    if (!book) {
      throw new ApiError("Book not found", 404);
    }
    if (book.saleType !== "crowdfunding") {
      throw new ApiError("Book is not in crowdfunding mode", 400);
    }

    contribution.status = "paid";
    contribution.paymentMethod = params.paymentMethod;
    if (params.paymentReference) {
      contribution.paymentReference = params.paymentReference;
    }
    if (params.transactionId) {
      contribution.transactionId = params.transactionId;
    }
    await contribution.save(session ? { session } : undefined);

    book.fundingRaised = (book.fundingRaised ?? 0) + contribution.amount;
    await book.save(session ? { session } : undefined);

    if (contribution.user) {
      await UserModel.findByIdAndUpdate(
        contribution.user,
        { $inc: { rewardPoints: Math.max(1, Math.floor(contribution.amount)) } },
        session ? { session } : {}
      );
    }

    return contribution;
  });
}

export async function getCampaignSnapshot(bookId: string) {
  await connectToDatabase();

  const book = await BookModel.findById(bookId, {
    title: 1,
    saleType: 1,
    fundingGoal: 1,
    fundingRaised: 1
  }).lean();
  if (!book) {
    throw new ApiError("Book not found", 404);
  }
  if (book.saleType !== "crowdfunding") {
    throw new ApiError("Book is not in crowdfunding mode", 400);
  }

  const contributors = await ContributionModel.find(
    { book: book._id, status: "paid", isPublic: true },
    { amount: 1, reward: 1, contributorName: 1, user: 1, createdAt: 1 }
  )
    .sort({ _id: -1 })
    .limit(200)
    .populate({ path: "user", select: "name" })
    .lean();

  const goal = book.fundingGoal ?? 0;
  const raised = book.fundingRaised ?? 0;

  return {
    bookId: book._id.toString(),
    title: book.title,
    goal,
    raised,
    progress: goal > 0 ? Math.min((raised / goal) * 100, 100) : 0,
    totalContributors: contributors.length,
    contributors: contributors.map((entry) => ({
      id: entry._id.toString(),
      name:
        entry.contributorName ||
        (entry.user as { name?: string } | null)?.name ||
        "Contributeur",
      amount: entry.amount,
      reward: entry.reward,
      createdAt: (entry as { createdAt?: Date }).createdAt
    }))
  };
}
