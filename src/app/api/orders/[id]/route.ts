import { handleApiError, jsonSuccess } from "@/lib/api";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/mongodb";
import OrderModel from "@/models/Order";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = requireAuth(request);
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonSuccess({ error: "Invalid order ID format" }, 400);
    }

    await connectToDatabase();
    const order = await OrderModel.findById(id);

    if (!order) {
      return jsonSuccess({ error: "Unauthorized" }, 403);
    }

    if (order.user.toString() !== session.sub) {
      return jsonSuccess({ error: "Unauthorized" }, 403);
    }

    return jsonSuccess({
      _id: order._id,
      total: order.total,
      email: order.email,
      status: order.status,
      saleType: order.saleType,
      paymentProvider: order.paymentProvider
    });
  } catch (error) {
    return handleApiError(error);
  }
}
