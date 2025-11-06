import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('currentUsername');
  const role = localStorage.getItem('currentRole');
  const [latestAnnouncement, setLatestAnnouncement] = useState<{ message: string; createdAt: string } | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showNotiPop, setShowNotiPop] = useState(false);
  const notiBtnRef = useRef<HTMLButtonElement | null>(null);
  const notiPopRef = useRef<HTMLDivElement | null>(null);
  const [adminNotifs, setAdminNotifs] = useState<Array<{ id: number; user_id: number; username: string; message: string; createdAt: string; read: number }>>([]);

  useEffect(() => {
    // Load the latest platform announcement
    fetch('/api/pm/announcements/latest')
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

  // click-away for popover
  useEffect(() => {
    if (!showNotiPop) return;
    function onDocClick(e: MouseEvent) {
      const btn = notiBtnRef.current;
      const pop = notiPopRef.current;
      if (!(e.target instanceof Node)) return;
      if (btn && btn.contains(e.target)) return;
      if (pop && pop.contains(e.target)) return;
      setShowNotiPop(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [showNotiPop]);

  // Fetch admin notifications when the popover is opened
  useEffect(() => {
    if (!showNotiPop) return;
    fetch('/api/userAdmin/admin-notifications')
      .then(r => r.json())
      .then(data => {
        if (data && data.success) setAdminNotifs(data.notifications || []);
      })
      .catch(err => console.error('Failed to fetch admin notifications', err));
  }, [showNotiPop]);

  // Add a logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/userAdmin/logout', { method: 'POST', credentials: 'include' });
      } catch {
        console.error("Logout error:");
        // Optionally handle error
    }
    localStorage.removeItem('dummyUsers'); // Clear dummy users
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('currentRole');
    navigate('/'); // Redirect to login
  };

  return (
    <div className="admin-bg">
      {/* notification bell will be rendered inside the card so it's positioned relative to it */}
      {latestAnnouncement && showAnnouncementModal && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', width: 'min(640px, 92vw)', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Announcement</div>
            <div style={{ whiteSpace: 'pre-wrap', color: '#111827' }}>{latestAnnouncement.message}</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 6 }}>at {new Date(latestAnnouncement.createdAt).toLocaleString()}</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="button" onClick={() => { localStorage.setItem('latestAnnouncementSeenAt', latestAnnouncement!.createdAt); setShowAnnouncementModal(false); }} style={{ background: '#2563eb', color: '#fff' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      <div className="admin-container admin-card">
        {/* Inline notification bell (top-right of card) */}
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <button ref={notiBtnRef} className="admin-bell" aria-label="Notifications" title="Notifications" onClick={() => setShowNotiPop(s => !s)}>
            🔔
            {/* unread dot for latest announcement OR admin notifications */}
            {(latestAnnouncement && latestAnnouncement.createdAt !== localStorage.getItem('latestAnnouncementSeenAt')) || adminNotifs.some(n => n.read === 0) ? (
              <span className="admin-bell-dot" />
            ) : null}
          </button>
          {showNotiPop && (
            <div ref={notiPopRef} className="admin-noti-popover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>Notifications</div>
                <button className="button" onClick={() => { if (latestAnnouncement) localStorage.setItem('latestAnnouncementSeenAt', latestAnnouncement.createdAt); setShowNotiPop(false); setShowAnnouncementModal(false); }} style={{ padding: '4px 8px' }}>Close</button>
              </div>
              {/* Render admin notifications first if present */}
              {adminNotifs.length > 0 ? (
                <div className="admin-noti-list">
                  {adminNotifs.map(n => (
                    <button key={n.id} className="admin-notif-item" aria-read={n.read === 0 ? 'false' : 'true'} onClick={async () => {
                      try {
                        // Delete notification when clicked (as requested)
                        const resp = await fetch(`/api/userAdmin/admin-notifications/${n.id}`, { method: 'DELETE' });
                        if (resp.ok) {
                          setAdminNotifs(prev => prev.filter(x => x.id !== n.id));
                        } else {
                          console.error('Failed to delete admin notification');
                        }
                      } catch (err) {
                        console.error('Delete admin notification error', err);
                      }
                    }}>
                      <div className="notif-title">{n.username}</div>
                      <div className="notif-message">{n.message}</div>
                      <div className="notif-meta">{new Date(n.createdAt).toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              ) : (
                // Fallback to platform announcement if no admin notifications
                (latestAnnouncement ? (
                  <div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{new Date(latestAnnouncement.createdAt).toLocaleString()}</div>
                    <div style={{ fontSize: 14, color: '#111827', whiteSpace: 'pre-wrap' }}>{latestAnnouncement.message}</div>
                  </div>
                ) : (
                  <div className="pm-noti-empty">No announcements</div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="admin-logo">
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="27" cy="27" r="27" fill="#6C63FF"/>
            <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="24" fontFamily="Arial" dy=".3em">A</text>
          </svg>
        </div>
        <h1 style={{ color: '#2d3748', fontWeight: 700, fontSize: '2.2rem', marginBottom: '0.5rem' }}>Admin Dashboard</h1>
        {username && role && (
          <div className="welcome-message" style={{marginBottom: '32px', fontSize: '1.25rem', color: '#333', fontWeight: 500}}>
            Welcome, <span style={{color:'#6C63FF'}}>{username}</span>!<br />Role: <span style={{color:'#764ba2'}}>{role}</span>
          </div>
        )}
        
        <div className="bubble-options">
          <div className="bubble" onClick={() => navigate('/useradmin/ViewUserList')}>
            View User Dashboard
          </div>
          <div className="bubble" onClick={() => navigate('/useradmin/ViewUserRoles')}>
            View Roles Dashboard
          </div>
          <div className="bubble" onClick={() => navigate('/useradmin/SystemLog')}>
            View System Log
          </div>
          <div className="bubble" onClick={() => navigate('/useradmin/PasswordResetRequests')}>
            View Password Reset Dashboard
          </div>
          <div className="bubble logout-bubble" onClick={handleLogout}>
            Logout
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
