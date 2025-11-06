import React, { useState } from "react";
import { Edit, Trash2, Heart, Eye } from "lucide-react";  // Added Eye + Heart icons
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
  requestType?: string; // optional request type stored for editing
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
    requestType: "Technical Support",
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
    requestType: "Account Setup",
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
    requestType: "Data Migration",
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
    requestType: "Training",
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

  // Edit modal state and handlers
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | null>(null);
  const [formValues, setFormValues] = useState({
    title: "",
    requestType: "",
    description: "",
    location: "North",
    urgency: "Low Priority",
  });

  const openEdit = (request: Request) => {
    setEditingRequest(request);
    setFormValues({
      title: request.title,
      requestType: request.requestType || "",
      description: request.description || "",
      location: "North",
      urgency: request.urgencyStatus,
    });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingRequest(null);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormValues((v) => ({ ...v, [field]: value }));
  };

  const handleUpdate = () => {
    if (!editingRequest) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === editingRequest.id
          ? {
              ...r,
              title: formValues.title,
              description: formValues.description,
              requestType: formValues.requestType,
              urgencyStatus: formValues.urgency as Request['urgencyStatus'],
            }
          : r
      )
    );
    closeEdit();
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
      <div className="my-requests-top">
        <div>
        <header className="my-requests-header"></header>
          <h1>Created Requests</h1>
          <p>Browse and manage your own requests</p>
        </div>
      </div>

        <div className="my-requests-actions">
          <input
            type="text"
            placeholder="Search by request ID or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-my-requests"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-my-requests"
          >
            <option>All ({statusCounts.All})</option>
            <option>Available ({statusCounts.Available})</option>
            <option>Pending ({statusCounts.Pending})</option>
            <option>Completed ({statusCounts.Completed})</option>
          </select>
          <button
            className="reset-my-requests btn"
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("All");
            }}
          >
            Reset
          </button>
        </div>

      <div className="my-requests-list">
        <table className="my-requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Urgency</th>
              <th>No. of Offers</th>
              <th>No. of Shortlist</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.id} className={request.status.toLowerCase()}>
                <td>{request.id}</td>
                <td>{request.title}</td>
                <td>
                  <span className={`user-accounts-status ${request.status.toLowerCase()}`}>{request.status}</span>
                </td>
                <td>{request.submittedDate}</td>
                <td>
                  <span
                    className={`my-requests-urgency ${request.urgencyStatus.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {request.urgencyStatus}
                  </span>
                </td>
                <td>
                  <Eye className="icon" /> {request.csrOffersCount}
                </td>
                <td>
                  <Heart className="heart-icon" onClick={() => handleShortlist(request.id)} /> {request.shortlistCount} 
                </td>
                <td>
                  <button className="edit-my-requests" onClick={() => openEdit(request)}>
                    <Edit className="icon" /> Edit
                  </button>
                  <button className="delete-my-requests" onClick={() => handleDelete(request.id)}>
                    <Trash2 className="icon" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isEditOpen && (
        <div className="mr-modal-overlay" onMouseDown={closeEdit}>
          <div className="mr-modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <h2>Edit Request</h2>

            <label>
              Title
              <input
                type="text"
                value={formValues.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
              />
            </label>

            <label>
              Request Type
              <select
                value={formValues.requestType}
                onChange={(e) => handleFormChange('requestType', e.target.value)}
              >
                <option value="">Select type</option>
                <option>Technical Support</option>
                <option>Account Setup</option>
                <option>Training</option>
                <option>Data Migration</option>
              </select>
            </label>

            <label>
              Description (Optional)
              <input
                type="text"
                value={formValues.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
              />
            </label>

            <fieldset className="mr-fieldset">
              <legend>Location</legend>
              <label><input type="radio" name="mr-location" checked={formValues.location === 'North'} onChange={() => handleFormChange('location', 'North')} /> North</label>
              <label><input type="radio" name="mr-location" checked={formValues.location === 'South'} onChange={() => handleFormChange('location', 'South')} /> South</label>
              <label><input type="radio" name="mr-location" checked={formValues.location === 'East'} onChange={() => handleFormChange('location', 'East')} /> East</label>
              <label><input type="radio" name="mr-location" checked={formValues.location === 'West'} onChange={() => handleFormChange('location', 'West')} /> West</label>
            </fieldset>

            <fieldset className="mr-fieldset">
              <legend>Urgency Level</legend>
              <label><input type="radio" name="mr-urgency" checked={formValues.urgency === 'Low Priority'} onChange={() => handleFormChange('urgency', 'Low Priority')} /> Low Priority</label>
              <label><input type="radio" name="mr-urgency" checked={formValues.urgency === 'High Priority'} onChange={() => handleFormChange('urgency', 'High Priority')} /> High Priority</label>
            </fieldset>

            <div className="mr-modal-actions">
              <button className="delete-my-requests" onClick={closeEdit}>Cancel</button>
              <button className="edit-my-requests" onClick={handleUpdate}>Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
