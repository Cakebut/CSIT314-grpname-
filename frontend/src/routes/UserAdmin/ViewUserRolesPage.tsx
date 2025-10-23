
import { useEffect, useState } from 'react';
import './ViewUserRolesPage.css';

type Role = {
  id: number;
  label: string;
  issuspended: boolean;
};

function ViewUserRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="roles-container">
      <h2>Roles Dashboard</h2>
      <table className="roles-table">
        <thead>
          <tr>
            <th>Role ID</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4}>Loading...</td></tr>
          ) : roles.length === 0 ? (
            <tr><td colSpan={4}>No roles found.</td></tr>
          ) : (
            roles.map(role => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.label}</td>
                <td>
                  <span className={role.issuspended ? 'status-suspended' : 'status-active'}>
                    {role.issuspended ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td>
                  {/* Future actions (edit/delete) */}
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
