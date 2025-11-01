import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PlatformManagerEntity } from "../entities/PlatformManager";

type ReportQuery = { start?: string; end?: string; typeNames?: string[] };

export class PlatformManagerController {
  private entity: PlatformManagerEntity;
  constructor(db: NodePgDatabase) {
    this.entity = new PlatformManagerEntity(db);
  }

  // Minimal in-memory latest announcement (non-persistent)
  private latestAnnouncement: { message: string; createdAt: string } | null = null;

  async listServiceTypes() {
    return this.entity.listServiceTypes();
  }

  async searchServiceTypes(q?: string, includeDeleted?: boolean) {
    return this.entity.searchServiceTypes(q, includeDeleted);
  }

  async createServiceType(name?: string) {
    return this.entity.createServiceType(name);
  }

  async updateServiceType(id?: number, name?: string) {
    return this.entity.updateServiceType(id, name);
  }

  async deleteServiceType(id?: number) {
    return this.entity.deleteServiceType(id);
  }

  // force delete removed; only soft delete is supported

  async restoreServiceType(id?: number) {
    return this.entity.restoreServiceType(id);
  }

  async reassignServiceType(fromId?: number, toId?: number) {
    return this.entity.reassignServiceType(fromId, toId);
  }

  async getActiveCounts() {
    return this.entity.getActiveCounts();
  }

  async getQuickStats() {
    return this.entity.getQuickStats();
  }

  async getCustomReport(q: ReportQuery) {
    return this.entity.getCustomReport(q);
  }

  async getCustomReportRaw(q: ReportQuery) {
    return this.entity.getCustomReportRaw(q);
  }

  async sendAnnouncement({ message }: { message?: string }) {
    if (!message || !message.trim()) throw new Error("Message cannot be empty");
    const deliveredCount = await this.entity.countActiveUsers();
    this.latestAnnouncement = { message: message.trim(), createdAt: new Date().toISOString() };
    return { deliveredCount };
  }

  getLatestAnnouncement() {
    return this.latestAnnouncement;
  }

  // Volunteer name feature removed
}
