import React, { useState } from "react";
import { Check, X } from "lucide-react"; // Importing Check and X icons from lucide-react
import "./PendingOffers.css";

// Interface for the CSR offer details
interface CSROffer {
  csrName: string;
  csrEmail: string;
  csrInitial: string;
  skills: string[];
  offeredAt: string;
}

// Interface for the requests
interface Request {
  id: string;
  title: string;
  description: string;
  submittedDate: string;
  csrOffers: CSROffer[];
}

const initialRequests: Request[] = [
  {
    id: "REQ-001",
    title: "Technical Support",
    description: "Need help setting up the new software",
    submittedDate: "25/10/2024",
    csrOffers: [
      {
        csrName: "John Smith",
        csrEmail: "john.smith@example.com",
        csrInitial: "J",
        skills: ["Software Installation", "Technical Support"],
        offeredAt: "26/10/2024",
      },
    ],
  },
  {
    id: "REQ-002",
    title: "Account Setup Assistance",
    description: "Help needed with initial account setup and verification",
    submittedDate: "24/10/2024",
    csrOffers: [
      {
        csrName: "Sarah Williams",
        csrEmail: "sarah.williams@example.com",
        csrInitial: "S",
        skills: ["Account Management", "User Onboarding"],
        offeredAt: "25/10/2024",
      },
      {
        csrName: "David Lee",
        csrEmail: "david.lee@example.com",
        csrInitial: "D",
        skills: ["Account Setup", "Verification Support"],
        offeredAt: "25/10/2024",
      },
    ],
  },
  // More requests...
];

const PendingOffers: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>(initialRequests);

  // Handle Accept Offer
  const handleAccept = (requestId: string, csrName: string) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) => {
        if (request.id === requestId) {
          alert(`Accepted offer from ${csrName}`);
          return {
            ...request,
            csrOffers: request.csrOffers.filter((offer) => offer.csrName !== csrName),
          };
        }
        return request;
      })
    );
  };

  // Handle Reject Offer
  const handleReject = (requestId: string, csrName: string) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) => {
        if (request.id === requestId) {
          alert(`Rejected offer from ${csrName}`);
          return {
            ...request,
            csrOffers: request.csrOffers.filter((offer) => offer.csrName !== csrName),
          };
        }
        return request;
      })
    );
  };

  return (
    <div className="pending-offers-container">
      <h1>Pending CSR Offers</h1>
      <p>{requests.length} requests have CSR offers awaiting your approval</p>

      {requests.map((request) => (
        <div key={request.id} className="request-card">
          <h2>{request.title}</h2>
          <p>{request.description}</p>
          <p>Submitted on {request.submittedDate}</p>

          <div className="csr-offers">
            {request.csrOffers.map((offer) => (
              <div key={offer.csrName} className="csr-offer-card">
                <div className="csr-info">
                  <div className="csr-initial">{offer.csrInitial}</div>
                  <div className="csr-details">
                    <p className="csr-name">{offer.csrName}</p>
                    <p className="csr-email">{offer.csrEmail}</p>
                    <div className="csr-skills">
                      {offer.skills.map((skill, index) => (
                        <span key={index} className="skill">{skill}</span>
                      ))}
                    </div>
                    <p>Offered on {offer.offeredAt}</p>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => handleAccept(request.id, offer.csrName)}
                    className="accept-btn"
                  >
                    <Check className="icon" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(request.id, offer.csrName)}
                    className="reject-btn"
                  >
                    <X className="icon" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingOffers;
