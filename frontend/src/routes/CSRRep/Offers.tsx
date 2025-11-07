import React, { useEffect, useMemo, useState } from "react";


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

export default Offers;