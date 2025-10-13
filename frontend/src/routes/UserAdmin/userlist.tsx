import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserList.css';

type User = {
  id: string;
  username: string;
  profile: string;
  status: 'Active' | 'Suspended';
};

function UserList() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dummyUsers, setDummyUsers] = useState<User[]>([]); // Store users in state

  // Generate dummy users only once when component mounts
  useEffect(() => {
    // Try to load users from localStorage
    const stored = localStorage.getItem('dummyUsers');
    if (stored) {
      setDummyUsers(JSON.parse(stored));
    } else {
      // Generate and store dummy users if not present
      const generateDummyUsers = (): User[] => {
        const profiles = ['User admin', 'CSR Rep', 'Person-In-Need', 'Platform Manager'];
        const statuses: User['status'][] = ['Active', 'Suspended'];
        const users: User[] = [];
        for (let i = 1; i <= 100; i++) {
          users.push({
            id: i.toString().padStart(3, '0'),
            username: `user${i}_${Math.random().toString(36).substring(7)}`,
            profile: profiles[Math.floor(Math.random() * profiles.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
          });
        }
        return users;
      };
      const users = generateDummyUsers();
      setDummyUsers(users);
      localStorage.setItem('dummyUsers', JSON.stringify(users));
    }
  }, []);


// Filter users by search term
const filteredUsers = dummyUsers.filter(user =>
  user.username.toLowerCase().includes(searchTerm.toLowerCase())
);


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
          <th>Profile</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {filteredUsers.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.username}</td>
            <td>{user.profile}</td>
            <td className={`status ${user.status.toLowerCase()}`}>{user.status}</td>
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
            <input type="text" defaultValue={selectedUser.profile} placeholder="Profile" />
            <select defaultValue={selectedUser.status}>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
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
