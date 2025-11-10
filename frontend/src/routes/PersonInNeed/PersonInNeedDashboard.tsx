import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./PersonInNeedDashboard.css";
import * as Popover from "@radix-ui/react-popover";import { Bell, MoveLeft } from "lucide-react";
;

// Centralized status color logic
function getStatusColor(status?: string) {
  switch ((status || '').toLowerCase()) {
    case 'available':
      return '#22c55e';
    case 'pending':
      return '#f59e42';
    case 'completed':
      return '#6b7280';
    default:
      return '#334155';
  }
}

// Centralized status badge component
const StatusBadge: React.FC<{ status?: string }> = ({ status }) => (
  <span style={{ fontWeight: 600, color: getStatusColor(status) }}>
    {status || <span style={{ color: '#6b7280' }}>-</span>}
  </span>
);



interface Request {
  id: number;
  pin_id: number;
  pinName: string;
  title: string;
  categoryID: number;
  categoryName: string;
  message?: string;
  status?: string;
  createdAt?: string;
  locationID?: number;
  locationName?: string;
  urgencyLevelID?: number;
  urgencyLabel?: string;
  urgencyColor?: string;
  view_count?: number;
  shortlist_count?: number;
  // optional array of csr shortlist entries (if backend provides detailed list)
  csr_shortlists?: { csr_id: number }[];
}

// --- My Offers types ---
interface Offer {
  requestId: number;
  title: string;
  status: string;
  assignedCsrId?: number | null;
  interestedCsrs: { csr_id: number; interestedAt: string; username: string }[];
  feedback?: {
    id: number;
    rating: number;
    description?: string;
    createdAt: string;
  } | null;
}

const API_BASE = "http://localhost:3000";

const PersonInNeedDashboard: React.FC = () => {
  // Filter bar state
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Edit modal state hooks (must be inside the component)
  const [editRequest, setEditRequest] = useState<Request | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategoryID, setEditCategoryID] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editLocationID, setEditLocationID] = useState("");
  const [editUrgencyLevelID, setEditUrgencyLevelID] = useState("");
  const [editStatusMsg, setEditStatusMsg] = useState("");
  const [selected, setSelected] = useState<Request | null>(null);
  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRequestId, setFeedbackRequestId] = useState<number | null>(null);
  const [feedbackCsrId, setFeedbackCsrId] = useState<number | null>(null);
  const [feedbackCsrUsername, setFeedbackCsrUsername] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);


  const [showMyRequests, setShowMyRequests] = useState(false);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  // My Requests modal filter/sort state
  const [myRequestsFilterTitle, setMyRequestsFilterTitle] = useState("");
  const [myRequestsFilterType, setMyRequestsFilterType] = useState("");
  const [myRequestsFilterStatus, setMyRequestsFilterStatus] = useState("");
  const [myRequestsFilterUrgency, setMyRequestsFilterUrgency] = useState("");
  const [myRequestsSortViews, setMyRequestsSortViews] = useState("asc");
  const [myRequestsSortShortlists, setMyRequestsSortShortlists] = useState("asc");
  const [myRequestsPrimarySort, setMyRequestsPrimarySort] = useState<'views'|'shortlists'>('views');
  const [showCreate, setShowCreate] = useState(false);
  const [categoryID, setCategoryID] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string }[]>([]);

  const userId = Number(localStorage.getItem("userId"));
  const username = localStorage.getItem("username") || "User";

  // Notification type
  interface Notification {
    id: number;
    type: string;
    csr_id: number;
    pin_request_id: number;
    createdAt: string;
    read: number;
    csrUsername?: string;
    requestTitle?: string;
  }
  // Notification state (must be inside component to access userId)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notiLoading, setNotiLoading] = useState(false);
  const [notiError, setNotiError] = useState("");
  const [notiHasUnread, setNotiHasUnread] = useState(false);
  const notiButtonRef = React.useRef<HTMLButtonElement>(null);
  const notiPopoverRef = React.useRef<HTMLDivElement>(null);
 
  // Outside click handler for notification popover
  useEffect(() => {
    if (!notificationsOpen) return;
    function handleClick(e: MouseEvent) {
      const btn = notiButtonRef.current;
      const pop = notiPopoverRef.current;
      if (!btn || !pop) return;
      if (
        !btn.contains(e.target as Node) &&
        !pop.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notificationsOpen]);

  // Fetch notifications for PIN user
  const fetchNotifications = React.useCallback(() => {
    if (!userId) return;
    setNotiLoading(true);
    setNotiError("");
    fetch(`${API_BASE}/api/pin/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        // Only keep 'interested' and 'shortlist' notification types for PIN dashboard
        const filtered = (data.data || []).filter((n: Notification) => n.type === 'interested' || n.type === 'shortlist');
        setNotifications(filtered);
        setNotiLoading(false);
        setNotiHasUnread(filtered.some((n: Notification) => n.read === 0));
      })
      .catch(() => {
        setNotiError("Could not load notifications.");
        setNotiLoading(false);
      });
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  useEffect(() => {
    fetchNotifications();
    // Optionally poll for new notifications every 60s
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, [userId, fetchNotifications]);

  // When the popover opens, mark notifications as read (clears badge)
  useEffect(() => {
    if (notificationsOpen && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
    }

  // Helper to load the latest platform announcement and update modal state
  const fetchLatestAnnouncement = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pm/announcements/latest`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      const latest = data?.latest ?? null;
      setLatestAnnouncement(latest);
      if (latest?.createdAt) {
        const lastSeen = localStorage.getItem('latestAnnouncementSeenAt');
        if (lastSeen !== latest.createdAt) {
          setShowAnnouncementModal(true);
        }
      }
    } catch (err) {
      // Log for debugging but don't break the UI
      console.error('Failed to fetch latest announcement', err);
    }
  };

    // Load latest platform announcement
    fetchLatestAnnouncement();

  }, [notificationsOpen, unreadCount]);

  // Ensure the badge is cleared immediately when the popover is opened via the trigger
  const handleNotificationsOpenChange = (open: boolean) => {
    setNotificationsOpen(open);
    if (open && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: 1 })));
    }
  };


  const [locationID, setLocationID] = useState("");
  const [urgencyLevelID, setUrgencyLevelID] = useState("");
  const [locations, setLocations] = useState<{ id: number; name: string; line: string }[]>([]);
  const [urgencyLevels, setUrgencyLevels] = useState<{ id: number; label: string; color: string }[]>([]);
  const [latestAnnouncement, setLatestAnnouncement] = useState<{ message: string; createdAt: string } | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  
  useEffect(() => {
    fetch(`${API_BASE}/api/pin/locations`)
      .then(res => res.json())
      .then(data => setLocations(data.data || []));
    fetch(`${API_BASE}/api/pin/urgency-levels`)
      .then(res => res.json())
      .then(data => setUrgencyLevels(data.data || []));
    // Load latest platform announcement for PIN users
    fetch(`${API_BASE}/api/pm/announcements/latest`)
      .then(res => res.json())
      .then(data => {
        const latest = data?.latest ?? null;
        setLatestAnnouncement(latest);
        if (latest?.createdAt) {
          const lastSeen = localStorage.getItem('latestAnnouncementSeenAt');
          if (lastSeen !== latest.createdAt) {
            setShowAnnouncementModal(true);
          }
        }
      })
      .catch(() => {});
  }, []);



  useEffect(() => {
  fetch(`${API_BASE}/api/pin/service-types`)
    .then(res => res.json())
    .then(data => setServiceTypes(data.data || []));
  }, []);

  // Helper to fetch all requests
  const fetchAllRequests = () => {
    setLoading(true);
    fetch(`${API_BASE}/api/pin/requests`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch requests");
        return res.json();
      })
      .then((data) => {
        setRequests(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load requests.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  const openMyRequests = () => {
    if (!userId) {
      setStatusMsg("No user is signed in.");
      return;
    }
    setStatusMsg("");
    fetch(`${API_BASE}/api/pin/requests/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        setMyRequests(data.data || []);
        setShowMyRequests(true);
      })
      .catch(() => setStatusMsg("Network error while loading My Requests"));
  };

  // My Offers state
  const [showMyOffers, setShowMyOffers] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState("");

  // Fetch My Offers (all requests for PIN + interested CSRs)
  const openMyOffers = () => {
    if (!userId) {
      setOffersError("No user is signed in.");
      setShowMyOffers(true);
      return;
    }
    setOffersLoading(true);
    setOffersError("");
    fetch(`${API_BASE}/api/pin/offers/${userId}`)
      .then(res => res.json())
      .then(data => {
        setOffers(data.data || []);
        setOffersLoading(false);
        setShowMyOffers(true);
      })
      .catch(() => {
        setOffersError("Could not load offers.");
        setOffersLoading(false);
        setShowMyOffers(true);
      });
  };

  // Accept a CSR for a request
  const handleAcceptCsr = async (requestId: number, csrId: number) => {
    const res = await fetch(`${API_BASE}/api/pin/offers/${requestId}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csrId }),
    });
    if (res.ok) {
      toast.success("CSR accepted for this request.");
      // Refetch offers after a short delay to ensure backend updates are reflected
      setTimeout(openMyOffers, 300);
    } else {
      toast.error("Failed to accept CSR.");
    }
  };

  // Cancel a CSR's interest for a request
  const handleCancelCsr = async (requestId: number, csrId: number) => {
    const res = await fetch(`${API_BASE}/api/pin/offers/${requestId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csrId }),
    });
    if (res.ok) {
      toast.success("CSR interest cancelled.");
      setTimeout(openMyOffers, 300);
    } else {
      toast.error("Failed to cancel CSR interest.");
    }
  };



  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg("");
    if (!title.trim()) {
      setStatusMsg("Please enter a request title.");
      return;
    }
    if (!categoryID) {
      setStatusMsg("Please select a request type.");
      return;
    }
    if (!locationID) {
      setStatusMsg("Please select a location.");
      return;
    }
    if (!urgencyLevelID) {
      setStatusMsg("Please select an urgency level.");
      return;
    }
    const res = await fetch(`${API_BASE}/api/pin/requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin_id: userId, title, categoryID: Number(categoryID), message, locationID: Number(locationID), urgencyLevelID: Number(urgencyLevelID) }),
    });
    if (res.ok) {
      toast.success("Request created successfully!");
      setTitle("");
      setCategoryID("");
      setMessage("");
      setLocationID("");
      setUrgencyLevelID("");
      openMyRequests();
      fetchAllRequests(); // Refresh all requests table after create
      setShowCreate(false);
    } else {
      toast.error("Failed to create request.");
    }
  };

    // Download handler for past service history
  const handleDownloadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pin/requests/history?pin_id=${userId}`);
      if (!res.ok) throw new Error('Failed to download history');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'service-history.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download service history.');
    }
  };

  // Open feedback modal for a completed offer
  function openFeedbackModal(requestId: number, csrId: number, csrUsername?: string) {
    setShowMyOffers(false); // Close My Offers modal first
    setFeedbackRequestId(requestId);
    setFeedbackCsrId(csrId);
    setFeedbackCsrUsername(csrUsername || 'CSR');
    setFeedbackText('');
    setShowFeedbackModal(true);
  }

  // Reset feedback modal state
  function handleCancelFeedback() {
    setShowFeedbackModal(false);
    setFeedbackRequestId(null);
    setFeedbackCsrId(null);
    setFeedbackCsrUsername('');
    setFeedbackText('');
    setFeedbackRating(0);
  }

  // Submit feedback to backend
  async function handleSubmitFeedback() {
    if (!feedbackRequestId || !feedbackCsrId || feedbackRating === 0) return;
    setFeedbackLoading(true);
    const createdAt = new Date().toISOString();
    try {
      const res = await fetch(`${API_BASE}/api/pin/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: feedbackRequestId,
          csrId: feedbackCsrId,
          pinId: userId,
          rating: feedbackRating,
          description: feedbackText,
          createdAt,
        }),
      });
      if (res.ok) {
        toast.success('Feedback submitted!');
        // Refetch offers from backend to get updated feedback data
        openMyOffers();
        handleCancelFeedback();
      } else {
        toast.error('Failed to submit feedback.');
      }
    } catch {
      toast.error('Failed to submit feedback.');
    }
    setFeedbackLoading(false);
  }

  // Compute filtered and sorted My Requests for the modal
  const filteredSortedMyRequests = [...myRequests].filter(r => {
    if (myRequestsFilterTitle && !(r.title || '').toLowerCase().includes(myRequestsFilterTitle.toLowerCase())) return false;
    if (myRequestsFilterType && r.categoryName !== myRequestsFilterType) return false;
    if (myRequestsFilterStatus && r.status !== myRequestsFilterStatus) return false;
    if (myRequestsFilterUrgency && (r.urgencyLabel || '') !== myRequestsFilterUrgency) return false;
    return true;
  });
  // Helper to get shortlist count either from detailed csr_shortlists array or from shortlist_count
  const getShortlistCount = (r: Request) => Array.isArray((r as any).csr_shortlists) ? (r as any).csr_shortlists.length : (r.shortlist_count ?? 0);

  // Apply sorting: primary key controlled by myRequestsPrimarySort
  filteredSortedMyRequests.sort((a, b) => {
    const compareBy = (key: 'views'|'shortlists') => {
      if (key === 'views') {
        const va = a.view_count ?? 0;
        const vb = b.view_count ?? 0;
        if (va !== vb) return myRequestsSortViews === 'asc' ? va - vb : vb - va;
        return 0;
      } else {
        const sa = getShortlistCount(a);
        const sb = getShortlistCount(b);
        if (sa !== sb) return myRequestsSortShortlists === 'asc' ? sa - sb : sb - sa;
        return 0;
      }
    };

    // primary
    const p = compareBy(myRequestsPrimarySort);
    if (p !== 0) return p;
    // secondary
    const secondaryKey: 'views'|'shortlists' = myRequestsPrimarySort === 'views' ? 'shortlists' : 'views';
    const s = compareBy(secondaryKey);
    if (s !== 0) return s;
    return 0;
  });

  return (
    <>
      {/* Latest Announcement Modal */}
      {showAnnouncementModal && latestAnnouncement && (
        <div className="pin-modal" onClick={() => setShowAnnouncementModal(false)}>
          <div className="pin-modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14 }}>
            <h3>Platform Announcement</h3>
            <div style={{ marginBottom: 12, fontWeight: 600 }}>{latestAnnouncement.message}</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>Posted: {latestAnnouncement.createdAt.slice(0, 10)}</div>
            <button className="pin-button primary" style={{ background: '#2563eb', color: '#fff' }}
              onClick={() => {
                setShowAnnouncementModal(false);
                localStorage.setItem('latestAnnouncementSeenAt', latestAnnouncement.createdAt);
              }}
            >Dismiss</button>
          </div>
        </div>
      )}


      {/* Notification popover (restored Radix design) */}
        <div className="CSR-notification-popover-wrapper">
          <Popover.Root open={notificationsOpen} onOpenChange={handleNotificationsOpenChange}>
            <Popover.Trigger asChild>
              <button
                className="CSR-notification-button"
                aria-haspopup="true"
                aria-expanded={notificationsOpen}
                title="Notifications"
              >
                <Bell className="icon" />
                {unreadCount > 0 && (
                  <span className="CSR-badge" aria-hidden>
                    {unreadCount}
                  </span>
                )}
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content className="CSR-notification-popover" sideOffset={8} align="end">
                <div className="CSR-notification-popover-header">
                  <h3>Notifications</h3>
                </div>

                <div className="CSR-notification-popover-body">
                  {notiLoading ? <div>Loading...</div> : notiError ? <div style={{ color: '#b91c1c' }}>{notiError}</div> : notifications.length === 0 ? (
                    <div className="CSR-notification-empty">
                      <Bell className="CSR-empty-icon" />
                      <div className="CSR-empty-text">No notifications yet</div>
                    </div>
                  ) : (
                    <ul className="CSR-notification-list">
                      {notifications.map(noti => (
                        <li
                          key={noti.id}
                          className={`CSR-notification-item ${noti.read ? 'read' : 'unread'}`}
                          onClick={() => {
                            // Mark this notification as read locally (do not remove it)
                            setNotifications(prev => prev.map(p => p.id === noti.id ? { ...p, read: 1 } : p));
                          }}
                          title="Mark as read"
                        >
                          <div className="CSR-notification-title" style={{ fontWeight: 700, fontSize: '1.08rem', color: '#2563eb', marginBottom: 2 }}>
                            {noti.type === 'interested' ? '👀 CSR Interested'
                            : noti.type === 'shortlist' ? '❤️ CSR Shortlisted'
                            : noti.type === 'accepted' ? `✅ CSR Accepted`
                            : noti.type === 'rejected' ? `❌ CSR Rejected`
                            : noti.type === 'feedback' ? '⭐ Feedback received'
                            : noti.type}
                          </div>
                          <div style={{ fontSize: 15, color: '#334155', fontWeight: 500, marginBottom: 2 }}>
                            CSR: <span style={{ color: '#0ea5e9' }}>{noti.csrUsername || noti.csr_id}</span> | Request: <span style={{ color: '#0ea5e9' }}>{noti.requestTitle || noti.pin_request_id}</span>
                          </div>
                          <div style={{ fontSize: 13, color: '#64748b' }}>{noti.createdAt?.slice(0, 19).replace('T', ' ')}</div>
                          <button
                            type="button"
                            className="CSR-notification-close"
                            aria-label="Clear notification"
                            title="Clear notification"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const res = await fetch(`http://localhost:3000/api/pin/notifications/${noti.id}`, { method: 'DELETE', credentials: 'include' });
                                if (res.ok) {
                                  setNotifications(prev => prev.filter(n => n.id !== noti.id));
                                  toast.success('Notification cleared');
                                } else {
                                  toast.error('Failed to clear notification');
                                }
                              } catch (err) {
                                toast.error('Failed to clear notification');
                              }
                            }}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Popover.Close />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>


      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      
      <div className="pin-container">
        <div>
        <header className="pin-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}></header>
          <h2>All Person-In-Need Requests</h2>
          <p>Manage user accounts and permissions</p>
        </div>
      

      <div className="pin-actions">
        {/* Filter Bar - inserted directly after header */}
          
          {/* Text filter bar on the left */}
          <label style={{ fontWeight: 600, marginRight: 6 }}>Search:</label>
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Type to filter by title..."
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', width: 180 }}
          />

          <label style={{ fontWeight: 600, marginRight: 6 }}>Status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: 110, padding: '6px 8px', borderRadius: 6 }}>
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>

          <label style={{ fontWeight: 600, marginRight: 6 }}>Type:</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ minWidth: 110, padding: '6px 8px', borderRadius: 6 }}>
            <option value="">All</option>
            {serviceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          <label style={{ fontWeight: 600, marginRight: 6 }}>Location:</label>
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{ minWidth: 110, padding: '6px 8px', borderRadius: 6 }}>
            <option value="">All</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>


          <label style={{ fontWeight: 600, marginRight: 6 }}>Urgency:</label>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} style={{ minWidth: 110, padding: '6px 8px', borderRadius: 6 }}>
            <option value="">All</option>
            {urgencyLevels.map(u => (
              <option key={u.id} value={u.label}>{u.label}</option>
            ))}
          </select>

          <button className="pin-button" style={{ marginLeft: 8 }} onClick={() => {
            setFilterText("");
            setFilterStatus("");
            setFilterCategory("");
            setFilterLocation("");
            setFilterUrgency("");
          }}>Clear</button>
        
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button 
              type="button" 
              className="btn" 
              onClick={openMyRequests}>
                My Requests
              </button>

            <button 
              type="button" 
              className="btn"  
              onClick={openMyOffers}>
                My Offers
            </button>
          </div>
      </div>

      {/* My Offers Modal */}
      {showMyOffers && (
        <div className="pin-modal" onClick={() => setShowMyOffers(false)}>
          <div className="pin-modal-content" onClick={e => e.stopPropagation()} style={{ width: 1100, maxWidth: '90vw', padding: '30px 24px', borderRadius: 14}}>
            <h3>CSR Offers for My Requests</h3>
            {offersLoading ? (
              <div>Loading...</div>
            ) : offersError ? (
              <div style={{ color: '#b91c1c' }}>{offersError}</div>
            ) : offers.length === 0 ? (
              <div className="pin-row-muted">No offers found.</div>
            ) : (
              <table className="pin-table">
                <thead>
                  <tr>
                    <th>Request Title</th>
                    <th>Status</th>
                    <th>Interested CSRs</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map(offer => (
                    <tr key={offer.requestId}>
                      <td>{offer.title}</td>
                      <td><StatusBadge status={offer.status} /></td>
                      <td>
                        {offer.interestedCsrs.length === 0 ? (
                          <span style={{ color: '#6b7280' }}>No interested CSRs</span>
                        ) : (
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {offer.interestedCsrs.map(csr => (
                              <li key={csr.csr_id} style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span style={{ fontWeight: 600 }}>{csr.username || `CSR #${csr.csr_id}`}</span>
                                  <span style={{ color: '#64748b', fontSize: 13 }}>({new Date(csr.interestedAt).toLocaleDateString()})</span>
                                  {offer.assignedCsrId === csr.csr_id && offer.status === 'Pending' && (
                                    <span style={{ color: '#22c55e', fontWeight: 700, marginLeft: 8 }}>Assigned</span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                  {offer.assignedCsrId !== csr.csr_id && (
                                    <>
                                      <button className="pin-button" style={{ backgroundColor: 'white', color: '#1b9c4aff', border: '1px solid black', width: '90px' }} onClick={() => handleAcceptCsr(offer.requestId, csr.csr_id)}>Accept</button>
                                      <button className="pin-button" style={{ backgroundColor: 'white', color: '#b91616ff', border: '1px solid black', width: '90px' }} onClick={() => handleCancelCsr(offer.requestId, csr.csr_id)}>Reject</button>
                                    </>
                                  )}

                                  {offer.status === 'Pending' && offer.assignedCsrId === csr.csr_id && (
                                    <button
                                      className="pin-button"
                                      style={{ color: '#6b7280', backgroundColor: 'white', border: '1px solid black', width: '200px' }}
                                      onClick={async () => {
                                        if (window.confirm('Mark this request as completed?')) {
                                          const res = await fetch(`${API_BASE}/api/pin/offers/${offer.requestId}/complete`, { method: 'POST' });
                                          if (res.ok) {
                                            toast.success('Request marked as completed.');
                                            openMyOffers();
                                          } else {
                                            toast.error('Failed to mark request as completed.');
                                          }
                                        }
                                      }}
                                    >Mark Completed</button>
                                  )}

                                  {offer.status === 'Completed' && offer.assignedCsrId === csr.csr_id && (
                                    (!offer.feedback) ? (
                                      <button
                                        className="pin-button"
                                        style={{ backgroundColor: 'white', color: '#1c4cb6ff', border: '1px solid black', width: '200px' }}
                                        onClick={() => openFeedbackModal(offer.requestId, csr.csr_id, csr.username)}
                                      >Feedback</button>
                                    ) : null
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="pin-button" onClick={() => setShowMyOffers(false)} style={{ marginTop: 20, display: 'block', marginLeft: 'auto' }}>Close</button>
          </div>
        </div>
      )}


      {/* Feedback Modal - always rendered at root, independent of My Offers */}
      {showFeedbackModal && (
        <div className="pin-modal" onClick={handleCancelFeedback}>
          <div className="pin-modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14 }}>
            <h3>Give Feedback to {feedbackCsrUsername}</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600 }}>Rating:</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {[1,2,3,4,5].map(star => (
                  <span
                    key={star}
                    style={{ cursor: 'pointer', fontSize: 28, color: feedbackRating >= star ? '#f59e42' : '#e5e7eb' }}
                    onClick={() => setFeedbackRating(star)}
                    title={`${star} Star${star > 1 ? 's' : ''}`}
                  >★</span>
                ))}
              </div>
            </div>
            {/* ...existing code ... */}
            <label style={{ fontWeight: 600 }}>Description (optional):</label>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              rows={4}
              style={{ width: '100%', marginBottom: 16, fontSize: 16, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
              placeholder="Enter your feedback here..."
              disabled={feedbackLoading}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button className="pin-button" onClick={handleCancelFeedback} disabled={feedbackLoading}>Cancel</button>
              <button className="pin-button primary" style={{ background: '#2563eb', color: '#fff' }} onClick={handleSubmitFeedback} disabled={feedbackLoading || feedbackRating === 0}>
                {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24, alignItems: 'center' }}>
          {/* Filter requests based on filter bar selections */}
          {(() => {
            const filteredRequests = requests
              .filter(r => r.status !== 'Completed')
              .filter(r => {
                // Text filter (title)
                if (filterText && !r.title.toLowerCase().includes(filterText.toLowerCase())) return false;
                // Status filter
                if (filterStatus && r.status?.toLowerCase() !== filterStatus.toLowerCase()) return false;
                // Category filter
                if (filterCategory && r.categoryID.toString() !== filterCategory) return false;
                // Location filter
                if (filterLocation && r.locationID?.toString() !== filterLocation) return false;
                // Urgency filter (compare by label)
                if (filterUrgency && r.urgencyLabel?.toLowerCase() !== filterUrgency.toLowerCase()) return false;
                return true;
              });
            if (filteredRequests.length === 0) {
              return (
                <div className="pin-row-muted" style={{ fontSize: 18, color: '#64748b', padding: 32, borderRadius: 12, background: '#f3f4f6', width: '90%' }}>
                  No requests found.
                </div>
              );
            }
            return filteredRequests.map((r) => (
              <div
                key={r.id}
                className={`pin-request-card ${r.urgencyLabel && r.urgencyLabel.toLowerCase() === 'high priority' ? 'priority-high-card' : ''}`}
                onClick={() => setSelected(r)}
              >
                <div className="pin-request-left">
                  <div className="pin-request-title">{r.title}</div>
                  <div className="pin-request-category">{r.categoryName}</div>
                  <div className="pin-request-location">Location: {r.locationName || '-'}</div>
                  <div className="pin-request-pinname">{r.pinName}</div>
                </div>

                <div className="pin-badges">
                  <div className="pin-badge pin-badge-status"><StatusBadge status={r.status} /></div>
                  {r.urgencyLabel && (
                    <div className={`pin-badge pin-badge-priority ${r.urgencyLabel.toLowerCase() === 'high priority' ? 'high' : r.urgencyLabel.toLowerCase() === 'low priority' ? 'low' : ''}`}>
                      {r.urgencyLabel}
                    </div>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {selected && (
        <div className="pin-modal" onClick={() => setSelected(null)}>
          <div className="pin-modal-content" onClick={e => e.stopPropagation()} style={{ width: 700, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14 }}>
            <button
              onClick={() => void setSelected(null)}
              style={{
                position: 'absolute',
                top: 12,
                right: 15,
                background: 'none',
                border: 'none',
                fontSize: 26,
                fontWeight: 700,
                color: '#64748b',
                cursor: 'pointer',
                lineHeight: 1,
                zIndex: 2
              }}
              aria-label="Close"
            >
              ×
            </button>
          <div className="details" style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
            <h3>Request Details</h3>
            <div><b>PIN Name:</b> {selected.pinName || 'N/A'}</div>
            <div><b>Title:</b> {selected.title || 'Untitled Request'}</div>
            <div><b>Request Type:</b> {selected.categoryName}</div>
            <div><b>Location:</b> { selected.locationName || '-'}</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '8px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>Status:</strong>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem 0.8rem',
                  borderRadius: 9999,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: selected.status === 'Pending' ? '#' : selected.status === 'Available' ? '#16a34a' : '#6b7280',
                  backgroundColor: selected.status === 'Pending' ? 'rgba(229, 138, 41, 0.08)' : selected.status === 'Available' ? 'rgba(34,197,94,0.08)' : 'rgba(107,114,128,0.06)'
                }}>
                  {selected.status || '-'}
                </span>
              </div>
              <div> {selected.urgencyLabel && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 90,
                    padding: '0.4em 1.2em',
                    borderRadius: 18,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    backgroundColor:
                      selected.urgencyLabel.toLowerCase() === 'high priority' ? '#ef4444' :
                      selected.urgencyLabel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280',
                    textAlign: 'center',
                    letterSpacing: 1,
                  }}
                >
                  {selected.urgencyLabel}
                </span>
              )}</div>
            </div>
            <div><b>Description:</b></div>
            <div className="pin-desc-box">{selected.message || '(No description)'}</div>
          </div>
        </div>
        </div>
      )}

      {showMyRequests && (
        <div className="pin-modal" onClick={() => setShowMyRequests(false)}>
          <div
            className="pin-modal-content"
            onClick={e => e.stopPropagation()}
            style={{ width: '1600px', maxWidth: '98vw', minHeight: '500px', padding: '40px 50px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ marginRight: 'auto' }}>My Requests</h3>
            </div>
            {/* Filter row for My Requests - placed directly below action buttons */}
            <div className="pin-my-requests-filter-row" style={{ marginTop: 30, padding: 20, borderRadius: 12 }}>
              <input
                className="pin-filter-control pin-filter-title"
                placeholder="Title"
                value={myRequestsFilterTitle}
                onChange={e => setMyRequestsFilterTitle(e.target.value)}
              />
              <select
                className="pin-filter-control pin-filter-select"
                value={myRequestsFilterType}
                onChange={e => setMyRequestsFilterType(e.target.value)}
              >
                <option value="">Request Type</option>
                {serviceTypes.map(st => (
                  <option key={st.id} value={st.name}>{st.name}</option>
                ))}
              </select>
              <select
                className="pin-filter-control pin-filter-select"
                value={myRequestsFilterStatus}
                onChange={e => setMyRequestsFilterStatus(e.target.value)}
              >
                <option value="">Status</option>
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                className="pin-filter-control pin-filter-select"
                value={myRequestsFilterUrgency}
                onChange={e => setMyRequestsFilterUrgency(e.target.value)}
              >
                <option value="">Urgency Status</option>
                {urgencyLevels.map(ul => (
                  <option key={ul.id} value={ul.label}>{ul.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="pin-filter-button"
                style={{ background: myRequestsPrimarySort === 'views' ? 'white' : 'white', color: 'black', border: '1px solid black', fontWeight: 600, width: '120px' }}
                onClick={() => {
                  // make views the primary sort key and toggle its direction
                  setMyRequestsPrimarySort('views');
                  setMyRequestsSortViews(myRequestsSortViews === 'asc' ? 'desc' : 'asc');
                }}
              >
                Views {myRequestsSortViews === 'asc' ? '▲' : '▼'}
              </button>
              <button
                type="button"
                className="pin-filter-button"
                style={{ background: myRequestsPrimarySort === 'shortlists' ? 'white' : 'white', color: 'black', border: '1px solid black', fontWeight: 600, width: '120px' }}
                onClick={() => {
                  // make shortlists the primary sort key and toggle its direction
                  setMyRequestsPrimarySort('shortlists');
                  setMyRequestsSortShortlists(myRequestsSortShortlists === 'asc' ? 'desc' : 'asc');
                }}
              >
                Shortlists {myRequestsSortShortlists === 'asc' ? '▲' : '▼'}
              </button>
              <button className="btn" onClick={() => setShowCreate(true)} style={{ marginLeft: 'auto', width: '140px' }}>Create Request</button>
            </div>
            <table className="pin-table" style={{ marginTop: 25 }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Request Type</th>
                  <th>Status</th>
                  <th>Urgency Status</th>
                  <th>Date Created</th>
                  <th style={{ textAlign: 'center' }}>Views</th>
                  <th style={{ textAlign: 'center' }}>Shortlists</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSortedMyRequests.length === 0 ? (
                  <tr><td colSpan={8} className="pin-row-muted">No requests found.</td></tr>
                ) : (
                  filteredSortedMyRequests.map(r => (
                    <tr key={r.id}>
                      <td>{r.title}</td>
                      <td>{r.categoryName}</td>
                      <td style={{ padding: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 48 }}>
                          <StatusBadge status={r.status} />
                        </div>
                      </td>
                      <td style={{ padding: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 48 }}>
                          {r.urgencyLabel ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: 70,
                                padding: '0.3em 0.8em',
                                borderRadius: 16,
                                color: 'white',
                                fontWeight: 600,
                                backgroundColor:
                                  r.urgencyLabel.toLowerCase() === 'high priority' ? '#ef4444' :
                                  r.urgencyLabel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280',
                                textAlign: 'center',
                              }}
                            >
                              {r.urgencyLabel}
                            </span>
                          ) : (
                            <span style={{ color: '#6b7280' }}>-</span>
                          )}
                        </div>
                      </td>
                      <td>{r.createdAt ? r.createdAt.slice(0, 10) : '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span title="Views" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
                          <span style={{ fontWeight: 600 }}>{r.view_count ?? 0}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span title="Shortlists" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4 0l-.9.9-.9-.9c-1.5-1.4-3.9-1.4-5.4 0-1.6 1.5-1.6 4 0 5.5l6.3 6.2c.2.2.5.2.7 0l6.3-6.2c1.6-1.5 1.6-4 0-5.5z"/></svg>
                          <span style={{ fontWeight: 600 }}>{getShortlistCount(r)}</span>
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {/* Only show Edit button if not completed */}
                        {r.status !== 'Completed' && (
                          <button 
                            className="pin-button" 
                            style={{ backgroundColor: 'white', color: '#1b9c4aff', border: '1px solid black', marginRight: 8, width: '90px' }}
                            onClick={() => {
                              setEditRequest(r);
                              setEditTitle(r.title);
                              setEditCategoryID(r.categoryID.toString());
                              setEditMessage(r.message || "");
                              setEditLocationID(r.locationID ? r.locationID.toString() : "");
                              setEditUrgencyLevelID(r.urgencyLevelID ? r.urgencyLevelID.toString() : "");
                              setEditStatusMsg("");
                            }}
                          >Edit</button>
                        )}
                        <button 
                          className="pin-button" 
                          style={{ backgroundColor: 'white', color: '#b91616ff', border: '1px solid black', width: '90px' }}
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this request?')) {
                              const res = await fetch(`${API_BASE}/api/pin/requests/${r.id}`, { method: 'DELETE' });
                              if (res.ok) {
                                toast.error("Request deleted.");
                                openMyRequests();
                                fetchAllRequests(); // Refresh all requests table
                              } else {
                                toast.error('Failed to delete request.');
                              }
                            }
                          }}
                        >Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
            <button
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                onClick={handleDownloadHistory}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download w-4 h-4 mr-2" aria-hidden="true"><path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path></svg>
                Download Past Service History
              </button>
            <button className="pin-button" onClick={() => setShowMyRequests(false)}>Close</button>
              </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="pin-modal" onClick={() => setShowCreate(false)}>
          <div className="pin-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create New Request</h3>
            <form onSubmit={handleCreate}>
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter request title"
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 5, border: '1px solid #d1d5db', marginTop: '0.2rem', fontSize: '1rem' }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Request Type:</label>
                <select value={categoryID} onChange={e => setCategoryID(e.target.value)} required>
                  <option value="">Select type</option>
                  {serviceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Description (optional):</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Describe your need..."
                  rows={4}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Location:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 6 }}>
                  {locations.map(loc => (
                    <label key={loc.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: locationID === loc.id.toString() ? 600 : 400 }}>
                      <input
                        type="radio"
                        name="location"
                        value={loc.id}
                        checked={locationID === loc.id.toString()}
                        onChange={() => setLocationID(loc.id.toString())}
                        style={{ marginRight: 6 }}
                      />
                      {loc.name} {loc.line ? `(${loc.line})` : ''}
                    </label>
                  ))}
                </div>
                {!locationID && <div style={{ color: '#b91c1c', marginTop: 4, fontSize: 13 }}>Please select a location</div>}
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Urgency Level:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 6 }}>
                  {urgencyLevels.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: urgencyLevelID === u.id.toString() ? 600 : 400 }}>
                      <input
                        type="radio"
                        name="urgency"
                        value={u.id}
                        checked={urgencyLevelID === u.id.toString()}
                        onChange={() => setUrgencyLevelID(u.id.toString())}
                        style={{ marginRight: 6 }}
                      />
                      {u.label}
                    </label>
                  ))}
                </div>
                {!urgencyLevelID && <div style={{ color: '#b91c1c', marginTop: 4, fontSize: 13 }}>Please select an urgency level</div>}
              </div>
              <button className="pin-button primary" type="submit" style={{ marginTop: 16 }}>Submit</button>
              {statusMsg && <div style={{ marginTop: 12 }}>{statusMsg}</div>}
            </form>
            <button className="pin-button" onClick={() => setShowCreate(false)} style={{ marginTop: 16 }}>Cancel</button>
          </div>
        </div>
      )}

      {editRequest && (
        <div className="pin-modal" onClick={() => setEditRequest(null)}>
          <div className="pin-modal-content" onClick={e => e.stopPropagation()} style={{ width: 600, maxWidth: '90vw', padding: '30px 24px', borderRadius: 14}}>
            <h3>Edit Request</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setEditStatusMsg("");
              if (!editTitle.trim()) {
                setEditStatusMsg("Please enter a request title.");
                return;
              }
              if (!editCategoryID) {
                setEditStatusMsg("Please select a request type.");
                return;
              }
              if (!editLocationID) {
                setEditStatusMsg("Please select a location.");
                return;
              }
              if (!editUrgencyLevelID) {
                setEditStatusMsg("Please select an urgency level.");
                return;
              }
              // Assume PUT /api/pin/requests/:id exists
              const res = await fetch(`${API_BASE}/api/pin/requests/${editRequest.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: editTitle,
                  categoryID: Number(editCategoryID),
                  message: editMessage,
                  locationID: Number(editLocationID),
                  urgencyLevelID: Number(editUrgencyLevelID),
                }),
              });
              if (res.ok) {
                toast.success("Request updated successfully!");
                setEditRequest(null);
                openMyRequests();
                fetchAllRequests(); // Refresh all requests table
              } else {
                toast.error("Failed to update request.");
              }
            }}>
              <div>
                <label>Title:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 5, border: '1px solid #d1d5db', marginTop: '0.2rem', fontSize: '1rem' }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Request Type:</label>
                <select value={editCategoryID} onChange={e => setEditCategoryID(e.target.value)} required>
                  <option value="">Select type</option>
                  {serviceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Description (optional):</label>
                <textarea
                  value={editMessage}
                  onChange={e => setEditMessage(e.target.value)}
                  rows={4}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Location:</label>
                <select value={editLocationID} onChange={e => setEditLocationID(e.target.value)} required>
                  <option value="">Select location</option>
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Urgency Level:</label>
                <select value={editUrgencyLevelID} onChange={e => setEditUrgencyLevelID(e.target.value)} required>
                  <option value="">Select urgency</option>
                  {urgencyLevels.map(u => (
                    <option key={u.id} value={u.id}>{u.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display : 'flex', justifyContent : 'space-between', marginTop: 20}}>
              <button className="pin-button" onClick={() => setEditRequest(null)} style={{ marginTop: 16 }}>Cancel</button>
              <button className="pin-button primary" type="submit" style={{ marginTop: 16 }}>Save Changes</button>
              {editStatusMsg && <div style={{ marginTop: 12 }}>{editStatusMsg}</div>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  </>
  );
};

export default PersonInNeedDashboard;
