import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission reload
    try {
      const res = await fetch("http://localhost:3000/api/login", {
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
        }
        else if (data.role === "PIN") {
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

  // const handleRegister = async () => {
  //   try {
  //     const res = await fetch('http://localhost:3000/api/person-in-need', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ username, password }),
  //     });
  //     if (res.ok) {
  //       setStatus('Account created!');
  //     } else {
  //       setStatus('Account creation failed.');
  //     }
  //   } catch (err) {
  //     setStatus('Registration error.');
  //     console.error('Error:', err);
  //   }
  // };

  return (
    // <div className="login-card">
    //   <h2>Login</h2>
    //   <input
    //     type="text"
    //     placeholder="Username"
    //     value={username}
    //     onChange={e => setUsername(e.target.value)}
    //   />
    //   <input
    //     type="password"
    //     placeholder="Password"
    //     value={password}
    //     onChange={e => setPassword(e.target.value)}
    //   />
    //   <button className="login-button" onClick={handleLogin}>
    //     Login
    //   </button>
    //   <button className="register-button" onClick={handleRegister}>
    //     Create Account
    //   </button>
    //   {status && <div className="login-status">{status}</div>}
    // </div>

    <>
      {/* <header class="header container">
            <img class="header-logo" src="assets/logo.png" />

            <div class="header-items">
                <ul class="header-menu">
                    <li>
                        <Link class="header-link back" to="/home">Back to Home</Link>
                    </li>
                </ul>
            </div>
        </header> */}

      <section className="login-main login-section">
        <form id="loginForm" className="login-box">
          <div className="login-header">
            <header>Welcome Back</header>
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
