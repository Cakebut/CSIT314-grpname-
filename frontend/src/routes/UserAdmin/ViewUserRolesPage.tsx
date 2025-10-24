import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './ViewUserRolesPage.css';

type Role = {
  id: number;
  label: string;
  issuspended: boolean;
};

function ViewUserRoles() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoleLabel, setNewRoleLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/roles');
        if (res.ok) {
          const data = await res.json();
          setRoles(data);
        } else {
          setRoles([]);
        }
      } catch {
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  // Create new role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleLabel.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('http://localhost:3000/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newRoleLabel })
      });
      if (res.ok) {
        setNewRoleLabel("");
        setShowCreateModal(false);
        toast.success('Role created successfully');
        // Refresh roles
        const updated = await fetch('http://localhost:3000/api/roles');
        setRoles(updated.ok ? await updated.json() : []);
      } else {
        toast.error('Failed to create role');
      }
    } finally {
      setCreating(false);
    }
  };

  // Delete role
  const handleDeleteRole = async (id: number) => {
    if (!window.confirm('Delete this role?')) return;
    const res = await fetch(`http://localhost:3000/api/roles/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Role deleted successfully');
    } else {
      toast.error('Failed to delete role');
    }
    // Refresh roles
    const updated = await fetch('http://localhost:3000/api/roles');
    setRoles(updated.ok ? await updated.json() : []);
  };

  // Suspend/Unsuspend role
  const handleSuspendRole = async (role: Role) => {
    const action = role.issuspended ? 'unsuspend' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this role?`)) return;
    const res = await fetch(`http://localhost:3000/api/roles/${role.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issuspended: !role.issuspended })
    });
    if (res.ok) {
      toast.success(role.issuspended ? 'Role enabled' : 'Role disabled');
    } else {
      toast.error('Failed to update role status');
    }
    // Refresh roles
    const updated = await fetch('http://localhost:3000/api/roles');
    setRoles(updated.ok ? await updated.json() : []);
  };

  // Search roles
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setSearching(true);
    try {
      const res = await fetch(`http://localhost:3000/api/roles/search?q=${encodeURIComponent(value)}`);
      if (res.ok) {
        setRoles(await res.json());
      } else {
        setRoles([]);
      }
    } catch {
      setRoles([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="roles-container" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e3e6f3 100%)', minHeight: '100vh' }}>
      <button className="back-btn" onClick={() => navigate('/useradmin')}>
        ← Back to Dashboard
      </button>
      <div className="roles-header">
        <h2 style={{ fontWeight: 700, fontSize: '2rem', color: '#2d3a4a', marginBottom: '0.5rem' }}>Roles Dashboard</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={handleSearch}
            style={{ padding: '0.7rem 1.2rem', borderRadius: '10px', border: '1.5px solid #bfc8d6', fontSize: '1.05rem', background: '#f3f6fb', width: '220px', marginRight: '0.5rem' }}
          />
          <button className="create-role-btn" onClick={() => setShowCreateModal(true)}>
            ＋ Create Role
          </button>
        </div>
      </div>
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ color: '#2d3a4a' }}>Create New Role</h3>
            <form onSubmit={handleCreateRole}>
              <input
                type="text"
                placeholder="Role label"
                value={newRoleLabel}
                onChange={e => setNewRoleLabel(e.target.value)}
                disabled={creating}
                required
                style={{ marginBottom: '1rem', width: '100%' }}
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={creating || !newRoleLabel.trim()}>
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <table className="roles-table" style={{ boxShadow: '0 4px 16px rgba(44,62,80,0.08)', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
        <thead>
          <tr style={{ background: '#e3e6f3' }}>
            <th>Role ID</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading || searching ? (
            <tr><td colSpan={4}>Loading...</td></tr>
          ) : roles.length === 0 ? (
            <tr><td colSpan={4}>No roles found.</td></tr>
          ) : (
            roles.map(role => (
              <tr key={role.id} style={{ background: role.issuspended ? '#fff8e1' : 'white' }}>
                <td>{role.id}</td>
                <td style={{ fontWeight: 600 }}>{role.label}</td>
                <td>
                  <span className={role.issuspended ? 'status-suspended' : 'status-active'} style={{ padding: '0.3rem 0.8rem', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', background: role.issuspended ? '#ffe082' : '#e0f7fa', color: role.issuspended ? '#d84315' : '#00796b' }}>
                    {role.issuspended ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td>
                  <button onClick={() => handleSuspendRole(role)} style={{ marginRight: '0.5rem', background: role.issuspended ? '#43a047' : '#ffd600', color: '#222', border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', fontWeight: 500, cursor: 'pointer' }}>
                    {role.issuspended ? 'Enable' : 'Disable'}
                  </button>
                  <button onClick={() => handleDeleteRole(role.id)} style={{ marginRight: '0.5rem', background: '#f44336', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', fontWeight: 500, cursor: 'pointer' }}>
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
}

export default ViewUserRoles;
