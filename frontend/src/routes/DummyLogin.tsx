import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
 

function App() {
  
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [status, setStatus] = useState<string>("")

  const handleRegistration = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/person-in-need', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      if (res.ok) {
        setStatus("Registration successful!")
      } else {
        setStatus("Registration failed.")
      }
    } catch (err) {
      setStatus("Registration error.")
      console.error("Error: ", err)
    }
  }

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Important for session cookies
      })
      if (res.ok) {
        setStatus("Login successful!")
      } else {
        setStatus("Login failed.")
      }
    } catch (err) {
      setStatus("Login error.")
      console.error("Error: ", err)
    }
  }

  const handleLogout = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/logout', {
        method: "POST",
        credentials: 'include'
      })
      if (res.ok) {
        setStatus("Logged out.")
      } else {
        setStatus("Logout failed.")
      }
    } catch (err) {
      setStatus("Logout error.")
      console.error("Error: ", err)
    }
  }

  return (
    <>
      <div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          <input
            style={{ padding: 3, border: 1 }}
            name="username-input"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            name="password-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={handleRegistration}>
            Register UserAdmin
          </button>
          <button onClick={handleLogin}>
            Login UserAdmin
          </button>
          <button onClick={handleLogout}>
            Logout UserAdmin
          </button>
          <div>{status}</div>
        </div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
     
    </>
  )
}

export default App