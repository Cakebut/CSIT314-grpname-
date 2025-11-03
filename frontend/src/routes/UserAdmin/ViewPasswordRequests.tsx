import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import "./ReviewPasswordRequests.css";

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>Review Password Change Request</h3>
        <p><strong>Request ID:</strong> #{request.id}</p>
        <p><strong>Status:</strong> {getStatusBadge(request.status)}</p>

        <div className="user-info">
          <h4>User Information</h4>
          <p><strong>Username:</strong> {request.username}</p>
          {request.email && <p><strong>Email:</strong> {request.email}</p>}
          {request.role && <p><strong>Role:</strong> {request.role}</p>}
          {request.accountStatus && <p><strong>Account Status:</strong> {request.accountStatus}</p>}
          {request.lastLogin && <p><strong>Last Login:</strong> {request.lastLogin}</p>}
        </div>

        <div className="request-details">
          <h4>Request Details</h4>
          <p><strong>Request Date:</strong> {request.requestDate}</p>
          <p><strong>Request Type:</strong> Password Change</p>
          {request.reason && <p><strong>Reason:</strong> {request.reason}</p>}

          <div className="password-section">
            <div className="password-field">
              <span>New Password:</span>
              <span>{showPassword ? "SecurePass123!" : "••••••••••••"}</span>
              <button onClick={() => setShowPassword(!showPassword)} className="show-password">
                {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="password-strength">
              <span>Password Strength:</span>
              <div className="progress-bar">
                <div className="strength" style={{ width: "85%" }}></div>
              </div>
              <span>Strong</span>
            </div>
            <div className="password-check">
              <Check className="icon" />
              <span>Meets all security requirements</span>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
export default ViewPasswordRequest;