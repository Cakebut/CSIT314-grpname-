import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import React from 'react';
import { Toaster } from 'sonner';

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

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const [role, setRole] = React.useState(localStorage.getItem('currentRole'));
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRole(localStorage.getItem('currentRole'));
    }, 2000); // check every 2 seconds
    return () => clearInterval(interval);
  }, []);
  if (role === allowedRole) {
    return <>{children}</>;
  } else {
    return <Navigate to="/" replace />;
  }
}

  return (
    <Router>
      <div className="app-wrapper">
        <Toaster />
        <Routes>

            {/* Login */}
            <Route path="/" element={<Login />} />

            {/* Forget Password */}
            <Route path="/forget" element={<Forget />} />
        
            {/* User Admin */}
            <Route path="/admin" element={<ProtectedRoute allowedRole="User Admin"><AdminDashboard /></ProtectedRoute>} />

            {/* Person-in-Need */}
            <Route path="/pin" element={<ProtectedRoute allowedRole="Person In Need"><PINDashboard /></ProtectedRoute>} />

            {/* CSR */}
            <Route path="/csr" element={<ProtectedRoute allowedRole="CSR Rep"><CSRDashboard /></ProtectedRoute>} />

            {/* PM */}
            <Route path="/pm" element={<ProtectedRoute allowedRole="Platform Manager"><PMDashboard /></ProtectedRoute>} /> 

        </Routes>
      </div>
    </Router>
  );
}

export default App;
