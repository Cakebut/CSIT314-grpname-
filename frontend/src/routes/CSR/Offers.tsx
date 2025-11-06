import React, { useState } from "react";
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
    status: "Pending",
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
    status: "Pending",
  },
];

const Offers: React.FC = () => {
  const [offersRequests, setOffersRequests] = useState<Request[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [interestedIds, setInterestedIds] = useState<Record<string, boolean>>(() => {
    // mark all currently-offered requests as interested by default
    const map: Record<string, boolean> = {};
    initialRequests.forEach((r) => { map[r.id] = true; });
    return map;
  });
  const [awaitingIds, setAwaitingIds] = useState<Record<string, boolean>>({});

  const openDetails = (request: Request) => setSelectedRequest(request);
  const closeDetails = () => setSelectedRequest(null);
  const toggleInterested = (id: string) => {
    setInterestedIds((prev) => ({ ...prev, [id]: !prev[id] }));

  };

  const handleReject = (id?: string) => {
    if (!id) return;
    // remove the offer from the Offers list (sent back to All Requests)
    setOffersRequests((prev) => prev.filter((r) => r.id !== id));
    closeDetails();
  };

  const handleAccept = (id?: string) => {
    if (!id) return;
    // mark this offer as awaiting confirmation and keep modal open showing the waiting message
    setAwaitingIds((prev) => ({ ...prev, [id]: true }));
    // optionally update the item's status to indicate it's in progress
    setOffersRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Pending' } : r));
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
