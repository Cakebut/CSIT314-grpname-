import './CreateNewUserAccountPage.css';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { useState, useEffect } from "react";

function CreateNewUserAccountPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleid, setRoleid] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState('Active'); // I set active as default


  // Dynamically fetched roles
  const [roles, setRoles] = useState<{id: number, label: string, issuspended?: boolean}[]>([]);
  useEffect(() => {
    fetch('/api/roles')
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(() => setRoles([]));
  }, []);

    
    const statusOptions = ['Active', 'Suspend'];


    // Handle form submission
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, roleid, status }),
        credentials: 'include',
      });
      if (res.ok) {
  navigate('/useradmin/ViewUserList', { state: { accountCreated: true } });
      } else {
        toast.error('Account creation failed.');
      }
    } catch (err) {
      toast.error('Error creating account.');
      console.error('Error:', err);
      navigate('/useradmin/ViewUserList');
    }
  };

  return (
    <div className="create-user-container" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button
        onClick={() => navigate('/useradmin/ViewUserList')}
        style={{ position: 'absolute', top: '2rem', left: '2rem', background: '#0077cc', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.3rem', fontWeight: 700, fontSize: '1rem', boxShadow: '0 1px 4px rgba(44,62,80,0.10)', cursor: 'pointer', letterSpacing: '0.01em', transition: 'background 0.2s' }}
      >
        ← Return to User List
      </button>
      <form onSubmit={handleCreateAccount} className="create-user-form" style={{ background: 'white', borderRadius: '24px', boxShadow: '0 12px 32px rgba(44,62,80,0.12)', padding: '2.5rem 2rem', maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2rem', color: '#2d3748', marginBottom: '2rem', letterSpacing: '0.02em' }}>Create New User</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.1rem' }}>
          <input
            type="text"
            placeholder="Name"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ padding: '1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #bfc8d6', fontSize: '1.08rem', width: '100%', background: '#f3f6fb', boxSizing: 'border-box', transition: 'border 0.2s', outline: 'none' }}
            onFocus={e => e.currentTarget.style.border = '1.5px solid #0077cc'}
            onBlur={e => e.currentTarget.style.border = '1.5px solid #bfc8d6'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ padding: '1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #bfc8d6', fontSize: '1.08rem', width: '100%', background: '#f3f6fb', boxSizing: 'border-box', transition: 'border 0.2s', outline: 'none' }}
            onFocus={e => e.currentTarget.style.border = '1.5px solid #0077cc'}
            onBlur={e => e.currentTarget.style.border = '1.5px solid #bfc8d6'}
          />
        </div>
        <div style={{ marginBottom: '1.1rem' }}>
          <select value={roleid} onChange={e => setRoleid(Number(e.target.value))} required style={{ padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid #bfc8d6', fontSize: '1.05rem', width: '100%', background: '#f3f6fb', transition: 'border 0.2s', outline: 'none' }}>
            <option value="">Select Role</option>
            {roles.filter(role => !role.issuspended).map((role) => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '1.1rem' }}>
          <select value={status} onChange={e => setStatus(e.target.value)} required style={{ padding: '0.9rem 1.2rem', borderRadius: '12px', border: '1.5px solid #bfc8d6', fontSize: '1.05rem', width: '100%', background: '#f3f6fb', transition: 'border 0.2s', outline: 'none' }}>
            <option value="">Select Status</option>
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={{ background: '#0077cc', color: 'white', border: 'none', borderRadius: '12px', padding: '1rem 0', fontWeight: 700, fontSize: '1.08rem', width: '100%', marginTop: '1.2rem', boxShadow: '0 2px 8px rgba(44,62,80,0.10)', cursor: 'pointer', letterSpacing: '0.02em', transition: 'background 0.2s' }}>Submit</button>
      </form>
    </div>
  );
}

export default CreateNewUserAccountPage;
