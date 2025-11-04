import React, { useState } from "react";
import { Bell, Check, X, Eye, Edit } from "lucide-react";
import ReviewPasswordRequest from "./ReviewPasswordRequests"; // Import the modal component
import "./AdminPasswordRequests.css";

interface PasswordRequest {
  id: string;
  username: string;
  requestDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

const initialRequests: PasswordRequest[] = [
  { id: "001", username: "john_doe", requestDate: "Oct 29, 2025", status: "Pending" },
  { id: "002", username: "jane_smith", requestDate: "Oct 28, 2025", status: "Pending" },
  { id: "003", username: "bob_wilson", requestDate: "Oct 27, 2025", status: "Approved" },
  { id: "004", username: "alice_jones", requestDate: "Oct 26, 2025", status: "Rejected" },
  { id: "005", username: "mike_brown", requestDate: "Oct 25, 2025", status: "Approved" },
];

const AdminPasswordRequests: React.FC = () => {
  const [requests, setRequests] = useState<PasswordRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal visibility
  const [currentRequest, setCurrentRequest] = useState<PasswordRequest | null>(null); // Store the current request to be reviewed

  const handleViewDetails = (id: string) => {
    alert(`View details for request ID: ${id}`);
  };

  const handleReviewRequest = (id: string) => {
    // Find the request from the list to pass it to the modal
    const requestToReview = requests.find((request) => request.id === id);
    if (requestToReview) {
      setCurrentRequest(requestToReview); // Set the selected request
      setIsModalOpen(true); // Open the modal
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesUsername = request.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All Status" || request.status === filterStatus;
    return matchesUsername && matchesStatus;
  });

  const statusCounts = {
    Pending: requests.filter((r) => r.status === "Pending").length,
    Approved: requests.filter((r) => r.status === "Approved").length,
    Rejected: requests.filter((r) => r.status === "Rejected").length,
  };

  return (
    <div className="password-requests-container">
      <header className="header">
        <h1>Password Change Requests</h1>
        <p>Review and manage user password change requests</p>
        <div className="actions">
          <input
            type="text"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <button className="reset-btn" onClick={() => { setSearchQuery(""); setFilterStatus("All Status"); }}>
            Reset
          </button>
          <div className="status-badge-container">
            <span className="status-badge pending">{statusCounts.Pending} Pending</span>
          </div>
        </div>
      </header>

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
          {filteredRequests.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.username}</td>
              <td>{request.requestDate}</td>
              <td>
                <span className={`status ${request.status.toLowerCase()}`}>{request.status}</span>
              </td>
              <td>
                <button className="view-btn" onClick={() => handleViewDetails(request.id)}>
                  <Eye className="icon" /> View Details
                </button>
                {request.status === "Pending" && (
                  <button className="review-btn" onClick={() => handleReviewRequest(request.id)}>
                    <Edit className="icon" /> Review
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for reviewing password requests */}
      {isModalOpen && currentRequest && (
        <ReviewPasswordRequest
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          request={currentRequest}
        />
      )}
    </div>
  );
};

export default AdminPasswordRequests;
