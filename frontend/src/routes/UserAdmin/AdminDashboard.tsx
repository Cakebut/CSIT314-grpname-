import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';
import './UserAdminNavbar.css';

function AdminDashboard() {
  const navigate = useNavigate();

  // Add a logout handler
  const handleLogout = () => {
    localStorage.removeItem('dummyUsers'); // Clear dummy users
    navigate('/'); // Redirect to login
  };

  return (
    <>
      <header className="header container">

        <div className="header-items">
          <ul className="header-menu">
            <li><Link className="header-link" to="/useradmin">Dashboard</Link></li>
            <li><Link className="header-link" to="/#">Notifications</Link></li>
            <li><Link className="header-link" to="/#">System Log</Link></li>
            <li><Link className="header-link" to="/useradmin/viewroles">View User</Link></li>
            <li><Link className="header-link" to="/useradmin/createuser">Create User</Link></li>

            <li><Link className="header-login btn" to="/">Logout</Link></li>
          </ul>
        </div>
      </header>

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
    </>
  );
}

export default AdminDashboard;
