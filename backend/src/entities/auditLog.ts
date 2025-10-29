import { db } from "../index";
import { auditLogTable } from "../db/schema/aiodb";
import { desc } from "drizzle-orm";

export async function addAuditLog({ actor, action, target, details }: {
  actor: string;
  action: string;
  target: string;
  details?: string;
}) {
  await db.insert(auditLogTable).values({
    actor,
    action,
    target,
    details,
    timestamp: new Date(),
  });
}

export async function getAuditLogs(limit?: number) {
  let query = db.select().from(auditLogTable).orderBy(desc(auditLogTable.timestamp));
  if (limit && limit > 0) {
    // drizzle-orm chaining: .orderBy(...).limit(...)
    return await db.select().from(auditLogTable).orderBy(desc(auditLogTable.timestamp)).limit(limit);
  }
  return await query;
}

export async function clearAuditLogs() {
  await db.delete(auditLogTable);
}
