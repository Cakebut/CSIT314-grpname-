import { createAuditLog, fetchAuditLogs,clearAuditLogs,exportAuditLogsCSV } from "../entities/auditLog";
import { db } from "../index";


export class AuditLogController {
  async exportAuditLogsCSV(limit?: number) {
    // Call entity function to get CSV string
    return await exportAuditLogsCSV(limit);
  }
  async createAuditLog(actor: string, action: string, target: string, details?: string) {
    try {
      if (details !== undefined) {
        return await createAuditLog({ actor, action, target, details });
      } else {
        return await createAuditLog({ actor, action, target });
      }
    } catch (error) {
      console.error("Error creating audit log:", error);
      throw new Error("Failed to create audit log");
    }
  }

  async fetchAuditLogs(limit?: number) {
    return await fetchAuditLogs(limit);
  }

  async clearAuditLogs() {
    return await clearAuditLogs();
  }
}
