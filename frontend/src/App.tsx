import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

//Person In Need
import PersonInNeedDashboard from './routes/PersonInNeed/PersonInNeedDashboard';

// Platform Manager
import PlatformManagerHome from './routes/PlatformManager';

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
          {/* Person In Need */}
          <Route path="/PIN" element={<PersonInNeedDashboard />} />
          {/* Platform Manager */}
          <Route path="/platform-manager" element={<PlatformManagerHome />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
