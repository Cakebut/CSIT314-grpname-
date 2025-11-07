import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import React from 'react';
 

// LOGIN PAGE
import Login from './routes/LoginPage';

// FORGOT PASSWORD PAGE
import ForgotPasswordPage from './routes/ForgotPasswordPage';

// USER ADMIN PAGE
import AdminDashboard from './routes/UserAdmin/AdminDashboard';

// PERSON IN NEED PAGE
import PersonInNeedDashboard from './routes/PersonInNeed/PersonInNeedDashboard';

// CSR PAGE
import CSRDashboard from './routes/CSRRep/CSRDashboard';
import CSRRepDashboard from './routes/CSRRep/CSRRepDashboard';


// PLATFORM MANAGER PAGE
import PlatformManagerHome from './routes/PlatformManager';
import CategoriesPage from './routes/PlatformManager/CategoriesPage';
import ReportsPage from './routes/PlatformManager/ReportsPage';
import AnnouncementsPage from './routes/PlatformManager/AnnouncementsPage';

// CSS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import PINDashboard from './routes/PersonInNeed/PINDashboard';



function App() {
  useEffect (() => {
    document.title = "Volunteering Service in Singapore"
  })

  // ProtectedRoute component for all actors
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
        <Routes>
          {/* Login */}
          <Route path="/" element={<Login />} />

          {/* Forgot Password */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* User Admin */}
          <Route path="/useradmin" element={<ProtectedRoute allowedRole="User Admin"><AdminDashboard /></ProtectedRoute>} />

          {/* Person In Need */}
          <Route path="/PIN" element={<ProtectedRoute allowedRole="Person In Need"><PINDashboard /></ProtectedRoute>} />
          
          {/* CSR Rep */}
          <Route path="/csr/*" element={<ProtectedRoute allowedRole="CSR Rep"><CSRDashboard /></ProtectedRoute>} />

          {/* Platform Manager (Dashboard + nested pages) */}
          <Route path="/platformManager" element={<ProtectedRoute allowedRole="Platform Manager"><PlatformManagerHome /></ProtectedRoute>}>
            <Route index element={<Navigate to="reports" replace />} />
            <Route path="categories" element={<ProtectedRoute allowedRole="Platform Manager"><CategoriesPage /></ProtectedRoute>} />
            <Route path="reports" element={<ProtectedRoute allowedRole="Platform Manager"><ReportsPage /></ProtectedRoute>} />
            <Route path="announcements" element={<ProtectedRoute allowedRole="Platform Manager"><AnnouncementsPage /></ProtectedRoute>} />
          </Route>
         
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
