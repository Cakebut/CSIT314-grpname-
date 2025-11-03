import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./ViewUserAccountPage.css";

type UserAccount = {
  id: number;
  username: string;
  userProfile: string;
  isSuspended: boolean;
  updatedAt?: string; // last updated timestamp
  lastAction?: string; // audit log action
};
type UserProfile = {
  id: number;
  label: string;
  issuspended: boolean;
};

export default function ViewUserAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editSuspended, setEditSuspended] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState<UserAccount[]>([]); // Store users from backend
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null); // For spinner

  const [roles, setRoles] = useState<UserProfile[]>([]); // Store roles from backend

  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
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
      toast.success("Account has been created");
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  //fetch roles from backend
  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
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

  // Filter users by search term, role, and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.username
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole ? user.userProfile === filterRole : true;
    const matchesStatus =
      filterStatus && filterStatus !== "All Status"
        ? filterStatus === "Active"
          ? !user.isSuspended
          : user.isSuspended
        : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEdit = (user: UserAccount) => {
    setSelectedUser(user);
    setEditUsername(user.username);
    setEditRole(user.userProfile);
    setEditSuspended(user.isSuspended);
    setShowModal(true);
  };

  // Delete user by id
  const handleDelete = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.error("User deleted successfully");
        await fetchUsers();
      } else {
        toast.error("Failed to delete user");
      }
    } catch {
      toast.error("Error deleting user");
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
    const selectedRole = roles.find((r) => r.label === editRole);
    const roleid = selectedRole ? selectedRole.id : null;
    if (!roleid) {
      toast.error("Please select a valid role.");
      return;
    }
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editUsername,
          roleid: roleid,
          issuspended: editSuspended,
        }),
      });
      if (res.ok) {
        toast.success(
          `Account ID: ${selectedUser.id}  ,account details have been updated`
        );
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
    <div className="view-user-account-container">
      <button className="back-btn" onClick={() => navigate("/useradmin")}>
        ← Back to Dashboard
      </button>

      <div className="user-list-header">
        <h2>User Accounts</h2>
        <div
          className="user-list-actions"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "0.5rem",
            marginBottom: "1.2rem",
          }}
        >
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <input
              type="text"
              placeholder="🔍 Search by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1.2px solid #bfc8d6",
                fontSize: "0.98rem",
                background: "#f3f6fb",
                width: "170px",
              }}
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1.2px solid #bfc8d6",
                fontSize: "0.98rem",
                background: "#f3f6fb",
                minWidth: "110px",
              }}
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.label}>
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border: "1.2px solid #bfc8d6",
                fontSize: "0.98rem",
                background: "#f3f6fb",
                minWidth: "110px",
              }}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '1.2rem' }}>
        <button
          className="export-user-csv-btn"
          style={{
            background: "#22c55e",
            color: "white",
            borderRadius: 8,
            padding: "0.5em 1.2em",
            fontWeight: 600,
            fontSize: "1em",
            border: "none",
            boxShadow: "0 1px 4px rgba(44,62,80,0.10)",
            cursor: "pointer",
          }}
          onClick={async () => {
            try {
              // Fetch CSV first to count records
              const res = await fetch("/api/userAdmin/users/export");
              if (!res.ok) throw new Error("Failed to export");
              const csv = await res.text();
              // Count records (lines minus header)
              const lines = csv.split("\n");
              const recordCount = Math.max(0, lines.length - 1);
              // Download CSV
              const blob = new Blob([csv], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "users.csv";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              toast.success(
                `User data successfully exported. [${recordCount}] records included.`
              );
            } catch {
              toast.error("Failed to export user data.");
            }
          }}
        >
          Export User Data
        </button>
        <button
          onClick={() => navigate("/useradmin/create")}
          style={{
            background: "#0077cc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.6rem 1.3rem",
            fontWeight: 700,
            fontSize: "1rem",
            boxShadow: "0 1px 4px rgba(44,62,80,0.10)",
            cursor: "pointer",
            letterSpacing: "0.01em",
            transition: "background 0.2s",
            alignSelf: "flex-end",
            display: "block",
          }}
        >
          ＋ Create Account
        </button>
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
            <tr
              key={user.id}
              style={user.isSuspended ? { background: "#ffeaea", borderLeft: "6px solid #d32f2f", opacity: 0.85 } : {}}
            >
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.userProfile}</td>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.3em 0.9em",
                    borderRadius: "1em",
                    fontWeight: 600,
                    color: "white",
                    background: user.isSuspended ? "#d32f2f" : "#388e3c",
                    fontSize: "0.95em",
                  }}
                  title={
                    user.isSuspended
                      ? "This user is currently suspended."
                      : "This user is active."
                  }
                >
                  {user.isSuspended ? (
                    <FaExclamationCircle style={{ marginRight: 4 }} />
                  ) : null}
                  {user.isSuspended ? "Suspended" : "Active"}
                </span>
              </td>
              <td>
                <button
                  style={{
                    background: user.isSuspended ? "#388e3c" : "#d32f2f",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.4em 1.2em",
                    fontWeight: 700,
                    fontSize: "1em",
                    marginRight: "0.5em",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(44,62,80,0.10)",
                    letterSpacing: "0.01em",
                    transition: "background 0.2s",
                  }}
                  title={user.isSuspended ? "Reactivate this user" : "Suspend this user"}
                  onClick={async () => {
                    if (!window.confirm(`Are you sure you want to ${user.isSuspended ? 'reactivate' : 'suspend'} this user?`)) return;
                    setLoadingUserId(user.id);
                    const selectedRole = roles.find(r => r.label === user.userProfile);
                    const roleid = selectedRole ? selectedRole.id : null;
                    if (!roleid) {
                      toast.error("Please select a valid role.");
                      setLoadingUserId(null);
                      return;
                    }
                    try {
                      const res = await fetch(`/api/users/${user.id}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          username: user.username,
                          roleid: roleid,
                          issuspended: !user.isSuspended
                        })
                      });
                      if (res.ok) {
                        toast.success(!user.isSuspended ? "User suspended." : "User reactivated.");
                        await fetchUsers();
                      } else {
                        toast.error("Failed to update status.");
                      }
                    } catch {
                      toast.error("Error updating status.");
                    }
                    setLoadingUserId(null);
                  }}
                >
                  {loadingUserId === user.id ? (
                    <span className="spinner" style={{ marginRight: 8 }} />
                  ) : null}
                  {user.isSuspended ? "Reactivate" : "Suspend"}
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(user)}
                  title="Edit user details"
                >
                  ✏️ Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(user.id)}
                  title="Delete user"
                >
                  🗑️
                </button>
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
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                {roles.map((role: UserProfile) => (
                  <option key={role.id} value={role.label}>
                    {role.label}
                  </option>
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
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="Username"
                required
              />
              {/* Status toggle button removed from modal. Only available in user list table. */}
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
