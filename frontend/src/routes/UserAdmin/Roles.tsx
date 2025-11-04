import React, { useState } from "react";
import { Download } from "lucide-react";
import "./Roles.css";

interface User {
  id: string;
  role: string;
  status: "Active" | "Inactive";
}

const initialUsers: User[] = [
  { id: "001", role: "Admin", status: "Active" },
  { id: "002", role: "PIN", status: "Active" },
  { id: "003", role: "User", status: "Inactive" },
  { id: "004", role: "PIN", status: "Active" },
  { id: "005", role: "Admin", status: "Active" }
];

const Roles: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const handleDisable = (id: string) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        // Toggle the status: "Active" to "Inactive", "Inactive" to "Active"
        let newStatus: "Active" | "Inactive" = user.status === "Active" ? "Inactive" : "Active";
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === "All Roles" || user.role === filterRole;
    const matchesStatus = filterStatus === "All Status" || user.status === filterStatus;

    return matchesRole && matchesStatus;
  });

  return (
    <div className="roles-container">

      <div className="roles-top">
        <div>
        <header className="roles-header"></header>
          <h1>Roles</h1>
          <p>Manage roles and permissions</p>
        </div>
        <button className="create-roles btn">
          <a className="create-text">Create Account</a>
        </button>
      </div>

          <div className="roles-actions">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-roles"
            >
              <option>Roles</option>
              <option>Admin</option>
              <option>PIN</option>
              <option>User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-roles"
            >
              <option>Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="reset-roles btn" onClick={() => { setFilterRole("All Roles"); setFilterStatus("All Status"); }}>
              Reset
            </button>
            
            <button className="export-roles btn"><Download className="icon"/>Export File</button>
          </div>

        <table className="roles-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Role Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>{user.status}</span>
                </td>
                <td>
                  <button className="disable-roles" onClick={() => handleDisable(user.id)}>{user.status === "Inactive" ? "Enable" : "Disable"}</button>
                  <button className="delete-roles" onClick={() => handleDelete(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

    </div>
  );
};

export default Roles;
