import { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { LogOut, Users, Key, FileText, Tags, Bell } from "lucide-react";

import ViewUserAccountPage from "./UserAccounts";
import ViewResetDashboardPage from "./ViewResetDashboardPage";
import SystemActivityLogs from "./SystemActivityLogs";
import Roles from "./Roles";

import "./AdminDashboard.css";

interface AdminDashboardProps {
  onLogout?: () => void;
}

type ActiveSection = "userAccounts" | "roles" | "passwordRequests" | "activityLogs";


  
export function AdminDashboard({ onLogout }: { onLogout?: () => void }) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("userAccounts");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem('currentUsername');
  const role = localStorage.getItem('currentRole');
  const [latestAnnouncement, setLatestAnnouncement] = useState<{ message: string; createdAt: string } | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [adminNotifs, setAdminNotifs] = useState<Array<{ id: number; user_id: number; username: string; message: string; createdAt: string; read: number }>>([]);
  const unreadCount = adminNotifs.filter((n) => n.read === 0).length;

  // Load platform announcements
  useEffect(() => {
    fetch('/api/pm/announcements/latest')
      .then(res => res.json())
      .then(data => {
        const latest = data?.latest ?? null;
        setLatestAnnouncement(latest);
        if (latest?.createdAt) {
          const lastSeen = localStorage.getItem('latestAnnouncementSeenAt');
          if (lastSeen !== latest.createdAt) {
            setShowAnnouncementModal(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fetch admin notifications when the popover is opened
  useEffect(() => {
    if (!notificationsOpen) return;
    fetch('/api/userAdmin/admin-notifications')
      .then(r => r.json())
      .then(data => {
        if (data && data.success) setAdminNotifs(data.notifications || []);
      })
      .catch(err => console.error('Failed to fetch admin notifications', err));
  }, [notificationsOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/userAdmin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      console.error("Logout error:");
    }
    localStorage.removeItem('dummyUsers');
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('currentRole');
    if (onLogout) {
      onLogout();
    } else {
      window.location.replace("/");
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Announcement modal */}
      {latestAnnouncement && showAnnouncementModal && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', width: 'min(640px, 92vw)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Announcement</div>
            <div style={{ whiteSpace: 'pre-wrap', color: '#111827' }}>{latestAnnouncement.message}</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>at {new Date(latestAnnouncement.createdAt).toLocaleString()}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="button" onClick={() => { localStorage.setItem('latestAnnouncementSeenAt', latestAnnouncement!.createdAt); setShowAnnouncementModal(false); }} style={{ background: '#2563eb', color: '#fff' }}>Close</button>
            </div>
          </div>
        </div>
      )}

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
          <button onClick={handleLogout} className="logout-button">
            <LogOut className="icon" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-inner">
          {activeSection === "userAccounts" && <ViewUserAccountPage  />}
          {activeSection === "roles" && <Roles />}
            {activeSection === "passwordRequests" && <ViewResetDashboardPage />}
          {activeSection === "activityLogs" && <SystemActivityLogs />}
        </div>
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
                {adminNotifs.length === 0 ? (
                  latestAnnouncement ? (
                    <div>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{new Date(latestAnnouncement.createdAt).toLocaleString()}</div>
                      <div style={{ fontSize: 14, color: '#111827', whiteSpace: 'pre-wrap' }}>{latestAnnouncement.message}</div>
                    </div>
                  ) : (
                    <div className="user-admin-notification-empty">
                      <Bell className="user-admin-empty-icon" />
                      <div className="user-admin-empty-text">No notifications yet</div>
                    </div>
                  )
                ) : (
                  <ul className="user-admin-notification-list">
                    {adminNotifs.map((n) => (
                      <li
                        key={n.id}
                        className={`user-admin-notification-item ${n.read === 0 ? "unread" : "read"}`}
                        onClick={async () => {
                          try {
                            const resp = await fetch(`/api/userAdmin/admin-notifications/${n.id}`, { method: 'DELETE' });
                            if (resp.ok) {
                              setAdminNotifs(prev => prev.filter(x => x.id !== n.id));
                            } else {
                              console.error('Failed to delete admin notification');
                            }
                          } catch (err) {
                            console.error('Delete admin notification error', err);
                          }
                        }}
                      >
                        <div className="user-admin-notification-title">{n.username}</div>
                        <div className="user-admin-notification-message">{n.message}</div>
                        <div className="user-admin-notification-time">{new Date(n.createdAt).toLocaleString()}</div>
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
