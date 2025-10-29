
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ViewUserAccountPage.css";

type UserAccount = {
  id: number;
  username: string;
  userProfile: string;
  isSuspended: boolean;
};
type UserProfile = {
  id: number;
  label: string;
  issuspended: boolean;
};

function ViewUserAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editSuspended, setEditSuspended] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState<UserAccount[]>([]); // Store users from backend
 

  const [roles, setRoles] = useState<UserProfile[]>([]); // Store roles from backend

 
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

  useEffect(() => {
    if (location.state?.accountCreated) {
      toast.success('Account has been created');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

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
  
 

  const handleEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditRole(user.userProfile);
    setEditSuspended(user.isSuspended);
    setShowModal(true);
  };

  // Delete user by id
  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('User deleted successfully');
        await fetchUsers();
      } else {
        toast.error('Failed to delete user');
      }
    } catch {
      toast.error('Error deleting user');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    // Find the selected role id from label
    const selectedRole = roles.find(r => r.label === editRole);
    const roleid = selectedRole ? selectedRole.id : null;
    if (!roleid) {
  toast.error("Please select a valid role.");
  return;
    }
    try {
      const res = await fetch(`http://localhost:3000/api/users/${selectedUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editUsername,
          roleid: roleid,
          issuspended: editSuspended
        })
      });
      if (res.ok) {
        toast.success(`Account ID: ${selectedUser.id}  ,account details have been updated`);
        await fetchUsers();
        closeModal();
      } else {
        toast.error("Failed to update user.");
      }
    } catch {
      toast.error("Error updating user.");
    }
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
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user: UserAccount) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.userProfile}</td>
              <td>
                <span className={user.isSuspended ? 'status-suspended' : 'status-active'}>
                  {user.isSuspended ? 'Suspended' : 'Active'}
                </span>
              </td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(user)}>
                  ✏️ Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(user.id)}>🗑️</button>
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
              <select value={editRole} onChange={e => setEditRole(e.target.value)} required>
                <option value="">Select Role</option>
                {roles.map((role: UserProfile) => (
                  <option key={role.id} value={role.label}>{role.label}</option>
                ))}
              </select>
              <label>UserID</label>
              <input
                type="text"
                value={selectedUser.id}
                placeholder="User ID"
                disabled
              />
              <label>Username:</label>
              <input
                type="text"
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
                placeholder="Username"
                required
              />
              <div style={{ marginBottom: '1rem', fontWeight: 500 }}>
                Status: {editSuspended ? 'Suspended' : 'Active'}
              </div>
              <button
                type="button"
                className={editSuspended ? "reactivate-btn" : "suspend-btn"}
                onClick={async () => {
                  if (!selectedUser) return;
                  const newSuspended = !editSuspended;
                  setEditSuspended(newSuspended);
                  try {
                    const selectedRole = roles.find(r => r.label === editRole);
                    const roleid = selectedRole ? selectedRole.id : null;
                    if (!roleid) {
                      toast.error("Please select a valid role.");
                      return;
                    }
                    const res = await fetch(`http://localhost:3000/api/users/${selectedUser.id}`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        username: editUsername,
                        roleid: roleid,
                        issuspended: newSuspended
                      })
                    });
                    if (res.ok) {
                      toast.success(newSuspended ? "User suspended." : "User reactivated.");
                      await fetchUsers();
                      setEditSuspended(newSuspended);
                    } else {
                      toast.error("Failed to update status.");
                    }
                  } catch {
                    toast.error("Error updating status.");
                  }
                }}
              >
                {editSuspended ? 'Reactivate' : 'Suspend'}
              </button>
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
