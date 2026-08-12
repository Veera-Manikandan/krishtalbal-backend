import AuditLog from "../models/AuditLog.js";

export async function writeAudit(userId, action, details, metadata = {}) {
  await AuditLog.create({ userId, action, details, metadata });
}