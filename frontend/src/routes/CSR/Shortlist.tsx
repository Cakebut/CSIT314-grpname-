import React, { useState } from "react";
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
  views: number;
  status?: "Available" | "Pending" | "Completed";
  details?: string;
}

const initialRequests: Request[] = [
  {
    id: "REQ-009",
    title: "Medical Appointment Companion",
    priority: "High Priority",
    requestType: "Medical",
    pinName: "Iris Lim",
    pinId: "PIN-8901",
    region: "Central Region",
    views: 18,
  },
  {
    id: "REQ-010",
    title: "Technology Tutoring",
    priority: "Low Priority",
    requestType: "Tutoring",
    pinName: "Jack Wong",
    pinId: "PIN-4568",
    region: "South Region",
    views: 6,
  },
];

const Shortlist: React.FC = () => {
  const [shortlistedRequests] = useState<Request[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [interestedIds, setInterestedIds] = useState<Record<string, boolean>>(() => {
    // mark all currently-shortlisted requests as interested by default
    const map: Record<string, boolean> = {};
    initialRequests.forEach((r) => { map[r.id] = true; });
    return map;
  });

  // const handleDelete = (requestId: string) => {
  //   setShortlistedRequests((prev) => prev.filter((r) => r.id !== requestId));
  // };

  const openDetails = (request: Request) => setSelectedRequest(request);
  const closeDetails = () => setSelectedRequest(null);
  const toggleInterested = (id: string) => {
    setInterestedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="shortlist-container">
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

                {/* <button
                  type="button"
                  className="shortlist-delete-button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(request.id); }}
                >
                  <Trash2 className="icon" /> Delete
                </button> */}
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
