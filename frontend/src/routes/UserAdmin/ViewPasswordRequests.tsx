import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import "./ViewPasswordRequests.css";

// Mock request data for demonstration
interface ViewPasswordRequestProps {
  open: boolean;
  onClose: () => void;
  request: {
    id: string;
    username: string;
    email?: string;
    role?: string;
    accountStatus?: string;
    lastLogin?: string;
    requestDate: string;
    reason?: string;
    status: string;
  };
}

function ViewPasswordRequest({ open, onClose, request }: ViewPasswordRequestProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge pending">
            <Eye className="icon" />
            Pending Approval
          </span>
        );
      case "approved":
        return (
          <span className="badge approved">
            <Check className="icon" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="badge rejected">
            <X className="icon" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (!open) return null;  // Don't render if the modal isn't open

  return (
    <div className="view-modal-overlay" onClick={onClose}>
      <div className="view-modal-content" onClick={e => e.stopPropagation()}>
        <h3>View Details</h3>
        <p style={{ marginBottom: 20 }}><strong>Request ID:</strong> #{request.id}</p>
        <p><strong>Status:</strong> {getStatusBadge(request.status)}</p>

        <div className="view-user-info">
          <h4>User Information</h4>
          <p><strong>Username:</strong> {request.username}</p>
          {request.email && <p><strong>Email:</strong> {request.email}</p>}
          {request.role && <p><strong>Role:</strong> {request.role}</p>}
          {request.accountStatus && <p><strong>Account Status:</strong> {request.accountStatus}</p>}
          {request.lastLogin && <p><strong>Last Login:</strong> {request.lastLogin}</p>}
        </div>

        <div className="view-request-details">
          <h4>Request Details</h4>
          <p><strong>Request Date:</strong> {request.requestDate}</p>
          {request.reason && <p><strong>Reason:</strong> {request.reason}</p>}

          <div className="view-password-section">
            <div className="view-password-field">
              <span>New Password:</span>
              <span>{showPassword ? "SecurePass123!" : "••••••••••••"}</span>
              <button onClick={() => setShowPassword(!showPassword)} className="view-show-password">
                {showPassword ? <EyeOff className="view-icon" /> : <Eye className="view-icon" />}
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <div className="view-modal-actions">
          <button onClick={onClose} className="view-cancel-btn">Close</button>
        </div>
      </div>
    </div>
  );
}
export default ViewPasswordRequest;