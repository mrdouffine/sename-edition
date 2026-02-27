import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/lib/api";
import { verifyFedapayWebhookSignature } from "@/lib/services/paymentService";
import { markOrderAsPaid } from "@/lib/services/orderService";
import { recordPaymentTransaction, hasProcessedWebhookEvent } from "@/lib/services/paymentAuditService";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-fedapay-signature");

    verifyFedapayWebhookSignature({ rawBody, signature });

    const event = JSON.parse(rawBody) as any;
    const eventId: string | undefined = event?.id ?? event?.event_id ?? event?.data?.id;

    if (eventId) {
      const already = await hasProcessedWebhookEvent({ provider: "fedapay", providerEventId: eventId });
      if (already) return NextResponse.json({ ok: true });
    }

    const type = event?.type ?? event?.event;
    const data = event?.data ?? event?.object ?? event?.transaction;

    if (type && String(type).includes("transaction") && data) {
      const status = data.status ?? data.state;
      const orderId = data.metadata?.orderId ?? data.reference ?? data.custom_id;
      const transactionId = data.id ?? data.transaction_id;

      if (orderId && (status === "approved" || status === "success" || status === "completed")) {
        const finalized = await markOrderAsPaid({
          orderId: String(orderId),
          paymentProvider: "fedapay",
          transactionId: String(transactionId),
          paymentReference: data.token ?? data.reference ?? undefined
        });

        await recordPaymentTransaction({
          orderId: finalized._id.toString(),
          userId: finalized.user.toString(),
          provider: "fedapay",
          kind: "webhook",
          providerEventId: eventId,
          status: "succeeded",
          providerReference: String(transactionId)
        } as any);

        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const status = searchParams.get("status");
  const orderId = searchParams.get("id"); // Sometimes FedaPay uses 'id' or other params in the return URL

  // If we have status=approved or similar, consider it a success redirect
  if (status === "approved" || status === "success" || status === "pending") {
    return NextResponse.redirect(`${origin}/commande/succes?provider=fedapay&orderId=${orderId || ""}`);
  }

  // Otherwise treat as failure or unknown
  return NextResponse.redirect(`${origin}/commande/echec?provider=fedapay`);
}
