import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

// Component
// import Navbar from './components/Navbar';
// import Video from './components/Video';

// LOGIN PAGE
import Login from './routes/LoginPage';


// USER ADMIN PAGE
import UserAdmin from './routes/UserAdmin/AdminDashboard';
import UserList from './routes/UserAdmin/ViewUserAccountPage';
import ViewRoles from './routes/UserAdmin/ViewUserRolesPage';
import CreateUser from './routes/UserAdmin/CreateNewUserAccountPage';

//Person In Need
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
           
            // User Admin
            <Route path="/useradmin" element={<UserAdmin />} />
              <Route path="/useradmin/userlist" element={<UserList />} />
                <Route path="/useradmin/viewroles" element={<ViewRoles />} />
                  <Route path="/useradmin/createuser" element={<CreateUser />} />

            // Person In Need
            <Route path="/PIN" element={<PersonInNeedDashboard />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
