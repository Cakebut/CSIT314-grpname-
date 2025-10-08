import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const handleRegistration = async() => {
    try {
      console.log("User, pwd: ", username, password)
      const res = await fetch('http://localhost:3000/api/person-in-need', {
        method: "POST", 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: password
        })
      })
      if (!res.ok) {
        console.error("Error: ", res)
      }
      console.log("Res: ", res)
    } catch (err) {
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
          style={{
            padding: 3,
            border: 1,  
          }}
          name="username-input" value={username} onChange={e => setUsername(e.target.value)} 
        />
        <input 
          name="password-input" value={password} onChange={e => setPassword(e.target.value)} 
        />
        <button onClick={handleRegistration}>
          Register Shitty User
        </button>
        </div>
        
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more and change again
      </p>
    </>
  )
}

export default App
