import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ViewUserAccountPage.css';

type User = {
  id: number;
  username: string;
  roleid: number;
  issuspended: boolean;
};

function UserList() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  
  const [users, setUsers] = useState<User[]>([]); // Store users from backend
  const [roles, setRoles] = useState<{id: number, name: string}[]>([]); // Store roles from backend

  // Fetch users from backend only once when component mounts
  useEffect(() => {
  fetch('http://localhost:3000/api/users')
    .then(res => res.json())
    .then(data => setUsers(data))
    .catch(() => setUsers([]));
  fetch('http://localhost:3000/api/roles')
    .then(res => res.json())
    .then(data => setRoles(data))
    .catch(() => setRoles([]));
}, []);


// Filter users by search term
const filteredUsers = users.filter(user =>
  user.username.toLowerCase().includes(searchTerm.toLowerCase())
);

const roleMap = roles.reduce((acc, role) => {
  acc[role.id] = role.name;
  return acc;
}, {} as Record<number, string>);

const handleEdit = (user: User) => {
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
    <button className="back-btn" onClick={() => navigate('/useradmin')}>
      ← Back to Dashboard
    </button>

    <div className="user-list-header">
      <h2>User Accounts</h2>
      <div className="user-list-actions">
        <input 
          type="text"
          placeholder= "Search by username"
          value= {searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button onClick={() => navigate('/useradmin/create')}>Create Account</button>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Username</th>
          <th>Role ID</th>
          <th>Suspended</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map((user: User) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.username}</td>
            <td>{roleMap[user.roleid] || user.roleid}</td>
            <td>{user.issuspended ? "Suspended" : "Active"}</td>
            <td>
              <button className="edit-btn" onClick={() => handleEdit(user)}>✏️ Edit</button>
              <button className="delete-btn">🗑️</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {showModal && selectedUser && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Edit User</h3>
          <form onSubmit={handleSubmit}>
            <input type="text" defaultValue={selectedUser.id} placeholder="User ID" />
            <input type="text" defaultValue={selectedUser.username} placeholder="Username" />
            {/* Profile and status fields removed since they do not exist in User type */}
            <div className="modal-actions">
              <button type="button" onClick={closeModal}>Cancel</button>
              <button type="submit">Save</button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
}

export default UserList;
