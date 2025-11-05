import { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { LogOut, Users, Key, FileText, Tags, Bell } from "lucide-react";

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New offer received", time: "2h ago", read: false },
    { id: 2, title: "Password request approved", time: "1d ago", read: true },
  ]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // When the popover opens, mark notifications as read (clears badge)
  useEffect(() => {
    if (notificationsOpen && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }, [notificationsOpen]);

  return (
    <div className="admin-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">User Admin's Dashboard</h1>
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
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                // default behavior: navigate to root host (local dev)
                try {
                  window.location.replace("http://localhost:5173");
                } catch (e) {
                  // fallback
                  window.location.href = "http://localhost:5173";
                }
              }
            }}
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

      {/* Notification popover */}
      <div className="user-admin-notification-popover-wrapper">
        <Popover.Root open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <Popover.Trigger asChild>
            <button
              className="user-admin-notification-button"
              aria-haspopup="true"
              aria-expanded={notificationsOpen}
              title="Notifications"
            >
              <Bell className="icon" />
              {unreadCount > 0 && (
                <span className="user-admin-badge" aria-hidden>
                  {unreadCount}
                </span>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content className="user-admin-notification-popover" sideOffset={8} align="end">
              <div className="user-admin-notification-popover-header">
                <h3>Notifications</h3>
              </div>

              <div className="user-admin-notification-popover-body">
                {notifications.length === 0 ? (
                  <div className="user-admin-notification-empty">
                    <Bell className="user-admin-empty-icon" />
                    <div className="user-admin-empty-text">No notifications yet</div>
                  </div>
                ) : (
                  <ul className="user-admin-notification-list">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`user-admin-notification-item ${n.read ? "read" : "unread"}`}
                        onClick={() =>
                          setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, read: true } : p)))
                        }
                      >
                        <div className="user-admin-notification-title">{n.title}</div>
                        <div className="user-admin-notification-time">{n.time}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Popover.Close />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}

export default AdminDashboard;
