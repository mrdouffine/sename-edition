import { connectToDatabase } from "@/lib/mongodb";
import AdminAuditLogModel from "@/models/AdminAuditLog";

export async function logAdminAction(params: {
  adminUserId: string;
  action: string;
  entity: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}) {
  await connectToDatabase();

  await AdminAuditLogModel.create({
    adminUserId: params.adminUserId,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    payload: params.payload
  });
}

export async function listAdminAuditLogs() {
  await connectToDatabase();

  const logs = await AdminAuditLogModel.find({})
    .sort({ _id: -1 })
    .limit(300)
    .populate({ path: "adminUserId", select: "name email" })
    .lean();

  return logs.map((log) => ({
    id: log._id.toString(),
    action: log.action,
    entity: log.entity,
    entityId: log.entityId ?? "",
    payload: log.payload ?? {},
    createdAt: (log as { createdAt?: Date }).createdAt,
    adminUser: {
      id:
        typeof (log.adminUserId as { _id?: { toString(): string } })?._id?.toString === "function"
          ? (log.adminUserId as { _id: { toString(): string } })._id.toString()
          : "",
      name: (log.adminUserId as { name?: string } | null)?.name ?? "Admin",
      email: (log.adminUserId as { email?: string } | null)?.email ?? ""
    }
  }));
}
