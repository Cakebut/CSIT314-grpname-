import { and, between, count, eq, inArray, ilike, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { service_typeTable, csr_requestsTable, useraccountTable, roleTable, pin_requestsTable } from "../db/schema/aiodb";

type ReportQuery = { start?: string; end?: string; typeNames?: string[] };

export class PlatformManagerEntity {
  constructor(private db: NodePgDatabase) {}

  async listServiceTypes() {
    const rows = await this.db
      .select()
      .from(service_typeTable)
      .where(eq(service_typeTable.deleted, false))
      .orderBy(service_typeTable.name);
    return rows.map(r => r.name);
  }

  async searchServiceTypes(q?: string, includeDeleted?: boolean) {
    const hasQ = !!(q && q.trim());
    const base = includeDeleted ? sql`TRUE` : eq(service_typeTable.deleted, false);
    const filt = hasQ ? and(base as any, ilike(service_typeTable.name, `%${q!.trim()}%`)) : (base as any);
    const rows = await this.db
      .select({ id: service_typeTable.id, name: service_typeTable.name, deleted: service_typeTable.deleted })
      .from(service_typeTable)
      .where(filt)
      .orderBy(service_typeTable.name);
    return rows;
  }

  async createServiceType(name?: string) {
    if (!name || !name.trim()) throw new Error("Name is required");
    const nm = name.trim();
    try {
      const res = await this.db
        .insert(service_typeTable)
        .values({ name: nm })
        .returning({ id: service_typeTable.id, name: service_typeTable.name });
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
    // Soft delete: mark as deleted
    await this.db.update(service_typeTable).set({ deleted: true }).where(eq(service_typeTable.id, id));
    return { ok: true, deleted: true };
  }

  // force delete removed; only soft delete supported

  async restoreServiceType(id?: number) {
    if (!id || !Number.isFinite(id)) throw new Error("Invalid id");
    await this.db.update(service_typeTable).set({ deleted: false }).where(eq(service_typeTable.id, id));
    return { ok: true, deleted: false };
  }

  // Soft-deactivate feature removed

  async reassignServiceType(fromId?: number, toId?: number) {
    if (!fromId || !Number.isFinite(fromId)) throw new Error("Invalid source id");
    if (!toId || !Number.isFinite(toId)) throw new Error("Invalid target id");
    if (fromId === toId) throw new Error("Source and target must differ");

    const targetExists = await this.db
      .select({ id: service_typeTable.id })
      .from(service_typeTable)
      .where(eq(service_typeTable.id, toId));
    if (!targetExists.length) throw new Error("Target service type not found");

    // Reassign references
    await this.db
      .update(csr_requestsTable)
      .set({ categoryID: toId })
      .where(eq(csr_requestsTable.categoryID, fromId));
    await this.db
      .update(pin_requestsTable)
      .set({ categoryID: toId })
      .where(eq(pin_requestsTable.categoryID, fromId));
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

    const [{ total }] = await this.db
      .select({ total: count() })
      .from(csr_requestsTable)
      .where(whereAll);

    if (!total) return this.emptySummary();

    const rowsByStatus = await this.db
      .select({ status: csr_requestsTable.status, n: count() })
      .from(csr_requestsTable)
      .where(whereAll)
      .groupBy(csr_requestsTable.status);

    const byStatus: Record<string, number> = {};
    rowsByStatus.forEach(r => (byStatus[r.status] = Number(r.n)));

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

    const uniqRes = await this.db.execute(sql`
      SELECT COUNT(DISTINCT cr.csr_id)::int AS uniq
      FROM ${csr_requestsTable} cr
      WHERE cr."requestedAt" BETWEEN ${start} AND ${end}
      ${idFilter}
    `);
    const uniq = Number(uniqRes.rows?.[0]?.uniq ?? 0);

    const completed = byStatus["Completed"] ?? 0;
    const completionRate = total ? Number((completed / total).toFixed(3)) : 0;

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

    const averageTimeToComplete = null;
    const totalVolunteerHours = 0;

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

  async countActiveUsers() {
    const [{ n }] = await this.db
      .select({ n: count() })
      .from(useraccountTable)
      .where(eq(useraccountTable.issuspended, false));
    return Number(n ?? 0);
  }
}
