import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('currentUsername');
  const role = localStorage.getItem('currentRole');

  // Add a logout handler
  const handleLogout = () => {
    localStorage.removeItem('dummyUsers'); // Clear dummy users
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('currentRole');
    navigate('/'); // Redirect to login
  };

  return (
    <div className="admin-bg">
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
          <div className="bubble logout-bubble" onClick={handleLogout}>
            Logout
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
