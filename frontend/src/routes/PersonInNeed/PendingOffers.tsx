import React, { useState } from "react";
import { MapPin, X, Check } from "lucide-react"; // Importing icons for location and actions
import "./PendingOffers.css";

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
  const [offersRequests] = useState<Request[]>(initialRequests);
  // no modal usage: interested state removed
  // no awaitingIds/modal handlers required here
  // Interested offers list shown in the table below (sample data)
  interface OfferRow { id: string; csrId: string; requestId: string; timestamp: string; status: 'Pending' | 'Accepted' | 'Rejected' }
  const [interestedOffers, setInterestedOffers] = useState<OfferRow[]>(() => [
    // Multiple sample CSR offers for request REQ-009
    { id: 'OFFER-001', csrId: 'CSR-101', requestId: initialRequests[0].id, timestamp: '2025-11-06 10:12', status: 'Pending' },
    { id: 'OFFER-003', csrId: 'CSR-103', requestId: initialRequests[0].id, timestamp: '2025-11-06 10:45', status: 'Pending' },
    { id: 'OFFER-004', csrId: 'CSR-104', requestId: initialRequests[0].id, timestamp: '2025-11-06 11:20', status: 'Pending' },
    // Multiple sample CSR offers for request REQ-010
    { id: 'OFFER-002', csrId: 'CSR-102', requestId: initialRequests[1].id, timestamp: '2025-11-06 11:05', status: 'Pending' },
    { id: 'OFFER-005', csrId: 'CSR-105', requestId: initialRequests[1].id, timestamp: '2025-11-06 12:30', status: 'Pending' },
  ]);
  // toggleInterested removed because modal interactions are not used here

  const acceptInterestedOffer = (offerId: string) => {
    // mark as awaiting confirmation and wait for external confirmation.
    // Previously we auto-marked accepted after 2s — removing that so awaiting state persists
    // until an external confirmation (or another action) updates it.
    setAwaitingOffers((prev) => ({ ...prev, [offerId]: true }));
  };

  const rejectInterestedOffer = (offerId: string) => {
    setInterestedOffers((prev) => prev.filter(o => o.id !== offerId));
  };

  const [awaitingOffers, setAwaitingOffers] = useState<Record<string, boolean>>({});

  return (
    <div className="pending-offers-container">
      <div className="pending-offers-top">
        <div>
        <header className="pending-offers-header"></header>
          <h1>Pending Offers For You</h1>
          <p>Browse and track any ongoing pending offers offered by CSR Representatives</p>
        </div>
      </div>

      <div className="pending-offers-content">
        {offersRequests.length === 0 ? (

          <div className="pending-offers-empty-state">
            <p>No offers available.</p>
            <p>Check back later for any updates.</p>
          </div>

        ) : (

          <div className="pending-offers-list">
            {offersRequests.map((request) => (
              <div key={request.id} className={`pending-offers-card ${request.priority.toLowerCase().includes("high") ? 'priority-high-card' : ''}`}>
                <span className={`pending-offers-priority ${request.priority.toLowerCase().includes("high") ? 'priority-high' : 'priority-low'}`}>
                  {request.priority}
                </span>
                <div className="pending-offers-header">
                  <h3 className="pending-offers-title">{request.title}</h3>
                </div>
                <div className="pending-offers-body">
                  <p className="pending-offers-type"><strong>Request Type:</strong> {request.requestType ?? 'General'}</p>
                  <div className="pending-offers-location"><strong>Location:</strong> {request.region}</div>
                  <div className="pending-offers-field"><strong>Further Details:</strong>
                     <p className="pending-offers-details">{request.details ?? 'No further details provided.'}</p>
                  </div>

                  {interestedOffers.filter(o => o.requestId === request.id).length > 0 && (
                    <table className="pending-offers-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th>CSR ID</th>
                          <th>Offered At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interestedOffers.filter(o => o.requestId === request.id).map((offer) => (
                          <tr key={offer.id} className={offer.status.toLowerCase()}>
                            <td style={{ padding: 20 }}>{offer.csrId}</td>
                            <td style={{ padding: 20 }}>{offer.timestamp}</td>
                            <td style={{ padding: 20 }}>
                              {awaitingOffers[offer.id] ? (
                                <div className="pending-offer-waiting">Waiting for confirmation...</div>
                              ) : (
                                <div className="pending-offer-decision-buttons">
                                  <button className="pending-offer-reject" onClick={() => rejectInterestedOffer(offer.id)}>
                                      <X className="icon" /> Reject
                                    </button>
                                    <button className="pending-offer-accept" onClick={() => acceptInterestedOffer(offer.id)} disabled={offer.status === 'Accepted'}>
                                      <Check className="icon" /> Accept
                                    </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Offers;
