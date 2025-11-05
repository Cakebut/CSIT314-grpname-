// Modal component for CSR Rep to increment view count on open
interface CSRRequestDetailsModalProps {
  request: any;
  onClose: () => void;
  csrId: string | null;
  shortlistedIds: number[];
  interestedIds: number[];
  reloadShortlist: () => Promise<void>;
  reloadInterested: () => Promise<void>;
}
function CSRRequestDetailsModal({ request, onClose, csrId, shortlistedIds, interestedIds, reloadShortlist, reloadInterested }: CSRRequestDetailsModalProps) {
  const lastIncrementedId = React.useRef<number | null>(null);
  useEffect(() => {
    if (request && request.requestId !== lastIncrementedId.current) {
      fetch(`http://localhost:3000/api/pin/requests/${request.requestId}/increment-view`, {
        method: 'POST',
        headers: {
          'x-user-role': 'CSR Rep',
        },
      }).catch(() => {}); // Silently ignore errors
      lastIncrementedId.current = request.requestId;
    }
    // Only call once per unique requestId
    // eslint-disable-next-line
  }, [request?.requestId]);
  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14, position: 'relative' }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'none',
            border: 'none',
            fontSize: 26,
            fontWeight: 700,
            color: '#64748b',
            cursor: 'pointer',
            lineHeight: 1,
            zIndex: 2,
          }}
          aria-label="Close"
        >
          ×
        </button>
        <h3>Request Details</h3>
        <div><b>PIN Name:</b> {request.pinName || 'N/A'}</div>
        <div><b>Title:</b> {request.title || 'Untitled Request'}</div>
        <div><b>Request Type:</b> {request.categoryName}</div>
        <div><b>Location:</b> {request.location || request.locationName || '-'}</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '8px 0' }}>
          <div>
            <b>Status:</b> <span style={{
              color:
                request.status === 'Pending' ? '#f59e42' :
                request.status === 'Available' ? '#22c55e' :
                '#6b7280',
              fontWeight: 700,
              fontSize: '1.05rem',
            }}>{request.status || '-'}</span>
          </div>
          <div>
            {request.urgencyLevel && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 90,
                  padding: '0.4em 1.2em',
                  borderRadius: 18,
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  backgroundColor:
                    request.urgencyLevel.toLowerCase() === 'high priority' ? '#ef4444' :
                    request.urgencyLevel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280',
                  textAlign: 'center',
                  letterSpacing: 1,
                }}
              >
                {request.urgencyLevel}
              </span>
            )}
          </div>
        </div>
        <div><b>Description:</b></div>
        <div className="desc-box">{request.message || '(No description)'}</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
          <button
            className={interestedIds.includes(request.requestId) ? "csr-btn-danger" : "csr-btn"}
            style={{
              minWidth: 110,
              background: request.status === 'Pending' ? '#e5e7eb' : '#2563eb',
              color: request.status === 'Pending' ? '#a1a1aa' : '#fff',
              border: request.status === 'Pending' ? '1px solid #cbd5e1' : 'none',
              opacity: request.status === 'Pending' ? 0.55 : 1,
              cursor: request.status === 'Pending' ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: 8,
              transition: 'all 0.2s',
            }}
            disabled={request.status === 'Pending'}
            onClick={async () => {
              if (request.status === 'Pending') return;
              if (!csrId) {
                alert("You must be logged in as a CSR rep to mark interest.");
                return;
              }
              let resp;
              try {
                if (interestedIds.includes(request.requestId)) {
                  resp = await fetch(`http://localhost:3000/api/csr/${csrId}/interested/${request.requestId}`, { method: "DELETE" });
                } else {
                  resp = await fetch(`http://localhost:3000/api/csr/${csrId}/interested/${request.requestId}`, { method: "POST" });
                }
                if (!resp.ok) {
                  const err = await resp.text();
                  alert(`Failed to update interested: ${err}`);
                  return;
                }
                await reloadInterested();
              } catch (e) {
                alert(`Error updating interested: ${e}`);
              }
            }}
          >
            {interestedIds.includes(request.requestId) ? "Unmark Interested" : "Interested"}
          </button>
          <button
            className="csr-heart-btn"
            style={{
              minWidth: 48,
              fontSize: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 0.5em',
              background: 'none',
              border: 'none',
              cursor: csrId ? 'pointer' : 'not-allowed',
              opacity: csrId ? 1 : 0.5,
              transition: 'transform 0.1s',
            }}
            disabled={!csrId}
            onClick={async () => {
              if (!csrId) {
                alert("You must be logged in as a CSR rep to shortlist requests.");
                return;
              }
              let resp;
              try {
                if (shortlistedIds.includes(request.requestId)) {
                  resp = await fetch(`http://localhost:3000/api/csr/${csrId}/shortlist/${request.requestId}`, { method: "DELETE" });
                } else {
                  resp = await fetch(`http://localhost:3000/api/csr/${csrId}/shortlist/${request.requestId}`, { method: "POST" });
                  if (resp.ok) {
                    // Increment shortlist count in pin_requests
                    await fetch(`http://localhost:3000/api/pin/requests/${request.requestId}/increment-shortlist`, { method: 'POST' });
                  }
                }
                if (!resp.ok) {
                  const err = await resp.text();
                  alert(`Failed to update shortlist: ${err}`);
                  return;
                }
                await reloadShortlist();
              } catch (e) {
                alert(`Error updating shortlist: ${e}`);
              }
            }}
            aria-label={shortlistedIds.includes(request.requestId) ? "Remove from shortlist" : "Add to shortlist"}
            title={shortlistedIds.includes(request.requestId) ? "Remove from shortlist" : "Add to shortlist"}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{
              color: shortlistedIds.includes(request.requestId) ? '#ef4444' : '#64748b',
              fontSize: 28,
              lineHeight: 1,
              transition: 'color 0.15s',
              userSelect: 'none',
            }}>
              {shortlistedIds.includes(request.requestId) ? '❤️' : '🤍'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
 
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CSRRepDashboard.css";
import "./CSRRepDashboard.extra.css";


// --- Auth Utilities ---
function getCSRId() {
  const role = localStorage.getItem("currentRole");
  const userId = localStorage.getItem("userId");
  if (role === "CSR Rep" && userId) return userId;
  return null;
}




// --- CSRHeader ---
function CSRHeader() {
  const [showNoti, setShowNoti] = useState(false);
  const [hasUpdates, setHasUpdates] = useState(false);
  // Close popover on outside click
  React.useEffect(() => {
    if (!showNoti) return;
    function handleClick(e: MouseEvent) {
      const pop = document.getElementById('csr-noti-popover');
        const btn = document.querySelector('.csr-icon-btn');
      // Only close if click is outside both popover and button
      if (pop && !pop.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setShowNoti(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNoti]);
  return (
    <header className="csr-header">
      <div className="csr-header-left">
        <h1 className="csr-logo">CSR Dashboard</h1>
        <p className="csr-welcome">Welcome to your Customer Service Representative Portal</p>
      </div>
      <div className="csr-header-right">
        <div className="csr-noti" style={{ position: 'relative' }}>
          <button className="csr-icon-btn" onClick={() => setShowNoti(s => !s)} aria-label="Notifications">🔔</button>
          {showNoti && (
            <div id="csr-noti-popover" style={{
              position: 'absolute',
              top: 38,
              right: 0,
              minWidth: 260,
              background: '#fff',
              boxShadow: '0 4px 16px #cbd5e1',
              borderRadius: 12,
              zIndex: 100,
              padding: '14px 18px 12px 18px',
              animation: 'fadeIn 0.18s',
            }}>
              <div style={{ position: 'absolute', top: -10, right: 18, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '10px solid #fff' }} />
              <div className="csr-noti-title" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Notifications</div>
              {hasUpdates ? <div>Update on your offers.</div> : <div className="csr-muted">No notifications yet</div>}
            </div>
          )}
        </div>
        <a
          className="csr-btn-outline"
          href="/"
          onClick={e => {
            e.preventDefault();
            // Remove all user-related keys for a clean logout
            localStorage.removeItem("CSR_ID");
            localStorage.removeItem("PIN_ID");
            localStorage.removeItem("currentRole");
            localStorage.removeItem("currentUsername");
            localStorage.removeItem("userId");
            localStorage.removeItem("username");
            window.location.href = "/";
          }}
        >
          Logout
        </a>
      </div>
    </header>
  );
}

// --- NavBar ---
function NavBar({ setPage }: { setPage: (page: string) => void }) {
  return (
    <nav className="csr-navbar">
      <button onClick={() => setPage("dashboard")}>Dashboard</button>
      <button onClick={() => setPage("requests")}>Requests</button>
      <button onClick={() => setPage("shortlist")}>Shortlist</button>
      <button onClick={() => setPage("offers")}>Offers</button>
      <button onClick={() => setPage("history")}>History</button>
    </nav>
  );
}

// --- RequestCard ---
type RequestCardProps = {
  title: string;
  location: string;
  urgencyLevel?: string | null;
  specialNeeds?: string | null;
  categoryName?: string;
  status?: string;
  onRemove?: () => void;
  loading?: boolean;
};
function RequestCard({ title, location, urgencyLevel, specialNeeds, categoryName, status, onRemove, loading }: RequestCardProps) {
  // Determine background color for high priority
  const isHighPriority = urgencyLevel && urgencyLevel.toLowerCase() === 'high priority';
  // Determine status chip color
  let statusBg = '#f1f5f9';
  let statusColor = '#64748b';
  if (status && status.toLowerCase() === 'available') {
    statusBg = '#22c55e';
    statusColor = 'white';
  }
  return (
    <div className="csr-card csr-card-shortlisted" style={{ minWidth: 340, maxWidth: 440, fontSize: '1.08rem', background: isHighPriority ? '#fee2e2' : '#fff', boxShadow: '0 2px 8px #e0e7ef', borderRadius: 14 }}>
      <div className="csr-card-top" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="csr-card-title" style={{ fontWeight: 700, fontSize: '1.22rem', color: '#1e293b' }}>{title}</span>
          {categoryName && <span className="csr-chip csr-chip-category" style={{ background: '#e0e7ef', color: '#334155', fontWeight: 600 }}>{categoryName}</span>}
          {status && <span className="csr-chip csr-chip-status" style={{ background: statusBg, color: statusColor, fontWeight: 600 }}>{status}</span>}
          {urgencyLevel && <span className="csr-chip csr-chip-urgency" style={{ background: urgencyLevel.toLowerCase() === 'high priority' ? '#ef4444' : urgencyLevel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280', color: 'white', fontWeight: 700 }}>{urgencyLevel}</span>}
        </div>
      </div>
      <div className="csr-card-body" style={{ fontSize: '1.08rem' }}>
        <div><strong>Location:</strong> {location}</div>
        {specialNeeds && <div><strong>Needs:</strong> {specialNeeds}</div>}
      </div>
      {onRemove && (
        <div className="csr-card-actions">
          <button className="csr-btn-danger" onClick={onRemove} disabled={!!loading}>
            {loading ? "Removing..." : "Remove from Shortlist"}
          </button>
        </div>
      )}
    </div>
  );
}

// --- RequestRow ---
type RequestListItem = {
  requestId: number;
  title?: string;
  categoryName?: string;
  location: string;
  urgencyLevel?: string | null;
  status?: string;
};
function RequestRow({ item, onClick }: { item: RequestListItem; onClick?: () => void }) {
  return (
    <div className="csr-req-row" onClick={onClick} role="button">
      <div className="csr-req-row-top">
        <div className="csr-req-title">
          <span className="csr-req-title-text">{item.categoryName}</span>
          <span className="csr-req-id">REQ-{String(item.requestId).padStart(3, "0")}</span>
          {item.urgencyLevel && <span className="csr-chip csr-chip-urgency">{item.urgencyLevel}</span>}
        </div>
        <div className="csr-req-views">{item.location}</div>
      </div>
      <div className="csr-req-row-bottom">
        <div className="csr-muted">Region shown via location</div>
      </div>
    </div>
  );
}

// --- SummaryCard ---
function SummaryCard({ label, value, onClick }: { label: string; value: number | string; onClick?: () => void }) {
  return (
    <div className="csr-summary-card" onClick={onClick} role={onClick ? "button" : undefined}>
      <div className="csr-summary-label">{label}</div>
      <div className="csr-summary-value">{value}</div>
    </div>
  );
}

// --- CSRAvailableRequests ---
function CSRAvailableRequests() {
  // Color logic for status and urgency
  function getStatusColor(status: string | undefined) {
    switch ((status || '').toLowerCase()) {
      case 'available':
        return '#22c55e';
      case 'pending':
        return '#f59e42';
      case 'completed':
        return '#6b7280';
      default:
        return '#334155';
    }
  }
  function getUrgencyColor(urgency: string | undefined) {
    if (!urgency) return '#6b7280';
    const u = urgency.toLowerCase();
    if (u === 'high priority') return '#ef4444';
    if (u === 'low priority') return '#22c55e';
    return '#6b7280';
  }
  const [requests, setRequests] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [shortlistedIds, setShortlistedIds] = useState<number[]>([]);
  const [interestedIds, setInterestedIds] = useState<number[]>([]);
  const csrId = getCSRId();
  // Prevent actions if not logged in as CSR
  useEffect(() => {
    if (!csrId) {
      alert("You must be logged in as a CSR rep to shortlist requests.");
    }
  }, [csrId]);
  useEffect(() => {
    const loadRequests = async () => {
      const res = await fetch("http://localhost:3000/api/csr/pin_requests");
      const json = await res.json();
      setRequests(json.requests || []);
    };
    const loadShortlist = async () => {
      if (!csrId) return;
      const res = await fetch(`http://localhost:3000/api/csr/${csrId}/shortlist`);
      const json = await res.json();
      setShortlistedIds((json.shortlistedRequests || []).map((r: any) => r.requestId));
    };
    const loadInterested = async () => {
      if (!csrId) return;
      const res = await fetch(`http://localhost:3000/api/csr/${csrId}/interested`);
      const json = await res.json();
      // Support both requestId and pin_request_id from backend
      setInterestedIds((json.interestedRequests || []).map((r: any) => r.requestId ?? r.pin_request_id));
    };
    loadRequests();
    loadShortlist();
    loadInterested();
  }, [csrId]);
  // Helper to reload shortlist from backend
  const reloadShortlist = async () => {
    if (!csrId) return;
    const res = await fetch(`http://localhost:3000/api/csr/${csrId}/shortlist`);
    const json = await res.json();
    setShortlistedIds((json.shortlistedRequests || []).map((r: any) => r.requestId));
  };
  // Helper to reload interested from backend
  const reloadInterested = async () => {
    if (!csrId) return;
    const res = await fetch(`http://localhost:3000/api/csr/${csrId}/interested`);
    const json = await res.json();
    setInterestedIds((json.interestedRequests || []).map((r: any) => r.requestId ?? r.pin_request_id));
  };
  return (
    <div className="csr-page">
      <h2 className="csr-section-title big">All Person-In-Need Requests</h2>
      <p className="csr-muted">Browse all requests from Persons in Need</p>
      <div className="csr-list">
        {requests.length === 0 ? (
          <div className="csr-empty">No requests found.</div>
        ) : (
          // Filter out duplicate requests by requestId
          Array.from(new Map(requests.map(r => [r.requestId, r])).values()).map((r) => (
            <div
              key={r.requestId}
              className="csr-req-row"
              onClick={() => setSelected(r)}
              style={{
                cursor: 'pointer',
                background: r.urgencyLevel && r.urgencyLevel.toLowerCase() === 'high priority' ? '#fee2e2' : '#fff',
              }}
            >
              <div className="csr-req-row-top">
                <div className="csr-req-title">
                  <span className="csr-req-title-text" style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1e293b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{r.title || 'Untitled Request'}</span>
                  <span className="csr-req-id">REQ-{String(r.requestId).padStart(3, "0")}</span>
                  {r.urgencyLevel && (
                    <span className={`csr-chip csr-chip-urgency${r.urgencyLevel.toLowerCase() === 'high priority' ? ' high' : r.urgencyLevel.toLowerCase() === 'low priority' ? ' low' : ''}`}
                      style={{ backgroundColor: getUrgencyColor(r.urgencyLevel), color: 'white', fontWeight: 700 }}
                    >
                      {r.urgencyLevel}
                    </span>
                  )}
                </div>
                <div className="csr-req-views" style={{ fontSize: '1.02rem', color: '#0ea5e9', fontWeight: 500 }}>{r.location || r.locationName || '-'}</div>
              </div>
              <div className="csr-req-row-bottom">
                <div className="csr-muted" style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 500 }}>{r.categoryName}</div>
                <div className="csr-muted" style={{ fontWeight: 600, fontSize: '1.05rem', color: getStatusColor(r.status) }}>{r.status || '-'}</div>
              </div>
            </div>
          ))
        )}
      </div>
      {selected && (
        <CSRRequestDetailsModal
          key={selected.requestId + '-' + interestedIds.join(',')}
          request={selected}
          onClose={() => setSelected(null)}
          csrId={csrId}
          shortlistedIds={shortlistedIds}
          interestedIds={interestedIds}
          reloadShortlist={reloadShortlist}
          reloadInterested={reloadInterested}
        />
      )}
    </div>
  );
}

// --- CSRDashboard ---
function CSRDashboard() {
  const [availableCount, setAvailableCount] = useState(0);
  const [shortlistCount, setShortlistCount] = useState(0);
  const navigate = useNavigate();
  const loadData = async () => {
    try {
      // Use the same endpoint as CSRAvailableRequests for available requests
      const reqRes = await fetch("http://localhost:3000/api/csr/pin_requests");
      const reqJson = await reqRes.json();
      setAvailableCount(reqJson.requests?.length ?? 0);
      const id = localStorage.getItem("CSR_ID");
      if (id) {
        const shortRes = await fetch(`http://localhost:3000/api/csr/${id}/shortlist`);
        const shortJson = await shortRes.json();
        setShortlistCount(shortJson.shortlistedRequests?.length ?? 0);
      }
    } catch (e) {
      console.error("Failed to load dashboard counts", e);
    }
  };
  useEffect(() => { loadData(); }, []);
  return (
    <div className="csr-page">
      <div className="csr-dash-summary">
        <SummaryCard label="Available Requests" value={availableCount} onClick={() => navigate("/csr/requests")} />
        <SummaryCard label="Shortlisted" value={shortlistCount} onClick={() => navigate("/csr/shortlist")} />
        <SummaryCard label="Active Offers" value="0" />
        <SummaryCard label="Completed Services" value="0" />
      </div>
    </div>
  );
}

// --- CSRHistory ---
function CSRHistory() {
  type Status = "Pending" | "Completed";
  type ServiceType = "Food Distribution" | "Elder Care" | "Environmental" | "Education" | "Healthcare";
  type HistoryRow = {
    name: string;
    date: string;
    duration: string;
    location: string;
    type: ServiceType;
    status: Status;
  };
  const DATA: HistoryRow[] = [
    { name: "Meal delivery for senior",     date: "2025-10-20", duration: "1h",  location: "Downtown Community Center", type: "Food Distribution", status: "Completed" },
    { name: "Computer setup for PIN",       date: "2025-10-22", duration: "2h",  location: "Lincoln High School",       type: "Education",         status: "Completed" },
    { name: "Park cleanup activity",        date: "2025-10-24", duration: "1.5h",location: "Greenfields Park",          type: "Environmental",     status: "Pending"   },
    { name: "Wheelchair escort",            date: "2025-10-25", duration: "1h",  location: "Central Medical Wing",      type: "Healthcare",        status: "Completed" },
  ];
  const TYPES: ("All Types" | ServiceType)[] = ["All Types", "Food Distribution", "Elder Care", "Environmental", "Education", "Healthcare"];
  const [svcType, setSvcType] = useState<(typeof TYPES)[number]>("All Types");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const filtered = useMemo(() => {
    return DATA.filter(row => {
      const itype = svcType === "All Types" || row.type === svcType;
      const istart = !start || row.date >= start;
      const iend = !end || row.date <= end;
      return itype && istart && iend;
    });
  }, [svcType, start, end]);
  const totals = {
    total: filtered.length,
    pending: filtered.filter(r => r.status === "Pending").length,
    completed: filtered.filter(r => r.status === "Completed").length,
  };
  const clear = () => {
    setSvcType("All Types");
    setStart("");
    setEnd("");
  };
  const downloadCsv = () => {
    const rows = [
      ["Service Name", "Date", "Duration", "Location", "Service Type", "Status"],
      ...filtered.map(r => [r.name, r.date, r.duration, r.location, r.type, r.status]),
    ];
    const csv = rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `volunteer-service-history-${yyyy}-${mm}-${dd}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="csr-page">
      <div className="csr-subnav">
        <button className="csr-btn" onClick={downloadCsv} style={{ marginLeft: "auto" }}>
          Download History
        </button>
      </div>
      <h2 className="csr-section-title big">Search History</h2>
      <p className="csr-muted">View and filter your completed volunteer service activities</p>
      <div className="csr-history-counters">
        <div className="csr-offer-counter">Total Services <span>{totals.total}</span></div>
        <div className="csr-offer-counter">Pending <span>{totals.pending}</span></div>
        <div className="csr-offer-counter">Completed <span>{totals.completed}</span></div>
      </div>
      <h3 className="csr-subtitle">Filter Options</h3>
      <div className="csr-filters">
        <select className="csr-select" value={svcType} onChange={e => setSvcType(e.target.value as any)}>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="date" className="csr-input" value={start} onChange={e => setStart(e.target.value)} />
        <input type="date" className="csr-input" value={end} onChange={e => setEnd(e.target.value)} />
        <button className="csr-btn" onClick={() => { /* live filtering */ }}>Apply Filter</button>
        <button className="csr-btn-outline" onClick={clear}>Clear Filter</button>
      </div>
      <h3 className="csr-subtitle">Service Records</h3>
      <div className="csr-table">
        <div className="csr-thead">
          <div>Service Name</div>
          <div>Date</div>
          <div>Duration</div>
          <div>Location</div>
          <div>Service Type</div>
          <div>Status</div>
        </div>
        {filtered.map((r, i) => (
          <div key={i} className="csr-trow">
            <div>{r.name}</div>
            <div>{r.date}</div>
            <div>{r.duration}</div>
            <div>{r.location}</div>
            <div>{r.type}</div>
            <div>{r.status}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="csr-empty">No records for given filters.</div>
        )}
      </div>
    </div>
  );
}

// --- CSROffers ---
function CSROffers() {
  type OfferStatus = "All" | "Pending" | "Accepted" | "Rejected" | "Completed";
  type OfferItem = {
  id: number;
  title: string;
  reqNo: string;
  pinId: string;
  pinUsername?: string;
  date: string;
  status: OfferStatus;
  feedbackRating?: number;
  feedbackDescription?: string;
  feedbackCreatedAt?: string;
  };
  const TABS: OfferStatus[] = ["All", "Pending", "Accepted", "Rejected", "Completed"];
  const [tab, setTab] = useState<OfferStatus>("All");
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const csrId = getCSRId();
  useEffect(() => {
    const fetchOffers = async () => {
      if (!csrId) {
        setOffers([]);
        return;
      }
      try {
        // Fetch all offers from csr_requests table for this CSR
        const res = await fetch(`http://localhost:3000/api/csr/${csrId}/offers`);
        const json = await res.json();
        const requests = json.offers || [];
        // Map backend data to OfferItem[]
        const data = requests.map((r: any) => ({
          id: r.requestId ?? r.pin_request_id,
          title: r.title || 'Untitled Request',
          reqNo: `REQ-${String(r.requestId ?? r.pin_request_id).padStart(3, "0")}`,
          pinId: r.pinId ? `PIN-${String(r.pinId).padStart(3, "0")}` : (r.pin_id ? `PIN-${String(r.pin_id).padStart(3, "0")}` : '—'),
          pinUsername: r.pinUsername || r.pin_username || '',
          date: r.interestedAt ? r.interestedAt.slice(0, 10) : (r.createdAt ? r.createdAt.slice(0, 10) : '-'),
          status: r.status || '-',
          feedbackRating: r.feedbackRating,
          feedbackDescription: r.feedbackDescription,
          feedbackCreatedAt: r.feedbackCreatedAt,
        }));
        setOffers(data);
      } catch (e) {
        setOffers([]);
      }
    };
    fetchOffers();
  }, [csrId]);
  // --- Fetch offer counters from csr_requests ---
  // Show all offers, including rejected and duplicates
  const total = offers.length;
  const pending = offers.filter(o => o.status === "Pending").length;
  const accepted = offers.filter(o => o.status === "Accepted").length;
  const rejected = offers.filter(o => o.status === "Rejected").length;
  const completed = offers.filter(o => o.status === "Completed").length;
  const filtered = useMemo(() => {
    if (tab === "All") return offers;
    return offers.filter(o => o.status === tab);
  }, [tab, offers]);
  const handleCancelInterest = async (requestId: number) => {
    const csrId = getCSRId();
    if (!csrId) return;
    try {
      const resp = await fetch(`http://localhost:3000/api/pin/offers/${requestId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csrId }),
      });
      if (!resp.ok) {
        alert('Failed to cancel interest');
        return;
      }
      // Reload offers after cancel
      window.location.reload(); // or refetch offers if you use state
    } catch (e) {
      alert('Error cancelling interest');
    }
  };
  return (
    <div className="csr-page">
      <h2 className="csr-section-title big">My Offers</h2>
      <p className="csr-muted">Track and manage your offers</p>
      <div className="csr-offer-counters">
        <div className="csr-offer-counter">Total Offers <span>{total}</span></div>
        <div className="csr-offer-counter">Pending <span>{pending}</span></div>
        <div className="csr-offer-counter">Accepted <span>{accepted}</span></div>
        <div className="csr-offer-counter">Rejected <span>{rejected}</span></div>
        <div className="csr-offer-counter">Completed <span>{completed}</span></div>
      </div>
      <div className="csr-tabs">
        {TABS.map((t) => (
          <button key={t} className={`csr-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "All" ? `All (${total})` : `${t} (${offers.filter(o => o.status === t).length})`}
          </button>
        ))}
      </div>
      <div className="csr-list">
  {filtered.filter(o => typeof o.id === 'number' && !isNaN(o.id)).map((o) => (
          <div key={o.id} className="csr-req-row">
            <div className="csr-req-row-top">
              <div className="csr-req-title">
                <span className="csr-req-title-text">{o.title}</span>
                <span className="csr-req-id">{o.reqNo}</span>
                <span className={`csr-chip csr-chip-status-${o.status.toLowerCase()}`}>{o.status}</span>
              </div>
              <div className="csr-req-views">{o.date}</div>
            </div>
            <div className="csr-req-row-bottom" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div className="csr-req-pin"><strong>PIN User:</strong> {o.pinUsername ? o.pinUsername : o.pinId}</div>
              <div className="csr-req-interested-date"><strong>Interested On:</strong> {o.date}</div>
              {/* Feedback section: show only if feedback exists, else show 'No feedback yet.' */}
              {(o.feedbackRating || o.feedbackDescription || o.feedbackCreatedAt) ? (
                <div className="csr-rating" style={{ marginTop: 8 }}>
                  <strong>Feedback:</strong>
                  <div style={{ marginLeft: 8 }}>
                    {typeof o.feedbackRating === 'number' && (
                      <span>Rating: {"★".repeat(o.feedbackRating)}{"☆".repeat(5 - o.feedbackRating)} ({o.feedbackRating}/5)</span>
                    )}
                    {o.feedbackDescription && (
                      <div>Description: {o.feedbackDescription}</div>
                    )}
                    {o.feedbackCreatedAt && (
                      <div className="csr-muted small">Feedback created: {o.feedbackCreatedAt.slice(0,10)}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="csr-muted small" style={{ marginTop: 8 }}>No feedback yet.</div>
              )}
              <div style={{ marginTop: 8 }}>
                <button
                  className="csr-btn-danger"
                  style={{ minWidth: 110, marginRight: 8 }}
                  onClick={() => handleCancelInterest(o.id)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.filter(o => typeof o.id === 'number' && !isNaN(o.id)).length === 0 && <div className="csr-empty">No items.</div>}
      </div>
    </div>
  );
}

// --- CSRShortlist ---
function CSRShortlist() {
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const csrId = getCSRId();
  const load = async () => {
    if (!csrId) {
      alert("You must be logged in as a CSR rep to view your shortlist.");
      setShortlist([]);
      return;
    }
    const res = await fetch(`http://localhost:3000/api/csr/${csrId}/shortlist`);
    const json = await res.json();
    setShortlist(json.shortlistedRequests || []);
  };
  const remove = async (reqId: number) => {
    if (!csrId) {
      alert("You must be logged in as a CSR rep to remove from shortlist.");
      return;
    }
    setLoadingId(reqId);
    await fetch(`http://localhost:3000/api/csr/${csrId}/shortlist/${reqId}`, { method: "DELETE" });
    setLoadingId(null);
    await load();
  };
  useEffect(() => { load(); }, [csrId]);
  return (
    <div className="csr-page">
      <h2 className="csr-section-title big">My Shortlist</h2>
      <div className="csr-grid">
        {shortlist.map((s) => (
          <div key={s.requestId} style={{ cursor: 'pointer' }} onClick={() => setSelected(s)}>
            <RequestCard
              title={s.title}
              location={s.location}
              urgencyLevel={s.urgencyLevel}
              specialNeeds={s.specialNeeds}
              categoryName={s.categoryName}
              status={s.status}
              onRemove={() => remove(s.requestId)}
              loading={loadingId === s.requestId}
            />
          </div>
        ))}
      </div>
      {shortlist.length === 0 && <p className="csr-empty">No items shortlisted yet.</p>}
      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14, position: 'relative' }}>
            <button
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: 26,
                fontWeight: 700,
                color: '#64748b',
                cursor: 'pointer',
                lineHeight: 1,
                zIndex: 2,
              }}
              aria-label="Close"
            >
              ×
            </button>
            <h3>Request Details</h3>
            <div><b>PIN Name:</b> {selected.pinName || 'N/A'}</div>
            <div><b>Title:</b> {selected.title || 'Untitled Request'}</div>
            <div><b>Request Type:</b> {selected.categoryName}</div>
            <div><b>Location:</b> {selected.location || selected.locationName || '-'}</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '8px 0' }}>
              <div>
                <b>Status:</b> <span style={{
                  color:
                    selected.status === 'Pending' ? '#f59e42' :
                    selected.status === 'Available' ? '#22c55e' :
                    '#6b7280',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                }}>{selected.status || '-'}</span>
              </div>
              <div>
                {selected.urgencyLevel && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 90,
                      padding: '0.4em 1.2em',
                      borderRadius: 18,
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      backgroundColor:
                        selected.urgencyLevel.toLowerCase() === 'high priority' ? '#ef4444' :
                        selected.urgencyLevel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280',
                      textAlign: 'center',
                      letterSpacing: 1,
                    }}
                  >
                    {selected.urgencyLevel}
                  </span>
                )}
              </div>
            </div>
            <div><b>Description:</b></div>
            <div className="desc-box">{selected.message || '(No description)'}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button className="csr-btn-danger" style={{ minWidth: 110 }} onClick={async () => { await remove(selected.requestId); setSelected(null); }} disabled={loadingId === selected.requestId}>
                {loadingId === selected.requestId ? "Removing..." : "Remove from Shortlist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Combined CSRRep Page ---
export default function CSRRepDashboard() {
  const [page, setPage] = useState("dashboard");
  return (
    <div className="csr-wrap">
      <CSRHeader />
      <NavBar setPage={setPage} />
      <main className="csr-content">
        {page === "dashboard" && <CSRDashboard />}
        {page === "requests" && <CSRAvailableRequests />}
        {page === "shortlist" && <CSRShortlist />}
        {page === "offers" && <CSROffers />}
        {page === "history" && <CSRHistory />}
      </main>
    </div>
  );
}
