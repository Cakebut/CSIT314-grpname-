import React, { useState } from "react";
import { MapPin } from "lucide-react";  // Importing relevant icons from lucide-react
import "./AllRequests.css";

// Define the structure for a request
interface Request {
  id: string;
  title: string;
  priority: "Low Priority" | "High Priority";
  requestType: string;
  pinName: string;
  pinId: string;
  region: string;
  status?: "Available" | "Pending" | "Completed";
  details?: string;
  views: number;
}

const initialRequests: Request[] = [
  {
    id: "REQ-001",
    title: "Technical Support",
    priority: "Low Priority",
    requestType: "Support",
    pinName: "Alice Johnson",
    pinId: "PIN-1234",
    region: "North Region",
    status: "Available",
    details: "Help needed to troubleshoot connectivity issues and set up VPN.",
    views: 13,
  },
  {
    id: "REQ-002",
    title: "Account Setup Assistance",
    priority: "Low Priority",
    requestType: "Account",
    pinName: "Bob Smith",
    pinId: "PIN-5678",
    region: "South Region",
    views: 8,
  },
  {
    id: "REQ-003",
    title: "Document Preparation",
    priority: "High Priority",
    requestType: "Documentation",
    pinName: "Carol Davis",
    pinId: "PIN-9012",
    region: "East Region",
    status: "Pending",
    details: "Need someone to format and proofread a set of legal documents.",
    views: 15,
  },
  {
    id: "REQ-004",
    title: "Software Training",
    priority: "Low Priority",
    requestType: "Training",
    pinName: "David Wilson",
    pinId: "PIN-3456",
    region: "West Region",
    views: 5,
  },
  {
    id: "REQ-005",
    title: "Data Entry Help",
    priority: "High Priority",
    requestType: "Data Entry",
    pinName: "Emma Brown",
    pinId: "PIN-7890",
    region: "Central Region",
    status: "Available",
    details: "Assist with entering survey data into spreadsheet and verifying accuracy.",
    views: 20,
  },
  {
    id: "REQ-006",
    title: "Transportation Assistance",
    priority: "High Priority",
    requestType: "Logistics",
    pinName: "Frank Lee",
    pinId: "PIN-2345",
    region: "North Region",
    views: 7,
  },
  {
    id: "REQ-007",
    title: "Home Cleaning Support",
    priority: "Low Priority",
    requestType: "Home",
    pinName: "Grace Tan",
    pinId: "PIN-6789",
    region: "East Region",
    views: 11,
  },
  {
    id: "REQ-008",
    title: "Grocery Shopping Help",
    priority: "Low Priority",
    requestType: "Errands",
    pinName: "Henry Ng",
    pinId: "PIN-3457",
    region: "West Region",
    views: 9,
  },
  {
    id: "REQ-009",
    title: "Medical Appointment Companion",
    priority: "High Priority",
    requestType: "Medical",
    pinName: "Iris Lim",
    pinId: "PIN-8901",
    region: "Central Region",
    status: "Completed",
    details: "Accompanied to appointment on 05/11; follow-up required.",
    views: 18,
  },
  {
    id: "REQ-010",
    title: "Technology Tutoring",
    priority: "Low Priority",
    requestType: "Tutoring",
    pinName: "Jack Wong",
    pinId: "PIN-4568",
    region: "South Region",
    status: "Available",
    details: "One-hour session to cover basic computer skills and email setup.",
    views: 6,
  },
];

import CSRRequestDetails from "./PINRequestDetails";

const Available: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("All Locations");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [interestedIds, setInterestedIds] = useState<Record<string, boolean>>({});

  // Filter requests based on search query and location
  const filteredRequests = initialRequests.filter((request) => {
    const matchesQuery = request.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         request.pinName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === "All Locations" || request.region === filterLocation;
    return matchesQuery && matchesLocation;
  });

  const openDetails = (request: Request) => setSelectedRequest(request);

  const closeDetails = () => setSelectedRequest(null);

  const toggleInterested = (id: string) => {
    setInterestedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="allrequests-container">
      <div className="allrequests-top">
        <div>
        <header className="allrequests-header"></header>
          <h1>Available Requests</h1>
          <p>Browse and offer assistance to different Persons in Need</p>
        </div>
      </div>

        <div className="allrequests-actions">
        <input
          type="text"
          placeholder="Search by request title, description, or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-allrequests"
        />
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="filter-allrequests"
        >
          <option>All Locations</option>
          <option>North Region</option>
          <option>South Region</option>
          <option>East Region</option>
          <option>West Region</option>
          <option>Central Region</option>
        </select>
        <button className="reset-allrequests btn" onClick={() => { setFilterLocation("All Locations"); setSearchQuery(""); }}>
          Reset
        </button>
      </div>

      <div className="allrequests-request-list">
        {filteredRequests.map((request) => (
          <div key={request.id} onClick={() => openDetails(request)} className={`allrequests-request-card ${request.priority.toLowerCase().includes("high") ? 'priority-high-card' : ''}`}>
            <span className={`allrequests-request-priority ${request.priority.toLowerCase().includes("high") ? 'priority-high' : 'priority-low'}`}>
              {request.priority}
            </span>
            <div className="allrequests-request-header">
              <h3 className="allrequests-request-title">{request.title}</h3>
            </div>

            <div className="allrequests-request-body">
              <p className="allrequests-request-type"><strong>Request Type:</strong> {request.requestType}</p>
              <p className="allrequests-request-pin"><strong>PIN:</strong> {request.pinName}</p>
              <p className="allrequests-request-location"><MapPin className="icon" /> {request.region}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedRequest && (
        <CSRRequestDetails
          request={selectedRequest}
          open={!!selectedRequest}
          onClose={closeDetails}
          interested={!!interestedIds[selectedRequest.id]}
          onToggleInterested={() => toggleInterested(selectedRequest.id)}
        />
      )}
    </div>
  );
};

export default Available;
