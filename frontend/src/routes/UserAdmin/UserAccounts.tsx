import React, { useEffect, useState } from "react";
import { /* useNavigate */ } from "react-router-dom";
import { toast } from "react-toastify";
import "./UserAccounts.css";

type Role = {
  id: number;
  label: string;
  issuspended?: boolean;
};

// Backend shapes
type BackendUser = {
  id: number;
  username: string;
  userProfile?: string; // role label
  isSuspended?: boolean;
};

type BackendRole = {
  id: number;
  label: string;
  issuspended?: boolean;
};

type User = {
  id: string | number;
  username: string;
  roleId?: number;
  roleLabel?: string;
  issuspended?: boolean;
};

const UserAccounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("All Roles");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleId, setNewRoleId] = useState<number | undefined>(undefined);
  const [newStatus, setNewStatus] = useState("Active");
  const [editId, setEditId] = useState<string | number>("");
  const [editUsername, setEditUsername] = useState("");
  const [editRoleId, setEditRoleId] = useState<number | undefined>(undefined);
  const [editIsSuspended, setEditIsSuspended] = useState(false);

  const [loadingId, setLoadingId] = useState<string | number | null>(null);

  // const navigate = useNavigate(); // not used here anymore

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoadingId("create");
      const body = { username: newUsername, password: newPassword, roleid: newRoleId, status: newStatus };
      const res = await fetch('/api/userAdmin/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Create failed: ${res.status}`);
      toast.success('Account created');
      setShowCreateModal(false);
      setNewUsername('');
      setNewPassword('');
      setNewRoleId(undefined);
      setNewStatus('Active');
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error('Account creation failed');
    } finally {
      setLoadingId(null);
    }
  };

  // Fetch users and roles
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error(`Fetch users failed: ${res.status}`);
      const data = (await res.json()) as BackendUser[];
      const mapped: User[] = data.map((u) => ({
        id: u.id,
        username: u.username,
        roleLabel: u.userProfile ?? "",
        issuspended: !!u.isSuspended,
      }));
      setUsers(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      if (!res.ok) throw new Error(`Fetch roles failed: ${res.status}`);
      const data = (await res.json()) as BackendRole[];
      const mapped: Role[] = data.map((r) => ({ id: r.id, label: r.label, issuspended: !!r.issuspended }));
      setRoles(mapped);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load roles");
    }
  };

  useEffect(() => {
  fetchUsers();
  fetchRoles();
  }, []);

  const openEditModal = (user: User) => {
    setEditId(user.id);
    setEditUsername(user.username);
    setEditRoleId(typeof user.roleId === "number" ? user.roleId : roles.find(r => r.label === user.roleLabel)?.id);
    setEditIsSuspended(!!user.issuspended);
    setShowEditModal(true);
  };

  const closeEditModal = () => setShowEditModal(false);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    try {
      setLoadingId(editId);
      const body: { username: string; roleid?: number; issuspended: boolean } = {
        username: editUsername,
        roleid: editRoleId,
        issuspended: editIsSuspended,
      };
      const res = await fetch(`/api/users/${editId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      toast.success("User updated");
      closeEditModal();
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Delete this user?")) return;
    try {
      setLoadingId(id);
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      toast.success("User deleted");
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSuspend = async (user: User) => {
    try {
      setLoadingId(user.id);
      const body = {
        username: user.username,
        roleid: user.roleId ?? roles.find(r => r.label === user.roleLabel)?.id,
        issuspended: !user.issuspended,
      };
      const res = await fetch(`/api/users/${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Suspend toggle failed: ${res.status}`);
      toast.success(user.issuspended ? "User activated" : "User suspended");
      await fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to change user status");
    } finally {
      setLoadingId(null);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/userAdmin/users/export`);
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const csv = await res.text();
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export started");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export users");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesUsername = u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "All Roles" || (u.roleLabel ?? "").toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = filterStatus === "All Status" || (filterStatus === "Active" ? !u.issuspended : u.issuspended);
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
          {roles.map(r => (
            <option key={r.id}>{r.label}</option>
          ))}
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

        <button className="create-user-accounts btn" type="button" onClick={() => setShowCreateModal(true)}>
          <span className="create-text">Create Account</span>
        </button>

        <button className="export-user-accounts btn" type="button" onClick={handleExport}>
          Export CSV
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="user-accounts-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="user-accounts-modal" role="dialog" aria-modal="true" aria-labelledby="create-modal-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="create-modal-title">Create Account</h2>
            <form className="user-accounts-modal-form" onSubmit={handleCreateSubmit}>
              <label>
                Name
                <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="Full name or username" required />
              </label>
              <label>
                Password
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Password" required />
              </label>
              <label>
                Role
                <select value={newRoleId ?? ""} onChange={(e) => setNewRoleId(e.target.value ? Number(e.target.value) : undefined)} required>
                  <option value="">Select Role</option>
                  {roles.filter(r => !r.issuspended).map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} required>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </label>
              <div className="user-accounts-modal-actions">
                <button type="button" className="user-accounts-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="user-accounts-modal-create" disabled={!!loadingId}>{loadingId === "create" ? "Creating..." : "Create"}</button>
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
                Username
                <input value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required />
              </label>
              <label>
                Role
                <select value={editRoleId} onChange={(e) => setEditRoleId(Number(e.target.value))}>
                  <option value={0}>-- select role --</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select value={editIsSuspended ? "Suspended" : "Active"} onChange={(e) => setEditIsSuspended(e.target.value === "Suspended")}>
                  <option>Active</option>
                  <option>Suspended</option>
                </select>
              </label>
              <div className="user-accounts-modal-actions">
                <button type="button" className="user-accounts-modal-cancel" onClick={closeEditModal}>Cancel</button>
                <button type="submit" className="user-accounts-modal-create" disabled={!!loadingId}>{loadingId ? "Saving..." : "Save"}</button>
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
            <tr key={String(user.id)} className={(user.issuspended ? "suspended" : "active") }>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.roleLabel ?? roles.find(r => r.id === user.roleId)?.label ?? "-"}</td>
              <td>
                <span className={`user-accounts-status ${user.issuspended ? 'suspended' : 'active'}`}>{user.issuspended ? 'Suspended' : 'Active'}</span>
              </td>
              <td>
                <button
                  className={`suspend-user-accounts ${user.issuspended ? 'activate' : 'suspend'}`}
                  onClick={() => handleSuspend(user)}
                  disabled={!!loadingId}
                >
                  {loadingId === user.id ? '...' : (user.issuspended ? 'Activate' : 'Suspend')}
                </button>
                <button className="edit-user-accounts" onClick={() => openEditModal(user)} disabled={!!loadingId}>Edit</button>
                <button className="delete-user-accounts" onClick={() => handleDelete(user.id)} disabled={!!loadingId}>{loadingId === user.id ? '...' : 'Delete'}</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserAccounts;
 
