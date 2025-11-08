import { and, between, count, eq, inArray, ilike, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { service_typeTable, csr_requestsTable, useraccountTable, roleTable, pin_requestsTable } from "../db/schema/aiodb";

type ReportQuery = { start?: string; end?: string; typeNames?: string[] };

export class PlatformManagerEntity {
  constructor(private db: NodePgDatabase) {}

  async listActiveServiceTypes() {
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
        .returning({ id: service_typeTable.id, name: service_typeTable.name , deleted: service_typeTable.deleted });
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

  async softDeleteServiceType(id?: number) {
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

  async reassignRequestsToServiceType(fromId?: number, toId?: number) {
    if (!fromId || !Number.isFinite(fromId)) throw new Error("Invalid source id");
    if (!toId || !Number.isFinite(toId)) throw new Error("Invalid target id");
    if (fromId === toId) throw new Error("Source and target must differ");

    const targetExists = await this.db
      .select({ id: service_typeTable.id })
      .from(service_typeTable)
      .where(eq(service_typeTable.id, toId));
    if (!targetExists.length) throw new Error("Target service type not found");

    // Reassign references in csr_requestsTable is no longer possible (categoryID removed)
    // If you need to reassign service type, update pin_requestsTable only:
    // await this.db
    //   .update(pin_requestsTable)
    //   .set({ categoryID: toId })
    //   .where(eq(pin_requestsTable.categoryID, fromId));
    await this.db
      .update(pin_requestsTable)
      .set({ categoryID: toId })
      .where(eq(pin_requestsTable.categoryID, fromId));
    return { ok: true };
  }

  async countActiveUsersByRole() {
    const [{ pins }] = await this.db
      .select({ pins: count() })
      .from(useraccountTable)
      .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id))
      .where(and(eq(useraccountTable.issuspended, false), eq(roleTable.label, 'Person In Need')));
    const [{ csrs }] = await this.db
      .select({ csrs: count() })
      .from(useraccountTable)
      .leftJoin(roleTable, eq(useraccountTable.roleid, roleTable.id))
      .where(and(eq(useraccountTable.issuspended, false), eq(roleTable.label, 'CSR Rep')));
    return { activePINs: Number(pins ?? 0), activeCSRs: Number(csrs ?? 0) };
  }

  async getRequestStatusCountsByPeriod() {
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
             SUM((cr.status='Completed')::int)::int    AS "Completed",
             SUM((cr.status='Cancelled')::int)::int    AS "Cancelled"
      FROM ${csr_requestsTable} cr, bounds b
      WHERE cr."requestedAt" >= b.day_start
        AND cr."requestedAt" <  b.day_start + interval '1 day'
      UNION ALL
      SELECT 'week',
             COUNT(*)::int,
        SUM((cr.status='Pending')::int)::int,
        SUM((cr.status='Completed')::int)::int,
        SUM((cr.status='Cancelled')::int)::int
      FROM ${csr_requestsTable} cr, bounds b
      WHERE cr."requestedAt" >= b.week_start
        AND cr."requestedAt" <  b.week_start + interval '1 week'
      UNION ALL
      SELECT 'month',
             COUNT(*)::int,
        SUM((cr.status='Pending')::int)::int,
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
        Completed: Number(r.Completed || 0),
        Cancelled: Number(r.Cancelled || 0),
      };
    });
    return quick;
  }

  private parseReportDateRange(q: ReportQuery) {
    if (!q.start || !q.end) throw new Error("Invalid date range");
    // Interpret incoming dates as local calendar days (not UTC) to avoid off-by-one
    const start = new Date(q.start + "T00:00:00");
    const end = new Date(q.end + "T23:59:59.999");
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) throw new Error("Invalid date range");
    return { start, end };
  }

  async getRequestsReportSummary(q: ReportQuery) {
    const { start, end } = this.parseReportDateRange(q);
    const toTS = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      const ms = String(d.getMilliseconds()).padStart(3, '0');
      return `${y}-${m}-${day} ${hh}:${mm}:${ss}.${ms}`;
    };
    const startStr = toTS(start);
    const endStr = toTS(end);

    let typeIds: number[] | null = null;
    if (q.typeNames && q.typeNames.length) {
      const rows = await this.db
        .select({ id: service_typeTable.id, name: service_typeTable.name })
        .from(service_typeTable)
        .where(inArray(service_typeTable.name, q.typeNames));
      typeIds = rows.map(r => r.id);
      if (!typeIds.length) return this.buildEmptyRequestsReportSummary();
    }

    const idFilterArr = typeIds && typeIds.length ? typeIds : null;
    const totalRes = await this.db.execute(sql`
      SELECT COUNT(*)::int AS total
      FROM ${csr_requestsTable} cr
      JOIN ${pin_requestsTable} pr ON pr.id = cr.pin_request_id
      WHERE cr."requestedAt" BETWEEN ${startStr}::timestamp AND ${endStr}::timestamp
      ${idFilterArr ? sql`AND pr."categoryID" IN (${sql.join(idFilterArr.map(id => sql`${id}`), sql`,`)})` : sql``}
    `);
    const total = Number(totalRes.rows?.[0]?.total ?? 0);

    if (!total) return this.buildEmptyRequestsReportSummary();

    const rowsByStatusRes = await this.db.execute(sql`
      SELECT cr.status AS status, COUNT(*)::int AS n
      FROM ${csr_requestsTable} cr
      JOIN ${pin_requestsTable} pr ON pr.id = cr.pin_request_id
      WHERE cr."requestedAt" BETWEEN ${startStr}::timestamp AND ${endStr}::timestamp
      ${idFilterArr ? sql`AND pr."categoryID" IN (${sql.join(idFilterArr.map(id => sql`${id}`), sql`,`)})` : sql``}
      GROUP BY cr.status
    `);

    const byStatus: Record<string, number> = {};
    rowsByStatusRes.rows.forEach((r: any) => (byStatus[r.status] = Number(r.n)));

    const idFilter = typeIds && typeIds.length
      ? sql`AND pr."categoryID" IN (${sql.join(typeIds.map(id => sql`${id}`), sql`,`)})`
      : sql``;

    const rowsByType = await this.db.execute(sql`
      SELECT st.name as name, COUNT(*)::int as n
      FROM ${csr_requestsTable} cr
      JOIN ${pin_requestsTable} pr ON pr.id = cr.pin_request_id
      JOIN ${service_typeTable} st ON st.id = pr."categoryID"
      WHERE cr."requestedAt" BETWEEN ${startStr}::timestamp AND ${endStr}::timestamp
      ${idFilter}
      GROUP BY st.name
      ORDER BY n DESC
    `);
    const byServiceType: Record<string, number> = {};
    rowsByType.rows.forEach((r: any) => (byServiceType[r.name] = Number(r.n)));

    const uniqRes = await this.db.execute(sql`
      SELECT COUNT(DISTINCT cr.csr_id)::int AS uniq
      FROM ${csr_requestsTable} cr
      JOIN ${pin_requestsTable} pr ON pr.id = cr.pin_request_id
      WHERE cr."requestedAt" BETWEEN ${startStr}::timestamp AND ${endStr}::timestamp
      ${idFilter}
    `);
    const uniq = Number(uniqRes.rows?.[0]?.uniq ?? 0);

    const trend = await this.db.execute(sql`
      SELECT to_char(date_trunc('day', cr."requestedAt"), 'YYYY-MM-DD') AS d,
             COUNT(*)::int AS total,
             SUM((cr.status='Pending')::int)::int AS "Pending",
             SUM((cr.status='Completed')::int)::int AS "Completed",
             SUM((cr.status='Cancelled')::int)::int AS "Cancelled"
      FROM ${csr_requestsTable} cr
      JOIN ${pin_requestsTable} pr ON pr.id = cr.pin_request_id
      WHERE cr."requestedAt" BETWEEN ${startStr}::timestamp AND ${endStr}::timestamp
      ${idFilter}
      GROUP BY d
      ORDER BY d
    `);
    const trendDaily = trend.rows.map((r: any) => ({
      date: r.d,
      total: r.total,
      Pending: r.Pending,
      Completed: r.Completed,
      Cancelled: r.Cancelled,
    }));

    const completed = byStatus["Completed"] ?? 0;
    const completionRate = total ? Number((completed / total).toFixed(3)) : 0;
    const averageTimeToComplete = null;
    const totalVolunteerHours = 0;

    // Get active PINs and CSRs
    const activeStats = await this.countActiveUsersByRole();
    return {
      totalRequests: total,
      byStatus,
      byServiceType,
      totalVolunteerHours,
      uniqueVolunteers: uniq,
      completionRate,
      averageTimeToComplete,
      trendDaily,
      activePINs: activeStats.activePINs,
      activeCSRs: activeStats.activeCSRs,
    };
  }

  async getRequestsReportRows(q: ReportQuery) {
    const { start, end } = this.parseReportDateRange(q);
    const toTS = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      const ms = String(d.getMilliseconds()).padStart(3, '0');
      return `${y}-${m}-${day} ${hh}:${mm}:${ss}.${ms}`;
    };
    const startStr = toTS(start);
    const endStr = toTS(end);

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
      ? sql`AND pr."categoryID" IN (${sql.join(typeIds.map(id => sql`${id}`), sql`,`)})`
      : sql``;

    const rows = await this.db.execute(sql`
      SELECT cr."requestedAt" AS requestedAt,
             st.name          AS serviceType,
             cr.status        AS status,
             pr.pin_id        AS pin_id,
             cr.csr_id        AS csr_id,
             cr.message       AS message
      FROM ${csr_requestsTable} cr
      JOIN ${pin_requestsTable} pr ON pr.id = cr.pin_request_id
      JOIN ${service_typeTable} st ON st.id = pr."categoryID"
      WHERE cr."requestedAt" BETWEEN ${startStr}::timestamp AND ${endStr}::timestamp
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

  private buildEmptyRequestsReportSummary() {
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
