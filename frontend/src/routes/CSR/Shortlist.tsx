import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react"; // Importing icons for delete and location
import "./Shortlist.css";
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
  views?: number;
  status?: "Available" | "Pending" | "Completed";
  details?: string;
}

const Shortlist: React.FC = () => {
  const [shortlistedRequests, setShortlistedRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [interestedIds, setInterestedIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const normalize = (r: any): Request => ({
    id: String(r.requestId || r.request_id || r.id),
    title: r.title || r.name || "Untitled",
    priority: r.urgencyLevel ? (String(r.urgencyLevel).toLowerCase().includes("urgent") || String(r.urgencyLevel).toLowerCase().includes("high") ? "High Priority" : "Low Priority") : "Low Priority",
    requestType: r.categoryName || r.requestType || "General",
    pinName: r.pinName || r.pinUsername || "",
    pinId: String(r.pinId || r.pin_id || ""),
    region: r.location || r.region || "",
    views: r.view_count || 0,
    status: r.status || "Available",
    details: r.message || r.details || "",
  });

  const fetchShortlist = async () => {
    setLoading(true);
    try {
      const csrId = Number(localStorage.getItem('userId')) || 0;
      if (!csrId) return setShortlistedRequests([]);
      const res = await fetch(`/api/csr/${csrId}/shortlist`, { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch shortlist');
      const payload = await res.json();
      const items = (payload.shortlistedRequests || []) as any[];
      const list = items.map(normalize);
      setShortlistedRequests(list);
      // mark all as interested by default
      const map: Record<string, boolean> = {};
      list.forEach((it) => map[it.id] = true);
      setInterestedIds(map);
    } catch (err) {
      console.error('Error fetching shortlist', err);
      toast.error('Failed to load shortlist');
      setShortlistedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShortlist(); }, []);

  const handleRemoveShortlist = async (requestId: string) => {
    try {
      const csrId = Number(localStorage.getItem('userId')) || 0;
      if (!csrId) return;
      const res = await fetch(`/api/csr/${csrId}/shortlist/${requestId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        // refresh
        await fetchShortlist();
        toast.success('Removed from shortlist');
      } else {
        const body = await res.text();
        console.error('Failed to remove from shortlist', body);
        toast.error('Failed to remove from shortlist');
      }
    } catch (err) {
      console.error('Error removing from shortlist', err);
      toast.error('Error removing from shortlist');
    }
  };

  const openDetails = (request: Request) => setSelectedRequest(request);
  const closeDetails = () => setSelectedRequest(null);
  const toggleInterested = async (id: string) => {
    // In shortlist, toggling interest removes from shortlist
    await handleRemoveShortlist(id);
  };

  return (
    <div className="shortlist-container">
      {loading && <div className="loading">Loading shortlist...</div>}
      <div className="shortlist-top">
        <div>
        <header className="shortlist-header"></header>
          <h1>Shortlisted Requests</h1>
          <p>Browse and view your shortlisted requests</p>
        </div>
      </div>

      <div className="shortlist-content">
        {shortlistedRequests.length === 0 ? (

          <div className="shortlist-empty-state">
            <p>Your shortlist is empty.</p>
            <p>Browse available requests and add them to your shortlist for later.</p>
          </div>

        ) : (

          <div className="shortlist-request-list">
            {shortlistedRequests.map((request) => (
              <div key={request.id} onClick={() => openDetails(request)} className={`shortlist-request-card ${request.priority.toLowerCase().includes("high") ? 'priority-high-card' : ''}`}>
                <span className={`shortlist-request-priority ${request.priority.toLowerCase().includes("high") ? 'priority-high' : 'priority-low'}`}>
                  {request.priority}
                </span>
                <div className="shortlist-request-header">
                  <h3 className="shortlist-request-title">{request.title}</h3>
                </div>

                <div className="shortlist-request-body">
                  <p className="shortlist-request-type"><strong>Request Type:</strong> {request.requestType ?? 'General'}</p>
                  <p className="shortlist-request-pin"><strong>PIN:</strong> {request.pinName}</p>
                  <p className="shortlist-request-location"><MapPin className="icon" /> {request.region}</p>
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
          />
        )}
    </div>
  );
};

export default Shortlist;
