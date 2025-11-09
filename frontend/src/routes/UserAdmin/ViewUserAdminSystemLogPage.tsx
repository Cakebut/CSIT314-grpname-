import React, { useEffect, useState } from "react";
import { Download, Filter } from "lucide-react"; // icons
 
import { toast } from "react-toastify";
import "./ViewUserAdminSystemLogPage.css";

interface AuditLogEntry {
  id: number;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  details?: string;
}

const ViewUserAdminSystemLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState<number | undefined>(20);
  const [clearing, setClearing] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [actionSearch, setActionSearch] = useState<string>("");
 

  useEffect(() => {
    let isMounted = true;
    const fetchAndUpdate = () => {
      fetchAuditLogs(limit)
        .then((data) => {
          if (isMounted) setLogs(data);
        })
        .catch(() => {
          if (isMounted) setError("Failed to load logs");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    };
    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [limit]);

  //FETCH AUDIT LOGS
  const fetchAuditLogs = async (limit?: number): Promise<AuditLogEntry[]> => {
    const url = limit ? `/api/userAdmin/audit-log?limit=${limit}` : "/api/userAdmin/audit-log";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    const data = await res.json();
    return data;
  };

  //CLEAR AUDIT LOGS
  const clearAuditLogs = async () => {
    const res = await fetch("/api/userAdmin/audit-log", { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to clear logs");
  };

  // Export audit log data as CSV
  const handleExportAuditLogData = async () => {
    try {
      const url = `/api/userAdmin/audit-log/export${limit && limit > 0 ? `?limit=${limit}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to export");
      const csv = await res.text();
      const lines = csv.split("\n");
      const recordCount = Math.max(0, lines.length - 1);
      if (recordCount === 0) {
        toast.error("No audit log data to export.");
        return;
      }
      // Download CSV
      const blob = new Blob([csv], { type: "text/csv" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "audit-log.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success(`Audit log successfully exported. [${recordCount}] records included.`);
    } catch {
      toast.error("Failed to export audit log data.");
    }
  };

  const handleClearLogs = async () => {
    setClearing(true);
    try {
      await clearAuditLogs();
      setLogs([]);
    } catch {
      setError("Failed to clear logs");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="activity-logs-container">
       

      <div className="activity-logs-top">
        <div>
          <header className="activity-logs-header"></header>
          <h1>System Activity Logs</h1>
          <p>Monitor user activity and system events</p>
        </div>
      </div>

      <div className="activity-logs-actions" style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="text"
            placeholder="Search logs..."
            value={actionSearch}
            onChange={(e) => setActionSearch(e.target.value)}
            className="search-activity-logs"
            style={{ minWidth: 200 }}
          />
        </div>

          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="filter-activity-logs">
            <option value="">All Actions</option>
            <option value="suspend user">Suspend User</option>
            <option value="activate user">Activate User</option>
            <option value="update user">Update User</option>
            <option value="create user">Create User</option>
            <option value="delete user">Delete User</option>
            <option value="suspend role">Suspend Role</option>
            <option value="activate role">Activate Role</option>
            <option value="create role">Create Role</option>
            <option value="delete role">Delete Role</option>
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Filter />
              <select value={limit} onChange={(e) => setLimit(Number(e.target.value) || undefined)}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>All</option>
              </select>
            </label>
          </div>
          
          <button className="reset-activity-logs btn" onClick={() => { setActionSearch(""); setActionFilter(""); setLimit(20); }}>
            Reset
          </button>


        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="clear-activity-logs btn" onClick={handleClearLogs} disabled={clearing}>
            {clearing ? "Clearing..." : "Clear Logs"}
          </button>
          <button className="export-activity-logs btn" onClick={handleExportAuditLogData}>
            <Download className="icon" /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="activity-logs-loading">Loading...</div>
      ) : error ? (
        <div className="activity-logs-error">{error}</div>
      ) : (
        <table className="activity-logs-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Target</th>
              <th>Timestamp</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filtered = logs.filter((log) => {
                const actionMatch = actionFilter ? log.action === actionFilter : true;
                const searchLower = actionSearch.toLowerCase();
                const searchMatch = actionSearch
                  ? [log.actor, log.action, log.target, log.timestamp, log.details || ""]
                      .map((field) => String(field).toLowerCase())
                      .some((val) => val.includes(searchLower))
                  : true;
                return actionMatch && searchMatch;
              });
              if (filtered.length === 0) {
                return (
                  <tr>
                    <td colSpan={5} className="activity-logs-muted">No log entries found.</td>
                  </tr>
                );
              }
              return filtered.map((log) => (
                <tr key={log.id}>
                  <td><span className="activity-logs-user">{log.actor}</span></td>
                  <td><span className={`activity-logs-action activity-logs-action-${log.action.replace(/\s/g, "-")}`}>{log.action}</span></td>
                  <td><span className="activity-logs-target">{log.target}</span></td>
                  <td><span className="activity-logs-timestamp">{new Date(log.timestamp).toLocaleString()}</span></td>
                  <td><span className="activity-logs-details">{log.details || "-"}</span></td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewUserAdminSystemLogPage;
