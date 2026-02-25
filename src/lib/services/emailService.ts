import { connectToDatabase } from "@/lib/mongodb";
import BookModel from "@/models/Book";
import ContributionModel from "@/models/Contribution";
import EmailLogModel from "@/models/EmailLog";
import OrderModel from "@/models/Order";
import UserModel from "@/models/User";

async function queueEmail(params: {
  to: string;
  subject: string;
  template: string;
  payload?: Record<string, unknown>;
}) {
  await connectToDatabase();

  const email = await EmailLogModel.create({
    to: params.to,
    subject: params.subject,
    template: params.template,
    payload: params.payload,
    status: "sent",
    sentAt: new Date()
  });

  // MVP local: journalise dans la console et stocke en base pour audit.
  console.log("[EMAIL]", {
    to: params.to,
    subject: params.subject,
    template: params.template
  });

  return email;
}

export async function sendSignupEmail(params: { to: string; name: string }) {
  return queueEmail({
    to: params.to,
    subject: "Bienvenue sur SENAME EDITION’S",
    template: "signup_welcome",
    payload: { name: params.name }
  });
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  name: string;
  orderId: string;
  total: number;
  saleType: "direct" | "preorder";
}) {
  return queueEmail({
    to: params.to,
    subject: "Confirmation de commande SENAME EDITION’S",
    template: "order_confirmation",
    payload: params
  });
}

export async function sendContributionConfirmationEmail(params: {
  to: string;
  name: string;
  bookTitle: string;
  amount: number;
}) {
  return queueEmail({
    to: params.to,
    subject: "Confirmation de contribution SENAME EDITION’S",
    template: "contribution_confirmation",
    payload: params
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  token: string;
  expiresAt: Date;
}) {
  return queueEmail({
    to: params.to,
    subject: "Réinitialisation de mot de passe SENAME EDITION’S",
    template: "password_reset",
    payload: {
      token: params.token,
      expiresAt: params.expiresAt.toISOString()
    }
  });
}

export async function runScheduledBookNotifications() {
  await connectToDatabase();

  const now = new Date();

  const preorderBooks = await BookModel.find({
    saleType: "preorder",
    releaseDate: { $lte: now },
    preorderNotifiedAt: { $exists: false }
  }).lean();

  let preorderCount = 0;
  for (const book of preorderBooks) {
    const orders = await OrderModel.find({ saleType: "preorder", "items.book": book._id })
      .populate({ path: "user", select: "email name" })
      .lean();

    for (const order of orders) {
      const user = order.user as { email?: string; name?: string } | null;
      if (!user?.email) continue;

      await queueEmail({
        to: user.email,
        subject: `Votre précommande est disponible: ${book.title}`,
        template: "preorder_release",
        payload: {
          bookTitle: book.title,
          bookSlug: book.slug,
          name: user.name ?? "Lecteur"
        }
      });
      preorderCount += 1;
    }

    await BookModel.findByIdAndUpdate(book._id, { preorderNotifiedAt: now });
  }

  const crowdfundingBooks = await BookModel.find({
    saleType: "crowdfunding",
    releaseDate: { $lte: now },
    campaignEndNotifiedAt: { $exists: false }
  }).lean();

  let campaignCount = 0;
  for (const book of crowdfundingBooks) {
    const contributions = await ContributionModel.find({ book: book._id })
      .populate({ path: "user", select: "email name" })
      .lean();
    const objectiveReached =
      (book.fundingRaised ?? 0) >= (book.fundingGoal ?? Number.MAX_SAFE_INTEGER);

    if (!objectiveReached) {
      const refundable = await ContributionModel.find(
        { book: book._id, status: "paid" },
        { user: 1, amount: 1 }
      ).lean();

      await ContributionModel.updateMany(
        { book: book._id, status: "paid" },
        { $set: { status: "refunded" } }
      );

      for (const entry of refundable) {
        if (entry.user) {
          await UserModel.findByIdAndUpdate(entry.user, {
            $inc: { rewardPoints: -Math.max(1, Math.floor(entry.amount)) }
          });
        }
      }

      await BookModel.findByIdAndUpdate(book._id, { fundingRaised: 0 });
    }

    for (const contribution of contributions) {
      const user = contribution.user as { email?: string; name?: string } | null;
      if (!user?.email) continue;

      await queueEmail({
        to: user.email,
        subject: `Fin de campagne: ${book.title}`,
        template: "campaign_end",
        payload: {
          bookTitle: book.title,
          bookSlug: book.slug,
          objectiveReached,
          raised: book.fundingRaised ?? 0,
          goal: book.fundingGoal ?? 0,
          name: user.name ?? "Lecteur"
        }
      });
      campaignCount += 1;
    }

    await BookModel.findByIdAndUpdate(book._id, { campaignEndNotifiedAt: now });
  }

  return {
    preorderEmailsSent: preorderCount,
    campaignEmailsSent: campaignCount
  };
}
