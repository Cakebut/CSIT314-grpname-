import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewResetDashboard.css";
import { toast } from 'react-toastify';

interface PasswordResetRequest {
  id: number;
  user_id: number;
  new_password: string;
  status: string;
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: number;
  rejection_reason?: string;
  username?: string;
  user_role?: string;
  account_status?: string;
  admin_name?: string;
  admin_note?: string;
}

const statusColors: Record<string, string> = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
};

// Utility function for POST requests using fetch
async function postData(url: string, data: object) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return res;
}

export default function AdminPasswordResetDashboard() {
   
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [adminId, setAdminId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve admin user ID and name from localStorage
    const storedId = localStorage.getItem('userId');
    const storedName = localStorage.getItem('username');
    setAdminId(storedId ? Number(storedId) : null);
    setAdminName(storedName ? storedName : null);
    // Optionally store admin name for use in requests
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const res = await fetch("/api/userAdmin/password-reset-requests");
      const data = await res.json();
      console.log('Fetched requests:', data.requests); // Debug log
      setRequests(data.requests || []);
    } catch {
      // handle error
    }
  }

  function filteredRequests() {
    return requests.filter(r =>
      (!search || (r.username && r.username.toLowerCase().includes(search.toLowerCase()))) &&
      (!statusFilter || r.status === statusFilter)
    );
  }

  async function handleApprove(request: PasswordResetRequest) {
    
    if (!adminNote) {
      toast.error('Please enter admin notes before approving.');
      return;
    }
    if (!adminId || !adminName) {
      toast.error(`Admin ID: ${adminId}, Admin Name: ${adminName}`);
      return;
    }
    await postData("/api/userAdmin/password-reset-approve", {
      requestId: request.id,
      adminId: adminId,
      adminName,
      note: adminNote,
    });
    toast.success('Password reset request approved!');
    setSelectedRequest(null);
    setAdminNote("");
    fetchRequests();
  }

  async function handleReject(request: PasswordResetRequest) {
    if (!adminNote) {
      toast.error('Please enter admin notes before rejecting.');
      return;
    }
    if (!adminId || !adminName) {
      toast.error('Admin ID or Admin Name missing. Please log in again.');
      return;
    }
    await postData("/api/userAdmin/password-reset-reject", {
      requestId: request.id,
      adminId: adminId,
      adminName,
      note: adminNote,
    });
    toast.info('Password reset request rejected.');
    setSelectedRequest(null);
    setAdminNote("");
    fetchRequests();
  }


  // Clear all password reset requests
  async function handleClearLogs() {
    const res = await postData("/api/userAdmin/password-reset-clear", {});
    if (res.ok) {
      toast.success("All password reset requests cleared.");
      fetchRequests();
    } else {
      toast.error("Failed to clear logs.");
    }
  }

  return (
    <div className="password-reset-dashboard">
                    <button className="dashboard-btn" onClick={() => navigate('/useradmin/')}>Return to Dashboard</button>
      <h2>Password Change Requests</h2>
      <p>Review and manage user password change requests</p>
      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="Search username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button onClick={() => { setSearch(""); setStatusFilter(""); }}>Reset</button>
        <button className="clear-logs-btn" onClick={handleClearLogs}>Clear Logs</button>
        <div className="pending-count">
          <span>🕒 {requests.filter(r => r.status === "Pending").length} Pending</span>
        </div>
      </div>
      <table className="requests-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Request Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests().length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '1.1rem', padding: '2rem 0' }}>
                No Password Reset Request Table
              </td>
            </tr>
          ) : (
            filteredRequests().map(r => (
              <tr key={r.id}>
                <td>{String(r.id).padStart(3, "0")}</td>
                <td>{r.username || r.user_id}</td>
                <td>{new Date(r.requested_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${statusColors[r.status] || ""}`}>{r.status}</span>
                </td>
                <td>
                  <button onClick={() => setSelectedRequest(r)}>
                    {r.status === "Pending" ? "Review" : "View Details"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {selectedRequest && (
        <div className="request-modal">
          <div className="modal-content">
            <button className="close-btn" onClick={() => setSelectedRequest(null)}>&times;</button>
            <h3>Review Password Change Request</h3>
            <div className="modal-section">
              <div><b>Request ID:</b> #{String(selectedRequest.id).padStart(3, "0")}</div>
              <div><b>Status:</b> <span className={`status-badge ${statusColors[selectedRequest.status] || ""}`}>{selectedRequest.status}</span></div>
            </div>
            <div className="modal-section">
              <div><b>User Information</b></div>
               <div>User ID: {selectedRequest.user_id}</div>
              <div>Username: {selectedRequest.username }</div>
              <div>Email: user@email.com</div>
              <div>User Role: {selectedRequest.user_role || 'N/A'}</div>
              <div>Account Status: {selectedRequest.account_status || 'Unknown'}</div>
              <div>Last Login: Oct 28, 2025 at 3:45 PM</div>
            </div>
            <div className="modal-section">
              <div><b>Request Details</b></div>
              <div>Request Date: {new Date(selectedRequest.requested_at).toLocaleString()}</div>
              <div>Request Type: Password Change</div>
              <div>Reason: Forgot password</div>
              <div>New Password: <input type="text" value={selectedRequest.new_password} readOnly /></div>
              <div>Password Strength: <span className="strong">Strong</span></div>
              <div>✔ Meets all security requirements</div>
            </div>
            {/* Admin Notes section for Pending requests only */}
            {selectedRequest.status === 'Pending' && (
              <div className="modal-section">
                <div><b>Admin Notes (Optional):</b></div>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Add any notes about this decision..."
                />
              </div>
            )}
            {/* Admin review info for Approved/Rejected requests only */}
            {selectedRequest.status !== 'Pending' && (
              <div className="modal-section">
                <div><b>Admin ID:</b> {selectedRequest.reviewed_by || 'N/A'}</div>
                <div><b>Admin Name:</b> {selectedRequest.admin_name || 'N/A'}</div>
                <div><b>Reviewed At:</b> {selectedRequest.reviewed_at ? new Date(selectedRequest.reviewed_at).toLocaleString() : 'N/A'}</div>
                <div><b>Admin Notes:</b> {selectedRequest.rejection_reason || selectedRequest.admin_note || 'None'}</div>
              </div>
            )}
            <div className="modal-actions">
 
              {selectedRequest.status === "Pending" ? (
                <>
                  <button className="reject-btn" onClick={() => handleReject(selectedRequest)}>Reject Request</button>
                  <button className="approve-btn" onClick={() => handleApprove(selectedRequest)}>Approve</button>
                </>
              ) : (
                <button onClick={() => setSelectedRequest(null)}>Close</button>
              )}
              <button className="cancel-btn" onClick={() => setSelectedRequest(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
