import React, { useState } from "react";
import { Edit, Trash2, Heart } from "lucide-react";  // Added Heart icon for Shortlist
import "./MyRequests.css";

// Interface for each request
interface Request {
  id: string;
  title: string;
  description: string;
  submittedDate: string;
  status: "Available" | "Pending" | "Completed";
  csrOffersCount: number; // Number of CSR offers pending for the request
  urgencyStatus: "High Priority" | "Low Priority"; // Urgency status
  shortlistCount: number; // Number of shortlists for this request
}

const initialRequests: Request[] = [
  {
    id: "REQ-001",
    title: "Technical Support",
    description: "Need help setting up the new software",
    submittedDate: "25/10/2024",
    status: "Available",
    csrOffersCount: 1,
    urgencyStatus: "High Priority",
    shortlistCount: 2,
  },
  {
    id: "REQ-002",
    title: "Account Setup Assistance",
    description: "Help needed with initial account setup and verification",
    submittedDate: "24/10/2024",
    status: "Available",
    csrOffersCount: 2,
    urgencyStatus: "Low Priority",
    shortlistCount: 1,
  },
  {
    id: "REQ-003",
    title: "Data Migration Support",
    description: "Assistance required for migrating data from old system",
    submittedDate: "23/10/2024",
    status: "Available",
    csrOffersCount: 1,
    urgencyStatus: "High Priority",
    shortlistCount: 0,
  },
  {
    id: "REQ-004",
    title: "Training Session Request",
    description: "Need training on system features and best practices",
    submittedDate: "22/10/2024",
    status: "Available",
    csrOffersCount: 3,
    urgencyStatus: "Low Priority",
    shortlistCount: 5,
  },
];

const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Handle deleting a request
  const handleDelete = (id: string) => {
    setRequests((prevRequests) => prevRequests.filter((request) => request.id !== id));
  };

  // Handle editing a request (this will just show an alert for now)
  const handleEdit = (id: string) => {
    alert(`Editing request with ID: ${id}`);
  };

  // Handle shortlist count
  const handleShortlist = (id: string) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, shortlistCount: request.shortlistCount + 1 } : request
      )
    );
  };

  // Filter requests based on search query and status
  const filteredRequests = requests.filter((request) => {
    const matchesUsername = request.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "All" || request.status === filterStatus;
    return matchesUsername && matchesStatus;
  });

  const statusCounts = {
    All: requests.length,
    Available: requests.filter((r) => r.status === "Available").length,
    Pending: requests.filter((r) => r.status === "Pending").length,
    Completed: requests.filter((r) => r.status === "Completed").length,
  };

  return (
    <div className="my-requests-container">
      <header className="header">
        <h1>All Requests</h1>
        <p>View your submitted help requests by status</p>
        <div className="actions">
          <input
            type="text"
            placeholder="Search by request ID, title, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option>All ({statusCounts.All})</option>
            <option>Available ({statusCounts.Available})</option>
            <option>Pending ({statusCounts.Pending})</option>
            <option>Completed ({statusCounts.Completed})</option>
          </select>
          <button
            className="reset-btn"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("All");
            }}
          >
            Reset
          </button>
        </div>
      </header>

      <div className="request-list">
        {filteredRequests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <h3>{request.title}</h3>
              <span className={`status ${request.status.toLowerCase()}`}>{request.status}</span>
            </div>
            <p>{request.description}</p>
            <p>Submitted on {request.submittedDate}</p>
            <p>{request.csrOffersCount} CSR offer{request.csrOffersCount > 1 ? "s" : ""} pending</p>
            <p>Urgency: <strong>{request.urgencyStatus}</strong></p>
            <p>Shortlisted: {request.shortlistCount} <Heart className="heart-icon" onClick={() => handleShortlist(request.id)} /></p>
            <div className="actions">
              <button className="edit-btn" onClick={() => handleEdit(request.id)}>
                <Edit className="icon" />
                Edit
              </button>
              <button className="delete-btn" onClick={() => handleDelete(request.id)}>
                <Trash2 className="icon" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRequests;
