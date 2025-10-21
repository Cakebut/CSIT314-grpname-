import { Link } from 'react-router-dom';
import './Navbar.css'

function Navbar() {
  return (
    <>
      <header className="header container">
        {/* <Link to="/main">
          <img className="header-logo" src="../assets/images/logo.png" alt="Logo" />
        </Link> */}

        <div className="header-items">
          <ul className="header-menu">
            <li><Link className="header-link" to="/about">Dashboard</Link></li>
            <li><Link className="header-link" to="/volunteer">Notification</Link></li>
            <li><Link className="header-link" to="/campaign">System Log</Link></li>
            <li><Link className="header-link" to="/contact">View User</Link></li>
            <li><Link className="header-link" to="/contact">Create User</Link></li>
            <li><Link className="header-link" to="/contact">Add User</Link></li>

            <li><Link className="header-login btn" to="/">Logout</Link></li>
          </ul>
        </div>
      </header>
    </>
  );
}

export default Navbar;
