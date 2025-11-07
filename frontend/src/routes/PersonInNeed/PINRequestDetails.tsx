import React from "react";
import { X} from "lucide-react";
import "./pinRequestDetails.css";

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

const PINRequestDetails: React.FC<Props> = ({ request, open, onClose }) => {
 

  if (!open) return null;

  const statusClass = (request.status ?? 'Available').toLowerCase();

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="pin-modal-overlay" onMouseDown={handleClose}>
      <div className="pin-modal" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="pin-modal-close" onClick={handleClose} aria-label="Close">
          <X />
        </button>

        <div className="pin-modal-header">
          <h2 className="pin-modal-title">{request.title}</h2>
          <div className="pin-modal-status">
            <span className={`pin-status-left ${statusClass}`}>{request.status ?? 'Available'}</span>
            <span className={`pin-status-right ${request.priority.toLowerCase().includes('high') ? 'priority-high' : 'priority-low'}`}>
              {request.priority}
            </span>
          </div>
        </div>

        <div className="pin-modal-body">
          <div className="pin-field"><strong>Request Type:</strong> {request.requestType}</div>
          <div className="pin-field"><strong>pin:</strong> {request.pinName} ({request.pinId})</div>
          <div className="pin-field"><strong>Location:</strong> {request.region}</div>
          <div className="pin-field"><strong>Further Details:</strong>
            <p className="pin-details">{request.details ?? 'No further details provided.'}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PINRequestDetails;
