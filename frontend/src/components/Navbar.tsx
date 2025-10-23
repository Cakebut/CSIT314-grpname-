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
            <li><Link className="header-link" to="/useradmin">Dashboard</Link></li>
            <li><Link className="header-link" to="/#">Notifications</Link></li>
            <li><Link className="header-link" to="/#">System Log</Link></li>
            <li><Link className="header-link" to="/useradmin/viewroles">View User</Link></li>
            <li><Link className="header-link" to="/useradmin/createuser">Create User</Link></li>

            <li><Link className="header-login btn" to="/">Logout</Link></li>
          </ul>
        </div>
      </header>
    </>
  );
}

export default Navbar;
