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
     

      <section className="login-main login-section" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        {showSuspendedModal && (
          <div className="modal-overlay" style={{ background: 'rgba(44,62,80,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1000 }}>
            <div className="modal-content" style={{ background: 'white', borderRadius: '18px', padding: '2rem 2.5rem', boxShadow: '0 8px 32px rgba(44,62,80,0.18)', textAlign: 'center' }}>
              <h3 style={{ color: '#d7263d', fontWeight: 700, marginBottom: '0.5rem' }}>Account Suspended</h3>
              <p style={{ color: '#2d3748', marginBottom: '1.2rem' }}>Your account is currently suspended.</p>
              <button onClick={() => setShowSuspendedModal(false)} className="submit-btn btn" style={{ background: '#0077cc', color: 'white', borderRadius: '10px', padding: '0.7rem 2.2rem', fontWeight: 600, fontSize: '1rem', boxShadow: '0 2px 8px rgba(44,62,80,0.10)' }}>Close</button>
            </div>
          </div>
        )}
        <form id="loginForm" className="login-box" style={{ background: 'white', borderRadius: '24px', boxShadow: '0 12px 32px rgba(44,62,80,0.12)', padding: '2.5rem 2rem', maxWidth: '400px', width: '100%' }}>
          <div className="login-header">
            <img src="/logo192.png" alt="Logo" style={{ width: '56px', marginBottom: '0.7rem' }} />
            <header style={{ fontWeight: 700, fontSize: '2rem', color: '#2d3748', letterSpacing: '0.02em' }}>Welcome Back</header>
            <div style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.2rem', marginBottom: '0.7rem' }}>Sign in to your account</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.1rem' }}>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
              style={{ padding: '1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #bfc8d6', fontSize: '1.08rem', width: '100%', background: '#f3f6fb', boxSizing: 'border-box', transition: 'border 0.2s', outline: 'none' }}
              onFocus={e => e.currentTarget.style.border = '1.5px solid #0077cc'}
              onBlur={e => e.currentTarget.style.border = '1.5px solid #bfc8d6'}
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
              style={{ padding: '1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #bfc8d6', fontSize: '1.08rem', width: '100%', background: '#f3f6fb', boxSizing: 'border-box', transition: 'border 0.2s', outline: 'none' }}
              onFocus={e => e.currentTarget.style.border = '1.5px solid #0077cc'}
              onBlur={e => e.currentTarget.style.border = '1.5px solid #bfc8d6'}
            />
          </div>
          <div className="forgot">
            <section>
              <input type="checkbox" id="check" />
              <label htmlFor="check">Remember me</label>
            </section>
            <section>
              <a className="login-text" href="#">Forgot Password</a>
            </section>
          </div>
          <div className="input-submit" style={{ marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              type="submit"
              className="submit-btn btn"
              id="submit"
              style={{ background: '#0077cc', color: 'white', border: 'none', borderRadius: '16px', padding: '1rem 0', fontWeight: 700, fontSize: '1.3rem', width: '90%', marginTop: '0.2rem', boxShadow: '0 2px 8px rgba(44,62,80,0.10)', cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 0.2s', display: 'block', textAlign: 'center' }}
              onClick={handleLogin}
            >Sign In</button>
          </div>
          {status && <div className="login-status" style={{ color: status === 'Login successful!' ? '#22c55e' : '#d7263d', background: '#f8fafc', borderRadius: '8px', padding: '0.7rem', marginTop: '0.5rem', fontWeight: 500, fontSize: '1rem', textAlign: 'center' }}>{status}</div>}
        </form>
      </section>
    </>
  );
}

export default Login;
