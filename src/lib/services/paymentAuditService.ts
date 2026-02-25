import { connectToDatabase } from "@/lib/mongodb";
import PaymentTransactionModel from "@/models/PaymentTransaction";

type RecordPaymentParams = {
  orderId?: string;
  userId?: string;
  provider: "stripe" | "paypal";
  kind: "payment" | "refund" | "webhook";
  providerEventId?: string;
  providerReference?: string;
  status: "pending" | "succeeded" | "failed";
  amount?: number;
  currency?: string;
  payload?: Record<string, unknown>;
};

export async function recordPaymentTransaction(params: RecordPaymentParams) {
  await connectToDatabase();
  if (params.providerEventId) {
    return PaymentTransactionModel.findOneAndUpdate(
      {
        provider: params.provider,
        providerEventId: params.providerEventId
      },
      { $set: params },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  return PaymentTransactionModel.create(params);
}

export async function hasProcessedWebhookEvent(params: {
  provider: "stripe" | "paypal";
  providerEventId: string;
}) {
  await connectToDatabase();
  const exists = await PaymentTransactionModel.exists({
    provider: params.provider,
    providerEventId: params.providerEventId
  });
  return Boolean(exists);
}
