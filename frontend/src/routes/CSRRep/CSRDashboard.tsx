import { useState, useEffect } from "react";
import { LogOut, ClipboardList, Bookmark, Clock, CheckCircle, Bell } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { useNavigate } from "react-router-dom";
import Available from "./Available";
import Shortlist from "./Shortlist";
import Offers from "./Offers";
import SearchHistory from "./SearchHistory";

import "./CSRDashboard.css";

interface CSRDashboardProps {
  onLogout?: () => void;
}

type ActiveSection = "Available" | "Shortlist" | "Offers" | "SearchHistory";

function CSRDashboard({ onLogout }: CSRDashboardProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>("Available");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
      { id: 1, title: "New offer received", time: "2h ago", read: false },
      { id: 2, title: "Password request approved", time: "1d ago", read: true },
    ]);
  const unreadCount = notifications.filter((n) => !n.read).length;  



  //Announcement modal
  const API_BASE = "http://localhost:3000";
  const [latestAnnouncement, setLatestAnnouncement] = useState<{ message: string; createdAt: string } | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);



  const handleLogout = async () => {
    try {
      await fetch('/api/userAdmin/logout', { method: 'POST', credentials: 'include' });
    } catch {
      console.error("Logout error:");
    }
    localStorage.removeItem('dummyUsers');
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('currentRole');
    // Call optional external onLogout handler if provided, then navigate
    try {
      if (typeof onLogout === 'function') onLogout();
    } catch (e) {
      console.error('onLogout handler threw', e);
    }
    navigate('/'); // Redirect to login
  };


 

  
  // Helper to load the latest platform announcement and update modal state
  const fetchLatestAnnouncement = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pm/announcements/latest`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const latest = data?.latest ?? null;
      setLatestAnnouncement(latest);
      if (latest?.createdAt) {
        const lastSeen = localStorage.getItem('latestAnnouncementSeenAt');
        if (lastSeen !== latest.createdAt) {
          setShowAnnouncementModal(true);
        }
      }
    } catch (err) {
      // Log for debugging but don't break the UI
      console.error('Failed to fetch latest announcement', err);
    }
  };

  // When the popover opens, mark notifications as read (clears badge)
  useEffect(() => {
    if (notificationsOpen && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }

    // Load latest platform announcement for PIN users
    fetchLatestAnnouncement();

  }, [notificationsOpen, unreadCount]);

  return (
    <div className="CSR-dashboard-container">
  
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
          <h1 className="sidebar-title">CSR Representative's Dashboard</h1>
          <p className="sidebar-subtitle">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-links">
            <button
              onClick={() => setActiveSection("Available")}
              className={`nav-button ${activeSection === "Available" ? "active" : ""}`}
            >
              <ClipboardList className="icon" />
              <span>Available Requests</span>
            </button>
            
            <button
              onClick={() => setActiveSection("Shortlist")}
              className={`nav-button ${activeSection === "Shortlist" ? "active" : ""}`}
            >
              <Bookmark className="icon" />
              <span>My Shortlist</span>
            </button>

            <button
              onClick={() => setActiveSection("Offers")}
              className={`nav-button ${activeSection === "Offers" ? "active" : ""}`}
            >
              <Clock className="icon" />
              <span>My Offers</span>
            </button>
            
            <button
              onClick={() => setActiveSection("SearchHistory")}
              className={`nav-button ${activeSection === "SearchHistory" ? "active" : ""}`}
            >
              <CheckCircle className="icon" />
              <span>Search History</span>
            </button>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            className="logout-button"
          >
            <LogOut className="icon" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeSection === "Available" && <Available />}
        {activeSection === "Shortlist" && <Shortlist />}
        {activeSection === "Offers" && <Offers />}
        {activeSection === "SearchHistory" && <SearchHistory />}
      </div>

      {/* Notification popover */}
      <div className="CSR-notification-popover-wrapper">
        <Popover.Root open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <Popover.Trigger asChild>
            <button
              className="CSR-notification-button"
              aria-haspopup="true"
              aria-expanded={notificationsOpen}
              title="Notifications"
            >
              <Bell className="icon" />
              {unreadCount > 0 && (
                <span className="CSR-badge" aria-hidden>
                  {unreadCount}
                </span>
              )}
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content className="CSR-notification-popover" sideOffset={8} align="end">
              <div className="CSR-notification-popover-header">
                <h3>Notifications</h3>
              </div>

              <div className="CSR-notification-popover-body">
                {notifications.length === 0 ? (
                  <div className="CSR-notification-empty">
                    <Bell className="CSR-empty-icon" />
                    <div className="CSR-empty-text">No notifications yet</div>
                  </div>
                ) : (
                  <ul className="CSR-notification-list">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`CSR-notification-item ${n.read ? "read" : "unread"}`}
                        onClick={() =>
                          setNotifications((prev) => prev.map((p) => (p.id === n.id ? { ...p, read: true } : p)))
                        }
                      >
                        <div className="CSR-notification-title">{n.title}</div>
                        <div className="CSR-notification-time">{n.time}</div>
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

export default CSRDashboard;
