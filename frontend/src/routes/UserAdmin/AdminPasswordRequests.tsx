import React, { useState } from "react";
import { Eye, Edit } from "lucide-react";
import ReviewPasswordRequest from "./ReviewPasswordRequests"; // Import the modal component
import ViewPasswordRequest from "./ViewPasswordRequests"; // View-only modal
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
  const [requests] = useState<PasswordRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the review modal visibility
  const [currentRequest, setCurrentRequest] = useState<PasswordRequest | null>(null); // Store the current request to be reviewed
  const [isViewOpen, setIsViewOpen] = useState(false); // State to control the view modal visibility
  const [currentViewRequest, setCurrentViewRequest] = useState<PasswordRequest | null>(null); // Store request for view-only modal

  const handleViewDetails = (id: string) => {
    const requestToView = requests.find((r) => r.id === id);
    if (requestToView) {
      setCurrentViewRequest(requestToView);
      setIsViewOpen(true);
    }
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

  // Split into Pending and Processed (Approved + Rejected)
  const pendingRequests = filteredRequests.filter((r) => r.status === "Pending");
  const processedRequests = filteredRequests.filter((r) => r.status !== "Pending");

  return (
    <div className="password-requests-container">

        <div className="password-requests-top">
          <div>
          <header className="password-requests-header"></header>
            <h1>Password Change Requests</h1>
            <p>Review and manage user password change requests</p>
          </div>
        </div>
        <div className="password-requests-actions">
          <input
            type="text"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-password-requests"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-password-requests"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
          <button className="reset-password-requests btn" onClick={() => { setSearchQuery(""); setFilterStatus("All Status"); }}>
            Reset
          </button>
        </div>

      <h2 style={{ marginTop: 20 }}>Pending Requests</h2>
      <table className="password-requests-table">
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
          {pendingRequests.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.username}</td>
              <td>{request.requestDate}</td>
              <td>
                <span className={`password-requests-status ${request.status.toLowerCase()}`}>{request.status}</span>
              </td>
              <td>
                {/* <button className="view-password-requests" onClick={() => handleViewDetails(request.id)}>
                  <Eye className="icon" /> View Details
                </button> */}
                <button className="review-password-requests" onClick={() => handleReviewRequest(request.id)}>
                  <Edit className="icon" /> Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 28 }}>Processed Requests</h2>
      <table className="password-requests-table">
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
          {processedRequests.map((request) => (
            <tr key={request.id}>
              <td>{request.id}</td>
              <td>{request.username}</td>
              <td>{request.requestDate}</td>
              <td>
                <span className={`password-requests-status ${request.status.toLowerCase()}`}>{request.status}</span>
              </td>
              <td>
                <button className="view-password-requests" onClick={() => handleViewDetails(request.id)}>
                  <Eye className="icon" /> View Details
                </button>
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
      {/* View-only modal for details */}
      {isViewOpen && currentViewRequest && (
        <ViewPasswordRequest
          open={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          request={currentViewRequest}
        />
      )}
    </div>
  );
};

export default AdminPasswordRequests;
