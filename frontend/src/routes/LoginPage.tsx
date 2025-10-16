import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<string>("");

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
        console.log(data.role);
        if (data.role === "User Admin") {
          navigate("/useradmin");
        } else if (data.role === "PIN") {
          navigate("/pin");
        }
      } else {
        setStatus("Login attempt failed.");
      }
    } catch (err) {
      setStatus("Unable to Login.");
      console.error("Error:", err);
    }
  };

  return (
    <>
      <section className="login-main login-section">
        <form id="loginForm" className="login-box">
          <div className="login-header">
            <header>Welcome</header>
          </div>

          <div>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-box">
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Password"
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
              <a className="forgot-text" href="#">
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
