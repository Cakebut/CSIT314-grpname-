import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import React from 'react';
 

// LOGIN PAGE
import Login from './routes/LoginPage';
import ForgotPasswordPage from './routes/ForgotPasswordPage';


// USER ADMIN PAGE
import AdminDashboard from './routes/UserAdmin/AdminDashboard';
import ViewUserAccountPage from './routes/UserAdmin/ViewUserAccountPage';
import ViewUserRolesPage from './routes/UserAdmin/ViewUserRolesPage';
import CreateNewUserAccountPage from './routes/UserAdmin/CreateNewUserAccountPage';
import UserAdminSystemLogPage from './routes/UserAdmin/ViewUserAdminSystemLogPage';
import AdminPasswordResetDashboard from './routes/UserAdmin/ViewResetDashboard';


//Person In Need
import PersonInNeedDashboard from './routes/PersonInNeed/PersonInNeedDashboard';

// Platform Manager
import PlatformManagerHome from './routes/PlatformManager';
import CategoriesPage from './routes/PlatformManager/CategoriesPage';
import ReportsPage from './routes/PlatformManager/ReportsPage';
import AnnouncementsPage from './routes/PlatformManager/AnnouncementsPage';

// CSR Rep
import CSRRepDashboard from './routes/CSRRep/CSRRepDashboard';

//===========================================================================
// CSS
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect (() => {
    document.title = "Volunteering Service in Singapore"
  })


  // ProtectedRoute component for all actors
function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const role = localStorage.getItem('currentRole');
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
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          {/* User Admin */}
          <Route path="/useradmin" element={<ProtectedRoute allowedRole="User Admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/useradmin/ViewUserList" element={<ProtectedRoute allowedRole="User Admin"><ViewUserAccountPage /></ProtectedRoute>} />
          <Route path="/useradmin/ViewUserRoles" element={<ProtectedRoute allowedRole="User Admin"><ViewUserRolesPage /></ProtectedRoute>} />
          <Route path="/useradmin/create" element={<ProtectedRoute allowedRole="User Admin"><CreateNewUserAccountPage /></ProtectedRoute>} />
          <Route path="/useradmin/SystemLog" element={<ProtectedRoute allowedRole="User Admin"><UserAdminSystemLogPage /></ProtectedRoute>} />
          <Route path="/useradmin/PasswordResetRequests" element={<ProtectedRoute allowedRole="User Admin"><AdminPasswordResetDashboard /></ProtectedRoute>} />

          
          {/* Person In Need */}
          <Route path="/PIN" element={<ProtectedRoute allowedRole="Person In Need"><PersonInNeedDashboard /></ProtectedRoute>} />
          
          {/* CSR Rep */}
          <Route path="/csr/*" element={<ProtectedRoute allowedRole="CSR Rep"><CSRRepDashboard /></ProtectedRoute>} />


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
