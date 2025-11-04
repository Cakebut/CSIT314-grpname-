import React, { useState } from "react";
import { Search, Eye, MapPin } from "lucide-react";  // Importing relevant icons from lucide-react
import "./AllRequests.css";

// Define the structure for a request
interface Request {
  id: string;
  title: string;
  priority: "Low Priority" | "High Priority";
  pinName: string;
  pinId: string;
  region: string;
  views: number;
}

const initialRequests: Request[] = [
  {
    id: "REQ-001",
    title: "Technical Support",
    priority: "Low Priority",
    pinName: "Alice Johnson",
    pinId: "PIN-1234",
    region: "North Region",
    views: 13,
  },
  {
    id: "REQ-002",
    title: "Account Setup Assistance",
    priority: "Low Priority",
    pinName: "Bob Smith",
    pinId: "PIN-5678",
    region: "South Region",
    views: 8,
  },
  {
    id: "REQ-003",
    title: "Document Preparation",
    priority: "High Priority",
    pinName: "Carol Davis",
    pinId: "PIN-9012",
    region: "East Region",
    views: 15,
  },
  {
    id: "REQ-004",
    title: "Software Training",
    priority: "Low Priority",
    pinName: "David Wilson",
    pinId: "PIN-3456",
    region: "West Region",
    views: 5,
  },
  {
    id: "REQ-005",
    title: "Data Entry Help",
    priority: "High Priority",
    pinName: "Emma Brown",
    pinId: "PIN-7890",
    region: "Central Region",
    views: 20,
  },
  {
    id: "REQ-006",
    title: "Transportation Assistance",
    priority: "High Priority",
    pinName: "Frank Lee",
    pinId: "PIN-2345",
    region: "North Region",
    views: 7,
  },
  {
    id: "REQ-007",
    title: "Home Cleaning Support",
    priority: "Low Priority",
    pinName: "Grace Tan",
    pinId: "PIN-6789",
    region: "East Region",
    views: 11,
  },
  {
    id: "REQ-008",
    title: "Grocery Shopping Help",
    priority: "Low Priority",
    pinName: "Henry Ng",
    pinId: "PIN-3457",
    region: "West Region",
    views: 9,
  },
  {
    id: "REQ-009",
    title: "Medical Appointment Companion",
    priority: "High Priority",
    pinName: "Iris Lim",
    pinId: "PIN-8901",
    region: "Central Region",
    views: 18,
  },
  {
    id: "REQ-010",
    title: "Technology Tutoring",
    priority: "Low Priority",
    pinName: "Jack Wong",
    pinId: "PIN-4568",
    region: "South Region",
    views: 6,
  },
];

const AllRequests: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterLocation, setFilterLocation] = useState<string>("All Locations");

  // Filter requests based on search query and location
  const filteredRequests = initialRequests.filter((request) => {
    const matchesQuery = request.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          request.pinName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === "All Locations" || request.region === filterLocation;
    return matchesQuery && matchesLocation;
  });

  return (
    <div className="AllRequests-container">
      <header className="header">
        <h1>AllRequests Requests</h1>
        <p>Browse and offer assistance to Persons in Need</p>
        <div className="actions">
          <input
            type="text"
            placeholder="Search by request title, description, or PIN name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="filter-select"
          >
            <option>All Locations</option>
            <option>North Region</option>
            <option>South Region</option>
            <option>East Region</option>
            <option>West Region</option>
            <option>Central Region</option>
          </select>
        </div>
      </header>

      <div className="request-list">
        {filteredRequests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <h3>{request.title}</h3>
              <span className={`priority ${request.priority === "High Priority" ? "high-priority" : "low-priority"}`}>
                {request.priority}
              </span>
            </div>
            <div className="request-details">
              <p>
                <strong>PIN:</strong> {request.pinName} ({request.pinId})
              </p>
              <p><MapPin className="icon" /> {request.region}</p>
              <p><Eye className="icon" /> {request.views} views</p>
            </div>
            <button className="view-btn">View Request</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllRequests;
