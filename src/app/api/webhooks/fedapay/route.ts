import { handleApiError, jsonSuccess } from "@/lib/api";
import { markOrderAsPaid, markOrderAsRefunded } from "@/lib/services/orderService";
import { verifyFedapayWebhookSignature, getFedapayTransactionStatus } from "@/lib/services/paymentService";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get("x-fedapay-signature");
        const rawBody = await request.text();

        // Verify webhook signature
        verifyFedapayWebhookSignature({
            rawBody,
            signature
        });

        const body = JSON.parse(rawBody);
        const event = body.name; // Type of event (e.g., transaction.created, transaction.approved)
        const transaction = body.entity;

        // We only care about transaction updates
        if (!transaction || !transaction.id) {
            return jsonSuccess({ received: true });
        }

        // The orderId is stored in custom metadata when we create the transaction
        const orderId = transaction.metadata?.orderId || transaction.custom_metadata?.orderId || transaction.reference;
        if (!orderId) {
            // If we can't link it to an order, acknowledge it to stop retries but do nothing
            return jsonSuccess({ received: true });
        }

        switch (event) {
            case "transaction.approved":
                // Fallback check: verify the status directly on Fedapay to be absolutely secure
                const verification = await getFedapayTransactionStatus(transaction.id);
                const verifiedTransaction = (verification.v1 as any)?.transaction || verification;

                if (verifiedTransaction.status === "approved" || transaction.status === "approved") {
                    await markOrderAsPaid({
                        orderId,
                        paymentProvider: "fedapay",
                        transactionId: transaction.id.toString(),
                        paymentReference: transaction.reference
                    });
                }
                break;

            case "transaction.canceled":
            case "transaction.declined":
                // Handle failed/declined transactions if necessary
                break;

            case "transaction.refunded":
                await markOrderAsRefunded({
                    orderId,
                    paymentReference: transaction.reference
                });
                break;
        }

        return jsonSuccess({ received: true });
    } catch (error) {
        if ((error as any).status !== 400 && (error as any).status !== 500) {
            console.error("Fedapay Webhook error:", error);
        }
        return handleApiError(error);
    }
}
