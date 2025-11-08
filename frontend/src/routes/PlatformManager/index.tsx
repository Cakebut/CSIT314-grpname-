import React, { useEffect, useRef, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
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

  // Chart data state: attempt to fetch server-provided reports, fall back to sample data
  const [requestsOverTime, setRequestsOverTime] = useState<{ period: string; requests: number; completed?: number }[]>([]);
  const [requestsByCategory, setRequestsByCategory] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    // try fetching a couple of PM report endpoints; if they fail, use mock data
    let mounted = true;
    async function loadReports() {
      try {
        const r1 = await fetch('/api/pm/reports/requests-over-time');
        const d1 = r1.ok ? await r1.json() : null;
        const r2 = await fetch('/api/pm/reports/requests-by-category');
        const d2 = r2.ok ? await r2.json() : null;

        if (!mounted) return;

        if (d1 && Array.isArray(d1.data)) setRequestsOverTime(d1.data);
        if (d2 && Array.isArray(d2.data)) setRequestsByCategory(d2.data);
      } catch (err) {
        // ignore - we'll fall back to sample data below
      }

      // Fallback sample data (used if fetch didn't populate state)
      if (mounted) {
        setRequestsOverTime(prev => prev.length ? prev : [
          { period: '2025-06', requests: 42, completed: 30 },
          { period: '2025-07', requests: 56, completed: 40 },
          { period: '2025-08', requests: 63, completed: 52 },
          { period: '2025-09', requests: 75, completed: 64 },
          { period: '2025-10', requests: 81, completed: 78 },
        ]);

        setRequestsByCategory(prev => prev.length ? prev : [
          { category: 'Food', count: 42 },
          { category: 'Shelter', count: 33 },
          { category: 'Medical', count: 27 },
          { category: 'Counselling', count: 15 },
        ]);
      }
    }

    loadReports();
    return () => { mounted = false; };
  }, []);

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

      {/* Charts grid */}
      <div className="pm-charts-grid">
        <div className="pm-card">
          <div className="pm-chart-title">Requests Over Time</div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={requestsOverTime} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="pm-card">
          <div className="pm-chart-title">Requests by Category</div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={requestsByCategory} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
