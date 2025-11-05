import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import "./ReviewPasswordRequests.css";

// Mock request data for demonstration
interface ReviewPasswordRequestProps {
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
    status?: string;
  };
}

function ReviewPasswordRequest({ open, onClose, request }: ReviewPasswordRequestProps) {
  const [adminNotes, _setAdminNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleApprove = () => {
    setShowConfirmDialog(true);
  };

  const confirmApprove = () => {
    // Handle approval logic here
    console.log("Approved", "Notes:", adminNotes);
    setShowConfirmDialog(false);
    setShowSuccessDialog(true);
  };

  const handleBackToDashboard = () => {
    setShowSuccessDialog(false);
    onClose();
  };

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
        <p style={{ marginBottom: 20 }}><strong>Request ID:</strong> #{request.id}</p>
        <p><strong>Status:</strong> {getStatusBadge(request.status || "pending")}</p>

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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="actions">
          <div className="actions-left">
            <button onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
          <div className="actions-right">
            <button
              onClick={() => {
                setTimeout(() => {
                  console.log('Reject action');
                  onClose();
                }, 100);
              }}
              className="reject-btn"
            >
              <X className="icon" /> 
              Reject
            </button>
            <button onClick={handleApprove} className="approve-btn">
              <Check className="icon" />
              Approve
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Action Dialog */}
      {showConfirmDialog && (
        <div className="confirm-dialog">
          <div className="confirm-content">
            <h4>Confirm Action</h4>
            <p>Are you sure you want to approve this password change request?</p>
            <p><strong>Username:</strong> {request.username}</p>
            <p><strong>Request ID:</strong> #{request.id}</p>
            <div className="actions">
              <button onClick={() => setShowConfirmDialog(false)}>No, Cancel</button>
              <button onClick={confirmApprove}>Yes, Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="success-dialog">
          <div className="success-content">
            <h4>Success!</h4>
            <p>Password change request approved</p>
            <ul>
              <li>User's password has been updated</li>
              <li>Request marked as approved</li>
            </ul>
            <button onClick={handleBackToDashboard}>Back to Dashboard</button>
          </div>
        </div>
      )}
    </div>
  );
}


export default ReviewPasswordRequest;
