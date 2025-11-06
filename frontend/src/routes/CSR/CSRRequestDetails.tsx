import React, { useState } from "react";
import { X, Heart, Check, Send } from "lucide-react";
import "./CSRRequestDetails.css";

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
}

interface Props {
  request: Request;
  open: boolean;
  onClose: () => void;
  interested: boolean;
  onToggleInterested: () => void;
  // When rendered from Offers, show decision buttons instead of interested control
  showDecisionButtons?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  awaitingConfirmation?: boolean;
  onOfferHelp?: () => void;
}

const CSRRequestDetails: React.FC<Props> = ({ request, open, onClose, interested, onToggleInterested, showDecisionButtons, onAccept, onReject, awaitingConfirmation, onOfferHelp }) => {
  const [awaitingOffer, setAwaitingOffer] = useState(false);

  if (!open) return null;

  const statusClass = (request.status ?? 'Available').toLowerCase();

  const handleClose = () => {
    setAwaitingOffer(false);
    onClose();
  };

  const handleOfferHelp = () => {
    setAwaitingOffer(true);
    if (onOfferHelp) onOfferHelp();
  };

  return (
    <div className="csr-modal-overlay" onMouseDown={handleClose}>
      <div className="csr-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="csr-modal-close" onClick={handleClose} aria-label="Close">
          <X />
        </button>

        <div className="csr-modal-header">
          <h2 className="csr-modal-title">{request.title}</h2>
          <div className="csr-modal-status">
            <span className={`csr-status-left ${statusClass}`}>{request.status ?? 'Available'}</span>
            <span className={`csr-status-right ${request.priority.toLowerCase().includes('high') ? 'priority-high' : 'priority-low'}`}>
              {request.priority}
            </span>
          </div>
        </div>

        <div className="csr-modal-body">
          <div className="csr-field"><strong>Request Type:</strong> {request.requestType}</div>
          <div className="csr-field"><strong>PIN:</strong> {request.pinName} ({request.pinId})</div>
          <div className="csr-field"><strong>Location:</strong> {request.region}</div>
          <div className="csr-field"><strong>Further Details:</strong>
            <p className="csr-details">{request.details ?? 'No further details provided.'}</p>
          </div>
        </div>

        <div className="csr-modal-actions">
          {showDecisionButtons ? (
            awaitingConfirmation ? (
              <div className="csr-waiting">Waiting for confirmation...</div>
            ) : (
              <div className="csr-decision-buttons">

                <button className="csr-reject" onClick={onReject}>
                  <X className="icon" /> Reject
                </button>
                <button className="csr-accept" onClick={onAccept}>
                  <Check className="icon" /> Accept
                </button>
    
              </div>
            )
          ) : (
            awaitingOffer ? (
              <div className="csr-waiting">Waiting for confirmation...</div>
            ) : (
              <div className="csr-interest-offer">
                <button className={`csr-interested ${interested ? 'active' : ''}`} onClick={onToggleInterested}>
                  <Heart className={`icon ${interested ? 'filled' : ''}`} /> {interested ? 'Remove Interested' : 'Mark as Interested'}
                </button>
                <button className="csr-offer-help" onClick={handleOfferHelp}>
                  <Send className="icon" /> Offer Help
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CSRRequestDetails;
