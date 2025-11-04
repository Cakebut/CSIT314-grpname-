import { useState } from "react";
import { LogOut, Users, FileText, ClipboardList } from "lucide-react";

import AllRequests from "./AllRequests";
import PendingOffers from "./PendingOffers";
import MyRequests from "./MyRequests";
import NotificationButton from "../../components/NotificationButton";
import "./PINDashboard.css";

interface PINDashboardProps {
  onLogout?: () => void;
}

type ActiveSection = "AllRequests" | "PendingOffers" | "MyRequests";

function PINDashboard({ onLogout }: PINDashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>("AllRequests");

  return (
    <div className="PIN-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">

        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">Person-In-Need Dashboard</h1>
          <p className="sidebar-subtitle">Management Panel</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-links">
            <button
              onClick={() => setActiveSection("AllRequests")}
              className={`nav-button ${activeSection === "AllRequests" ? "active" : ""}`}
            >
              <ClipboardList className="icon" />
              <span>Available Requests</span>
            </button>

            <button
              onClick={() => setActiveSection("PendingOffers")}
              className={`nav-button ${activeSection === "PendingOffers" ? "active" : ""}`}
            >
              <Users className="icon" />
              <span>Pending Offers</span>
            </button>
            
            <button
              onClick={() => setActiveSection("MyRequests")}
              className={`nav-button ${activeSection === "MyRequests" ? "active" : ""}`}
            >
              <FileText className="icon" />
              <span>My Requests</span>
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
        {activeSection === "AllRequests" && <AllRequests />}
        {activeSection === "PendingOffers" && <PendingOffers />}
        {activeSection === "MyRequests" && <MyRequests />}
      </div>

      {/* Notification Button */}
      <NotificationButton />
    </div>
  );
}

export default PINDashboard;
