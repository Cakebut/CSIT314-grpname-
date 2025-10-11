import { useState } from 'react';
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

  const dummyUsers: User[] = [
    { id: '001', username: 'Jennie_Nienow95', profile: 'Homeowner', status: 'Active' },
    { id: '002', username: 'Percy60', profile: 'Homeowner', status: 'Suspended' },
    { id: '003', username: 'Leff_Beahan', profile: 'Homeowner', status: 'Active' },
    { id: '004', username: 'Amie39', profile: 'Homeowner', status: 'Suspended' },
    { id: '005', username: 'Queenie70', profile: 'Homeowner', status: 'Active' },
    { id: '006', username: 'Serenity_Gerlach', profile: 'Homeowner', status: 'Active' },
    { id: '007', username: 'Ona_Rippin', profile: 'Homeowner', status: 'Active' },
  ];

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
          <input type="text" placeholder="Search by username" />
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
          {dummyUsers.map((user) => (
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
