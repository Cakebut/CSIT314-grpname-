
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const navigate = useNavigate();

    const onClick = () => {
        navigate('/Contact'); // Navigate to the "/Contact" route
    };

    return (
        <>
            <header className="header container">
                <Link to="/main">
                    <img className="header-logo" src="../assets/images/logo.png" alt="Logo" />
                </Link>

                <div className="header-items">
                    <ul className="header-menu">
                        <li><Link className="header-link" to="/main">Home</Link></li>
                        <li><Link className="header-link" to="/about">About us</Link></li>
                        <li><Link className="header-link" to="/volunteer">Volunteer</Link></li>
                        <li><Link className="header-link" to="/campaign">Campaigns</Link></li>
                        <li><Link className="header-link" to="/contact">Contact</Link></li>
                        <li className="header-line"></li>
                        <li><Link className="header-login btn" to="/login">Login</Link></li>
                    </ul>
                </div>

                <div className="header-bars">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </div>
            </header>

            <button className="floating-button btn" onClick={onClick}>
                <p>Contact us</p>
            </button>
        </>
    );
}

export default Navbar;
