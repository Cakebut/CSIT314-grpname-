import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './routes/Login';
import UserAdmin from './routes/UserAdmin/useradmin';
import PIN from './routes/PIN';
import UserList from './routes/UserAdmin/userlist';
import CreateUser from './routes/UserAdmin/createuser';
import ViewRoles from './routes/UserAdmin/viewroles';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/useradmin" element={<UserAdmin />} />
          <Route path="/pin" element={<PIN />} />
          <Route path="/useradmin/users" element={<UserList />} />
          <Route path="/useradmin/create" element={<CreateUser />} />
          <Route path="/useradmin/roles" element={<ViewRoles />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
