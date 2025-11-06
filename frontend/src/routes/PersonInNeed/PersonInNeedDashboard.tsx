import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./PersonInNeedDashboard.css";

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
  const [myRequestsFilterDate, setMyRequestsFilterDate] = useState("");
  const [myRequestsSortViews, setMyRequestsSortViews] = useState("asc");
  const [myRequestsSortShortlists, setMyRequestsSortShortlists] = useState("asc");
  const [myRequestsPrimarySort, setMyRequestsPrimarySort] = useState<'views'|'shortlists'>('views');
  // Calendar popup state for My Requests date filter
  const [showMyRequestsCalendar, setShowMyRequestsCalendar] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  const [tempCalendarSelected, setTempCalendarSelected] = useState<Date | null>(null);
  const myRequestsCalendarRef = React.useRef<HTMLDivElement | null>(null);
  const myRequestsDateButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [myRequestsCalendarPos, setMyRequestsCalendarPos] = useState<{ top: number; left: number } | null>(null);

  // Calendar helpers for My Requests date picker
  const formatYMD = (d: Date) => d.toISOString().slice(0, 10);
  const daysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const buildCalendar = (view: Date) => {
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0-6
    const total = daysInMonth(view);
    const cells: (Date | null)[] = [];
    // leading blanks
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(year, month, d));
    // trailing blanks to make full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  };

  // Close calendar when clicking outside
  useEffect(() => {
    if (!showMyRequestsCalendar) return;
    function onDocClick(e: MouseEvent) {
      const el = myRequestsCalendarRef.current;
      const btn = myRequestsDateButtonRef.current;
      if (!(e.target instanceof Node)) return;
      // if click is inside calendar popup or the date button, ignore
      if (el && el.contains(e.target)) return;
      if (btn && btn.contains(e.target)) return;
      setShowMyRequestsCalendar(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showMyRequestsCalendar]);

  // After the portal popup renders, adjust position if it overflows (measure actual popup size)
  useEffect(() => {
    if (!showMyRequestsCalendar) return;
    if (!myRequestsCalendarPos) return;
    // Wait for popup to render
    const raf = requestAnimationFrame(() => {
      const el = myRequestsCalendarRef.current;
      const btn = myRequestsDateButtonRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let top = myRequestsCalendarPos.top;
      let left = myRequestsCalendarPos.left;
      // Shift left if overflowing right
      if (left + rect.width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - rect.width - 8);
      // If overflowing bottom, try placing above the button
      if (top + rect.height > window.innerHeight - 8) {
        if (btn) {
          const b = btn.getBoundingClientRect();
          top = b.top - rect.height - 6;
        } else {
          top = Math.max(8, window.innerHeight - rect.height - 8);
        }
      }
      // Clamp
      if (top < 8) top = 8;
      if (left < 8) left = 8;
      // Only update if changed meaningfully
      if (Math.abs(top - myRequestsCalendarPos.top) > 1 || Math.abs(left - myRequestsCalendarPos.left) > 1) {
        setMyRequestsCalendarPos({ top, left });
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [showMyRequestsCalendar, myRequestsCalendarPos]);
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
  const [showNoti, setShowNoti] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notiLoading, setNotiLoading] = useState(false);
  const [notiError, setNotiError] = useState("");
  const [notiHasUnread, setNotiHasUnread] = useState(false);
  const notiButtonRef = React.useRef<HTMLButtonElement>(null);
  const notiPopoverRef = React.useRef<HTMLDivElement>(null);
  // Outside click handler for notification popover
  useEffect(() => {
    if (!showNoti) return;
    function handleClick(e: MouseEvent) {
      const btn = notiButtonRef.current;
      const pop = notiPopoverRef.current;
      if (!btn || !pop) return;
      if (
        !btn.contains(e.target as Node) &&
        !pop.contains(e.target as Node)
      ) {
        setShowNoti(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNoti]);

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

  useEffect(() => {
    fetchNotifications();
    // Optionally poll for new notifications every 60s
    // const interval = setInterval(fetchNotifications, 60000);
    // return () => clearInterval(interval);
  }, [userId, fetchNotifications]);
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
    if (myRequestsFilterDate) {
      const created = r.createdAt ? r.createdAt.slice(0,10) : '';
      if (created !== myRequestsFilterDate) return false;
    }
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
        <div className="modal" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14 }}>
            <h3>Platform Announcement</h3>
            <div style={{ marginBottom: 12, fontWeight: 600 }}>{latestAnnouncement.message}</div>
            <div style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>Posted: {latestAnnouncement.createdAt.slice(0, 10)}</div>
            <button className="button primary" style={{ background: '#2563eb', color: '#fff' }}
              onClick={() => {
                setShowAnnouncementModal(false);
                localStorage.setItem('latestAnnouncementSeenAt', latestAnnouncement.createdAt);
              }}
            >Dismiss</button>
          </div>
        </div>
      )}
      <div className="container">
      {/* PIN Dashboard Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '18px 0 8px 0', background: '#f1f5f9', borderBottom: '1px solid #e0e7ef', marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
          <h1 style={{ color: '#2563eb', fontWeight: 700, fontSize: '2rem', margin: 0 }}>PIN Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '1.08rem', margin: 0 }}>Welcome {username}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}>
          {/* Notification bell and popover already present here */}
          {/* Logout button already present here */}
        </div>
      </div>
      {/* Filter Bar - inserted directly after header */}
  <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-end', flexWrap: 'nowrap' }}>
        {/* Text filter bar on the left */}
        <div>
          <label style={{ fontWeight: 600, marginRight: 6 }}>Search:</label>
          <input
            type="text"
            value={filterText}
            onChange={e => setFilterText(e.target.value)}
            placeholder="Type to filter by title..."
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', width: 180 }}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: 6 }}>Status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ minWidth: 110, padding: '6px 8px', borderRadius: 6 }}>
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: 6 }}>Type:</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ minWidth: 110, padding: '6px 8px', borderRadius: 6 }}>
            <option value="">All</option>
            {serviceTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: 6 }}>Location:</label>
          <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} style={{ minWidth: 110, padding: '6px 8px', borderRadius: 6 }}>
            <option value="">All</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, marginRight: 6 }}>Urgency:</label>
          <select value={filterUrgency} onChange={e => setFilterUrgency(e.target.value)} style={{ minWidth: 110, padding: '6px 8px', borderRadius: 6 }}>
            <option value="">All</option>
            {urgencyLevels.map(u => (
              <option key={u.id} value={u.label}>{u.label}</option>
            ))}
          </select>
        </div>
        <button className="button" style={{ marginLeft: 8 }} onClick={() => {
          setFilterText("");
          setFilterStatus("");
          setFilterCategory("");
          setFilterLocation("");
          setFilterUrgency("");
        }}>Clear</button>
      </div>
      {/* Notification Button and Popover */}
      <div style={{ position: 'absolute', top: 18, right: 32, zIndex: 100 }}>
        <button
          ref={notiButtonRef}
          className="button"
          style={{ fontSize: 24, position: 'relative', background: '#e0e7ef', color: '#334155', borderRadius: 24, width: 44, height: 44, boxShadow: notiHasUnread ? '0 0 0 2px #ef4444' : undefined }}
          onClick={() => setShowNoti(s => !s)}
          aria-label="Notifications"
        >
          <span style={{ position: 'relative' }}>
            🔔
            {notiHasUnread && (
              <span style={{
                position: 'absolute',
                top: -2,
                right: -6,
                width: 12,
                height: 12,
                background: '#ef4444',
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 0 4px #ef4444',
                display: 'inline-block',
              }} />
            )}
          </span>
        </button>
        {showNoti && (
          <div ref={notiPopoverRef} style={{ position: 'absolute', top: 48, right: 0, minWidth: 320, background: '#fff', boxShadow: '0 4px 16px #cbd5e1', borderRadius: 12, zIndex: 200, padding: '14px 18px 12px 18px', animation: 'fadeIn 0.18s' }}>
            <div style={{ position: 'absolute', top: -10, right: 18, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '10px solid #fff' }} />
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>Notifications</div>
            {notiLoading ? <div>Loading...</div> : notiError ? <div style={{ color: '#b91c1c' }}>{notiError}</div> : notifications.length === 0 ? <div className="row-muted">No notifications yet.</div> : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: 320, overflowY: 'auto' }}>
                {notifications.map(noti => (
                  <li
                    key={noti.id}
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid #e5e7eb',
                      background: noti.read === 0 ? 'linear-gradient(90deg,#fef9c3 60%,#f3f4f6 100%)' : '#f3f4f6',
                      cursor: 'pointer',
                      borderRadius: 8,
                      marginBottom: 2,
                      boxShadow: noti.read === 0 ? '0 2px 8px #fef9c3' : 'none',
                      transition: 'background 0.2s, box-shadow 0.2s',
                      position: 'relative',
                    }}
                    title="Click to clear notification"
                    onClick={async () => {
                      try {
                        await fetch(`${API_BASE}/api/pin/notifications/${noti.id}`, { method: 'DELETE' });
                        setNotifications(prev => prev.filter(n => n.id !== noti.id));
                        toast.success('Notification cleared');
                      } catch {
                        toast.error('Failed to clear notification');
                      }
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1.08rem', color: '#2563eb', marginBottom: 2 }}>
                      {noti.type === 'interested' ? '👀 CSR Interested'
                        : noti.type === 'shortlist' ? '❤️ CSR Shortlisted'
                        : noti.type === 'accepted' ? `✅ CSR Accepted`
                        : noti.type === 'rejected' ? `❌ CSR Rejected`
                        : noti.type === 'feedback' ? '⭐ Feedback received'
                        : noti.type}
                    </div>
                    <div style={{ fontSize: 15, color: '#334155', fontWeight: 500, marginBottom: 2 }}>CSR: <span style={{ color: '#0ea5e9' }}>{noti.csrUsername || noti.csr_id}</span> | Request: <span style={{ color: '#0ea5e9' }}>{noti.requestTitle || noti.pin_request_id}</span></div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{noti.createdAt?.slice(0, 19).replace('T', ' ')}</div>
                    <span style={{ position: 'absolute', top: 8, right: 12, color: '#ef4444', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} title="Clear notification">×</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h2>All Person-In-Need Requests</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="button primary" onClick={openMyRequests}>My Requests</button>
          <button className="button" style={{ backgroundColor: '#0ea5e9', color: 'white' }} onClick={openMyOffers}>My Offers</button>
      {/* My Offers Modal */}
      {showMyOffers && (
        <div className="modal" onClick={() => setShowMyOffers(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 700, maxWidth: '98vw', minHeight: 400 }}>
            <h3>My Offers (Interested CSRs for My Requests)</h3>
            {offersLoading ? (
              <div>Loading...</div>
            ) : offersError ? (
              <div style={{ color: '#b91c1c' }}>{offersError}</div>
            ) : offers.length === 0 ? (
              <div className="row-muted">No offers found.</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Request Title</th>
                    <th>Status</th>
                    <th>Interested CSRs</th>
                    <th>Actions</th>
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
                              <li key={csr.csr_id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600 }}>{csr.username || `CSR #${csr.csr_id}`}</span>
                                <span style={{ color: '#64748b', fontSize: 13 }}>({new Date(csr.interestedAt).toLocaleDateString()})</span>
                                {offer.assignedCsrId === csr.csr_id && offer.status === 'Pending' && (
                                  <span style={{ color: '#22c55e', fontWeight: 700, marginLeft: 8 }}>Assigned</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td>
                        {offer.interestedCsrs.map(csr => (
                          <div key={csr.csr_id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {/* Accept/Cancel buttons for non-assigned CSRs */}
                            {offer.assignedCsrId !== csr.csr_id && (
                              <>
                                <button className="button" style={{ backgroundColor: '#22c55e', color: 'white' }} onClick={() => handleAcceptCsr(offer.requestId, csr.csr_id)}>Accept</button>
                                <button className="button" style={{ backgroundColor: '#ef4444', color: 'white', marginLeft: 4 }} onClick={() => handleCancelCsr(offer.requestId, csr.csr_id)}>Cancel</button>
                              </>
                            )}
                            {/* Mark Completed button for pending requests with assigned CSR */}
                            {offer.status === 'Pending' && offer.assignedCsrId === csr.csr_id && (
                              <button
                                className="button"
                                style={{ backgroundColor: '#6b7280', color: 'white' }}
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
                            {/* Feedback button for completed offers, only for assigned CSR */}
                            {offer.status === 'Completed' && offer.assignedCsrId === csr.csr_id && (
                              (!offer.feedback) ? (
                                <button
                                  className="button"
                                  style={{ backgroundColor: '#2563eb', color: 'white' }}
                                  onClick={() => openFeedbackModal(offer.requestId, csr.csr_id, csr.username)}
                                >Feedback</button>
                              ) : null
                            )}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button className="button" onClick={() => setShowMyOffers(false)} style={{ marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}

      {/* Feedback Modal - always rendered at root, independent of My Offers */}
      {showFeedbackModal && (
        <div className="modal" onClick={handleCancelFeedback}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14 }}>
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
              <button className="button" onClick={handleCancelFeedback} disabled={feedbackLoading}>Cancel</button>
              <button className="button primary" style={{ background: '#2563eb', color: '#fff' }} onClick={handleSubmitFeedback} disabled={feedbackLoading || feedbackRating === 0}>
                {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
          <button
            className="button"
            style={{ backgroundColor: '#64748b', color: 'white' }}
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
          >Logout</button>
        </div>
      </div>
      
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
                <div className="row-muted" style={{ fontSize: 18, color: '#64748b', padding: 32, borderRadius: 12, background: '#f3f4f6', width: '90%' }}>
                  No requests found.
                </div>
              );
            }
            return filteredRequests.map((r) => (
              <div
                key={r.id}
                style={{
                  background: r.urgencyLabel && r.urgencyLabel.toLowerCase() === 'high priority' ? '#fee2e2' : '#fff',
                  borderRadius: 14,
                  boxShadow: '0 2px 12px 0 rgba(30,41,59,0.08)',
                  padding: '28px 40px',
                  width: '90%',
                  maxWidth: 900,
                  minWidth: 320,
                  margin: '0 auto',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s',
                  border: '1.5px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
                onClick={() => setSelected(r)}
              >
                <div style={{ flex: 3, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#1e293b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {r.categoryName}
                  </div>
                  <div style={{ fontSize: '1.02rem', color: '#0ea5e9', fontWeight: 500, margin: '2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    Location: {r.locationName || '-'}
                  </div>
                  <div style={{ fontSize: '1.05rem', color: '#475569', fontWeight: 600, marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {r.pinName}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                  }}
                >
                  <StatusBadge status={r.status} />
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  {r.urgencyLabel && (
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
                        fontSize: '1.1rem',
                        backgroundColor:
                          r.urgencyLabel.toLowerCase() === 'high priority' ? '#ef4444' :
                          r.urgencyLabel.toLowerCase() === 'low priority' ? '#22c55e' : '#6b7280',
                        textAlign: 'center',
                        letterSpacing: 1,
                      }}
                    >
                      {r.urgencyLabel}
                    </span>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ width: 400, maxWidth: '90vw', padding: '28px 24px', borderRadius: 14 }}>
            <h3>Request Details</h3>
            <div><b>PIN Name:</b> {selected.pinName}</div>
            <div><b>Title:</b> {selected.title}</div>
            <div><b>Request Type:</b> {selected.categoryName}</div>
            <div><b>Location:</b> {selected.locationName || '-'}</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', margin: '8px 0' }}>
              <div><b>Status:</b> <StatusBadge status={selected.status} /></div>
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
            <div className="desc-box">{selected.message || '(No description)'}</div>
            <button className="button primary" style={{ marginTop: 16 }} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}

      {showMyRequests && (
        <div className="modal" onClick={() => setShowMyRequests(false)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{ width: '1000px', maxWidth: '98vw', minHeight: '500px' }}
          >
            <h3>My Requests</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <button className="button primary" onClick={() => setShowCreate(true)}>Create Request</button>
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 px-4 py-2 has-[>svg]:px-3 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleDownloadHistory}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download w-4 h-4 mr-2" aria-hidden="true"><path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path></svg>
                Download Past Service History
              </button>
            </div>
            {/* Filter row for My Requests - placed directly below action buttons */}
            <div className="my-requests-filter-row">
              {/** common control style */}
              <input
                className="filter-control filter-title"
                placeholder="Title"
                value={myRequestsFilterTitle}
                onChange={e => setMyRequestsFilterTitle(e.target.value)}
              />
              <select
                className="filter-control filter-select"
                value={myRequestsFilterType}
                onChange={e => setMyRequestsFilterType(e.target.value)}
              >
                <option value="">Request Type</option>
                {serviceTypes.map(st => (
                  <option key={st.id} value={st.name}>{st.name}</option>
                ))}
              </select>
              <select
                className="filter-control filter-select"
                value={myRequestsFilterStatus}
                onChange={e => setMyRequestsFilterStatus(e.target.value)}
              >
                <option value="">Status</option>
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
              <select
                className="filter-control filter-select"
                value={myRequestsFilterUrgency}
                onChange={e => setMyRequestsFilterUrgency(e.target.value)}
              >
                <option value="">Urgency Status</option>
                {urgencyLevels.map(ul => (
                  <option key={ul.id} value={ul.label}>{ul.label}</option>
                ))}
              </select>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  ref={myRequestsDateButtonRef}
                  onClick={() => {
                    // position popup relative to button (page coordinates)
                    const btn = myRequestsDateButtonRef.current;
                    if (btn) {
                      const rect = btn.getBoundingClientRect();
                      // Use viewport coordinates for fixed positioning (no scroll offsets)
                      // Ensure the popup stays within the viewport (avoid clipping)
                      const POPUP_W = 240;
                      const POPUP_H = 300;
                      let left = rect.left;
                      // shift left if overflowing right edge
                      if (left + POPUP_W > window.innerWidth - 8) left = Math.max(8, window.innerWidth - POPUP_W - 8);
                      // default top below button
                      let top = rect.bottom + 6;
                      // if popup would overflow bottom, position above the button
                      if (top + POPUP_H > window.innerHeight - 8) {
                        top = rect.top - POPUP_H - 6;
                        if (top < 8) top = 8; // clamp to viewport
                      }
                      setMyRequestsCalendarPos({ top, left });
                    } else {
                      setMyRequestsCalendarPos({ top: 100, left: 100 });
                    }
                    // open calendar and initialize temp selection to current filter
                    setTempCalendarSelected(myRequestsFilterDate ? new Date(myRequestsFilterDate) : null);
                    setCalendarViewDate(myRequestsFilterDate ? new Date(myRequestsFilterDate) : new Date());
                    setShowMyRequestsCalendar(s => !s);
                  }}
                  className="filter-control filter-button"
                >
                  <span style={{ color: myRequestsFilterDate ? '#0f172a' : '#6b7280', fontSize: 14 }}>{myRequestsFilterDate ? new Date(myRequestsFilterDate).toLocaleDateString() : 'Date'}</span>
                </button>
                {showMyRequestsCalendar && myRequestsCalendarPos ? createPortal(
                  <div ref={el => { myRequestsCalendarRef.current = el; }} className="calendar-popup" style={{ position: 'fixed', top: myRequestsCalendarPos.top, left: myRequestsCalendarPos.left, zIndex: 9999999 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <button aria-label="Previous month" type="button" onClick={() => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} style={{ border: 'none', background: 'transparent', fontSize: 18, padding: '4px 8px', color: '#0f172a' }}>‹</button>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{calendarViewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
                      <button aria-label="Next month" type="button" onClick={() => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} style={{ border: 'none', background: 'transparent', fontSize: 18, padding: '4px 8px', color: '#0f172a' }}>›</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8, textAlign: 'center', color: '#64748b', fontSize: 12 }}>
                      {['S','M','T','W','T','F','S'].map(d => <div key={d} style={{ fontSize: 12 }}>{d}</div>)}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
                      {buildCalendar(calendarViewDate).map((dt, idx) => {
                        const selected = dt && tempCalendarSelected && dt.toDateString() === tempCalendarSelected.toDateString();
                        return (
                          <div key={idx} className="day-cell">
                            {dt ? (
                              <button type="button" onClick={() => setTempCalendarSelected(dt)} className={`day-button${selected ? ' selected' : ''}`}>{dt.getDate()}</button>
                            ) : <div />}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowMyRequestsCalendar(false)} className="button">Cancel</button>
                      <button type="button" onClick={() => {
                        if (tempCalendarSelected) {
                          setMyRequestsFilterDate(formatYMD(tempCalendarSelected));
                        } else {
                          setMyRequestsFilterDate('');
                        }
                        setShowMyRequestsCalendar(false);
                      }} className="button primary" style={{ background: '#2563eb', color: '#fff' }}>Apply</button>
                    </div>
                  </div>,
                  document.body
                ) : null}
              </div>
              <button
                type="button"
                className="filter-button"
                style={{ background: myRequestsPrimarySort === 'views' ? '#0f6fd8' : '#1583e9', color: 'white', border: 'none', fontWeight: 600 }}
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
                className="filter-button"
                style={{ background: myRequestsPrimarySort === 'shortlists' ? '#0f6fd8' : '#1583e9', color: 'white', border: 'none', fontWeight: 600 }}
                onClick={() => {
                  // make shortlists the primary sort key and toggle its direction
                  setMyRequestsPrimarySort('shortlists');
                  setMyRequestsSortShortlists(myRequestsSortShortlists === 'asc' ? 'desc' : 'asc');
                }}
              >
                Shortlists {myRequestsSortShortlists === 'asc' ? '▲' : '▼'}
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Request Type</th>
                  <th>Status</th>
                  <th>Urgency Status</th>
                  <th>Date Created</th>
                  <th style={{ textAlign: 'center' }}>Views</th>
                  <th style={{ textAlign: 'center' }}>Shortlists</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSortedMyRequests.length === 0 ? (
                  <tr><td colSpan={8} className="row-muted">No requests found.</td></tr>
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
                      <td>
                        {/* Only show Edit button if not completed */}
                        {r.status !== 'Completed' && (
                          <button 
                            className="button" 
                            style={{ backgroundColor: '#22c55e', color: 'white', marginRight: 8 }}
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
                          className="button" 
                          style={{ backgroundColor: '#ef4444', color: 'white' }}
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
            <button className="button" onClick={() => setShowMyRequests(false)} style={{ marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="modal" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
              <button className="button primary" type="submit" style={{ marginTop: 16 }}>Submit</button>
              {statusMsg && <div style={{ marginTop: 12 }}>{statusMsg}</div>}
            </form>
            <button className="button" onClick={() => setShowCreate(false)} style={{ marginTop: 16 }}>Cancel</button>
          </div>
        </div>
      )}

      {editRequest && (
        <div className="modal" onClick={() => setEditRequest(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
              <button className="button primary" type="submit" style={{ marginTop: 16 }}>Save Changes</button>
              {editStatusMsg && <div style={{ marginTop: 12 }}>{editStatusMsg}</div>}
            </form>
            <button className="button" onClick={() => setEditRequest(null)} style={{ marginTop: 16 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  </>
  );
};

export default PersonInNeedDashboard;
