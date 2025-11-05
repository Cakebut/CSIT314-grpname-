import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('currentUsername');
  const role = localStorage.getItem('currentRole');
  const [latestAnnouncement, setLatestAnnouncement] = useState<{ message: string; createdAt: string } | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

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
