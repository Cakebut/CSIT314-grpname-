import React, { useState } from "react";
import "./Roles.css";

interface User {
  id: string;
  role: string;
  status: "Active" | "Inactive";
}

const initialUsers: User[] = [
  { id: "001", role: "User Admin", status: "Active" },
  { id: "002", role: "Person In Need", status: "Active" },
  { id: "003", role: "User Admin", status: "Inactive" },
  { id: "004", role: "Person In Need", status: "Active" },
  { id: "005", role: "User Admin", status: "Active" }
];

const Roles: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleStatus, setNewRoleStatus] = useState<"Active" | "Inactive">("Active");

  const handleDelete = (id: string) => {
    // Remove the user and renumber remaining IDs
    const remaining = users.filter(user => user.id !== id);
    const renumbered = remaining.map((user, index) => ({
      ...user,
      id: String(index + 1).padStart(3, "0"),
    }));
    setUsers(renumbered);
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
    const matchesUsername = user.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All Roles" || user.role === filterRole;
    const matchesStatus = filterStatus === "All Status" || user.status === filterStatus;

    return matchesUsername && matchesRole && matchesStatus;
  });

  return (
    <div className="roles-container">

      <div className="roles-top">
        <div>
        <header className="roles-header"></header>
          <h1>Roles</h1>
          <p>Manage roles and permissions</p>
        </div>
      </div>
          <div className="roles-actions">
            <input
              type="text"
              placeholder="Search by role"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-roles"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-roles"
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
              className="filter-roles"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <button className="reset-roles btn" onClick={() => { setFilterRole("All Roles"); setFilterStatus("All Status"); }}>
              Reset
            </button>
            
            <button className="create-roles btn" onClick={() => setShowCreateModal(true)}>Create Role</button>
          </div>

          {showCreateModal && (
            <div className="roles-modal-overlay" onClick={() => setShowCreateModal(false)}>
              <div className="roles-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Create Role</h2>
                <form
                  className="roles-modal-form"
                  onSubmit={(e) => {
                    e.preventDefault();

                    // determine next ID by parsing
                    const numericIds = users
                      .map((u) => parseInt(u.id, 10))
                      .filter((n) => !isNaN(n));
                    const maxId = numericIds.length ? Math.max(...numericIds) : 0;
                    const next = maxId + 1;

                    // format with 00
                    const newId = String(next).padStart(3, "0");

                    const newUser: User = {
                      id: newId,
                      role: newRoleName || "New Role",
                      status: newRoleStatus,
                    };

                    setUsers((prev) => [...prev, newUser]);
                    setNewRoleName("");
                    setNewRoleStatus("Active");
                    setShowCreateModal(false);
                  }}
                >
                  <label>
                    Role Name
                    <select
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      required
                    >
                      <option value="">Select a role</option>
                      <option value="User Admin">User Admin</option>
                      <option value="Person In Need">Person In Need</option>
                      <option value="CSR Representative">CSR Representative</option>
                      <option value="Platform Manager">Platform Manager</option>
                    </select>
                  </label>

                  <label>
                    Status
                    <select value={newRoleStatus} onChange={(e) => setNewRoleStatus(e.target.value as "Active" | "Inactive") }>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>

                  <div className="roles-modal-actions">
                    <button type="button" className="roles-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                    <button type="submit" className="roles-modal-create">Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}

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
              <tr key={user.id} className={user.status.toLowerCase()}>
                <td>{user.id}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`roles-status ${user.status.toLowerCase()}`}>{user.status}</span>
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
