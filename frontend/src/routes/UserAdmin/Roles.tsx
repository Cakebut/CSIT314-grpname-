import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./Roles.css";

type Role = {
  id: number;
  label: string;
  issuspended: boolean;
};

const Roles: React.FC = () => {
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All Status");

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Error fetching roles', err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Create new role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleLabel.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newRoleLabel })
      });
      if (res.ok) {
        setNewRoleLabel("");
        setShowCreateModal(false);
        toast.success('Role created successfully');
        await fetchRoles();
      } else {
        toast.error('Failed to create role');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create role');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('Delete this role?')) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Role deleted successfully');
      } else {
        toast.error('Failed to delete role');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete role');
    }
    await fetchRoles();
  };

  const handleSuspendRole = async (role: Role) => {
    const action = role.issuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this role?`)) return;
    try {
      const res = await fetch(`/api/roles/${role.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issuspended: !role.issuspended })
      });
      if (res.ok) {
        toast.success(role.issuspended ? 'Role enabled' : 'Role disabled');
      } else {
        toast.error('Failed to update role status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update role status');
    }
    await fetchRoles();
  };

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (!value) {
      await fetchRoles();
      return;
    }
    try {
      const res = await fetch(`/api/roles/search?q=${encodeURIComponent(value)}`);
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Search roles error', err);
      setRoles([]);
    }
  };

  const filteredRoles = roles.filter(r => {
    if (filterStatus === 'All Status') return true;
    if (filterStatus === 'Active') return !r.issuspended;
    return r.issuspended;
  });

  return (
    <div className="roles-container">
      
      <div className="roles-top">
        <div>
          <header className="roles-header"></header>
          <h1>Roles</h1>
          <p>Manage all available roles and permissions</p>
        </div>
      </div>

      {/* Search / controls panel (styles live in Roles.css) */}
      <div className="roles-actions">
        <input
          type="text"
          placeholder="Search by role"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-roles"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-roles"
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <button
          onClick={() => { setFilterStatus('All Status'); setSearchQuery(''); fetchRoles(); }}
          className="reset-roles btn"
        >
          Reset
        </button>

        <button
          onClick={() => setShowCreateModal(true)}
          className="create-roles btn"
        >
          Create Role
        </button>
      </div>

      {showCreateModal && (
        <div className="roles-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="roles-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Role</h2>
            <form className="roles-modal-form" onSubmit={handleCreateRole}>
              <label>
                Role Name
                <input
                  type="text"
                  value={newRoleLabel}
                  onChange={(e) => setNewRoleLabel(e.target.value)}
                  required
                />
              </label>

              <div className="roles-modal-actions">
                <button type="button" className="roles-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="roles-modal-create" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
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
          {loading ? (
            <tr><td colSpan={4}>Loading...</td></tr>
          ) : filteredRoles.length === 0 ? (
            <tr><td colSpan={4}>No roles found.</td></tr>
          ) : (
            filteredRoles.map((role) => (
              <tr key={role.id} className={role.issuspended ? 'inactive' : 'active'}>
                <td>{String(role.id).padStart(3, '0')}</td>
                <td>{role.label}</td>
                <td>
                  <span className={`roles-status ${role.issuspended ? 'inactive' : 'active'}`}>
                    {role.issuspended ? 'Inactive' : 'Active'}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleSuspendRole(role)}
                    className={`disable-roles ${role.issuspended ? 'enable' : 'disable'}`}
                    style={{ marginRight: 10 }}
                  >
                    {role.issuspended ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="delete-roles"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Roles;
