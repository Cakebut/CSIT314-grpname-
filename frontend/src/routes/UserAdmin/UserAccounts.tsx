import React, { useState } from "react";
import { Download } from "lucide-react";
import "./UserAccounts.css";

interface User {
  id: string;
  username: string;
  role: string;
  status: "Active" | "Inactive" | "Suspended";
}

const initialUsers: User[] = [
  { id: "001", username: "john_doe", role: "Admin", status: "Active" },
  { id: "002", username: "jane_smith", role: "PIN", status: "Suspended" },
  { id: "003", username: "bob_wilson", role: "User", status: "Inactive" },
  { id: "004", username: "alice_jones", role: "PIN", status: "Active" },
  { id: "005", username: "mike_brown", role: "Admin", status: "Suspended" },
];

const UserAccounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleEdit = (id: string) => {
    alert(`Edit user with ID: ${id}`);
  };

  const handleSuspend = (id: string) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        let newStatus: "Active" | "Inactive" | "Suspended" = user.status === "Suspended" ? "Active" : "Suspended";
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

  return (
    <div className="user-accounts-container">

      <div className="user-accounts-top">
        <div>
        <header className="user-accounts-header"></header>
          <h1>User Accounts</h1>
          <p>Manage user accounts and permissions</p>
        </div>
        <button className="create-user-accounts btn">
          <a className="create-text">Create Account</a>
        </button>
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
              <option>Roles</option>
              <option>Admin</option>
              <option>PIN</option>
              <option>User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-user-accounts"
            >
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="reset-user-accounts btn" onClick={() => { setSearchQuery(""); setFilterRole("All Roles"); setFilterStatus("All Status"); }}>
              Reset
            </button>
            
            <button className="export-user-accounts btn"><Download className="icon"/>Export File</button>
          </div>

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
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`user-account-status ${user.status.toLowerCase()}`}>{user.status}</span>
                </td>
                <td>
                  <button className="suspend-user-accounts" onClick={() => handleSuspend(user.id)}>{user.status === "Suspended" ? "Reactivate" : "Suspended"}</button>
                  <button className="edit-user-accounts" onClick={() => handleEdit(user.id)}>Edit</button>
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
