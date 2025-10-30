import { addAuditLog, getAuditLogs,clearAuditLogs } from "../entities/auditLog";
import { db } from "../index";


export class AuditLogController {
  async createAuditLog(actor: string, action: string, target: string, details?: string) {
    if (details !== undefined) {
      return await addAuditLog({ actor, action, target, details });
    } else {
      return await addAuditLog({ actor, action, target });
    }
  }

  async fetchAuditLogs(limit?: number) {
    return await getAuditLogs(limit);
  }

  async clearAuditLogs() {
    return await clearAuditLogs();
  }
}
