import React, { useState } from "react";
import { Download } from "lucide-react";  // Importing the download icon from lucide-react
import "./SystemActivityLogs.css";  // Importing the CSS file

// Defining the type for each log entry
interface ActivityLog {
  username: string;
  sessions: number;
  loginCount: number;
  logoutCount: number;
  accountStatus: "Active" | "Suspended";
  lastSuspension: string | "N/A";
  lastPasswordChange: string;
}

const initialLogs: ActivityLog[] = [
  {
    username: "john_doe",
    sessions: 45,
    loginCount: 52,
    logoutCount: 48,
    accountStatus: "Active",
    lastSuspension: "N/A",
    lastPasswordChange: "Oct 15, 2025 at 2:30 PM",
  },
  {
    username: "jane_smith",
    sessions: 78,
    loginCount: 89,
    logoutCount: 85,
    accountStatus: "Active",
    lastSuspension: "N/A",
    lastPasswordChange: "Oct 10, 2025 at 10:15 AM",
  },
  {
    username: "bob_wilson",
    sessions: 12,
    loginCount: 15,
    logoutCount: 14,
    accountStatus: "Suspended",
    lastSuspension: "Oct 28, 2025 at 9:00 AM",
    lastPasswordChange: "Sept 20, 2025 at 4:45 PM",
  },
  {
    username: "alice_jones",
    sessions: 34,
    loginCount: 40,
    logoutCount: 38,
    accountStatus: "Active",
    lastSuspension: "Oct 1, 2025 at 11:30 AM",
    lastPasswordChange: "Oct 5, 2025 at 3:20 PM",
  },
  {
    username: "mike_brown",
    sessions: 56,
    loginCount: 62,
    logoutCount: 60,
    accountStatus: "Active",
    lastSuspension: "N/A",
    lastPasswordChange: "Oct 22, 2025 at 1:10 PM",
  },
  {
    username: "sarah_davis",
    sessions: 23,
    loginCount: 28,
    logoutCount: 26,
    accountStatus: "Suspended",
    lastSuspension: "Oct 29, 2025 at 8:15 AM",
    lastPasswordChange: "Oct 12, 2025 at 5:00 PM",
  },
];

const SystemActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");

  // Filter the logs based on username and status
  const filteredLogs = logs.filter((log) => {
    const matchesUsername = log.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All Status" || log.accountStatus === filterStatus;

    return matchesUsername && matchesStatus;
  });

  const handleDownloadCSV = () => {
    // Function to export the logs as a CSV file
    const headers = ["Username", "Sessions", "Login Count", "Logout Count", "Account Status", "Last Suspension", "Last Password Change"];
    const rows = filteredLogs.map((log) => [
      log.username,
      log.sessions,
      log.loginCount,
      log.logoutCount,
      log.accountStatus,
      log.lastSuspension,
      log.lastPasswordChange,
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
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
          </select>
          <button className="reset-btn" onClick={() => { setSearchQuery(""); setFilterStatus("All Status"); }}>
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
            <th>Sessions</th>
            <th>Login Count</th>
            <th>Logout Count</th>
            <th>Account Status</th>
            <th>Last Suspension</th>
            <th>Last Password Change</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, index) => (
            <tr key={index}>
              <td>{log.username}</td>
              <td>{log.sessions}</td>
              <td>{log.loginCount}</td>
              <td>{log.logoutCount}</td>
              <td>
                <span className={`status ${log.accountStatus.toLowerCase()}`}>
                  {log.accountStatus}
                </span>
              </td>
              <td>{log.lastSuspension}</td>
              <td>{log.lastPasswordChange}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SystemActivityLogs;
