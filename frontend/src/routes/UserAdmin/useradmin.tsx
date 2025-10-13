import { useNavigate } from 'react-router-dom';
import './UserAdmin.css';

function UserAdmin() {
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
        <div className="bubble" onClick={() => navigate('/useradmin/users')}>
          View User Dashboard
        </div>
        <div className="bubble" onClick={() => navigate('/useradmin/roles')}>
          View Roles Dashboard
        </div>
        <div className="bubble logout-bubble" onClick={handleLogout}> {/* need to change to this () => navigate('/') */}
          Logout
        </div>
      </div>
    </div>
  );
}

export default UserAdmin;
