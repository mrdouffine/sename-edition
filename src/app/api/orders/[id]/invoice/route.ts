import { ApiError, handleApiError } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import { generateInvoicePdf } from "@/lib/services/invoiceService";
import OrderModel from "@/models/Order";
import UserModel from "@/models/User";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(request);
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const disposition = searchParams.get("disposition") === "inline" ? "inline" : "attachment";

    await connectToDatabase();
    const order = await OrderModel.findById(id)
      .populate({ path: "items.book", select: "title" })
      .lean();

    if (!order) {
      throw new ApiError("Order not found", 404);
    }

    const isOwner = order.user.toString() === session.sub;
    if (!isOwner && session.role !== "admin") {
      throw new ApiError("Forbidden", 403);
    }

    if (order.status !== "paid" && order.status !== "refunded") {
      throw new ApiError("Invoice is available only after successful payment", 409);
    }

    let invoiceBase64 = order.invoicePdfBase64;
    if (!invoiceBase64) {
      const user = await UserModel.findById(order.user, { name: 1, email: 1 }).lean();
      const invoicePdf = generateInvoicePdf({
        invoiceNumber: order.invoiceNumber,
        orderId: order._id.toString(),
        customerName: user?.name ?? "Client SENAME EDITION’S",
        customerEmail: user?.email ?? "client@senameedition.local",
        saleType: order.saleType,
        paymentMethod: order.paymentMethod,
        paymentReference: order.paymentReference,
        total: order.total,
        createdAt: (order as { createdAt?: Date }).createdAt ?? new Date(),
        items: order.items.map((item) => ({
          book: item.book as never,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          title: (item.book as { title?: string } | null)?.title
        }))
      });
      invoiceBase64 = invoicePdf.toString("base64");
      await OrderModel.findByIdAndUpdate(order._id, { invoicePdfBase64: invoiceBase64 });
    }

    const pdfBuffer = Buffer.from(invoiceBase64, "base64");
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename="${order.invoiceNumber}.pdf"`,
        "Cache-Control": "private, max-age=0, must-revalidate"
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}
