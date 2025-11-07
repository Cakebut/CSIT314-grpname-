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
      {/* Back to Dashboard button removed */}

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Roles</h1>
        <p style={{ margin: '6px 0 14px', color: '#6b7280' }}>Manage roles and permissions</p>
      </div>

      {/* Search / controls panel (design from AdminDashboard) */}
      <div style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 16, background: '#fff', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by role"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid #d1d5db', flex: 1, minWidth: 220 }}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid #d1d5db', minWidth: 150 }}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          <button
            onClick={() => { setFilterStatus('All Status'); setSearchQuery(''); fetchRoles(); }}
            style={{ background: '#000', color: '#fff', borderRadius: 10, padding: '10px 14px', border: 'none', cursor: 'pointer' }}
          >
            Reset
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{ background: '#000', color: '#fff', borderRadius: 10, padding: '10px 14px', border: 'none', cursor: 'pointer' }}
          >
            Create Role
          </button>
        </div>
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
                    onClick={() => handleSuspendRole(role)}
                    style={{ marginRight: '0.5rem', background: '#1e90ff', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {role.issuspended ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    style={{ marginRight: '0.5rem', background: '#000', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', fontWeight: 500, cursor: 'pointer' }}
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
