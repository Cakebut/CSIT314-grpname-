// import React, { useEffect, useState } from "react";
// import { MapPin, X, Check } from "lucide-react"; // Importing icons for location and actions
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import "./PendingOffers.css";

// function getStatusColor(status?: string) {
//   switch ((status || '').toLowerCase()) {
//     case 'available':
//       return '#22c55e';
//     case 'pending':
//       return '#f59e42';
//     case 'completed':
//       return '#6b7280';
//     default:
//       return '#334155';
//   }
// }

// // Centralized status badge component
// const StatusBadge: React.FC<{ status?: string }> = ({ status }) => (
//   <span style={{ fontWeight: 600, color: getStatusColor(status) }}>
//     {status || <span style={{ color: '#6b7280' }}>-</span>}
//   </span>
// );



// interface Request {
//   id: number;
//   pin_id: number;
//   pinName: string;
//   title: string;
//   categoryID: number;
//   categoryName: string;
//   message?: string;
//   status?: string;
//   createdAt?: string;
//   locationID?: number;
//   locationName?: string;
//   urgencyLevelID?: number;
//   urgencyLabel?: string;
//   urgencyColor?: string;
//   view_count?: number;
//   shortlist_count?: number;
//   // optional array of csr shortlist entries (if backend provides detailed list)
//   csr_shortlists?: { csr_id: number }[];
// }

// // --- My Offers types ---
// interface Offer {
//   requestId: number;
//   title: string;
//   status: string;
//   assignedCsrId?: number | null;
//   interestedCsrs: { csr_id: number; interestedAt: string; username: string }[];
//   feedback?: {
//     id: number;
//     rating: number;
//     description?: string;
//     createdAt: string;
//   } | null;
// }

// const API_BASE = "http://localhost:3000";

// const PersonInNeedDashboard: React.FC = () => {
//   // Filter bar state
//   const [filterText, setFilterText] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [filterCategory, setFilterCategory] = useState("");
//   const [filterLocation, setFilterLocation] = useState("");
//   const [filterUrgency, setFilterUrgency] = useState("");
//   const navigate = useNavigate();
//   const [requests, setRequests] = useState<Request[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   // Edit modal state hooks (must be inside the component)
//   const [editRequest, setEditRequest] = useState<Request | null>(null);
//   const [editTitle, setEditTitle] = useState("");
//   const [editCategoryID, setEditCategoryID] = useState("");
//   const [editMessage, setEditMessage] = useState("");
//   const [editLocationID, setEditLocationID] = useState("");
//   const [editUrgencyLevelID, setEditUrgencyLevelID] = useState("");
//   const [editStatusMsg, setEditStatusMsg] = useState("");
//   const [selected, setSelected] = useState<Request | null>(null);
//   // Feedback modal state
//   const [showFeedbackModal, setShowFeedbackModal] = useState(false);
//   const [feedbackRequestId, setFeedbackRequestId] = useState<number | null>(null);
//   const [feedbackCsrId, setFeedbackCsrId] = useState<number | null>(null);
//   const [feedbackCsrUsername, setFeedbackCsrUsername] = useState<string>('');
//   const [feedbackText, setFeedbackText] = useState('');
//   const [feedbackLoading, setFeedbackLoading] = useState(false);
//   const [feedbackRating, setFeedbackRating] = useState<number>(0);


//   const [showMyRequests, setShowMyRequests] = useState(false);
//   const [myRequests, setMyRequests] = useState<Request[]>([]);
//   // My Requests modal filter/sort state
//   const [myRequestsFilterTitle, setMyRequestsFilterTitle] = useState("");
//   const [myRequestsFilterType, setMyRequestsFilterType] = useState("");
//   const [myRequestsFilterStatus, setMyRequestsFilterStatus] = useState("");
//   const [myRequestsFilterUrgency, setMyRequestsFilterUrgency] = useState("");
//   const [myRequestsSortViews, setMyRequestsSortViews] = useState("asc");
//   const [myRequestsSortShortlists, setMyRequestsSortShortlists] = useState("asc");
//   const [myRequestsPrimarySort, setMyRequestsPrimarySort] = useState<'views'|'shortlists'>('views');
//   const [showCreate, setShowCreate] = useState(false);
//   const [categoryID, setCategoryID] = useState("");
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [statusMsg, setStatusMsg] = useState("");
//   const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string }[]>([]);

//   const userId = Number(localStorage.getItem("userId"));
//   const username = localStorage.getItem("username") || "User";

//   // Notification type
//   interface Notification {
//     id: number;
//     type: string;
//     csr_id: number;
//     pin_request_id: number;
//     createdAt: string;
//     read: number;
//     csrUsername?: string;
//     requestTitle?: string;
//   }
//   // Notification state (must be inside component to access userId)
//   const [showNoti, setShowNoti] = useState(false);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [notiLoading, setNotiLoading] = useState(false);
//   const [notiError, setNotiError] = useState("");
//   const [notiHasUnread, setNotiHasUnread] = useState(false);
//   const notiButtonRef = React.useRef<HTMLButtonElement>(null);
//   const notiPopoverRef = React.useRef<HTMLDivElement>(null);
//   // Outside click handler for notification popover
//   useEffect(() => {
//     if (!showNoti) return;
//     function handleClick(e: MouseEvent) {
//       const btn = notiButtonRef.current;
//       const pop = notiPopoverRef.current;
//       if (!btn || !pop) return;
//       if (
//         !btn.contains(e.target as Node) &&
//         !pop.contains(e.target as Node)
//       ) {
//         setShowNoti(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, [showNoti]);

//   // Fetch notifications for PIN user
//   const fetchNotifications = React.useCallback(() => {
//     if (!userId) return;
//     setNotiLoading(true);
//     setNotiError("");
//     fetch(`${API_BASE}/api/pin/notifications/${userId}`)
//       .then(res => res.json())
//       .then(data => {
//         // Only keep 'interested' and 'shortlist' notification types for PIN dashboard
//         const filtered = (data.data || []).filter((n: Notification) => n.type === 'interested' || n.type === 'shortlist');
//         setNotifications(filtered);
//         setNotiLoading(false);
//         setNotiHasUnread(filtered.some((n: Notification) => n.read === 0));
//       })
//       .catch(() => {
//         setNotiError("Could not load notifications.");
//         setNotiLoading(false);
//       });
//   }, [userId]);

//   useEffect(() => {
//     fetchNotifications();
//     // Optionally poll for new notifications every 60s
//     // const interval = setInterval(fetchNotifications, 60000);
//     // return () => clearInterval(interval);
//   }, [userId, fetchNotifications]);
//   const [locationID, setLocationID] = useState("");
//   const [urgencyLevelID, setUrgencyLevelID] = useState("");
//   const [locations, setLocations] = useState<{ id: number; name: string; line: string }[]>([]);
//   const [urgencyLevels, setUrgencyLevels] = useState<{ id: number; label: string; color: string }[]>([]);
//   const [latestAnnouncement, setLatestAnnouncement] = useState<{ message: string; createdAt: string } | null>(null);
//   const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
//   useEffect(() => {
//     fetch(`${API_BASE}/api/pin/locations`)
//       .then(res => res.json())
//       .then(data => setLocations(data.data || []));
//     fetch(`${API_BASE}/api/pin/urgency-levels`)
//       .then(res => res.json())
//       .then(data => setUrgencyLevels(data.data || []));
//     // Load latest platform announcement for PIN users
//     fetch(`${API_BASE}/api/pm/announcements/latest`)
//       .then(res => res.json())
//       .then(data => {
//         const latest = data?.latest ?? null;
//         setLatestAnnouncement(latest);
//         if (latest?.createdAt) {
//           const lastSeen = localStorage.getItem('latestAnnouncementSeenAt');
//           if (lastSeen !== latest.createdAt) {
//             setShowAnnouncementModal(true);
//           }
//         }
//       })
//       .catch(() => {});
//   }, []);



//   useEffect(() => {
//   fetch(`${API_BASE}/api/pin/service-types`)
//     .then(res => res.json())
//     .then(data => setServiceTypes(data.data || []));
//   }, []);

//   // Helper to fetch all requests
//   const fetchAllRequests = () => {
//     setLoading(true);
//     fetch(`${API_BASE}/api/pin/requests`)
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch requests");
//         return res.json();
//       })
//       .then((data) => {
//         setRequests(data.data || []);
//         setLoading(false);
//       })
//       .catch(() => {
//         setError("Could not load requests.");
//         setLoading(false);
//       });
//   };

//   useEffect(() => {
//     fetchAllRequests();
//   }, []);

//   const openMyRequests = () => {
//     if (!userId) {
//       setStatusMsg("No user is signed in.");
//       return;
//     }
//     setStatusMsg("");
//     fetch(`${API_BASE}/api/pin/requests/user/${userId}`)
//       .then(res => res.json())
//       .then(data => {
//         setMyRequests(data.data || []);
//         setShowMyRequests(true);
//       })
//       .catch(() => setStatusMsg("Network error while loading My Requests"));
//   };

//   // My Offers state
//   const [showMyOffers, setShowMyOffers] = useState(false);
//   const [offers, setOffers] = useState<Offer[]>([]);
//   const [offersLoading, setOffersLoading] = useState(false);
//   const [offersError, setOffersError] = useState("");

//   // Fetch My Offers (all requests for PIN + interested CSRs)
//   const openMyOffers = () => {
//     if (!userId) {
//       setOffersError("No user is signed in.");
//       setShowMyOffers(true);
//       return;
//     }
//     setOffersLoading(true);
//     setOffersError("");
//     fetch(`${API_BASE}/api/pin/offers/${userId}`)
//       .then(res => res.json())
//       .then(data => {
//         setOffers(data.data || []);
//         setOffersLoading(false);
//         setShowMyOffers(true);
//       })
//       .catch(() => {
//         setOffersError("Could not load offers.");
//         setOffersLoading(false);
//         setShowMyOffers(true);
//       });
//   };

//   // Accept a CSR for a request
//   const handleAcceptCsr = async (requestId: number, csrId: number) => {
//     const res = await fetch(`${API_BASE}/api/pin/offers/${requestId}/accept`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ csrId }),
//     });
//     if (res.ok) {
//       toast.success("CSR accepted for this request.");
//       // Refetch offers after a short delay to ensure backend updates are reflected
//       setTimeout(openMyOffers, 300);
//     } else {
//       toast.error("Failed to accept CSR.");
//     }
//   };

//   // Cancel a CSR's interest for a request
//   const handleCancelCsr = async (requestId: number, csrId: number) => {
//     const res = await fetch(`${API_BASE}/api/pin/offers/${requestId}/cancel`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ csrId }),
//     });
//     if (res.ok) {
//       toast.success("CSR interest cancelled.");
//       setTimeout(openMyOffers, 300);
//     } else {
//       toast.error("Failed to cancel CSR interest.");
//     }
//   };



//   const handleCreate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatusMsg("");
//     if (!title.trim()) {
//       setStatusMsg("Please enter a request title.");
//       return;
//     }
//     if (!categoryID) {
//       setStatusMsg("Please select a request type.");
//       return;
//     }
//     if (!locationID) {
//       setStatusMsg("Please select a location.");
//       return;
//     }
//     if (!urgencyLevelID) {
//       setStatusMsg("Please select an urgency level.");
//       return;
//     }
//     const res = await fetch(`${API_BASE}/api/pin/requests`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ pin_id: userId, title, categoryID: Number(categoryID), message, locationID: Number(locationID), urgencyLevelID: Number(urgencyLevelID) }),
//     });
//     if (res.ok) {
//       toast.success("Request created successfully!");
//       setTitle("");
//       setCategoryID("");
//       setMessage("");
//       setLocationID("");
//       setUrgencyLevelID("");
//       openMyRequests();
//       fetchAllRequests(); // Refresh all requests table after create
//       setShowCreate(false);
//     } else {
//       toast.error("Failed to create request.");
//     }
//   };

//   // Download handler for past service history
//   const handleDownloadHistory = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/pin/requests/history?pin_id=${userId}`);
//       if (!res.ok) throw new Error('Failed to download history');
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = 'service-history.csv';
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       window.URL.revokeObjectURL(url);
//     } catch {
//       toast.error('Could not download service history.');
//     }
//   };

//   // Open feedback modal for a completed offer
//   function openFeedbackModal(requestId: number, csrId: number, csrUsername?: string) {
//     setShowMyOffers(false); // Close My Offers modal first
//     setFeedbackRequestId(requestId);
//     setFeedbackCsrId(csrId);
//     setFeedbackCsrUsername(csrUsername || 'CSR');
//     setFeedbackText('');
//     setShowFeedbackModal(true);
//   }

//   // Reset feedback modal state
//   function handleCancelFeedback() {
//     setShowFeedbackModal(false);
//     setFeedbackRequestId(null);
//     setFeedbackCsrId(null);
//     setFeedbackCsrUsername('');
//     setFeedbackText('');
//     setFeedbackRating(0);
//   }

//   // Submit feedback to backend
//   async function handleSubmitFeedback() {
//     if (!feedbackRequestId || !feedbackCsrId || feedbackRating === 0) return;
//     setFeedbackLoading(true);
//     const createdAt = new Date().toISOString();
//     try {
//       const res = await fetch(`${API_BASE}/api/pin/feedback`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           requestId: feedbackRequestId,
//           csrId: feedbackCsrId,
//           pinId: userId,
//           rating: feedbackRating,
//           description: feedbackText,
//           createdAt,
//         }),
//       });
//       if (res.ok) {
//         toast.success('Feedback submitted!');
//         // Refetch offers from backend to get updated feedback data
//         openMyOffers();
//         handleCancelFeedback();
//       } else {
//         toast.error('Failed to submit feedback.');
//       }
//     } catch {
//       toast.error('Failed to submit feedback.');
//     }
//     setFeedbackLoading(false);
//   }

//   // Compute filtered and sorted My Requests for the modal
//   const filteredSortedMyRequests = [...myRequests].filter(r => {
//     if (myRequestsFilterTitle && !(r.title || '').toLowerCase().includes(myRequestsFilterTitle.toLowerCase())) return false;
//     if (myRequestsFilterType && r.categoryName !== myRequestsFilterType) return false;
//     if (myRequestsFilterStatus && r.status !== myRequestsFilterStatus) return false;
//     if (myRequestsFilterUrgency && (r.urgencyLabel || '') !== myRequestsFilterUrgency) return false;
//     return true;
//   });
//   // Helper to get shortlist count either from detailed csr_shortlists array or from shortlist_count
//   const getShortlistCount = (r: Request) => Array.isArray((r as any).csr_shortlists) ? (r as any).csr_shortlists.length : (r.shortlist_count ?? 0);

//   // Apply sorting: primary key controlled by myRequestsPrimarySort
//   filteredSortedMyRequests.sort((a, b) => {
//     const compareBy = (key: 'views'|'shortlists') => {
//       if (key === 'views') {
//         const va = a.view_count ?? 0;
//         const vb = b.view_count ?? 0;
//         if (va !== vb) return myRequestsSortViews === 'asc' ? va - vb : vb - va;
//         return 0;
//       } else {
//         const sa = getShortlistCount(a);
//         const sb = getShortlistCount(b);
//         if (sa !== sb) return myRequestsSortShortlists === 'asc' ? sa - sb : sb - sa;
//         return 0;
//       }
//     };

//     // primary
//     const p = compareBy(myRequestsPrimarySort);
//     if (p !== 0) return p;
//     // secondary
//     const secondaryKey: 'views'|'shortlists' = myRequestsPrimarySort === 'views' ? 'shortlists' : 'views';
//     const s = compareBy(secondaryKey);
//     if (s !== 0) return s;
//     return 0;
//   });

//   return (
//     <div className="pending-offers-container">
//       <div className="pending-offers-top">
//         <div>
//           <header className="pending-offers-header"></header>
//           <h1>Pending Offers For You</h1>
//           <p>Browse and track any ongoing pending offers offered by CSR Representatives</p>
//         </div>
//       </div>

//       <div className="pending-offers-content">
//         {offersLoading ? (
//           <div>Loading...</div>
//         ) : offersError ? (
//           <div style={{ color: '#b91c1c' }}>{offersError}</div>
//         ) : offers.length > 0 ? (
//           <div>
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Request Title</th>
//                   <th>Status</th>
//                   <th>Interested CSRs</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {offers.map(offer => (
//                   <tr key={offer.requestId}>
//                     <td>{offer.title}</td>
//                     <td>{offer.status}</td>
//                     <td>
//                       {offer.interestedCsrs.length === 0 ? (
//                         <span style={{ color: '#6b7280' }}>No interested CSRs</span>
//                       ) : (
//                         <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
//                           {offer.interestedCsrs.map(csr => (
//                             <li key={csr.csr_id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
//                               <span style={{ fontWeight: 600 }}>{csr.username || `CSR #${csr.csr_id}`}</span>
//                               <span style={{ color: '#64748b', fontSize: 13 }}>({new Date(csr.interestedAt).toLocaleDateString()})</span>
//                               {offer.assignedCsrId === csr.csr_id && offer.status === 'Pending' && (
//                                 <span style={{ color: '#22c55e', fontWeight: 700, marginLeft: 8 }}>Assigned</span>
//                               )}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </td>
//                     <td>
//                       {offer.interestedCsrs.map(csr => (
//                         <div key={csr.csr_id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
//                           {offer.assignedCsrId !== csr.csr_id && offer.status === 'Pending' && (
//                             <>
//                               <button className="button" style={{ backgroundColor: '#22c55e', color: 'white' }} onClick={() => handleAcceptCsr(offer.requestId, csr.csr_id)}>Accept</button>
//                               <button className="button" style={{ backgroundColor: '#ef4444', color: 'white', marginLeft: 4 }} onClick={() => handleCancelCsr(offer.requestId, csr.csr_id)}>Cancel</button>
//                             </>
//                           )}
//                           {offer.status === 'Pending' && offer.assignedCsrId === csr.csr_id && (
//                             <button className="button" style={{ backgroundColor: '#6b7280', color: 'white' }} onClick={async () => {
//                               if (window.confirm('Mark this request as completed?')) {
//                                 const res = await fetch(`${API_BASE}/api/pin/offers/${offer.requestId}/complete`, { method: 'POST' });
//                                 if (res.ok) {
//                                   toast.success('Request marked as completed.');
//                                   fetchOffers();
//                                 } else {
//                                   toast.error('Failed to mark request as completed.');
//                                 }
//                               }
//                             }}>Mark Completed</button>
//                           )}
//                           {offer.status === 'Completed' && offer.assignedCsrId === csr.csr_id && (
//                             (!offer.feedback) ? (
//                               <button className="button" style={{ backgroundColor: '#2563eb', color: 'white' }} onClick={() => {
//                                 // open feedback flow - reuse dashboard handler if present
//                                 // fallback: show toast
//                                 toast.info('Open feedback dialog (not implemented here).');
//                               }}>Feedback</button>
//                             ) : null
//                           )}
//                         </div>
//                       ))}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           // fallback to sample UI using local sample data
//           <div>
//             <table className="table">
//               <thead>
//                 <tr>
//                   <th>Request Title</th>
//                   <th>Status</th>
//                   <th>Interested CSRs</th>
//                   <th>Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {offersRequests.map(req => {
//                   // show no interested CSRs in fallback
//                   return (
//                     <tr key={req.id}>
//                       <td>{req.title}</td>
//                       <td>{req.status ?? 'Pending'}</td>
//                       <td><span style={{ color: '#6b7280' }}>No interested CSRs</span></td>
//                       <td />
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Offers;
