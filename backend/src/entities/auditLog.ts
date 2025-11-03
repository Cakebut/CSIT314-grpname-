 
import { db } from "../index";
import { auditLogTable } from "../db/schema/aiodb";
import { desc } from "drizzle-orm";



// Export audit logs as CSV
export async function exportAuditLogsCSV(limit?: number): Promise<string> {
  const logs = await fetchAuditLogs(limit);
  const headers = ['id', 'actor', 'action', 'target', 'timestamp', 'details'];
  function escapeCsv(val: any) {
    if (val == null) return '';
    const str = String(val);
    // Escape double quotes, wrap in quotes if contains comma, quote, or newline
    const needsQuotes = /[",\n]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  }
  const rows = logs.map((log: any) => [
    log.id,
    log.actor,
    log.action,
    log.target,
    log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp,
    log.details || ''
  ]);
  const csvData = [headers.join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
  return csvData;
}

//Crate audit log entry
export async function createAuditLog({ actor, action, target, details }: {
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

//Fetch audit logs with optional limit
export async function fetchAuditLogs(limit?: number) {
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
