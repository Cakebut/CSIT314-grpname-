import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// COMPONENT


// LOGIN PAGE
import Login from './routes/LoginPage';

// FORGET PASSWORD PAGE
import Forget from './routes/ForgetPage';

// USER ADMIN PAGE
import UserAdmin from './routes/UserAdmin/AdminDashboard';
import UserList from './routes/UserAdmin/ViewUserAccountPage';
import ViewRoles from './routes/UserAdmin/ViewUserRolesPage';
import CreateUser from './routes/UserAdmin/CreateNewUserAccountPage';

// PERSON IN NEED PAGE
import PersonInNeedDashboard from './routes/PersonInNeed/PersonInNeedDashboard';

// CSS
import './App.css';

function App() {
  useEffect (() => {
    document.title = "Volunteering Service in Singapore"
  })

  return (
    <Router>
      <div className="app-wrapper">
        {/* <Video /> */}
        <Routes>
          <Route path="/" element={<Login />} />

            {/* Forget Password */}
            <Route path="/forget" element={<Forget />} />
        
            {/* User Admin */}
            <Route path="/useradmin" element={<UserAdmin />} />
            <Route path="/useradmin/userlist" element={<UserList />} />
            <Route path="/useradmin/viewroles" element={<ViewRoles />} />
            <Route path="/useradmin/createuser" element={<CreateUser />} />

            {/* Person-in-Need */}
            <Route path="/PIN" element={<PersonInNeedDashboard />} />

        </Routes>

        <ToastContainer />

      </div>
    </Router>
  );
}

export default App;
