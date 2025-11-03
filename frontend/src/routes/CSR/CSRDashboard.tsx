import { useState } from "react";
import { LogOut, ClipboardList, Bookmark, Clock, CheckCircle } from "lucide-react";

import Available from "./Available";
import Shortlist from "./Shortlist";
import Offers from "./Offers";
import SearchHistory from "./SearchHistory";

import NotificationButton from "../../components/NotificationButton";
import "./CSRDashboard.css";

interface CSRDashboardProps {
  onLogout?: () => void;
}

type ActiveSection = "Available" | "Shortlist" | "Offers" | "SearchHistory";

function CSRDashboard({ onLogout }: CSRDashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("Available");

  return (
    <div className="CSR-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">

        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">CSR Dashboard</h1>
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
        {activeSection === "Available" && <Available />}
        {activeSection === "Shortlist" && <Shortlist />}
        {activeSection === "Offers" && <Offers />}
        {activeSection === "SearchHistory" && <SearchHistory />}
      </div>

      {/* Notification Button */}
      <NotificationButton />
    </div>
  );
}

export default CSRDashboard;
