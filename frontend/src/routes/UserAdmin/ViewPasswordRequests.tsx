import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import "./ViewPasswordRequests.css";

type PasswordRequest = {
  id: number;
  user_id?: number;
  username?: string;
  new_password?: string;
  status?: string; // Pending | Approved | Rejected
  requested_at?: string;
  reviewed_at?: string;
  reviewed_by?: number;
  admin_note?: string;
  user_role?: string;
  account_status?: string;
  admin_name?: string;
};

interface ViewPasswordRequestProps {
  open: boolean;
  onClose: () => void;
  request: PasswordRequest;
  onUpdated?: () => void; // optional callback when approve/reject completes
}

function ViewPasswordRequest({ open, onClose, request, onUpdated }: ViewPasswordRequestProps) {
  const [adminNotes, setAdminNotes] = useState<string>(request.admin_note ?? "");
  const [localRequest, setLocalRequest] = useState<PasswordRequest>(request);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [actionResult, setActionResult] = useState<'approved' | 'rejected' | null>(null);
  const [busy, setBusy] = useState(false);

  const getStatusBadge = (status?: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return (
          <span className="view-password-badge pending">
            <Eye className="icon" />
            Pending Approval
          </span>
        );
      case "approved":
        return (
          <span className="view-password-badge approved">
            <Check className="icon" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="view-password-badge rejected">
            <X className="icon" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // don't early-return here (hooks must run); we'll check `open` before rendering below

  // read admin info from localStorage (set by login flow elsewhere)
  const adminId = Number(localStorage.getItem("userId") || 0);
  const adminName = localStorage.getItem("username") || "";

  // keep localRequest in sync when parent provides a new request
  useEffect(() => {
    setLocalRequest(request);
    setAdminNotes(request.admin_note ?? "");
    setActionResult(null);
    setShowConfirmDialog(false);
    setShowSuccessDialog(false);
  }, [request]);

  // Determine whether the admin notes field should be editable.
  const notesEditable = (localRequest.status || "").toLowerCase() === "pending" && !showSuccessDialog && !busy;

  const approve = async () => {
    if (!adminNotes) {
      alert("Please add admin notes before approving.");
      return;
    }
    if (!adminId || !adminName) {
      alert("Admin identity not found. Please log in again.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/userAdmin/password-reset-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId: request.id, adminId, adminName, note: adminNotes }),
      });
      if (!res.ok) throw new Error(`Approve failed: ${res.status}`);
    setShowConfirmDialog(false);
    // update local copy so UI reflects reviewer and timestamp
    const now = new Date().toISOString();
    setLocalRequest({ ...localRequest, status: 'Approved', reviewed_by: adminId, admin_name: adminName, reviewed_at: now, admin_note: adminNotes });
    setActionResult('approved');
    setShowSuccessDialog(true);
    if (onUpdated) onUpdated();
      } catch (err) {
        console.error(err);
        alert('Failed to approve request');
      } finally {
        setBusy(false);
      }
    };

  const reject = async () => {
    if (!adminNotes) {
      alert("Please add admin notes before rejecting.");
      return;
    }
    if (!adminId || !adminName) {
      alert("Admin identity not found. Please log in again.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/userAdmin/password-reset-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId: request.id, adminId, adminName, note: adminNotes }),
      });
    if (!res.ok) throw new Error(`Reject failed: ${res.status}`);
    // update local copy so UI reflects reviewer and timestamp
    const now = new Date().toISOString();
    setLocalRequest({ ...localRequest, status: 'Rejected', reviewed_by: adminId, admin_name: adminName, reviewed_at: now, admin_note: adminNotes });
    if (onUpdated) onUpdated();
    // show a small success/rejection dialog and lock the notes
    setActionResult('rejected');
    setShowSuccessDialog(true);
      } catch (err) {
        console.error(err);
        alert('Failed to reject request');
      } finally {
        setBusy(false);
      }
    };

  // Removed 'Back to Dashboard' action — success dialog will close the modal instead
  if (!open) return null;

  return (
    <div className="view-password-modal-overlay" onClick={onClose}>
      <div className="view-password-modal-content" onClick={e => e.stopPropagation()}>
        <h3>Review Password Change Request</h3>
        <p style={{ marginBottom: 20 }}><strong>Request ID:</strong> #{String(request.id).padStart(3, '0')}</p>
        <p><strong>Status:</strong> {getStatusBadge(request.status)}</p>

        <div className="view-passworduser-info">
          <h4>User Information</h4>
          <p><strong>Username:</strong> {request.username}</p>
          {request.user_role && <p><strong>Role:</strong> {request.user_role}</p>}
          {request.account_status && <p><strong>Account Status:</strong> {request.account_status}</p>}
          {request.requested_at && <p><strong>Requested At:</strong> {new Date(request.requested_at).toLocaleString()}</p>}
          {/* Reviewed meta: show reviewer and timestamp if present in the localRequest */}
          {localRequest?.admin_name && (
            <p><strong>Reviewed By:</strong> {localRequest.admin_name}</p>
          )}
          {localRequest?.reviewed_at && (
            <p><strong>Reviewed At:</strong> {new Date(localRequest.reviewed_at).toLocaleString()}</p>
          )}
        </div>

        <div className="view-password-request-details">
          <h4>Request Details</h4>
          {request.requested_at && <p><strong>Request Date:</strong> {new Date(request.requested_at).toLocaleString()}</p>}
          {request.new_password && (
            <div className="view-password-section">
              <div className="view-password-field">
                <span>New Password:</span>
                <span>{showPassword ? request.new_password : "••••••••••••"}</span>
                <button onClick={() => setShowPassword(!showPassword)} className="show-password">
                  {showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Notes */}
        <div style={{ marginTop: 12 }}>
          <label><strong>Admin Notes</strong></label>
          <textarea
            value={adminNotes}
            onChange={e => { if (notesEditable) setAdminNotes(e.target.value); }}
            placeholder="Add notes for the audit log"
            rows={4}
            style={{ width: '100%', padding: 8 }}
            readOnly={!notesEditable}
            aria-readonly={!notesEditable}
          />
        </div>

        {/* Action Buttons */}
        <div className="view-password-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <div style={{ marginRight: 'auto' }}>
            <button onClick={onClose} className="cancel-view-password">Cancel</button>
          </div>
          <div>
            <button
              onClick={() => reject()}
              className="reject-view-password"
              disabled={busy || request.status?.toLowerCase() !== 'pending'}
              style={{ marginLeft: 8 }}
            >
              <X className="icon" /> Reject
            </button>
            <button
              onClick={async () => { setShowConfirmDialog(true); }}
              className="approve-view-password"
              disabled={busy || request.status?.toLowerCase() !== 'pending'}
            >
              <Check className="icon" /> Approve
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Action Dialog */}
      {showConfirmDialog && (
        <div className="view-password-confirm-dialog">
          <div className="view-password-confirm-content">
            <h4>Confirm Action</h4>
            <p>Are you sure you want to approve this password change request?</p>
            <p><strong>Username:</strong> {request.username}</p>
            <p><strong>Request ID:</strong> #{String(request.id).padStart(3, '0')}</p>
            <div className="view-password-actions">
              <button onClick={() => setShowConfirmDialog(false)}>No, Cancel</button>
              <button onClick={approve}>Yes, Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="view-password-success-dialog">
          <div className="view-password-success-content">
            {actionResult === 'approved' ? (
              <>
                <h4>Success!</h4>
                <p>Password change request approved</p>
                <ul>
                  <li>User's password has been updated</li>
                  <li>Request marked as approved</li>
                </ul>
              </>
            ) : (
              <>
                <h4>Rejected</h4>
                <p>The password change request has been rejected.</p>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => { setShowSuccessDialog(false); onClose(); }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewPasswordRequest;