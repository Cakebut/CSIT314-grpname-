import React, { useEffect, useMemo, useState } from "react";
import "./Offers.css";


function getCSRId() {
  const role = localStorage.getItem("currentRole");
  const userId = localStorage.getItem("userId");
  if (role === "CSR Rep" && userId) return userId;
  return null;
}

function Offers() {
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
  const [filterStatus, setFilterStatus] = useState<OfferStatus | "">("");
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
  const total = offers.length; // retained for potential UI counts
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
    <div className="offers-container">
      <div className="offers-top">
        <div>
          <h1 className="offers-header" style={{ margin: 0 }}>My Offers</h1>
          <p>Track and manage your offers</p>
        </div>
      </div>

      <div className="offers-actions">
        <select
          className="offer-filter-status"
          value={tab}
          onChange={e => setTab(e.target.value as OfferStatus)}
        >
          {TABS.map(t => (
            <option key={t} value={t}>{t === "All" ? `All Status` : `${t} (${offers.filter(o => o.status === t).length})`}</option>
          ))}
        </select>

        <select
          className="offer-filter-category"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        
        <select
          className="offer-filter-location"
          value={filterLocation}
          onChange={e => setFilterLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <button className="reset-offers btn" onClick={() => { setFilterStatus(""); setFilterCategory(""); setFilterLocation(""); }}>Clear Filter</button>
      </div>

      <div className="available-list" style={{ pointerEvents: "none" }}>
        {filtered.filter(o => typeof o.id === 'number' && !isNaN(o.id)).map(o => (
          <div key={o.id} className="available-req-row" style={{ padding: '30px'}}>
            <div className="available-req-row-top">
              <div className="available-req-title">
                <span className="available-req-title-text">{o.title}</span>
                <span className="available-req-id">{o.reqNo}</span>
                <span className={`available-chip available-chip-status-${o.status.toLowerCase()}`}>{o.status}</span>
              </div>
              <div className="available-req-views">
                <div className="available-badges">
                  <div className={`status-${(o.status||'').toLowerCase()}`}>{o.status}</div>
                </div>
                <div className="available-req-date">{o.date}</div>
              </div>
            </div>
            <div className="available-req-row-bottom" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 5 }}>
              <div className="available-req-pin"><strong>PIN User:</strong> {o.pinUsername ? o.pinUsername : o.pinId}</div>
              <div className="available-req-category"><strong>Category:</strong> {o.categoryName ?? '-'}</div>
              <div className="available-req-location"><strong>Location:</strong> {o.location ?? '-'}</div>
              {/* Feedback section: show only if feedback exists, else show 'No feedback yet.' */}
              {(o.feedbackRating || o.feedbackDescription || o.feedbackCreatedAt) ? (
                <div className="available-rating" style={{ marginTop: 8, padding: 10, border: '1px solid black', borderRadius: 8, width: '100%' }}>
                  <strong>Feedbacks :</strong>
                  <div style={{ marginLeft: 8 }}>
                    {typeof o.feedbackRating === 'number' && (
                      <span>Rating : {"★".repeat(o.feedbackRating)}{"☆".repeat(5 - o.feedbackRating)} ({o.feedbackRating}/5)</span>
                    )}
                    {o.feedbackDescription && (
                      <div>Comments : {o.feedbackDescription}</div>
                    )}
                    {o.feedbackCreatedAt && (
                      <div className="available-muted small">Feedback created: {o.feedbackCreatedAt.slice(0,10)}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="available-muted small" style={{ marginTop: 8 }}>No feedback yet.</div>
              )}
              {/* Cancel button removed per request: CSR cancels handled elsewhere or not allowed here */}
            </div>
          </div>
        ))}
        {filtered.filter(o => typeof o.id === 'number' && !isNaN(o.id)).length === 0 && <div className="available-empty">No items.</div>}
      </div>
    </div>
  );
}

export default Offers;