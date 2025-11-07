import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ClipboardList, Bell } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

import "./PINDashboard.css";
import PersonInNeedDashboard from "./PersonInNeedDashboard";


type ActiveSection = "PersonInNeedDashboard";

function PINDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>("PersonInNeedDashboard");
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
    <div className="PIN-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">

        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">Person In Need's Dashboard</h1>
          <p className="sidebar-subtitle">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-links">
            <button
              onClick={() => setActiveSection("PersonInNeedDashboard")}
              className={`nav-button ${activeSection === "PersonInNeedDashboard" ? "active" : ""}`}
            >
              <ClipboardList className="icon" />
              <span>Available Requests</span>
            </button>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            onClick={() => { localStorage.clear(); navigate('/');}}
            className="logout-button"
            
          >
            <LogOut className="icon" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeSection === "PersonInNeedDashboard" && <PersonInNeedDashboard />}
      </div>

      {/* Notification popover */}
      <div className="PIN-notification-popover-wrapper">
        <Popover.Root open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <Popover.Trigger asChild>
            <button
              className="PIN-notification-button"
              aria-haspopup="true"
              aria-expanded={notificationsOpen}
              title="Notifications"
            >
              <Bell className="icon" />
              {unreadCount > 0 && (
                <span className="PIN-badge" aria-hidden>
                  {unreadCount}
                </span>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content className="PIN-notification-popover" sideOffset={8} align="end">
              <div className="PIN-notification-popover-header">
                <h3>Notifications</h3>
              </div>

              <div className="PIN-notification-popover-body">
                {notifications.length === 0 ? (
                  <div className="PIN-notification-empty">
                    <Bell className="PIN-empty-icon" />
                    <div className="PIN-empty-text">No notifications yet</div>
                  </div>
                ) : (
                  <ul className="PIN-notification-list">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`PIN-notification-item ${n.read ? "read" : "unread"}`}
                        onClick={() =>
                          setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, read: true } : p)))
                        }
                      >
                        <div className="PIN-notification-title">{n.title}</div>
                        <div className="PIN-notification-time">{n.time}</div>
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

export default PINDashboard;
