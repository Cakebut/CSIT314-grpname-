import React, { useEffect, useState } from "react";
import { MapPin } from "lucide-react";  // Importing relevant icons from lucide-react
import "./Available.css";

import CSRRequestDetails from "./CSRRequestDetails";

const Available: React.FC = () => {
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

  function getCSRId() {
    const role = localStorage.getItem("currentRole");
    const userId = localStorage.getItem("userId");
    if (role === "CSR Rep" && userId) return userId;
    return null;
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
        <CSRRequestDetails
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

export default Available;

