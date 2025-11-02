import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

// Component
// import Navbar from './components/Navbar';

// LOGIN PAGE
import Login from './routes/LoginPage';


// USER ADMIN PAGE
import AdminDashboard from './routes/UserAdmin/AdminDashboard';
import ViewUserAccountPage from './routes/UserAdmin/ViewUserAccountPage';
import ViewUserRolesPage from './routes/UserAdmin/ViewUserRolesPage';
import CreateNewUserAccountPage from './routes/UserAdmin/CreateNewUserAccountPage';
import UserAdminSystemLogPage from './routes/UserAdmin/UserAdminSystemLogPage';


//Person In Need
import PersonInNeedDashboard from './routes/PersonInNeed/PersonInNeedDashboard';

// Platform Manager
import PlatformManagerHome from './routes/PlatformManager';
import CategoriesPage from './routes/PlatformManager/CategoriesPage';
import ReportsPage from './routes/PlatformManager/ReportsPage';
import AnnouncementsPage from './routes/PlatformManager/AnnouncementsPage';

// CSS

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  useEffect (() => {
    document.title = "Volunteering Service in Singapore"
  })

  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Login />} />
          {/* User Admin */}
          <Route path="/useradmin" element={<AdminDashboard />} />
          <Route path="/useradmin/ViewUserList" element={<ViewUserAccountPage />} />
          <Route path="/useradmin/ViewUserRoles" element={<ViewUserRolesPage />} />
          <Route path="/useradmin/createuser" element={<CreateNewUserAccountPage />} />
          <Route path="/useradmin/create" element={<CreateNewUserAccountPage />} />
          <Route path="/useradmin/SystemLog" element={<UserAdminSystemLogPage />} />
          {/* Person In Need */}
          <Route path="/PIN" element={<PersonInNeedDashboard />} />
          {/* Platform Manager (Dashboard + nested pages) */}
          <Route path="/platformManager" element={<PlatformManagerHome />}>
            <Route index element={<Navigate to="reports" replace />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
          </Route>
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
