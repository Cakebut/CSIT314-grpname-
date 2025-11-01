import { Router } from "express";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { PlatformManagerController } from "../controller/PlatformManagerControllers";

export function createPlatformManagerRouter(db: NodePgDatabase) {
const platformRouter = Router();
const ctrl = new PlatformManagerController(db);

// Service types for multiselect
platformRouter.get("/service-types", async (_req, res) => {
  try {
    const data = await ctrl.listActiveServiceTypes();
    res.json({ serviceTypes: data });
  } catch {
    res.status(500).json({ error: "Failed to load service types" });
  }
});

// Service types CRUD + search
platformRouter.get("/service-types/search", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    const inc = String(req.query.includeDeleted || '').toLowerCase();
    const includeDeleted = inc === '1' || inc === 'true' || inc === 'yes';
    const rows = await ctrl.searchServiceTypes(q, includeDeleted);
    res.json({ items: rows });
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Bad request" });
  }
});

platformRouter.post("/service-types", async (req, res) => {
  try {
    const { name } = req.body ?? {};
    const item = await ctrl.createServiceType(name);
    res.status(201).json({ item });
  } catch (e: any) {
    const code = e.message === 'Service type already exists' ? 409 : 400;
    res.status(code).json({ error: e.message ?? "Bad request" });
  }
});

platformRouter.put("/service-types/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body ?? {};
    const item = await ctrl.updateServiceType(id, name);
    res.json({ item });
  } catch (e: any) {
    const code = e.message === 'Service type already exists' ? 409 : 400;
    res.status(code).json({ error: e.message ?? "Bad request" });
  }
});

platformRouter.delete("/service-types/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const resp = await ctrl.softDeleteServiceType(id);
    res.json(resp);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Bad request" });
  }
});

// Restore a soft-deleted service type
platformRouter.post("/service-types/:id/restore", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const resp = await ctrl.restoreServiceType(id);
    res.json(resp);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? 'Bad request' });
  }
});

// Reassign all references from one service type to another
platformRouter.post("/service-types/:fromId/reassign", async (req, res) => {
  try {
    const fromId = Number(req.params.fromId);
    const { toId } = req.body ?? {};
    const result = await ctrl.reassignRequestsToServiceType(fromId, Number(toId));
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Bad request" });
  }
});

// isactive removed; no soft-delete toggle route

// JSON report summary
platformRouter.get("/reports/custom", async (req, res) => {
  try {
    const { start, end, types } = req.query as Record<string, string>;
    const typeList = types ? types.split(",").map(s => s.trim()).filter(Boolean) : [];
    const summary = await ctrl.getRequestsReportSummary({ start, end, typeNames: typeList });
    res.json(summary);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Bad request" });
  }
});

// CSV download based on daily trend
platformRouter.get("/reports/custom.csv", async (req, res) => {
  try {
    const { start, end, types } = req.query as Record<string, string>;
    const typeList = types ? types.split(",").map(s => s.trim()).filter(Boolean) : [];
    const { trendDaily } = await ctrl.getRequestsReportSummary({ start, end, typeNames: typeList });

    const header = ["date", "total", "Pending", "InProgress", "Completed", "Cancelled"];
    const lines = [header.join(",")];
    for (const d of trendDaily) {
      lines.push([
        d.date,
        d.total,
        d.Pending || 0,
        d.InProgress || 0,
        d.Completed || 0,
        d.Cancelled || 0,
      ].join(","));
    }
    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=custom-report.csv");
    res.send(csv);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Bad request" });
  }
});

// Send announcement
platformRouter.post("/announcements/send", async (req, res) => {
  try {
    const { message } = req.body ?? {};
    const result = await ctrl.sendAnnouncementToAllUsers({ message });
    res.json(result);
  } catch (e: any) {
    const code = e.message === "Message cannot be empty" ? 400 : 500;
    res.status(code).json({ error: e.message });
  }
});

// CSV download of raw data rows
platformRouter.get("/reports/custom-data.csv", async (req, res) => {
  try {
    const { start, end, types } = req.query as Record<string, string>;
    const typeList = types ? types.split(",").map(s => s.trim()).filter(Boolean) : [];
    const rows = await ctrl.getRequestsReportRows({ start, end, typeNames: typeList });

    // CSV escaping helper
    const esc = (v: any) => {
      const s = v == null ? "" : String(v);
      const q = s.replace(/"/g, '""');
      return `"${q}"`;
    };

    const header = [
      "requestedAt",
      "requestedDate",
      "serviceType",
      "status",
      "pin_id",
      "csr_id",
      "message",
    ];
    const lines: string[] = [header.join(",")];
    for (const r of rows) {
      const dt = r.requestedAt instanceof Date ? r.requestedAt.toISOString() : String(r.requestedAt);
      const requestedDate = dt.includes('T') ? dt.split('T')[0] : dt.slice(0, 10);
      lines.push([
        esc(dt),
        esc(requestedDate),
        esc(r.serviceType),
        esc(r.status),
        esc(r.pin_id),
        esc(r.csr_id),
        esc(r.message),
      ].join(","));
    }
    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=custom-report-data.csv");
    res.send(csv);
  } catch (e: any) {
    res.status(400).json({ error: e.message ?? "Bad request" });
  }
});

// Latest announcement (in-memory, minimal)
platformRouter.get("/announcements/latest", (_req, res) => {
  const latest = ctrl.getLatestAnnouncementSnapshot();
  res.json({ latest });
});

// PIN volunteers feature removed

  // Quick stats (today/week/month)
platformRouter.get('/reports/quick', async (_req, res) => {
  try {
    const data = await ctrl.getRequestStatusCountsByPeriod();
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Failed to load quick stats' });
  }
});
// Active users stats
  platformRouter.get('/stats/active', async (_req, res) => {
    try {
      const s = await ctrl.countActiveUsersByRole();
      res.json(s);
  } catch (e: any) {
    res.status(500).json({ error: e.message ?? 'Failed to load stats' });
  }
});

  return platformRouter;
}

