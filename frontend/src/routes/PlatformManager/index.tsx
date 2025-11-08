import React, { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet } from "react-router-dom";
import './PlatformManager.css';

export default function PlatformManagerHome() {
  const [showPmNoti, setShowPmNoti] = useState(false);
  const [pmNoti, setPmNoti] = useState<{ message?: string; createdAt?: string } | null>(null);
  const [pmLoading, setPmLoading] = useState(false);
  const [pmError, setPmError] = useState<string | null>(null);
  const notiBtnRef = useRef<HTMLButtonElement | null>(null);
  const notiPopRef = useRef<HTMLDivElement | null>(null);

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

  // Fetch latest announcement when opening the popover
  async function fetchLatestAnnouncement() {
    setPmLoading(true);
    setPmError(null);
    try {
      const res = await fetch('/api/pm/announcements/latest');
      const data = await res.json();
      setPmNoti(data?.latest ?? null);
    } catch  {
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

  return (
    <div className="pm-container">
      <div className="pm-header">
        <div>
          <div className="pm-title">Platform Manager</div>
          <div className="pm-subtitle">Welcome to your Platform Manager Portal</div>
        </div>
        <div className="pm-header-right">
          <button ref={notiBtnRef} className="pm-bell" aria-label="Notifications" title="Notifications" onClick={() => setShowPmNoti(s => !s)}>
            <span className="pm-bell-icon">🔔</span>
            <span className="pm-bell-dot" />
          </button>
          <button onClick={onLogout} className="pm-logout-btn">Logout</button>
        </div>
      </div>
      <nav className="pm-nav">
        <PMTab to="categories">Service Categories</PMTab>
        <PMTab to="reports">Reports</PMTab>
        <PMTab to="announcements">Announcements</PMTab>
      </nav>
      <div>
        <Outlet />
      </div>

      {showPmNoti && (
        <div ref={notiPopRef} className="pm-noti-popover">
          <div className="pm-noti-header">Notifications</div>
          {pmLoading ? <div className="pm-noti-empty">Loading...</div> : pmError ? <div className="pm-noti-empty pm-error">{pmError}</div> : (
            pmNoti ? (
              <div className="pm-noti-item">
                <div className="pm-noti-time">{pmNoti.createdAt?.slice(0,19).replace('T',' ')}</div>
                <div className="pm-noti-message">{pmNoti.message}</div>
              </div>
            ) : <div className="pm-noti-empty">No announcements</div>
          )}
        </div>
      )}
    </div>
  );
}

function PMTab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        background: isActive ? '#2563eb' : '#fff',
        color: isActive ? '#fff' : '#111827',
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 600,
      })}
    >
      {children}
    </NavLink>
  );
}
