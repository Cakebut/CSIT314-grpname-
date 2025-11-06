import React, { useEffect, useState, useMemo } from "react";
import "./CSRRepDashboard.css";
import "./CSRRepDashboard.extra.css";

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notiLoading, setNotiLoading] = useState(false);
  const [notiError, setNotiError] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const csrId = getCSRId();

  // Fetch notifications for CSR user
  useEffect(() => {
    if (!csrId) return;
    setNotiLoading(true);
    setNotiError("");
    fetch(`http://localhost:3000/api/pin/notifications/csr/${csrId}`)
      .then(res => res.json())
      .then(data => {
        // Only show notifications for accepted, rejected, or feedback
        const filtered = (data.data || []).filter((n: any) =>
          n.type === 'accepted' || n.type === 'rejected' || n.type === 'feedback'
        );
        setNotifications(filtered);
        setHasUnread(filtered.some((n: any) => n.read === 0));
        setNotiLoading(false);
      })
      .catch(() => {
        setNotiError("Could not load notifications.");
        setNotiLoading(false);
      });
  }, [csrId, showNoti]);

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
          <button className="csr-icon-btn" onClick={() => setShowNoti(s => !s)} aria-label="Notifications" style={{ position: 'relative', fontSize: 24, background: '#e0e7ef', borderRadius: 24, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <span role="img" aria-label="bell">🔔</span>
              {hasUnread && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 9,
                  height: 9,
                  background: '#ef4444',
                  borderRadius: '50%',
                  border: '1.5px solid #fff',
                  boxShadow: '0 0 2px #ef4444',
                  display: 'inline-block',
                }} />
              )}
            </span>
          </button>
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
              {notiLoading ? <div>Loading...</div> : notiError ? <div style={{ color: '#b91c1c' }}>{notiError}</div> : notifications.length === 0 ? <div className="csr-muted">No notifications yet</div> : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.map(noti => (
                    <li
                      key={noti.id}
                      style={{
                        padding: '12px 0',
                        borderBottom: '1px solid #e5e7eb',
                        background: noti.read === 0 ? 'linear-gradient(90deg,#fef9c3 60%,#f3f4f6 100%)' : '#f3f4f6',
                        cursor: 'pointer',
                        borderRadius: 8,
                        marginBottom: 2,
                        boxShadow: noti.read === 0 ? '0 2px 8px #fef9c3' : 'none',
                        transition: 'background 0.2s, box-shadow 0.2s',
                        position: 'relative',
                      }}
                      title="Click to clear notification"
                      onClick={async () => {
                        try {
                          await fetch(`http://localhost:3000/api/pin/notifications/${noti.id}`, { method: 'DELETE' });
                          setNotifications(prev => prev.filter(n => n.id !== noti.id));
                        } catch {
                          alert('Failed to clear notification');
                        }
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '1.08rem', color: '#2563eb', marginBottom: 2 }}>
                        {noti.type === 'accepted' ? `✅ Accepted by ${noti.pinUsername || 'PIN'}`
                          : noti.type === 'rejected' ? `❌ Rejected by ${noti.pinUsername || 'PIN'}`
                          : noti.type === 'feedback' ? '⭐ Feedback received'
                          : noti.type}
                      </div>
                      <div style={{ fontSize: 15, color: '#334155', fontWeight: 500, marginBottom: 2 }}>Request: <span style={{ color: '#0ea5e9' }}>{noti.requestTitle || noti.pin_request_id}</span></div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{noti.createdAt?.slice(0, 19).replace('T', ' ')}</div>
                      <span style={{ position: 'absolute', top: 8, right: 12, color: '#ef4444', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} title="Clear notification">×</span>
                    </li>
                  ))}
                </ul>
              )}
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
      <button onClick={() => setPage("requests")}>Requests</button>
      <button onClick={() => setPage("shortlist")}>Shortlist</button>
      <button onClick={() => setPage("offers")}>Offers</button>
      <button onClick={() => setPage("history")}>History</button>
    </nav>
  );
}


// --- CSRAvailableRequests ---
function CSRAvailableRequests() {
  // Filter and search state for Requests
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [urgencyOptions] = useState<string[]>(["High Priority", "Low Priority"]);
  useEffect(() => {
    fetch('/api/csr/service-types')
      .then(res => res.json())
      .then(data => setCategoryOptions(data.serviceTypes || []))
      .catch(() => setCategoryOptions([]));
    fetch('/api/csr/locations')
      .then(res => res.json())
      .then(data => setLocationOptions(data.locations || []))
      .catch(() => setLocationOptions([]));
  }, []);
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
      {/* Filter and Search Bar UI */}
  <div style={{ display: 'flex', gap: 14, margin: '18px 0 8px 0', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={e => setSearchTitle(e.target.value)}
          style={{ width: 220, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ width: 160, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}>
          <option value="">All Categories</option>
          {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{ width: 160, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}>
          <option value="">All Locations</option>
          {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} style={{ width: 160, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}>
          <option value="">All Urgency</option>
          {urgencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
        <button className="csr-btn-outline" style={{ minWidth: 110, height: 38 }} onClick={() => { setFilterCategory(""); setFilterLocation(""); setFilterUrgency(""); setFilterStatus(""); setSearchTitle(""); }}>Clear Filter</button>
      </div>
      <p className="csr-muted">Browse all requests from Persons in Need</p>
      <div className="csr-list">
        {Array.from(new Map(requests.map(r => [r.requestId, r])).values())
          .filter(r => r.status !== 'Completed')
          .filter(r => !filterCategory || r.categoryName === filterCategory)
          .filter(r => !filterLocation || (r.location === filterLocation || r.locationName === filterLocation))
          .filter(r => !filterUrgency || r.urgencyLevel === filterUrgency)
          .filter(r => !filterStatus || r.status === filterStatus)
          .filter(r => !searchTitle || (r.title && r.title.toLowerCase().includes(searchTitle.toLowerCase())))
          .length === 0 ? (
            <div className="csr-empty">No requests found.</div>
          ) : (
            Array.from(new Map(requests.map(r => [r.requestId, r])).values())
              .filter(r => r.status !== 'Completed')
              .filter(r => !filterCategory || r.categoryName === filterCategory)
              .filter(r => !filterLocation || (r.location === filterLocation || r.locationName === filterLocation))
              .filter(r => !filterUrgency || r.urgencyLevel === filterUrgency)
              .filter(r => !filterStatus || r.status === filterStatus)
              .filter(r => !searchTitle || (r.title && r.title.toLowerCase().includes(searchTitle.toLowerCase())))
              .map((r) => (
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
  // CSRDashboard removed; CSR users are redirected to Requests page by default
  return null;
}

// --- CSRHistory ---
function CSRHistory() {
  type Status = "Pending" | "Completed";
  type HistoryRow = {
    name: string;
    date: string;
    location: string;
    type: string;
    status: Status;
  };
  const [DATA, setDATA] = useState<HistoryRow[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>(["All Types"]);
  const [svcType, setSvcType] = useState<string>("All Types");
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");

  // Fetch service types from backend
  useEffect(() => {
    fetch('/api/csr/service-types')
      .then(res => res.json())
      .then(data => {
        setServiceTypes(["All Types", ...(data.serviceTypes || [])]);
      })
      .catch(() => setServiceTypes(["All Types"]));
  }, []);

  // Fetch real history from backend
  useEffect(() => {
    (async () => {
      const csrId = getCSRId();
      if (!csrId) return;
      try {
        const res = await fetch(`/api/csr/${csrId}/history`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        setDATA(json.history || []);
      } catch (e) {
        console.error("Failed to load CSR history", e);
        setDATA([]);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return DATA.filter(row => {
      const itype = svcType === "All Types" || row.type === svcType;
      const istart = !start || row.date >= start;
      const iend = !end || row.date <= end;
      return itype && istart && iend;
    });
  }, [DATA, svcType, start, end]);
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
      ["Service Name", "Date", "Location", "Service Type", "Status"],
      ...filtered.map(r => [r.name, r.date, r.location, r.type, r.status]),
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
        <select className="csr-select" value={svcType} onChange={e => setSvcType(e.target.value)}>
          {serviceTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="csr-history-start" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500, marginBottom: 2 }}>Start Date</label>
          <input
            id="csr-history-start"
            type="date"
            className="csr-input"
            value={start}
            onChange={e => setStart(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="csr-history-end" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500, marginBottom: 2 }}>End Date</label>
          <input
            id="csr-history-end"
            type="date"
            className="csr-input"
            value={end}
            onChange={e => setEnd(e.target.value)}
          />
        </div>
        <button className="csr-btn" onClick={() => { /* live filtering */ }}>Apply Filter</button>
        <button className="csr-btn-outline" onClick={clear}>Clear Filter</button>
      </div>
      <h3 className="csr-subtitle">Service Records</h3>
      <div className="csr-table">
        <div className="csr-thead">
          <div>Service Name</div>
          <div>Date</div>
          <div>Location</div>
          <div>Service Type</div>
          <div>Status</div>
        </div>
        {filtered.map((r, i) => (
          <div key={i} className="csr-trow">
            <div>{r.name}</div>
            <div>{r.date}</div>
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
  categoryName?: string;
  location?: string;
  };
  const TABS: OfferStatus[] = ["All", "Pending", "Accepted", "Rejected", "Completed"];
  const [tab, setTab] = useState<OfferStatus>("All");
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [filterStatus] = useState<OfferStatus | "">("");
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
          categoryName: r.categoryName || r.category_name || '-',
          location: r.location || r.locationName || r.location_name || '-',
        }));
        setOffers(data);
      } catch (e) {
        setOffers([]);
      }
    };
    fetchOffers();
  }, [csrId]);

  // Fetch category and location options from backend
  useEffect(() => {
    fetch('/api/csr/service-types')
      .then(res => res.json())
      .then(data => setCategoryOptions(data.serviceTypes || []))
      .catch(() => setCategoryOptions([]));
    fetch('/api/csr/locations')
      .then(res => res.json())
      .then(data => setLocationOptions(data.locations || []))
      .catch(() => setLocationOptions([]));
  }, []);
  // --- Fetch offer counters from csr_requests ---
  // Show all offers, including rejected and duplicates
  const total = offers.length;
  // --- Filtering logic ---
  const filtered = useMemo(() => {
    let result = offers;
    if (tab !== "All") {
      result = result.filter(o => o.status === tab);
    }
    if (filterCategory.trim()) {
      result = result.filter(o => o.categoryName?.toLowerCase().includes(filterCategory.trim().toLowerCase()));
    }
    if (filterLocation.trim()) {
      result = result.filter(o => o.location?.toLowerCase().includes(filterLocation.trim().toLowerCase()));
    }
    if (filterStatus && filterStatus !== "All") {
      result = result.filter(o => o.status === filterStatus);
    }
    return result;
  }, [tab, offers, filterCategory, filterLocation, filterStatus]);
    // Cancel action removed from this view; CSR cancel handled elsewhere if needed.
  return (
    <div className="csr-page">
      <h2 className="csr-section-title big">My Offers</h2>
      <p className="csr-muted">Track and manage your offers</p>
      <div style={{ display: 'flex', gap: 14, margin: '18px 0 8px 0', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        {TABS.map((t) => (
          <button key={t} className={`csr-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "All" ? `All (${total})` : `${t} (${offers.filter(o => o.status === t).length})`}
          </button>
        ))}
        <select
          id="offer-filter-category"
          className="csr-select"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{ width: 160, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
        >
          <option value="">Any Category</option>
          {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select
          id="offer-filter-location"
          className="csr-select"
          value={filterLocation}
          onChange={e => setFilterLocation(e.target.value)}
          style={{ width: 160, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 16 }}
        >
          <option value="">Any Location</option>
          {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <button className="csr-btn-outline" style={{ minWidth: 110, height: 38 }} onClick={() => { setFilterCategory(""); setFilterLocation(""); }}>Clear Filter</button>
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
              <div className="csr-req-category"><strong>Category:</strong> {o.categoryName ?? '-'}</div>
              <div className="csr-req-location"><strong>Location:</strong> {o.location ?? '-'}</div>
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
              {/* Cancel button removed per request: CSR cancels handled elsewhere or not allowed here */}
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
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterUrgency, setFilterUrgency] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
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
  // Fetch category and location options from backend
  useEffect(() => {
    fetch('/api/csr/service-types')
      .then(res => res.json())
      .then(data => setCategoryOptions(data.serviceTypes || []))
      .catch(() => setCategoryOptions([]));
    fetch('/api/csr/locations')
      .then(res => res.json())
      .then(data => setLocationOptions(data.locations || []))
      .catch(() => setLocationOptions([]));
  }, []);
  // Filtering logic
  const filtered = React.useMemo(() => {
    let result = shortlist;
    if (filterCategory) result = result.filter(s => s.categoryName === filterCategory);
    if (filterStatus) result = result.filter(s => s.status === filterStatus);
    if (filterUrgency) result = result.filter(s => (s.urgencyLevel || '').toLowerCase() === filterUrgency.toLowerCase());
    if (filterLocation) result = result.filter(s => s.location === filterLocation);
    return result;
  }, [shortlist, filterCategory, filterStatus, filterUrgency, filterLocation]);
  return (
    <div className="csr-page">
      <h2 className="csr-section-title big">My Shortlist</h2>
      {/* Filter UI */}
      <div className="csr-filters" style={{ display: 'flex', gap: 16, margin: '18px 0 8px 0', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-category" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}>Category</label>
          <select
            id="shortlist-filter-category"
            className="csr-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">Any</option>
            {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-status" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}>Status</label>
          <select
            id="shortlist-filter-status"
            className="csr-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">Any</option>
            <option value="Available">Available</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-urgency" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}>Urgency</label>
          <select
            id="shortlist-filter-urgency"
            className="csr-select"
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">Any</option>
            <option value="High Priority">High Priority</option>
            <option value="Low Priority">Low Priority</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-location" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}>Location</label>
          <select
            id="shortlist-filter-location"
            className="csr-select"
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">Any</option>
            {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
        <button className="csr-btn-outline" style={{ minWidth: 90 }} onClick={() => { setFilterCategory(""); setFilterStatus(""); setFilterUrgency(""); setFilterLocation(""); }}>Clear Filter</button>
      </div>
      <div className="csr-table" style={{ marginTop: 24, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px #e0e7ef' }}>
        <div className="csr-thead" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: '#f1f5f9', fontWeight: 700, fontSize: '1.08rem', color: '#334155', padding: '12px 0' }}>
          <div style={{ paddingLeft: 18 }}>Title</div>
          <div>Category</div>
          <div>Status</div>
          <div>Urgency</div>
          <div>Location</div>
          <div></div>
        </div>
        {filtered.length === 0 && <div className="csr-empty" style={{ padding: 24 }}>No items shortlisted yet.</div>}
        {filtered.map(s => (
          <div key={s.requestId} className="csr-trow" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', alignItems: 'center', borderBottom: '1px solid #e5e7eb', background: s.urgencyLevel && s.urgencyLevel.toLowerCase() === 'high priority' ? '#fff5f5' : '#fff', fontSize: '1.08rem', transition: 'background 0.2s', cursor: 'pointer', minHeight: 56 }} onClick={() => setSelected(s)}>
            <div style={{ paddingLeft: 18, fontWeight: 700, color: '#1e293b', fontSize: '1.12rem', letterSpacing: 0.5 }}>{s.title}</div>
            <div>{s.categoryName && <span className="csr-chip csr-chip-category" style={{ background: '#e0e7ef', color: '#334155', fontWeight: 600, borderRadius: 12, padding: '4px 14px', fontSize: '0.98rem' }}>{s.categoryName}</span>}</div>
            <div>{s.status && <span className="csr-chip csr-chip-status" style={{ background: s.status.toLowerCase() === 'available' ? '#22c55e' : '#f1f5f9', color: s.status.toLowerCase() === 'available' ? 'white' : '#64748b', fontWeight: 600, borderRadius: 12, padding: '4px 14px', fontSize: '0.98rem' }}>{s.status}</span>}</div>
            <div>{s.urgencyLevel && <span className="csr-chip csr-chip-urgency" style={{ background: s.urgencyLevel.toLowerCase() === 'high priority' ? '#ef4444' : s.urgencyLevel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280', color: 'white', fontWeight: 700, borderRadius: 12, padding: '4px 14px', fontSize: '0.98rem' }}>{s.urgencyLevel}</span>}</div>
            <div style={{ color: '#0ea5e9', fontWeight: 600 }}>{s.location}</div>
            <div>
              <button
                className="csr-btn-danger"
                onClick={e => { e.stopPropagation(); remove(s.requestId); }}
                disabled={loadingId === s.requestId}
                style={{
                  minWidth: 110,
                  fontWeight: 700,
                  fontSize: '1.08rem',
                  borderRadius: 10,
                  padding: '8px 0',
                  boxShadow: '0 2px 8px #ef4444',
                  border: 'none',
                  background: loadingId === s.requestId ? '#fca5a5' : '#ef4444',
                  color: '#fff',
                  transition: 'background 0.2s',
                  cursor: loadingId === s.requestId ? 'not-allowed' : 'pointer',
                }}
              >
                {loadingId === s.requestId ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        ))}
      </div>
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
  const [page, setPage] = useState("requests");
  // Announcement modal state
  const [latestAnnouncement, setLatestAnnouncement] = React.useState<{ message: string; createdAt: string } | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = React.useState(false);
  React.useEffect(() => {
    fetch('http://localhost:3000/api/pm/announcements/latest')
      .then(res => res.json())
      .then(data => {
        const latest = data?.latest ?? null;
        setLatestAnnouncement(latest);
        if (latest?.createdAt) {
          const lastSeen = localStorage.getItem('latestAnnouncementSeenAt_csr');
          if (lastSeen !== latest.createdAt) {
            setShowAnnouncementModal(true);
          }
        }
      })
      .catch(() => {});
  }, []);
  return (
    <>
      {/* Latest Announcement Modal for CSR */}
      {showAnnouncementModal && latestAnnouncement && (
        <div className="modal" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14 }}>
            <h3>Platform Announcement</h3>
            <div style={{ marginBottom: 12, fontWeight: 600 }}>{latestAnnouncement.message}</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>Posted: {latestAnnouncement.createdAt.slice(0, 10)}</div>
            <button className="button primary" style={{ background: '#2563eb', color: '#fff' }}
              onClick={() => {
                setShowAnnouncementModal(false);
                localStorage.setItem('latestAnnouncementSeenAt_csr', latestAnnouncement.createdAt);
              }}
            >Dismiss</button>
          </div>
        </div>
      )}
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
    </>
  );
}
