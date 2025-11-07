import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

// COMPONENT


// LOGIN PAGE
import Login from './routes/LoginPage';

// FORGET PASSWORD PAGE
import Forget from './routes/ForgetPage';

// USER ADMIN PAGE
import AdminDashboard from './routes/UserAdmin/AdminDashboard';

// PERSON IN NEED PAGE
import PINDashboard from './routes/PersonInNeed/PINDashboard';

// CSR PAGE
import CSRDashboard from './routes/CSR/CSRDashboard';

// PLAT MANAGER PAGE
import PMDashboard from './routes/PlatformManager/PMDashboard';

// CSS
import './App.css';

function App() {
  useEffect (() => {
    document.title = "Volunteering Service in Singapore"
  })

  return (
    <Router>
      <div className="app-wrapper">
        <Routes>

            {/* Login */}
            <Route path="/" element={<Login />} />

            {/* Forget Password */}
            <Route path="/forget" element={<Forget />} />
        
            {/* User Admin */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Person-in-Need */}
            <Route path="/pin" element={<PINDashboard />} />

            {/* CSR */}
            <Route path="/csr" element={<CSRDashboard />} />

            {/* PM */}
            <Route path="/pm" element={<PMDashboard />} />            

        </Routes>
      </div>
    </Router>
  );
}

export default App;
