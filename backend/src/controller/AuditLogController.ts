import {AuditLogs} from "../entities/auditLog";


export class AuditLogController {
  private auditLogsEntity = new AuditLogs();  

  async exportAuditLogsCSV(limit?: number) {
    // Call entity function to get CSV string
    return await this.auditLogsEntity.AuditLogsCSV(limit);
  }
  async createAuditLog(actor: string, action: string, target: string, details?: string) {
    try {
      if (details !== undefined) {
        return await this.auditLogsEntity.createAuditLog({ actor, action, target, details });
      } else {
        return await this.auditLogsEntity.createAuditLog({ actor, action, target });
      }
    } catch (error) {
      console.error("Error creating audit log:", error);
      throw new Error("Failed to create audit log");
    }
  }

  async fetchAuditLogs(limit?: number) {
    return await this.auditLogsEntity.fetchAuditLogs(limit);
  }

  async clearAuditLogs() {
    return await this.auditLogsEntity.clearAuditLogs();
  }
}
