import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface AdminAuditLogDocument extends Document {
  adminUserId: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}

const AdminAuditLogSchema = new Schema<AdminAuditLogDocument>(
  {
    adminUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String },
    payload: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

const AdminAuditLogModel: Model<AdminAuditLogDocument> =
  mongoose.models.AdminAuditLog ||
  mongoose.model<AdminAuditLogDocument>("AdminAuditLog", AdminAuditLogSchema);

export default AdminAuditLogModel;
