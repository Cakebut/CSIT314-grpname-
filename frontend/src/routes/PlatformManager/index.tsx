import { NavLink, Outlet } from "react-router-dom";

export default function PlatformManagerHome() {
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>Platform Manager Dashboard</h2>
      <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <PMTab to="categories">Service Categories</PMTab>
        <PMTab to="reports">Reports</PMTab>
        <PMTab to="announcements">Announcements</PMTab>
      </nav>
      <div>
        <Outlet />
      </div>
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
