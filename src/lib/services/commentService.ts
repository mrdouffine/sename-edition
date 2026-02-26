import { ApiError } from "@/lib/api";
import { connectToDatabase } from "@/lib/mongodb";
import CommentModel from "@/models/Comment";
import "@/models/User";

export async function createComment(params: {
  bookId: string;
  userId: string;
  rating: number;
  content: string;
  reviewerName?: string;
  reviewerEmail?: string;
}) {
  await connectToDatabase();

  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  const postedRecently = await CommentModel.exists({
    book: params.bookId,
    user: params.userId,
    createdAt: { $gte: oneMinuteAgo }
  });
  if (postedRecently) {
    throw new ApiError("Vous avez déjà envoyé un commentaire récemment pour ce livre.", 429);
  }

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const commentsToday = await CommentModel.countDocuments({
    book: params.bookId,
    user: params.userId,
    createdAt: { $gte: dayStart }
  });
  if (commentsToday >= 5) {
    throw new ApiError("Limite quotidienne de commentaires atteinte pour ce livre.", 429);
  }

  const comment = await CommentModel.create({
    book: params.bookId,
    user: params.userId,
    rating: params.rating,
    content: params.content,
    reviewerName: params.reviewerName,
    reviewerEmail: params.reviewerEmail,
    status: "approved"
  });

  return comment;
}

export async function listPublicComments(bookId: string) {
  try {
    await connectToDatabase();

    const comments = await CommentModel.find({ book: bookId, status: "approved" })
      .sort({ _id: -1 })
      .populate({ path: "user", select: "name" })
      .lean();

    return comments.map((comment) => ({
      id: comment._id.toString(),
      rating: comment.rating,
      content: comment.content,
      status: comment.status,
      authorReply: comment.authorReply,
      reportCount: comment.reportCount,
      reviewerName: comment.reviewerName,
      reviewerEmail: comment.reviewerEmail,
      user: comment.user
        ? {
          id: (comment.user as { _id: { toString(): string } })._id.toString(),
          name: (comment.user as { name?: string }).name ?? "Lecteur"
        }
        : null
    }));
  } catch (error) {
    console.warn("Comments unavailable, returning empty list", error);
    return [];
  }
}

export async function replyToComment(params: {
  commentId: string;
  reply: string;
}) {
  await connectToDatabase();

  const comment = await CommentModel.findByIdAndUpdate(
    params.commentId,
    { authorReply: params.reply },
    { new: true }
  ).lean();

  if (!comment) {
    throw new ApiError("Comment not found", 404);
  }

  return {
    id: comment._id.toString(),
    authorReply: comment.authorReply
  };
}
