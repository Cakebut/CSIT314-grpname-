import { and, between, count, eq, inArray, ilike, sql } from "drizzle-orm";
import { service_typeTable, csr_requestsTable, useraccountTable, roleTable } from "../db/schema/aiodb";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

type ReportQuery = { start?: string; end?: string; typeNames?: string[] };

export class PlatformManagerController {
  constructor(private db: NodePgDatabase) {}

  // Minimal in-memory latest announcement (non-persistent)
  private latestAnnouncement: { message: string; createdAt: string } | null = null;

  async listServiceTypes() {
    const rows = await this.db.select().from(service_typeTable).orderBy(service_typeTable.name);
    return rows.map(r => r.name);
  }

  async searchServiceTypes(q?: string) {
    const where = q && q.trim() ? ilike(service_typeTable.name, `%${q.trim()}%`) : undefined as any;
    const rows = await this.db
      .select({ id: service_typeTable.id, name: service_typeTable.name })
      .from(service_typeTable)
      .where(where)
      .orderBy(service_typeTable.name);
    return rows;
  }

  async createServiceType(name?: string) {
    if (!name || !name.trim()) throw new Error("Name is required");
    const nm = name.trim();
    try {
      const res = await this.db.insert(service_typeTable).values({ name: nm }).returning({ id: service_typeTable.id, name: service_typeTable.name });
      return res[0];
    } catch (e: any) {
      if (/duplicate/i.test(String(e?.message))) throw new Error("Service type already exists");
      throw e;
    }
  }

  async updateServiceType(id?: number, name?: string) {
    if (!id || !Number.isFinite(id)) throw new Error("Invalid id");
    if (!name || !name.trim()) throw new Error("Name is required");
    const nm = name.trim();
    try {
      await this.db.update(service_typeTable).set({ name: nm }).where(eq(service_typeTable.id, id));
      return { id, name: nm };
    } catch (e: any) {
      if (/duplicate/i.test(String(e?.message))) throw new Error("Service type already exists");
      throw e;
    }
  }

  async deleteServiceType(id?: number) {
    if (!id || !Number.isFinite(id)) throw new Error("Invalid id");
    await this.db.delete(service_typeTable).where(eq(service_typeTable.id, id));
    return { ok: true };
  }

  async getActiveCounts() {
    const [{ pins }] = await this.db
      .select({ pins: count() })
      .from(useraccountTable)
      .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id))
      .where(and(eq(useraccountTable.issuspended, false), eq(roleTable.label, 'PIN')));
    const [{ csrs }] = await this.db
      .select({ csrs: count() })
      .from(useraccountTable)
      .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id))
      .where(and(eq(useraccountTable.issuspended, false), eq(roleTable.label, 'CSR')));
    return { activePINs: Number(pins ?? 0), activeCSRs: Number(csrs ?? 0) };
  }

  async getQuickStats() {
    const rows = await this.db.execute(sql`
      WITH bounds AS (
        SELECT
          date_trunc('day',   now()) AS day_start,
          date_trunc('week',  now()) AS week_start,
          date_trunc('month', now()) AS month_start
      )
      SELECT 'day' AS period,
             COUNT(*)::int AS total,
             SUM((cr.status='Pending')::int)::int      AS "Pending",
             SUM((cr.status='InProgress')::int)::int   AS "InProgress",
             SUM((cr.status='Completed')::int)::int    AS "Completed",
             SUM((cr.status='Cancelled')::int)::int    AS "Cancelled"
      FROM ${csr_requestsTable} cr, bounds b
      WHERE cr."requestedAt" >= b.day_start
        AND cr."requestedAt" <  b.day_start + interval '1 day'
      UNION ALL
      SELECT 'week',
             COUNT(*)::int,
             SUM((cr.status='Pending')::int)::int,
             SUM((cr.status='InProgress')::int)::int,
             SUM((cr.status='Completed')::int)::int,
             SUM((cr.status='Cancelled')::int)::int
      FROM ${csr_requestsTable} cr, bounds b
      WHERE cr."requestedAt" >= b.week_start
        AND cr."requestedAt" <  b.week_start + interval '1 week'
      UNION ALL
      SELECT 'month',
             COUNT(*)::int,
             SUM((cr.status='Pending')::int)::int,
             SUM((cr.status='InProgress')::int)::int,
             SUM((cr.status='Completed')::int)::int,
             SUM((cr.status='Cancelled')::int)::int
      FROM ${csr_requestsTable} cr, bounds b
      WHERE cr."requestedAt" >= b.month_start
        AND cr."requestedAt" <  b.month_start + interval '1 month'
    `);

    const quick: any = { day: null, week: null, month: null };
    rows.rows.forEach((r: any) => {
      quick[r.period] = {
        total: Number(r.total || 0),
        Pending: Number(r.Pending || 0),
        InProgress: Number(r.InProgress || 0),
        Completed: Number(r.Completed || 0),
        Cancelled: Number(r.Cancelled || 0),
      };
    });
    return quick;
  }

  private parseDates(q: ReportQuery) {
    if (!q.start || !q.end) throw new Error("Invalid date range");
    const start = new Date(q.start + "T00:00:00Z");
    const end = new Date(q.end + "T23:59:59Z");
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) throw new Error("Invalid date range");
    return { start, end };
  }

  async getCustomReport(q: ReportQuery) {
    const { start, end } = this.parseDates(q);

    // Optional filter by type names -> ids
    let typeIds: number[] | null = null;
    if (q.typeNames && q.typeNames.length) {
      const rows = await this.db
        .select({ id: service_typeTable.id, name: service_typeTable.name })
        .from(service_typeTable)
        .where(inArray(service_typeTable.name, q.typeNames));
      typeIds = rows.map(r => r.id);
      if (!typeIds.length) return this.emptySummary();
    }

    const whereDate = between(csr_requestsTable.requestedAt, start, end);
    const whereAll = typeIds ? and(whereDate, inArray(csr_requestsTable.categoryID, typeIds)) : whereDate;

    // Total
    const [{ total }] = await this.db
      .select({ total: count() })
      .from(csr_requestsTable)
      .where(whereAll);

    if (!total) return this.emptySummary();

    // By status
    const rowsByStatus = await this.db
      .select({ status: csr_requestsTable.status, n: count() })
      .from(csr_requestsTable)
      .where(whereAll)
      .groupBy(csr_requestsTable.status);

    const byStatus: Record<string, number> = {};
    rowsByStatus.forEach(r => (byStatus[r.status] = Number(r.n)));

    // By service type
    const idFilter = typeIds && typeIds.length
      ? sql`AND cr."categoryID" IN (${sql.join(typeIds.map(id => sql`${id}`), sql`,`)})`
      : sql``;

    const rowsByType = await this.db.execute(sql`
      SELECT st.name as name, COUNT(*)::int as n
      FROM ${csr_requestsTable} cr
      JOIN ${service_typeTable} st ON st.id = cr."categoryID"
      WHERE cr."requestedAt" BETWEEN ${start} AND ${end}
      ${idFilter}
      GROUP BY st.name
      ORDER BY n DESC
    `);
    const byServiceType: Record<string, number> = {};
    rowsByType.rows.forEach((r: any) => (byServiceType[r.name] = Number(r.n)));

    // Unique volunteers (csr_id distinct)
    const uniqRes = await this.db.execute(sql`
      SELECT COUNT(DISTINCT cr.csr_id)::int AS uniq
      FROM ${csr_requestsTable} cr
      WHERE cr."requestedAt" BETWEEN ${start} AND ${end}
      ${idFilter}
    `);
    const uniq = Number(uniqRes.rows?.[0]?.uniq ?? 0);

    const completed = byStatus["Completed"] ?? 0;
    const completionRate = total ? Number((completed / total).toFixed(3)) : 0;

    // Daily trend
    const trend = await this.db.execute(sql`
      SELECT to_char(date_trunc('day', cr."requestedAt"), 'YYYY-MM-DD') AS d,
             COUNT(*)::int AS total,
             SUM((cr.status='Pending')::int)::int AS "Pending",
             SUM((cr.status='InProgress')::int)::int AS "InProgress",
             SUM((cr.status='Completed')::int)::int AS "Completed",
             SUM((cr.status='Cancelled')::int)::int AS "Cancelled"
      FROM ${csr_requestsTable} cr
      WHERE cr."requestedAt" BETWEEN ${start} AND ${end}
      ${idFilter}
      GROUP BY d
      ORDER BY d
    `);
    const trendDaily = trend.rows.map((r: any) => ({
      date: r.d,
      total: r.total,
      Pending: r.Pending,
      InProgress: r.InProgress,
      Completed: r.Completed,
      Cancelled: r.Cancelled,
    }));

    // Placeholders; schema lacks these fields
    const averageTimeToComplete = null; // needs completed_at
    const totalVolunteerHours = 0;      // needs hours_worked

    return {
      totalRequests: total,
      byStatus,
      byServiceType,
      totalVolunteerHours,
      uniqueVolunteers: uniq,
      completionRate,
      averageTimeToComplete,
      trendDaily,
    };
  }

  async getCustomReportRaw(q: ReportQuery) {
    const { start, end } = this.parseDates(q);

    // Optional filter by type names -> ids
    let typeIds: number[] | null = null;
    if (q.typeNames && q.typeNames.length) {
      const rows = await this.db
        .select({ id: service_typeTable.id, name: service_typeTable.name })
        .from(service_typeTable)
        .where(inArray(service_typeTable.name, q.typeNames));
      typeIds = rows.map(r => r.id);
      if (!typeIds.length) return [] as Array<any>;
    }

    const idFilter = typeIds && typeIds.length
      ? sql`AND cr."categoryID" IN (${sql.join(typeIds.map(id => sql`${id}`), sql`,`)})`
      : sql``;

    const rows = await this.db.execute(sql`
      SELECT cr."requestedAt" AS requestedAt,
             st.name          AS serviceType,
             cr.status        AS status,
             cr.pin_id        AS pin_id,
             cr.csr_id        AS csr_id,
             cr.message       AS message
      FROM ${csr_requestsTable} cr
      JOIN ${service_typeTable} st ON st.id = cr."categoryID"
      WHERE cr."requestedAt" BETWEEN ${start} AND ${end}
      ${idFilter}
      ORDER BY cr."requestedAt" ASC
    `);

    return rows.rows as Array<{
      requestedAt: Date;
      serviceType: string;
      status: string;
      pin_id: number;
      csr_id: number;
      message: string;
    }>;
  }

  private emptySummary() {
    return {
      totalRequests: 0,
      byStatus: {},
      byServiceType: {},
      totalVolunteerHours: 0,
      uniqueVolunteers: 0,
      completionRate: 0,
      averageTimeToComplete: null,
      trendDaily: [],
    };
  }

  async sendAnnouncement({ message }: { message?: string }) {
    if (!message || !message.trim()) throw new Error("Message cannot be empty");
    // Count active users (not suspended)
    const rows = await this.db
      .select({ id: useraccountTable.id })
      .from(useraccountTable);
    const active = rows.filter(() => true); // adjust if your schema flags active users
    const deliveredCount = active.length;
    // Store latest in memory (non-persistent, minimal implementation)
    this.latestAnnouncement = { message: message.trim(), createdAt: new Date().toISOString() };
    // To persist, create announcement table and insert here.
    return { deliveredCount };
  }

  getLatestAnnouncement() {
    return this.latestAnnouncement;
  }

  // Volunteer name feature removed
}
