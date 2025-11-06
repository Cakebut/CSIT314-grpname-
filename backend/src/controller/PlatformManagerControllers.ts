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

  async listActiveServiceTypes() {
    return this.entity.listActiveServiceTypes();
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

  async softDeleteServiceType(id?: number) {
    return this.entity.softDeleteServiceType(id);
  }

  // force delete removed; only soft delete is supported

  async restoreServiceType(id?: number) {
    return this.entity.restoreServiceType(id);
  }

  async reassignRequestsToServiceType(fromId?: number, toId?: number) {
    return this.entity.reassignRequestsToServiceType(fromId, toId);
  }

  async countActiveUsersByRole() {
    return this.entity.countActiveUsersByRole();
  }

  async getRequestStatusCountsByPeriod() {
    return this.entity.getRequestStatusCountsByPeriod();
  }

  async getRequestsReportSummary(q: ReportQuery) {
    return this.entity.getRequestsReportSummary(q);
  }

  async getRequestsReportSummaryForToday() {
    // Build server-local YYYY-MM-DD for today
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const today = `${y}-${m}-${day}`;
    return this.entity.getRequestsReportSummary({ start: today, end: today });
  }

  async getRequestsReportRows(q: ReportQuery) {
    return this.entity.getRequestsReportRows(q);
  }

  async getRequestsReportDebug(q: { date?: string; typeNames?: string[] }) {
    return this.entity.getRequestsReportDebug(q.date, q.typeNames);
  }

  async sendAnnouncementToAllUsers({ message }: { message?: string }) {
    if (!message || !message.trim()) throw new Error("Message cannot be empty");
    const deliveredCount = await this.entity.countActiveUsers();
    this.latestAnnouncement = { message: message.trim(), createdAt: new Date().toISOString() };
    return { deliveredCount };
  }

  getLatestAnnouncementSnapshot() {
    return this.latestAnnouncement;
  }

  // Volunteer name feature removed
}
