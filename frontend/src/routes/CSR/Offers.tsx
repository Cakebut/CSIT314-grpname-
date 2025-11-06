import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react"; // Importing icons for location
import "./Offers.css";
import CSRRequestDetails from "./CSRRequestDetails";

// Define the structure for a request
interface Request {
  id: string;
  title: string;
  priority: "Low Priority" | "High Priority";
  requestType: string;
  pinName: string;
  pinId: string;
  region: string;
  views: number;
  status?: "Available" | "Pending" | "Completed";
  details?: string;
}

// We'll fetch real offers from the backend for the current CSR

const Offers: React.FC = () => {
  const [offersRequests, setOffersRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [interestedIds, setInterestedIds] = useState<Record<string, boolean>>(() => {
    // mark all currently-offered requests as interested by default
    const map: Record<string, boolean> = {};
    offersRequests.forEach((r) => { map[r.id] = true; });
    return map;
  });
  const [awaitingIds, setAwaitingIds] = useState<Record<string, boolean>>({});

  const normalize = (r: any): Request => ({
    id: String(r.requestId || r.request_id || r.id),
    title: r.title || r.name || 'Untitled',
    priority: r.urgencyLevel ? (String(r.urgencyLevel).toLowerCase().includes('urgent') || String(r.urgencyLevel).toLowerCase().includes('high') ? 'High Priority' : 'Low Priority') : 'Low Priority',
    requestType: r.categoryName || r.requestType || 'General',
    pinName: r.pinName || r.pinUsername || '',
    pinId: String(r.pinId || r.pin_id || ''),
    region: r.location || r.region || '',
    views: r.view_count || 0,
    status: r.status || 'Pending',
    details: r.message || r.details || '',
  });

  const fetchOffers = async () => {
    try {
      const csrId = Number(localStorage.getItem('userId')) || 0;
      if (!csrId) return setOffersRequests([]);
      const res = await fetch(`/api/csr/${csrId}/offers`, { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch offers');
      const payload = await res.json();
      const items = (payload.offers || payload.requests || []) as any[];
      setOffersRequests(items.map(normalize));
      // mark offered items as interested by default
      const map: Record<string, boolean> = {};
      items.forEach((it) => map[String(it.requestId || it.id || it.request_id)] = true);
      setInterestedIds(map);
    } catch (err) {
      console.error('Error fetching offers', err);
      toast.error('Failed to load offers');
      setOffersRequests([]);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const openDetails = (request: Request) => setSelectedRequest(request);
  const closeDetails = () => setSelectedRequest(null);
  const toggleInterested = (id: string) => {
    setInterestedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  };

  const handleReject = (id?: string) => {
    if (!id) return;
    // Cancel this CSR's interest for the request via PIN route
    (async () => {
      try {
        const csrId = Number(localStorage.getItem('userId')) || 0;
        if (!csrId) return;
        const res = await fetch(`/api/pin/offers/${id}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ csrId }),
        });
        if (res.ok) {
          toast.success('Offer rejected');
          // refresh list
          await fetchOffers();
          closeDetails();
        } else {
          const body = await res.text();
          console.error('Failed to reject offer', body);
          toast.error('Failed to reject offer');
        }
      } catch (err) {
        console.error('Error rejecting offer', err);
        toast.error('Error rejecting offer');
      }
    })();
  };

  const handleAccept = (id?: string) => {
    if (!id) return;
    // For CSR accepting an offer we'll mark interest (POST to interested) and set awaiting status
    (async () => {
      try {
        const csrId = Number(localStorage.getItem('userId')) || 0;
        if (!csrId) return;
        const res = await fetch(`/api/csr/${csrId}/interested/${id}`, { method: 'POST', credentials: 'include' });
        if (res.ok) {
          toast.success('Accepted offer — waiting for PIN confirmation');
          setAwaitingIds((prev) => ({ ...prev, [id]: true }));
          setOffersRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Pending' } : r));
        } else {
          const body = await res.text();
          console.error('Failed to accept offer', body);
          toast.error('Failed to accept offer');
        }
      } catch (err) {
        console.error('Error accepting offer', err);
        toast.error('Error accepting offer');
      }
    })();
    
  };

  return (
    <div className="offers-container">
      <div className="offers-top">
        <div>
        <header className="offers-header"></header>
          <h1>Pending Offers</h1>
          <p>Browse and track any ongoing pending offers from Person In Needs</p>
        </div>
      </div>

      <div className="offers-content">
        {offersRequests.length === 0 ? (

          <div className="offers-empty-state">
            <p>No offers available.</p>
            <p>Check back later for any updates.</p>
          </div>

        ) : (

          <div className="offers-request-list">
            {offersRequests.map((request) => (
              <div key={request.id} onClick={() => openDetails(request)} className={`offers-request-card ${request.priority.toLowerCase().includes("high") ? 'priority-high-card' : ''}`}>
                <span className={`offers-request-priority ${request.priority.toLowerCase().includes("high") ? 'priority-high' : 'priority-low'}`}>
                  {request.priority}
                </span>
                <div className="offers-request-header">
                  <h3 className="offers-request-title">{request.title}</h3>
                </div>

                <div className="offers-request-body">
                  <p className="offers-request-type"><strong>Request Type:</strong> {request.requestType ?? 'General'}</p>
                  <p className="offers-request-pin"><strong>PIN:</strong> {request.pinName}</p>
                  <p className="offers-request-location"><MapPin className="icon" /> {request.region}</p>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
        {selectedRequest && (
          <CSRRequestDetails
            request={selectedRequest}
            open={!!selectedRequest}
            onClose={closeDetails}
            interested={!!interestedIds[selectedRequest.id]}
            onToggleInterested={() => toggleInterested(selectedRequest.id)}
            showDecisionButtons={true}
            onReject={() => handleReject(selectedRequest.id)}
            onAccept={() => handleAccept(selectedRequest.id)}
            awaitingConfirmation={!!awaitingIds[selectedRequest.id]}
          />
        )}
    </div>
  );
};

export default Offers;
