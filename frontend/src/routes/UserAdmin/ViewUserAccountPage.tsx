import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewUserAccountPage.css";

type UserAccount = {
  id: number;
  username: string;
  userProfile: string;
  issuspended: boolean;
};
type UserProfile = {
  id: number;
  label: string;
  issuspended: boolean;
};

function ViewUserAccountPage() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState<UserAccount[]>([]); // Store users from backend
 

  const [roles, setRoles] = useState<UserProfile[]>([]); // Store roles from backend

  //   // Fetch users from backend only once when component mounts
  //   useEffect(() => {
  //   fetch('http://localhost:3000/api/users')
  //     .then(res => res.json())
  //     .then(data => setUsers(data))
  //     .catch(() => setUsers([]));
  //   // fetch('http://localhost:3000/api/roles')
  //   //   .then(res => res.json())
  //   //   .then(data => setRoles(data))
  //   //   .catch(() => setRoles([]));
  // }, []);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  //fetch roles from backend
  const fetchRoles = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/roles");
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      } else {
        setRoles([]);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setRoles([]);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Filter users by search term
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // const roleMap = roles.reduce((acc, role) => {
  //   acc[role.id] = role.name;
  //   return acc;
  // }, {} as Record<number, string>);

  const handleEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save logic here
    closeModal();
  };

  return (

    
    <div className="user-list-container">
      <button className="back-btn" onClick={() => navigate("/useradmin")}>
        ← Back to Dashboard
      </button>

      <div className="user-list-header">
        <h2>User Accounts</h2>
        <div className="user-list-actions">
          <input
            type="text"
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => navigate("/useradmin/create")}>
            Create Account
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role Name</th>
            <th>Suspended</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user: UserAccount) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.userProfile}</td>
              {/* <td>{roleMap[user.userProfile] || user.userProfile}</td> */}
              <td>{user.issuspended ? "Suspended" : "Active"}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(user)}>
                  ✏️ Edit
                </button>
                <button className="delete-btn">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>




{/*EDIT MODEL */}

      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit User</h3>
            <form onSubmit={handleSubmit}>
              
                <label>Role</label>
                <select defaultValue={selectedUser. userProfile}>
                  <option value="">Select Role</option>
                  {roles.map((role: UserProfile) => (
                    <option key={role.id} value={role.label}>
                      {role.label}
                    </option>
                  ))}
                </select>




              {/* User ID Field */}
              <label>UserID</label>
              <input
                type="text"
                defaultValue={selectedUser.id}
                placeholder="User ID"
              />
              <label>Username:</label>
              <input
                type="text"
                defaultValue={selectedUser.username}
                placeholder="Username"
              />
          
              {/* Profile and status fields removed since they do not exist in User type */}
              <div className="modal-actions">
                <button type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewUserAccountPage;
