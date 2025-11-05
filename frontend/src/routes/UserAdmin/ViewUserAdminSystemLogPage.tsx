import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter } from "react-icons/fa";
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

export default function ViewUserAdminSystemLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState<number | undefined>(20);
  const [clearing, setClearing] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [actionSearch, setActionSearch] = useState<string>("");
  const navigate = useNavigate();

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


  //FETCH AUDIT LOGS
  const fetchAuditLogs = async (limit?: number): Promise<AuditLogEntry[]> => {
    const url = limit
      ? `/api/userAdmin/audit-log?limit=${limit}`
      : "/api/userAdmin/audit-log";
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
      const url = `/api/userAdmin/audit-log/export${
        limit && limit > 0 ? `?limit=${limit}` : ""
      }`;
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
      toast.success(
        `Audit log successfully exported. [${recordCount}] records included.`
      );
    } catch {
      toast.error("Failed to export audit log data.");
    }
  };

  return (
    <div className="system-log-container modern-log">
      <button
        onClick={() => navigate("/useradmin")}
        style={{
          background: "#0077cc",
          color: "white",
          border: "none",
          borderRadius: "8px",
          padding: "0.5rem 1.2rem",
          fontWeight: 700,
          fontSize: "1rem",
          boxShadow: "0 1px 4px rgba(44,62,80,0.10)",
          cursor: "pointer",
          letterSpacing: "0.01em",
          marginBottom: "1.2rem",
          display: "inline-block",
        }}
      >
        ← Back to Dashboard
      </button>
      <div className="log-header">
        <h2>User Admin System Log</h2>
        <div
          className="log-controls"
          style={{
            flexWrap: "wrap",
            gap: "1.2rem",
            background: "#f3f6fb",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(44,62,80,0.06)",
            padding: "1rem 1.2rem",
            marginTop: "0.5rem",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <label
              htmlFor="log-limit"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontWeight: 500,
              }}
            >
              <FaFilter style={{ marginRight: 2, color: "#64748b" }} /> Show
              <select
                id="log-limit"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value) || undefined)}
                style={{ marginLeft: 4 }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={0}>All</option>
              </select>
              entries
            </label>
            <label
              htmlFor="action-filter"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontWeight: 500,
              }}
            >
              <FaFilter style={{ marginRight: 2, color: "#64748b" }} /> Action
              <select
                id="action-filter"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                style={{ marginLeft: 4 }}
              >
                <option value="">All</option>
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
            </label>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <FaSearch
                style={{
                  position: "absolute",
                  left: 10,
                  color: "#64748b",
                  fontSize: "1.1em",
                }}
              />
              <input
                type="text"
                placeholder="Search logs..."
                value={actionSearch}
                onChange={(e) => setActionSearch(e.target.value)}
                style={{
                  padding: "0.4em 1em 0.4em 2.2em",
                  borderRadius: 8,
                  border: "1.2px solid #bfc8d6",
                  fontSize: "1em",
                  minWidth: 180,
                }}
              />
            </div>
            <button
              className="clear-log-btn"
              onClick={handleClearLogs}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear Logs"}
            </button>
            <button
              className="export-csv-btn"
              style={{
                background: "#22c55e",
                color: "white",
                borderRadius: 8,
                padding: "0.5em 1.2em",
                fontWeight: 600,
                fontSize: "1em",
                border: "none",
                boxShadow: "0 1px 4px rgba(44,62,80,0.10)",
                cursor: "pointer",
              }}
              onClick={handleExportAuditLogData}
            >
              Export User Data CSV
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="log-loading">Loading...</div>
      ) : error ? (
        <div className="log-error">{error}</div>
      ) : (
        <div className="log-table-wrapper">
          <table className="log-table">
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
                  const actionMatch = actionFilter
                    ? log.action === actionFilter
                    : true;
                  const searchLower = actionSearch.toLowerCase();
                  const searchMatch = actionSearch
                    ? [
                        log.actor,
                        log.action,
                        log.target,
                        log.timestamp,
                        log.details || "",
                      ]
                        .map((field) => String(field).toLowerCase())
                        .some((val) => val.includes(searchLower))
                    : true;
                  return actionMatch && searchMatch;
                });
                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} className="log-muted">
                        No log entries found.
                      </td>
                    </tr>
                  );
                }
                return filtered.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className="log-user">{log.actor}</span>
                    </td>
                    <td>
                      <span
                        className={`log-action log-action-${log.action.replace(
                          /\s/g,
                          "-"
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="log-target">{log.target}</span>
                    </td>
                    <td>
                      <span className="log-timestamp">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="log-details">{log.details || "-"}</span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
