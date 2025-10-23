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
      const res = await fetch("http://localhost:3000/api/userAdmin/login", {
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
     

      <section className="login-main login-section">
          {showSuspendedModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Account Suspended</h3>
              <p>Your account is currently suspended.</p>
              <button onClick={() => setShowSuspendedModal(false)} className="submit-btn btn">Close</button>
            </div>
          </div>
        )}
        <form id="loginForm" className="login-box">
          <div className="login-header">
            <header>Welcome Back</header>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginBottom: '1.2rem' }}>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
              style={{ padding: '1rem 1.5rem', borderRadius: '32px', border: 'none', fontSize: '1.1rem', width: '100%', background: '#fff', boxSizing: 'border-box', boxShadow: '0 2px 12px rgba(44,62,80,0.08)' }}
            />
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
              style={{ padding: '1rem 1.5rem', borderRadius: '32px', border: 'none', fontSize: '1.1rem', width: '100%', background: '#fff', boxSizing: 'border-box', boxShadow: '0 2px 12px rgba(44,62,80,0.08)' }}
            />
          </div>

          <div className="forgot">
            <section>
              <input type="checkbox" id="check" />
              <label htmlFor="check">Remember me</label>
            </section>
            <section>
              <a className="login-text" href="#">
                Forgot Password
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
            <label htmlFor="submit">Sign In</label>
          </div>

          {/* <div className="sign-up-link">
                    <p>Don't have an account? <Link className="login-text" to="/signup">Sign Up</Link></p>
                </div> */}

          {/* Make this a modal pop up because I don't like it if it appears at the bottom as text, THANKS FUTURE ME */}
          {status && <div className="login-status">{status}</div>}
        </form>
      </section>
    </>
  );
}

export default Login;
