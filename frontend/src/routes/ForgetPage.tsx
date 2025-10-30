import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgetPage.css";

function Forget() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission reload
    try {
      const res = await fetch("/api/userAdmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      if (res.ok) {
        setStatus("Login successful!");
        const data = await res.json();
        // Store username and role for dashboard
        localStorage.setItem('currentUsername', username);
        localStorage.setItem('currentRole', data.role);
        if (data.role === "User Admin") {
          navigate("/useradmin");
        } 
        else if (data.role === "Person In Need") {
          navigate("/pin");
        }
        else if (data.role === "CSR Rep") {
          navigate("/csr");
        }
        else if (data.role === "Platform Manager") {
          navigate("/platform");
        }
      } else {
          let errorMsg = "Login attempt failed.";
        try {
          const errorData = await res.json();
          if (errorData && errorData.error) errorMsg = errorData.error;
        } catch {errorMsg = "Login attempt failed.";}
        setStatus(errorMsg);
        if (errorMsg === "Account is currently suspended") {
          setShowSuspendedModal(true);
        }
      }
    } catch (err) {
      setStatus("Unable to Login.");
      console.error("Error:", err);
    }
  };

  return (
    <>
      <section className="forget-main forget-section">
    
        {showSuspendedModal && (
          <div className="modal-overlay" style={{ background: 'rgba(44,62,80,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000 }}>
            <div className="modal-content" style={{ background: 'white', borderRadius: '18px', padding: '2rem 2.5rem', boxShadow: '0 8px 32px rgba(44,62,80,0.18)', textAlign: 'center' }}>
              <h3 style={{ color: '#d7263d', fontWeight: 700, marginBottom: '0.5rem' }}>Account Suspended</h3>
              <p style={{ color: '#2d3748', marginBottom: '1.2rem' }}>Your account is currently suspended.</p>
              <button onClick={() => setShowSuspendedModal(false)} className="submit-btn btn" style={{ background: '#0077cc', color: 'white', borderRadius: '10px', padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }}>Close</button>
            </div>
          </div>
        )}

        <form id="loginForm" className="forget-box" onSubmit={handleLogin}>
          <div className="forget-header">
            <header>Reset Password</header>
            <div>Create a new secure password</div>
          </div>

          <div className="input-box">
            <header>Username</header>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-box">
            <header>New Password</header>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-box">
            <header>Confirm Password</header>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Confirm new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="forgot">
            <section>
              <a>Password must contain:</a>
            </section>
          </div>

          <div className="input-submit">
            <button
              type="submit"
              className="submit-btn btn"
              id="submit"
              onClick={handleLogin}
            ></button>
            <label htmlFor="submit">CONFIRM</label>
          </div>

          {status && <div className="forget-status">{status}</div>}
        </form>
      </section>
    </>
  );
}

export default Forget;
