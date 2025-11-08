import { useEffect, useRef, useState } from "react";
import { LogOut, FileText, Megaphone, Tag } from "lucide-react";

import ReportsPage from "./ReportsPage";
import AnnouncementsPage from "./AnnouncementsPage";
import CategoriesPage from "./CategoriesPage";

import "./PMDashboard.css";

type ActiveSection = "Reports" | "Announcements" | "Categories";

function PMDashboard() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("Reports");
  const [showPmNoti, setShowPmNoti] = useState(false);
  const [pmNoti, setPmNoti] = useState<{ message?: string; createdAt?: string } | null>(null);
  const [pmLoading, setPmLoading] = useState(false);
  const [pmError, setPmError] = useState<string | null>(null);
  const notiBtnRef = useRef<HTMLButtonElement | null>(null);
  const notiPopRef = useRef<HTMLDivElement | null>(null);

    // Fetch latest announcement when opening the popover
  async function fetchLatestAnnouncement() {
    setPmLoading(true);
    setPmError(null);
    try {
      const res = await fetch('/api/pm/announcements/latest');
      const data = await res.json();
      setPmNoti(data?.latest ?? null);
    } catch (err) {
      setPmError('Failed to load announcements');
    } finally {
      setPmLoading(false);
    }
  }

  useEffect(() => {
    if (showPmNoti) fetchLatestAnnouncement();
  }, [showPmNoti]);

  // click-away for popover
  useEffect(() => {
    if (!showPmNoti) return;
    function onDocClick(e: MouseEvent) {
      const btn = notiBtnRef.current;
      const pop = notiPopRef.current;
      if (!(e.target instanceof Node)) return;
      if (btn && btn.contains(e.target)) return;
      if (pop && pop.contains(e.target)) return;
      setShowPmNoti(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
    }, [showPmNoti]);

  const onLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear auth-related localStorage keys used across the app
    localStorage.removeItem('currentRole');
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('CSR_ID');
    localStorage.removeItem('PIN_ID');
    // Redirect to root (login)
    window.location.href = '/';
  };

  return (
    <div className="PM-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">

        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">Platform Manager Dashboard</h1>
          <p className="sidebar-subtitle">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-links">
            <button
              onClick={() => setActiveSection("Reports")}
              className={`nav-button ${activeSection === "Reports" ? "active" : ""}`}
            >
              <FileText className="icon" />
              <span>Reports</span>
            </button>
            
            <button
              onClick={() => setActiveSection("Announcements")}
              className={`nav-button ${activeSection === "Announcements" ? "active" : ""}`}
            >
              <Megaphone className="icon" />
              <span>Announcements</span>
            </button>

            <button
              onClick={() => setActiveSection("Categories")}
              className={`nav-button ${activeSection === "Categories" ? "active" : ""}`}
            >
              <Tag className="icon" />
              <span>Service Categories</span>
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
        {activeSection === "Reports" && <ReportsPage />}
        {activeSection === "Announcements" && <AnnouncementsPage />}
        {activeSection === "Categories" && <CategoriesPage />}
      </div>
    </div>
  );
}

export default PMDashboard;
