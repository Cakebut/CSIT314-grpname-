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
  {
    username: "john_doe",
    action: "login",
    target: "admin",
    timestamp: "31 October 2025 @ 3:00:00PM",
    details: "User logged in"
  },
  {
    username: "jane_smith",
    action: "password_change",
    target: "user",
    timestamp: "01 November 2025 @ 4:15:00PM",
    details: "User requested password change"
  },
  {
    username: "alice_jones",
    action: "login",
    target: "admin",
    timestamp: "02 November 2025 @ 10:00:00AM",
    details: "Admin logged in"
  },
];

const SystemActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
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
      <header className="header">
        <h1>System Activity Logs</h1>
        <p>Monitor user activity and system events</p>
        <div className="actions">
          <input
            type="text"
            placeholder="Search username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option>All Actions</option>
            <option>login</option>
            <option>password_change</option>
          </select>
          <button className="reset-btn" onClick={() => { setSearchQuery(""); setFilterStatus("All Actions"); }}>
            Reset
          </button>
          <button className="export-btn" onClick={handleDownloadCSV}>
            <Download className="icon" /> Export CSV
          </button>
        </div>
      </header>

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
              <td>{log.action}</td>
              <td>{log.target}</td>
              <td>{log.timestamp}</td>
              <td>
                <span className={`status ${log.details.toLowerCase()}`}>
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
