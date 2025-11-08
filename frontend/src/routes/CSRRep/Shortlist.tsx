import React, { useEffect, useState } from 'react';
import './Shortlist.css';



function getCSRId() {
  const role = localStorage.getItem("currentRole");
  const userId = localStorage.getItem("userId");
  if (role === "CSR Rep" && userId) return userId;
  return null;
}

function Shortlist() {
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

  // Lock body scroll and close on Escape when modal is open
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [selected]);
  return (
    <div className="shortlist-container">
      <div className="shortlist-top">
        <div>
        <header className="shortlist-header"></header>
          <h1>My Shortlisted Requests</h1>
          <p>Browse and manage your shortlisted requests</p>
        </div>
      </div>

  {/* Filter UI - shortlist-specific styles */}
  <div className="shortlist-actions csr-filters">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-category" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}></label>
          <select
            id="shortlist-filter-category"
            className="filter-shortlist"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All Categories</option>
            {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-status" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}></label>
          <select
            id="shortlist-filter-status"
            className="filter-shortlist"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-urgency" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}></label>
          <select
            id="shortlist-filter-urgency"
            className="filter-shortlist"
            value={filterUrgency}
            onChange={e => setFilterUrgency(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All Urgency</option>
            <option value="High Priority">High Priority</option>
            <option value="Low Priority">Low Priority</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-location" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}></label>
          <select
            id="shortlist-filter-location"
            className="filter-shortlist"
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All Locations</option>
            {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <button className="reset-shortlist" onClick={() => { setFilterCategory(""); setFilterStatus(""); setFilterUrgency(""); setFilterLocation(""); }}>Clear Filter</button>
      </div>
      <div className="csr-table" style={{ border: '1px solid black', marginTop: 30, borderRadius: 8, overflow: 'hidden' }}>
        <div className="csr-thead" style={{ border: '1px solid black', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', background: 'white', fontWeight: 700, fontSize: '1.08rem', color: '#334155', padding: '20px 0' }}>
          <div style={{ paddingLeft: 50 }}>Title</div>
          <div style={{ paddingLeft: 15 }}>Category</div>
          <div style={{ paddingLeft: 23 }}>Status</div>
          <div style={{ paddingLeft: 18 }}>Urgency</div>
          <div style={{ paddingLeft: 0 }}>Location</div>
          <div style={{ paddingLeft: 1 }}>Action</div>
          <div></div>
        </div>
        {filtered.length === 0 && <div className="csr-empty" style={{ padding: 30, textAlign: 'center' }}>No items shortlisted yet.</div>}
        {filtered.map(s => (
          <div key={s.requestId} className="csr-trow" style={{ border: '1px solid black', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', alignItems: 'center', borderBottom: '1px solid #e5e7eb', background: s.urgencyLevel && s.urgencyLevel.toLowerCase() === 'high priority' ? '#fff5f5' : '#fff', fontSize: '1.08rem', transition: 'background 0.2s', cursor: 'pointer', minHeight: 56, padding: 30 }} onClick={() => setSelected(s)}>
            <div style={{ paddingLeft: 18, fontWeight: 700, color: '#1e293b', fontSize: '1.12rem', letterSpacing: 0.5 }}>{s.title}</div>
            <div>{s.categoryName && <span className="csr-chip csr-chip-category" style={{ background: '#e0e7ef', color: '#334155', fontWeight: 600, borderRadius: 12, padding: '4px 5px', fontSize: '0.98rem' }}>{s.categoryName}</span>}</div>
            <div>{s.status && <span className="csr-chip csr-chip-status" style={{ background: s.status.toLowerCase() === 'available' ? '#22c55e' : '#f1f5f9', color: s.status.toLowerCase() === 'available' ? 'white' : '#64748b', fontWeight: 600, borderRadius: 12, padding: '4px 14px', fontSize: '0.98rem' }}>{s.status}</span>}</div>
            <div>{s.urgencyLevel && <span className="csr-chip csr-chip-urgency" style={{ background: s.urgencyLevel.toLowerCase() === 'high priority' ? '#ef4444' : s.urgencyLevel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280', color: 'white', fontWeight: 700, borderRadius: 12, padding: '4px 14px', fontSize: '0.98rem' }}>{s.urgencyLevel}</span>}</div>
            <div style={{ color: '#0ea5e9', fontWeight: 600, padding: '4px 26px' }}>{s.location}</div>
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
        <div className="shortlist-modal-overlay" onClick={() => setSelected(null)} aria-modal="true" role="dialog">
          <div className="shortlist-modal-content" onClick={e => e.stopPropagation()}>
            <button className="shortlist-modal-close" aria-label="Close details" onClick={() => setSelected(null)}>×</button>
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

export default Shortlist;