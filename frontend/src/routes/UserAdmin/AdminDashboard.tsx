import { useState } from "react";
import { LogOut, Users, Key, FileText, Tags } from "lucide-react";

import UserAccounts from "./UserAccounts";
import AdminPasswordRequests from "./AdminPasswordRequests";
import SystemActivityLogs from "./SystemActivityLogs";
import Roles from "./Roles";

import "./AdminDashboard.css";

interface AdminDashboardProps {
  onLogout?: () => void;
}

type ActiveSection = "userAccounts" | "roles" | "passwordRequests" | "activityLogs";

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("userAccounts");

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">Admin Dashboard</h1>
          <p className="sidebar-subtitle">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-links">
            <button
              onClick={() => setActiveSection("userAccounts")}
              className={`nav-button ${activeSection === "userAccounts" ? "active" : ""}`}
            >
              <Users className="icon" />
              <span>User Accounts</span>
            </button>

            <button
              onClick={() => setActiveSection("roles")}
              className={`nav-button ${activeSection === "roles" ? "active" : ""}`}
            >
              <Tags className="icon" />
              <span>Roles</span>
            </button>
            
            <button
              onClick={() => setActiveSection("passwordRequests")}
              className={`nav-button ${activeSection === "passwordRequests" ? "active" : ""}`}
            >
              <Key className="icon" />
              <span>Password Requests</span>
            </button>

            <button
              onClick={() => setActiveSection("activityLogs")}
              className={`nav-button ${activeSection === "activityLogs" ? "active" : ""}`}
            >
              <FileText className="icon" />
              <span>Activity Logs</span>
            </button>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            onClick={onLogout}
            className="logout-button"
          >
            <LogOut className="icon" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeSection === "userAccounts" && <UserAccounts />}
        {activeSection === "roles" && <Roles />}
        {activeSection === "passwordRequests" && <AdminPasswordRequests />}
        {activeSection === "activityLogs" && <SystemActivityLogs />}
      </div>
    </div>
  );
}

export default AdminDashboard;
