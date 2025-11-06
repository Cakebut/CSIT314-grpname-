import React, { useState, useEffect } from "react";
import "./UserAccounts.css";

interface User {
  id: string;
  username: string;
  role: string;
  status: "Active" | "Suspended";
}

const initialUsers: User[] = [
  { id: "001", username: "john_doe", role: "User Admin", status: "Active" },
  { id: "002", username: "jane_smith", role: "Person In Need", status: "Suspended" },
  { id: "003", username: "bob_wilson", role: "User Admin", status: "Suspended" },
  { id: "004", username: "alice_jones", role: "Person In Need", status: "Active" },
  { id: "005", username: "mike_brown", role: "CSR Representative", status: "Suspended" },
  { id: "006", username: "smith_tan", role: "Platform Manager", status: "Suspended" },
];

const UserAccounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<string>("User Admin");
  const [newStatus, setNewStatus] = useState<User['status']>("Active");

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  // Open edit modal with user data
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOriginalId, setEditOriginalId] = useState<string | null>(null);
  const [editId, setEditId] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("");

  const openEditModal = (user: User) => {
    setEditOriginalId(user.id);
    setEditId(user.id);
    setEditUsername(user.username);
    setEditRole(user.role);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditOriginalId(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOriginalId) return;
    setUsers(users.map(u => {
      if (u.id === editOriginalId) {
        return { ...u, id: editId, username: editUsername, role: editRole };
      }
      return u;
    }));
    closeEditModal();
  };

  const handleSuspend = (id: string) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        let newStatus: "Active" | "Suspended" = user.status === "Suspended" ? "Active" : "Suspended";
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesUsername = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All Roles" || user.role === filterRole;
    const matchesStatus = filterStatus === "All Status" || user.status === filterStatus;

    return matchesUsername && matchesRole && matchesStatus;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    if (showModal) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal]);

  const openModal = () => {
    setNewName("");
    setNewRole("User Admin");
    setNewStatus("Active");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = (users.length + 1).toString().padStart(3, "0");
    const newUser: User = { id: nextId, username: newName || `user_${nextId}`, role: newRole, status: newStatus };
    setUsers([newUser, ...users]);
    setShowModal(false);
  };

  return (
    <div className="user-accounts-container">

        <div className="user-accounts-top">
          <div>
            <header className="user-accounts-header"></header>
              <h1>User Accounts</h1>
              <p>Manage user accounts and permissions</p>
          </div>
        </div>

          <div className="user-accounts-actions">
            <input
              type="text"
              placeholder="Search by username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-user-accounts"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-user-accounts"
            >
              <option>All Roles</option>
              <option>User Admin</option>
              <option>Person In Need</option>
              <option>CSR Representative</option>
              <option>Platform Manager</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-user-accounts"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
            <button className="reset-user-accounts btn" onClick={() => { setSearchQuery(""); setFilterRole("All Roles"); setFilterStatus("All Status"); }}>
              Reset
            </button>
            
            <button className="create-user-accounts btn" type="button" onClick={openModal}>
              <span className="create-text">Create Account</span>
            </button>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="user-accounts-modal-overlay" onClick={closeModal}>
              <div className="user-accounts-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
                <h2 id="modal-title">Create Account</h2>
                <form className="user-accounts-modal-form" onSubmit={handleCreateSubmit}>
                  <label>
                    Username
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Full name or username" required />
                  </label>
                  <label>
                    Role
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                      <option>User Admin</option>
                      <option>Person In Need</option>
                      <option>CSR Representative</option>
                      <option>Platform Manager</option>
                    </select>
                  </label>
                  <label>
                    Status
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as User['status'])}>
                      <option>Active</option>
                      <option>Suspended</option>
                    </select>
                  </label>
                  <div className="user-accounts-modal-actions">
                    <button type="button" className="user-accounts-modal-cancel" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="user-accounts-modal-create">Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && (
            <div className="user-accounts-modal-overlay" onClick={closeEditModal}>
              <div className="user-accounts-modal" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title" onClick={(e) => e.stopPropagation()}>
                <h2 id="edit-modal-title">Edit Account</h2>
                <form className="user-accounts-modal-form" onSubmit={handleEditSubmit}>
                  <label>
                    ID
                    <input value={editId} onChange={(e) => setEditId(e.target.value)} required />
                  </label>
                  <label>
                    Username
                    <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required />
                  </label>
                  <label>
                    Role
                    <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                      <option>User Admin</option>
                      <option>Person In Need</option>
                      <option>CSR Representative</option>
                      <option>Platform Manager</option>
                    </select>
                  </label>
                  <div className="user-accounts-modal-actions">
                    <button type="button" className="user-accounts-modal-cancel" onClick={closeEditModal}>Cancel</button>
                    <button type="submit" className="user-accounts-modal-create">Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        <table className="user-accounts-table">
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
            {filteredUsers.map((user) => (
              <tr key={user.id} className={user.status.toLowerCase()}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`user-accounts-status ${user.status.toLowerCase()}`}>{user.status}</span>
                </td>
                <td>
                  <button
                    className={`suspend-user-accounts ${user.status === 'Suspended' ? 'activate' : 'suspend'}`}
                    onClick={() => handleSuspend(user.id)}
                  >
                    {user.status === "Suspended" ? "Activate" : "Suspend"}
                  </button>
                  <button className="edit-user-accounts" onClick={() => openEditModal(user)}>Edit</button>
                  <button className="delete-user-accounts" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
};

export default UserAccounts;
