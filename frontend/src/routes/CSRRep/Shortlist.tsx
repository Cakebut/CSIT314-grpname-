import React, { useEffect, useState } from 'react';
import './Available.css';
import CSRRequestDetails from './CSRRequestDetails';
import { MapPin } from 'lucide-react';



function getCSRId() {
  const role = localStorage.getItem("currentRole");
  const userId = localStorage.getItem("userId");
  if (role === "CSR Rep" && userId) return userId;
  return null;
}

function Shortlist() {
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterUrgency, setFilterUrgency] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [interestedIds, setInterestedIds] = useState<number[]>([]);
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
  // reload interested helper
  const reloadInterested = async () => {
    if (!csrId) return;
    try {
      const res = await fetch(`http://localhost:3000/api/csr/${csrId}/interested`);
      const json = await res.json();
      setInterestedIds((json.interestedRequests || []).map((r: any) => r.requestId ?? r.pin_request_id));
    } catch (e) {
      setInterestedIds([]);
    }
  };
  // removal is handled within CSRRequestDetails modal via the provided reloadShortlist
  useEffect(() => { load(); reloadInterested(); }, [csrId]);
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
    <div className="available-container">
      <div className="shortlist-container">
      <div className="shortlist-top">
        <div>
        <header className="shortlist-header"></header>
          <h1>My Shortlisted Requests</h1>
          <p>Browse and manage your shortlisted requests</p>
        </div>
      </div>

  {/* Filter UI - reuse Available styles */}
  <div className="available-actions csr-filters">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="shortlist-filter-category" style={{ fontSize: '0.98rem', color: '#64748b', fontWeight: 500 }}></label>
          <select
            id="shortlist-filter-category"
            className="filter-available"
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
            className="filter-available"
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
            className="filter-available"
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
            className="filter-available"
            value={filterLocation}
            onChange={e => setFilterLocation(e.target.value)}
            style={{ minWidth: 120 }}
          >
            <option value="">All Locations</option>
            {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <button className="reset-available" onClick={() => { setFilterCategory(""); setFilterStatus(""); setFilterUrgency(""); setFilterLocation(""); }}>Clear Filter</button>
        
      </div>
      <div className="available-list" style={{ marginTop: 30 }}>
        {filtered.length === 0 && <div className="available-empty">No items shortlisted yet.</div>}
        {filtered.map(s => (
          <div
            key={s.requestId}
            className={`available-req-row ${s.urgencyLevel && s.urgencyLevel.toLowerCase() === 'high priority' ? 'priority-high-card' : ''}`}
            onClick={() => setSelected(s)}
          >
            <div className="available-req-row-top">
              <div className="available-req-title">
                <span className="available-req-title-text">{s.title}</span>
                <span className="available-req-id">REQ-{String(s.requestId).padStart(3, '0')}</span>
              </div>
              <div className="available-badges">
                <div className={`status-${(s.status||'').toLowerCase()}`}>{s.status || '-'}</div>
                {s.urgencyLevel && (
                  <span className={`available-chip available-chip-urgency ${s.urgencyLevel.toLowerCase() === 'high priority' ? 'high' : s.urgencyLevel.toLowerCase() === 'low priority' ? 'low' : ''}`}>
                    {s.urgencyLevel}
                  </span>
                )}
              </div>
            </div>

            <div className="available-req-row-bottom">
              <div className="available-meta">
                <div className="available-muted">{s.categoryName}</div>
                <div className="available-location"><MapPin className="icon" />{s.location}</div>
              </div>
              <div />
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="available-modal-overlay" onClick={() => setSelected(null)} aria-modal="true" role="dialog">
          <div className="available-modal-content" onClick={e => e.stopPropagation()}>
            <button className="available-modal-close" aria-label="Close details" onClick={() => setSelected(null)}>×</button>
            <CSRRequestDetails
              request={selected}
              onClose={() => setSelected(null)}
              csrId={csrId}
              shortlistedIds={shortlist.map(s => s.requestId)}
              interestedIds={interestedIds}
              reloadShortlist={async () => { await load(); }}
              reloadInterested={reloadInterested}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Shortlist;