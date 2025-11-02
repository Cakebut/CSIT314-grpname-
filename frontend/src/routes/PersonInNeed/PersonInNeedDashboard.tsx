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

import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./PersonInNeedDashboard.css";



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
}

const API_BASE = "http://localhost:3000";

const PersonInNeedDashboard: React.FC = () => {
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
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [categoryID, setCategoryID] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [serviceTypes, setServiceTypes] = useState<{ id: number; name: string }[]>([]);
  const [locationID, setLocationID] = useState("");
  const [urgencyLevelID, setUrgencyLevelID] = useState("");
  const [locations, setLocations] = useState<{ id: number; name: string; line: string }[]>([]);
  const [urgencyLevels, setUrgencyLevels] = useState<{ id: number; label: string; color: string }[]>([]);
  useEffect(() => {
    fetch(`${API_BASE}/api/pin/locations`)
      .then(res => res.json())
      .then(data => setLocations(data.data || []));
    fetch(`${API_BASE}/api/pin/urgency-levels`)
      .then(res => res.json())
      .then(data => setUrgencyLevels(data.data || []));
  }, []);

  const userId = Number(localStorage.getItem("userId"));


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
      const res = await fetch(`${API_BASE}/api/pin/requests/history?userId=${userId}`);
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
    } catch (err) {
      toast.error('Could not download service history.');
    }
  };



  return (
    <div className="container">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <h2>All Person-In-Need Requests</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="button primary" onClick={openMyRequests}>My Requests</button>
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
          {requests.length === 0 ? (
            <div className="row-muted" style={{ fontSize: 18, color: '#64748b', padding: 32, borderRadius: 12, background: '#f3f4f6', width: '90%' }}>
              No requests found.
            </div>
          ) : (
            requests.map((r) => (
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
                onClick={async () => {
                  await fetch(`${API_BASE}/api/pin/requests/${r.id}/increment-view`, { method: 'POST' });
                  setSelected(r);
                }}
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
            ))
          )}
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
                {myRequests.length === 0 ? (
                  <tr><td colSpan={8} className="row-muted">No requests found.</td></tr>
                ) : (
                  myRequests.map(r => (
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
                          <span style={{ fontWeight: 600 }}>{r.shortlist_count ?? 0}</span>
                        </span>
                      </td>
                      <td>
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
      {/* Edit Request Modal */}
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 6 }}>
                  {locations.map(loc => (
                    <label key={loc.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: editLocationID === loc.id.toString() ? 600 : 400 }}>
                      <input
                        type="radio"
                        name="edit-location"
                        value={loc.id}
                        checked={editLocationID === loc.id.toString()}
                        onChange={() => setEditLocationID(loc.id.toString())}
                        style={{ marginRight: 6 }}
                      />
                      {loc.name} {loc.line ? `(${loc.line})` : ''}
                    </label>
                  ))}
                </div>
                {!editLocationID && <div style={{ color: '#b91c1c', marginTop: 4, fontSize: 13 }}>Please select a location</div>}
              </div>
              <div style={{ marginTop: 12 }}>
                <label>Urgency Level:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 6 }}>
                  {urgencyLevels.map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: editUrgencyLevelID === u.id.toString() ? 600 : 400 }}>
                      <input
                        type="radio"
                        name="edit-urgency"
                        value={u.id}
                        checked={editUrgencyLevelID === u.id.toString()}
                        onChange={() => setEditUrgencyLevelID(u.id.toString())}
                        style={{ marginRight: 6 }}
                      />
                      {u.label}
                    </label>
                  ))}
                </div>
                {!editUrgencyLevelID && <div style={{ color: '#b91c1c', marginTop: 4, fontSize: 13 }}>Please select an urgency level</div>}
              </div>
              <button className="button primary" type="submit" style={{ marginTop: 16 }}>Update</button>
              {editStatusMsg && <div style={{ marginTop: 12 }}>{editStatusMsg}</div>}
            </form>
            <button className="button" onClick={() => setEditRequest(null)} style={{ marginTop: 16 }}>Cancel</button>
          </div>
        </div>
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
    </div>
  );
};

export default PersonInNeedDashboard;
