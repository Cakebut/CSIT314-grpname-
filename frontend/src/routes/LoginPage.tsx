import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function Login() {
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
        // Store username, role, userId, and username for dashboard features
        localStorage.setItem('currentUsername', username);
        localStorage.setItem('currentRole', data.role);
        if (data.id) localStorage.setItem('userId', String(data.id));
        if (data.username) localStorage.setItem('username', data.username);
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
          navigate("/platformManager");
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

      <section className="login-main login-section">
        {showSuspendedModal && (
          <div className="modal-overlay" style={{ background: 'rgba(44,62,80,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000 }}>
            <div className="modal-content" style={{ background: 'white', borderRadius: '18px', padding: '2rem 2.5rem', boxShadow: '0 8px 32px rgba(44,62,80,0.18)', textAlign: 'center' }}>
              <h3 style={{ color: '#d7263d', fontWeight: 700, marginBottom: '0.5rem' }}>Account Suspended</h3>
              <p style={{ color: '#2d3748', marginBottom: '1.2rem' }}>Your account is currently suspended</p>
              <button onClick={() => setShowSuspendedModal(false)} className="submit-btn btn" style={{ background: 'black', color: 'white', borderRadius: '10px', padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }}>Close</button>
            </div>
          </div>
        )}

        <form id="loginForm" className="login-box" onSubmit={handleLogin}>
          <div className="login-header">
            <header>Welcome</header>
            <div>Sign in to your account</div>
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
            <header>Password</header>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="forgot">
            <section>
              <input type="checkbox" id="check" />
              <label htmlFor="check">Remember Me</label>
            </section>
            <section>
              <a className="forgot-text" href="/forgot-password">
                Forgot Password?
              </a>
            </section>
          </div>

          <div className="input-submit">
            <button
              type="submit"
              className="submit-btn btn"
              id="submit"
              onClick={handleLogin}
            ></button>
            <label htmlFor="submit">SIGN IN</label>
          </div>

          {status && <div className="login-status">{status}</div>}
        </form>
      </section>
    </>
  );
}

export default Login;
