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

  // Status and urgency colors are handled via CSS classes

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

  // When a request is selected, lock body scroll and allow Escape to close the modal
  useEffect(() => {
    if (!selected) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [selected]);

  return (
    <div className="available-container">
      <div className="available-top">
        <div>
        <header className="available-header"></header>
          <h1>Available Requests</h1>
          <p>Browse and offer assistance to different Persons in Need</p>
        </div>
      </div>

      {/* Filter and Search Bar UI */}
      <div className="available-actions">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTitle}
          onChange={e => setSearchTitle(e.target.value)}
          className="search-available"
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="filter-available">
          <option value="">All Categories</option>
          {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} className="filter-available">
          <option value="">All Locations</option>
          {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} className="filter-available">
          <option value="">All Urgency</option>
          {urgencyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-available">
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
        <button className="reset-available" onClick={() => { setFilterCategory(""); setFilterLocation(""); setFilterUrgency(""); setFilterStatus(""); setSearchTitle(""); }}>Clear Filter</button>
      </div>
      
      <div className="available-list">
        {Array.from(new Map(requests.map(r => [r.requestId, r])).values())
          .filter(r => r.status !== 'Completed')
          .filter(r => !filterCategory || r.categoryName === filterCategory)
          .filter(r => !filterLocation || (r.location === filterLocation || r.locationName === filterLocation))
          .filter(r => !filterUrgency || r.urgencyLevel === filterUrgency)
          .filter(r => !filterStatus || r.status === filterStatus)
          .filter(r => !searchTitle || (r.title && r.title.toLowerCase().includes(searchTitle.toLowerCase())))
          .length === 0 ? (
            <div className="available-empty">No requests found.</div>
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
                    className={`available-req-row ${r.urgencyLevel && r.urgencyLevel.toLowerCase() === 'high priority' ? 'priority-high-card' : ''}`}
                    onClick={() => setSelected(r)}
                  >
                  <div className="available-req-row-top">
                    <div className="available-req-title">
                        <span className="available-req-title-text">{r.title || 'Untitled Request'}</span>
                      <span className="available-req-id">REQ-{String(r.requestId).padStart(3, "0")}</span>
                    </div>
                  </div>

                  {/* top-right badges: status (left) then urgency (right) */}
                  <div className="available-badges">
                    <div className={`status-${(r.status||'').toLowerCase()}`}>{r.status || '-'}</div>
                    {r.urgencyLevel && (
                      <span className={`available-chip available-chip-urgency ${r.urgencyLevel.toLowerCase() === 'high priority' ? 'high' : r.urgencyLevel.toLowerCase() === 'low priority' ? 'low' : ''}`}>
                        {r.urgencyLevel}
                      </span>
                    )}
                  </div>

                  <div className="available-req-row-bottom">
                      <div className="available-meta">
                        <div className="available-muted">{r.categoryName}</div>
                        <div className="available-location"><MapPin className="icon" />{r.location || r.locationName || '-'}</div>
                      </div>
                      <div />
                  </div>
                </div>
              ))
          )}
      </div>
      {selected && (
        <div className="available-modal-overlay" onClick={() => setSelected(null)} aria-modal="true" role="dialog">
          <div className="available-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="available-modal-close" aria-label="Close details" onClick={() => setSelected(null)}>×</button>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Available;

