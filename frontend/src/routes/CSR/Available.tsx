import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";  // Importing relevant icons from lucide-react
import "./Available.css";

// Define the structure for a request (normalized from backend)
interface Request {
  id: string;
  title: string;
  priority: "Low Priority" | "High Priority";
  requestType: string;
  pinName: string;
  pinId: string;
  region: string;
  status?: "Available" | "Pending" | "Completed";
  details?: string;
  views?: number;
}

import CSRRequestDetails from "./CSRRequestDetails";

const Available: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("All Locations");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [interestedIds, setInterestedIds] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  // Map backend request shape to UI Request
  const normalize = (r: any): Request => ({
    id: String(r.requestId || r.id || r.request_id),
    title: r.title || r.name || "Untitled",
    priority: r.urgencyLevel ? (String(r.urgencyLevel).toLowerCase().includes("urgent") || String(r.urgencyLevel).toLowerCase().includes("high") ? "High Priority" : "Low Priority") : "Low Priority",
    requestType: r.categoryName || r.requestType || "General",
    pinName: r.pinName || r.pinUsername || r.pinName || "",
    pinId: String(r.pinId || r.pin_id || ""),
    region: r.location || r.region || "",
    status: r.status || "Available",
    details: r.message || r.details || "",
    views: r.view_count || 0,
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/csr/requests/open', { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch available requests');
      const payload = await res.json();
      const items = (payload.requests || []) as any[];
      setRequests(items.map(normalize));
    } catch (err) {
      console.error('Error loading requests', err);
      toast.error('Failed to load available requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/csr/locations', { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch locations');
      const payload = await res.json();
      setLocations(['All Locations', ...(payload.locations || [])]);
    } catch (err) {
      console.error('Error loading locations', err);
      toast.error('Failed to load locations');
      setLocations(['All Locations']);
    }
  };

  // Fetch interested list for the current CSR (to mark toggles)
  const fetchInterested = async () => {
    try {
      const csrId = Number(localStorage.getItem('userId')) || 0;
      if (!csrId) return;
      const res = await fetch(`/api/csr/${csrId}/interested`, { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch interested list');
      const payload = await res.json();
      const items = (payload.interestedRequests || payload.requests || []) as any[];
      const map: Record<string, boolean> = {};
      items.forEach((it) => map[String(it.requestId || it.id || it.request_id)] = true);
      setInterestedIds(map);
    } catch (err) {
      console.error('Error fetching interested list', err);
      toast.error('Failed to load your interested list');
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchLocations();
    fetchInterested();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter requests based on search query and location
  const filteredRequests = requests.filter((request) => {
    const matchesQuery = request.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         request.pinName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === "All Locations" || request.region === filterLocation;
    return matchesQuery && matchesLocation;
  });

  const openDetails = (request: Request) => setSelectedRequest(request);
  const closeDetails = () => setSelectedRequest(null);

  const toggleInterested = async (id: string) => {
    const csrId = Number(localStorage.getItem('userId')) || 0;
    if (!csrId) {
      console.warn('CSR id not found in localStorage');
      return;
    }
    const already = !!interestedIds[id];
    try {
      if (!already) {
        const res = await fetch(`/api/csr/${csrId}/interested/${id}`, { method: 'POST', credentials: 'include' });
        if (res.ok) setInterestedIds((prev) => ({ ...prev, [id]: true }));
        else {
          const body = await res.text();
          console.error('Failed to mark interested', body);
          toast.error('Failed to mark interested');
        }
      } else {
        const res = await fetch(`/api/csr/${csrId}/interested/${id}`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) setInterestedIds((prev) => { const n = { ...prev }; delete n[id]; return n; });
        else console.error('Failed to remove interested');
      }
    } catch (err) {
      console.error('Error toggling interested', err);
      toast.error('Error updating interest');
    }
  };

  return (
    <div className="available-container">
      <div className="available-top">
        <div>
        <header className="available-header"></header>
          <h1>Available Requests</h1>
          <p>Browse and offer assistance to different Persons in Need</p>
        </div>
      </div>

        <div className="available-actions">
        <input
          type="text"
          placeholder="Search by request title, description, or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-available"
        />
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="filter-available"
        >
          {locations.map((loc) => <option key={loc}>{loc}</option>)}
        </select>
        <button className="reset-available btn" onClick={() => { setFilterLocation("All Locations"); setSearchQuery(""); }}>
          Reset
        </button>
      </div>

      <div className="available-request-list">
        {loading ? <div className="loading">Loading...</div> : filteredRequests.map((request) => (
          <div key={request.id} onClick={() => openDetails(request)} className={`available-request-card ${request.priority.toLowerCase().includes("high") ? 'priority-high-card' : ''}`}>
            <span className={`available-request-priority ${request.priority.toLowerCase().includes("high") ? 'priority-high' : 'priority-low'}`}>
              {request.priority}
            </span>
            <div className="available-request-header">
              <h3 className="available-request-title">{request.title}</h3>
            </div>

            <div className="available-request-body">
              <p className="available-request-type"><strong>Request Type:</strong> {request.requestType}</p>
              <p className="available-request-pin"><strong>PIN:</strong> {request.pinName}</p>
              <p className="available-request-location"><MapPin className="icon" /> {request.region}</p>
            </div>
          </div>
        ))}
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

export default Available;
