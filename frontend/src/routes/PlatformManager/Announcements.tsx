import React, { useState } from "react";
import { Send } from "lucide-react"; // Import the Send icon

const Announcements: React.FC = () => {
  const [announcementMessage, setAnnouncementMessage] = useState<string>("");

  const handleSendAnnouncement = () => {
    if (announcementMessage.trim() === "") {
      alert("Please enter a message.");
      return;
    }

    // Simulate sending the announcement (e.g., sending a request to the server)
    console.log("Sending announcement:", announcementMessage);
    alert("Announcement sent successfully!");

    // Reset the message
    setAnnouncementMessage("");
  };

  return (
    <div className="announcements-container">
      <div className="announcement-header">
        <h1>Platform Announcements</h1>
        <p>Send important messages to all active users across the platform</p>
      </div>

      <div className="announcement-form">
        <textarea
          value={announcementMessage}
          onChange={(e) => setAnnouncementMessage(e.target.value)}
          placeholder="Type your announcement message here..."
          rows={6}
          className="announcement-textarea"
        />
        <p className="announcement-info">
          This message will be displayed to all PINs, CSRs, and Admins currently using the platform
        </p>
        <button onClick={handleSendAnnouncement} className="send-announcement-button">
          <Send className="send-icon" />
          Send Announcement
        </button>
      </div>

      <div className="announcement-info-box">
        <h3>How Announcements Work</h3>
        <p>
          When you send an announcement, all active users will receive a pop-up notification with your message.
          This is ideal for system updates, maintenance notices, or important policy changes that require immediate attention.
        </p>
      </div>
    </div>
  );
};

export default Announcements;
