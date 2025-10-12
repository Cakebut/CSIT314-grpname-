import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include', // for session cookies
      });

      if (res.ok) {
        setStatus('Login successful!');
        navigate('/useradmin');
      } else {
        setStatus('Login failed.');
      }
    } catch (err) {
      setStatus('Login error.');
      console.error('Error:', err);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/person-in-need', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        setStatus('Account created!');
      } else {
        setStatus('Account creation failed.');
      }
    } catch (err) {
      setStatus('Registration error.');
      console.error('Error:', err);
    }
  };

  return (
    <div className="login-card">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button className="login-button" onClick={handleLogin}>
        Login
      </button>
      <button className="register-button" onClick={handleRegister}>
        Create Account
      </button>
      {status && <div className="login-status">{status}</div>}
    </div>
  );
}

export default Login;
