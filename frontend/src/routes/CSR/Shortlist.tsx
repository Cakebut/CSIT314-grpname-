import React, { useState } from "react";
import { FilePlus, Trash2, Send } from "lucide-react"; // Importing icons for delete and offer help
import "./Shortlist.css";

// Define the structure for a request
interface Request {
  id: string;
  title: string;
  description: string;
  pinName: string;
  pinId: string;
  region: string;
  submittedDate: string;
  shortlistedDate: string;
  tags: string[];
}

const initialRequests: Request[] = [
  {
    id: "REQ-003",
    title: "Document Preparation",
    description: "Need assistance preparing and organizing important documents",
    pinName: "Carol Davis",
    pinId: "PIN-9012",
    region: "East Region",
    submittedDate: "23/10/2024",
    shortlistedDate: "03/11/2025",
    tags: ["Document Management", "Organization"],
  },
  {
    id: "REQ-004",
    title: "Software Training",
    description: "Looking for someone to provide training on using productivity software",
    pinName: "David Wilson",
    pinId: "PIN-3456",
    region: "West Region",
    submittedDate: "22/10/2024",
    shortlistedDate: "03/11/2025",
    tags: ["Training", "Software Knowledge"],
  },
];

const Shortlist: React.FC = () => {
  const [shortlistedRequests, setShortlistedRequests] = useState<Request[]>(initialRequests);

  const handleAddToShortlist = (request: Request) => {
    setShortlistedRequests((prev) => [...prev, request]);
  };

  const handleRemoveFromShortlist = (requestId: string) => {
    setShortlistedRequests((prev) => prev.filter((request) => request.id !== requestId));
  };

  const handleOfferHelp = (requestId: string) => {
    // Logic to offer help (you can add functionality here)
    console.log(`Offering help for request ID: ${requestId}`);
  };

  return (
    <div className="shortlist-container">
      <header className="header">
        <h1>My Shortlist</h1>
        <p>Review and manage your saved PIN requests</p>
        <p>{shortlistedRequests.length} requests in your shortlist</p>
      </header>

      <div className="content">
        {shortlistedRequests.length === 0 ? (
          <div className="empty-state">
            <p>Your shortlist is empty</p>
            <p>Browse available requests and add them to your shortlist for later review</p>
          </div>
        ) : (
          <div className="request-list">
            {shortlistedRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <h3>{request.title} <span className="request-id">({request.id})</span></h3>
                  <div className="action-buttons">
                    <button onClick={() => handleOfferHelp(request.id)} className="offer-help-btn">
                      <Send className="icon" /> Offer Help
                    </button>
                    <button onClick={() => handleRemoveFromShortlist(request.id)} className="delete-btn">
                      <Trash2 className="icon" /> Delete
                    </button>
                  </div>
                </div>
                <p><strong>PIN:</strong> {request.pinName} ({request.pinId})</p>
                <p><strong>Region:</strong> {request.region}</p>
                <p><strong>Submitted:</strong> {request.submittedDate}</p>
                <p><strong>Shortlisted:</strong> {request.shortlistedDate}</p>
                <div className="tags">
                  {request.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shortlist;
