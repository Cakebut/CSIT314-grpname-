import { useState } from "react";
import { LogOut, FileText, Megaphone, Tag } from "lucide-react";

import Reports from "./Reports";
import Announcements from "./Announcements";
import Categories from "./Categories";

import "./PMDashboard.css";

interface PMDashboardProps {
  onLogout?: () => void;
}

type ActiveSection = "Reports" | "Announcements" | "Categories";

function PMDashboard({ onLogout }: PMDashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("Reports");

  return (
    <div className="PM-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">

        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">PM Dashboard</h1>
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
        {activeSection === "Reports" && <Reports />}
        {activeSection === "Announcements" && <Announcements />}
        {activeSection === "Categories" && <Categories />}
      </div>
    </div>
  );
}

export default PMDashboard;
