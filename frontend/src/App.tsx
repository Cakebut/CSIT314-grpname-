import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';

// Component
// import Navbar from './components/Navbar';

// LOGIN PAGE
import Login from './routes/Login';


// USER ADMIN PAGE
import Useradmin from './routes/UserAdmin/useradmin';
import Userlist from './routes/UserAdmin/userlist';
import Viewroles from './routes/UserAdmin/viewroles';
import Createuser from './routes/UserAdmin/createuser';


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
          <Route path="/" element={<Login />} />
           
            <Route path="/useradmin" element={<Useradmin />} />
              <Route path="/useradmin/userlist" element={<Userlist />} />
                <Route path="/useradmin/viewroles" element={<Viewroles />} />
                  <Route path="/useradmin/createuser" element={<Createuser />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
