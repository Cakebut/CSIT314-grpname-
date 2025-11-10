import { useEffect, useState } from "react";
import "./ViewResetDashboardPage.css";
import ViewPasswordRequest from "./ViewPasswordRequestsModal";
import ReviewPasswordRequest from "./PasswordRequestsDetails";
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

export default function ViewResetDashboardPage() {
   
   
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);

  useEffect(() => {
    // fetch requests
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

  // approve/reject are handled inside the modal component `ViewPasswordRequest`.


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
    <div className="password-reset-container">
 
      <div className="password-reset-top">
        <div>
          <header className="password-reset-header"></header>
          <h1>Password Change Requests</h1>
          <p>Review and manage user password change requests</p>
        </div>
      </div>

      <div className="dashboard-controls">
        <input
          type="text"
          placeholder="Search username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-password-reset"
        />

        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="filter-password-reset">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button className="reset-password-reset btn"onClick={() => { setSearch(""); setStatusFilter(""); }}>Reset</button>
        <button className="clear-logs-btn btn" onClick={handleClearLogs}>Clear Logs</button>
        
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
        selectedRequest.status === "Pending" ? (
          <ViewPasswordRequest
            open={true}
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onUpdated={fetchRequests}
            />
          ) : (
          <ReviewPasswordRequest
            open={true}
            onClose={() => setSelectedRequest(null)}
            request={{
              id: String(selectedRequest.id),
              username: selectedRequest.username || String(selectedRequest.user_id),
              email: undefined,
              role: selectedRequest.user_role,
              accountStatus: selectedRequest.account_status,
              lastLogin: undefined,
              new_password: selectedRequest.new_password,
              requestDate: selectedRequest.requested_at,
              reason: selectedRequest.admin_note,
              status: selectedRequest.status,
            }}
          />
          )
        )}
    </div>
  );
}
