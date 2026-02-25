import { handleApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { listMyOrders } from "@/lib/services/meService";

function toCsv(orders: Awaited<ReturnType<typeof listMyOrders>>) {
  const header = ["ID", "DATE", "MONTANT", "STATUT", "FACTURE", "ARTICLES"];
  const rows = orders.map((order) => {
    const items = order.items
      .map((item) => item.book?.title ?? "")
      .filter(Boolean)
      .join(", ");
    return [
      order.id,
      (order as { createdAt?: Date }).createdAt
        ? new Date((order as { createdAt?: Date }).createdAt as Date).toISOString()
        : "",
      order.total.toFixed(2),
      order.status,
      order.invoiceNumber,
      `"${items.replace(/\"/g, '""')}"`
    ].join(",");
  });

  return [header.join(","), ...rows].join("\n");
}

export async function GET(request: Request) {
  try {
    const session = requireAuth(request);
    const orders = await listMyOrders(session.sub);
    const csv = toCsv(orders);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="mes-commandes.csv"'
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
