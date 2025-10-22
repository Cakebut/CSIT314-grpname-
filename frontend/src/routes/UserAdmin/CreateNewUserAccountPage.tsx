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
  const [roles, setRoles] = useState<{id: number, label: string}[]>([]);
  useEffect(() => {
    fetch('http://localhost:3000/api/roles')
      .then(res => res.json())
      .then(data => setRoles(data))
      .catch(() => setRoles([]));
  }, []);

    
    const statusOptions = ['Active', 'Suspend'];

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/users', {
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
    <div className="create-user-container">
      <h2>Create New User</h2>
      <form onSubmit = {handleCreateAccount}>
        <input
          type="text"
          placeholder="Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <select value={roleid} onChange={e => setRoleid(Number(e.target.value))} required>
          <option value="">Select Role</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>{role.label}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} required>
          <option value="">Select Status</option>
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button type="submit">Submit</button>
      
      </form>
    </div>
  );
}

export default CreateNewUserAccountPage;
