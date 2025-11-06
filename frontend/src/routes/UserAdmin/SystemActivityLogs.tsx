import React, { useState } from "react";
import { Download } from "lucide-react";  // Importing the download icon from lucide-react
import "./SystemActivityLogs.css";  // Importing the CSS file

// Defining the type for each log entry
interface ActivityLog {
  username: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

const initialLogs: ActivityLog[] = [
  { username: "john_doe", action: "Login", target: "admin", timestamp: "31 October 2025 @ 3:00:00PM", details: "User logged in" },
  { username: "jane_smith", action: "Password Change", target: "user", timestamp: "01 November 2025 @ 4:15:00PM", details: "User requested password change" },
  { username: "alice_jones", action: "Logout", target: "admin", timestamp: "02 November 2025 @ 10:00:00AM", details: "Admin logged out" },
  { username: "mike_brown", action: "Suspended", target: "user", timestamp: "03 November 2025 @ 09:20:00AM", details: "Account suspended due to policy" },
  { username: "sarah_lee", action: "Account Deleted", target: "user", timestamp: "04 November 2025 @ 11:05:00AM", details: "User requested deletion" },
  { username: "tom_wilson", action: "Account Activated", target: "user", timestamp: "05 November 2025 @ 02:30:00PM", details: "Account activated after verification" },
  { username: "emily_clark", action: "Account Created", target: "user", timestamp: "05 November 2025 @ 03:10:00PM", details: "New account created" },
  { username: "carla_mendez", action: "Login", target: "user", timestamp: "05 November 2025 @ 03:45:00PM", details: "User logged in" },
];

const SystemActivityLogs: React.FC = () => {
  const [logs] = useState<ActivityLog[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Actions");

  // Filter the logs based on username and status (action)
  const filteredLogs = logs.filter((log) => {
    const matchesUsername = log.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All Actions" || log.action === filterStatus;

    return matchesUsername && matchesStatus;
  });

  const handleDownloadCSV = () => {
    // Function to export the logs as a CSV file
    const headers = ["Username", "Action", "Target", "Timestamp", "Details"];
    const rows = filteredLogs.map((log) => [
      log.username,
      log.action,
      log.target,
      log.timestamp,
      log.details
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");

    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "system_activity_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <div className="activity-logs-actions">
          <input
            type="text"
            placeholder="Search username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-activity-logs"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-activity-logs"
          >
            <option>All Actions</option>
            <option>login</option>
            <option>password_change</option>
          </select>
          <button className="reset-activity-logs btn" onClick={() => { setSearchQuery(""); setFilterStatus("All Actions"); }}>
            Reset
          </button>
          <button className="export-activity-logs btn" onClick={handleDownloadCSV}>
            <Download className="icon" /> Export CSV
          </button>
        </div>

      <table className="activity-logs-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Action</th>
            <th>Target</th>
            <th>Timestamp</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, index) => (
            <tr key={index}>
              <td>{log.username}</td>
              <td>
                <span className={`activity-logs-action ${log.action.toLowerCase().replace(/\s+/g, "_")}`}>
                  {log.action}
                </span>
              </td>
              <td>{log.target}</td>
              <td>{log.timestamp}</td>
              <td>
                <span className={`activity-logs-details ${log.details.toLowerCase()}`}>
                  {log.details}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SystemActivityLogs;
