import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  const navigate = useNavigate();

  // Add a logout handler
  const handleLogout = () => {
    localStorage.removeItem('dummyUsers'); // Clear dummy users
    navigate('/'); // Redirect to login
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <div className="bubble-options">
        <div className="bubble" onClick={() => navigate('/useradmin/ViewUserList')}>
          View User Dashboard
        </div>
        <div className="bubble" onClick={() => navigate('/useradmin/ViewUserRoles')}>
          View Roles Dashboard
        </div>
        <div className="bubble logout-bubble" onClick={handleLogout}> {/* need to change to this () => navigate('/') */}
          Logout
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
