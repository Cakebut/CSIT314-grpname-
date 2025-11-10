import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ClipboardList } from "lucide-react";

import "./PINDashboard.css";
import PersonInNeedDashboard from "./PersonInNeedDashboard";


type ActiveSection = "PersonInNeedDashboard";


function PINDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>("PersonInNeedDashboard");
  const username = localStorage.getItem("username") || "User";

  return (
    <div className="PIN-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">

        {/* Header */}
        <div className="sidebar-header">
          <h1 className="sidebar-title">{username}'s Dashboard</h1>
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
    </div>
  );
}

export default PINDashboard;
