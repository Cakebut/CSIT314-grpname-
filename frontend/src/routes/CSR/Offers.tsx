import React, { useState } from "react";
import { CheckCircle, XCircle, FileText, Star } from "lucide-react"; // Import icons from lucide-react
import "./Offers.css";

// Define structure of an offer
interface Offer {
  id: string;
  title: string;
  description: string;
  requestId: string;
  pinName: string;
  pinId: string;
  offeredDate: string;
  status: "Pending" | "Accepted" | "Rejected" | "Completed";
  tags: string[];
  rating?: { stars: number; feedback: string; ratedOn: string };
}

const initialOffers: Offer[] = [
  {
    id: "REQ-012",
    title: "Email Setup Help",
    description: "Need assistance setting up email client and organizing inbox",
    requestId: "REQ-012",
    pinName: "John Doe",
    pinId: "PIN-2345",
    offeredDate: "26/10/2024",
    status: "Pending",
    tags: ["Technical Support", "Email Configuration"],
  },
  {
    id: "REQ-015",
    title: "Report Generation",
    description: "Help needed to generate monthly reports from database",
    requestId: "REQ-015",
    pinName: "Jane Smith",
    pinId: "PIN-6789",
    offeredDate: "25/10/2024",
    status: "Accepted",
    tags: ["Data Analysis", "Report Writing"],
    rating: {
      stars: 5,
      feedback: "Excellent service! Very patient and helpful throughout the process.",
      ratedOn: "23/10/2024",
    },
  },
  {
    id: "REQ-020",
    title: "Website Navigation Tutorial",
    description: "Looking for someone to guide through website features",
    requestId: "REQ-020",
    pinName: "Mike Johnson",
    pinId: "PIN-1122",
    offeredDate: "24/10/2024",
    status: "Rejected",
    tags: ["Training", "Customer Service"],
  },
  {
    id: "REQ-022",
    title: "File Organization",
    description: "Help organizing digital files and folders",
    requestId: "REQ-022",
    pinName: "Tom Brown",
    pinId: "PIN-5566",
    offeredDate: "18/10/2024",
    status: "Completed",
    tags: ["Organization", "File Management"],
    rating: {
      stars: 4,
      feedback: "Great help! Files are now organized and easy to find.",
      ratedOn: "21/10/2024",
    },
  },
];

const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);

  const handleChangeStatus = (offerId: string, status: Offer["status"]) => {
    setOffers((prevOffers) =>
      prevOffers.map((offer) =>
        offer.id === offerId ? { ...offer, status } : offer
      )
    );
  };

  return (
    <div className="offers-container">
      <header className="header">
        <h1>My Offers</h1>
        <p>Track and manage your assistance offers</p>
        <p>Total Offers: {offers.length}</p>
      </header>

      <div className="offers-content">
        {offers.map((offer) => (
          <div key={offer.id} className="offer-card">
            <div className="offer-header">
              <h3>{offer.title}</h3>
              <span className={`status ${offer.status.toLowerCase()}`}>
                {offer.status}
              </span>
            </div>
            <p>{offer.description}</p>
            <p>
              <strong>Request:</strong> {offer.requestId} <br />
              <strong>PIN:</strong> {offer.pinName} ({offer.pinId}) <br />
              <strong>Offered on:</strong> {offer.offeredDate}
            </p>

            <div className="tags">
              {offer.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="offer-actions">
              {offer.status === "Pending" && (
                <>
                  <button
                    className="action-button accept"
                    onClick={() => handleChangeStatus(offer.id, "Accepted")}
                  >
                    <CheckCircle className="icon" /> Accept
                  </button>
                  <button
                    className="action-button reject"
                    onClick={() => handleChangeStatus(offer.id, "Rejected")}
                  >
                    <XCircle className="icon" /> Reject
                  </button>
                </>
              )}

              {offer.status === "Accepted" && (
                <button
                  className="action-button complete"
                  onClick={() => handleChangeStatus(offer.id, "Completed")}
                >
                  <CheckCircle className="icon" /> Mark as Completed
                </button>
              )}

              {offer.status === "Rejected" && (
                <button className="action-button disabled" disabled>
                  <XCircle className="icon" /> Rejected
                </button>
              )}
            </div>

            {offer.rating && offer.status === "Completed" && (
              <div className="rating">
                <div className="stars">
                  {[...Array(offer.rating.stars)].map((_, index) => (
                    <Star key={index} className="icon" />
                  ))}
                </div>
                <p>{offer.rating.feedback}</p>
                <p>Rated on: {offer.rating.ratedOn}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;
