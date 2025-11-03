import React, { useState } from "react";
import { Bell } from "lucide-react"; // Importing the Bell icon from lucide-react
import * as PopoverPrimitive from "@radix-ui/react-popover"; // Importing Radix Popover components
import "./NotificationButton.css";

interface Notification {
  id: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const NotificationButton: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "1", message: "New CSR offer for your request.", timestamp: "Oct 29, 2025", isRead: false },
    { id: "2", message: "Your request has been reviewed.", timestamp: "Oct 28, 2025", isRead: false },
  ]);

  // Mark notifications as read when the popover is opened
  const handlePopoverOpen = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) => ({
        ...notif,
        isRead: true,
      }))
    );
  };

  return (
    <div className="notification-button-container">
      <PopoverPrimitive.Root onOpenChange={handlePopoverOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button className="notification-button">
            <Bell className="icon" />
            {notifications.filter((notif) => !notif.isRead).length > 0 && (
              <span className="notification-badge">
                {notifications.filter((notif) => !notif.isRead).length}
              </span>
            )}
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Content className="notification-popover">
          <h3>Notifications</h3>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p>No notifications yet</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.isRead ? "read" : "unread"}`}
                >
                  <p>{notif.message}</p>
                  <span>{notif.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    </div>
  );
};

export default NotificationButton;
