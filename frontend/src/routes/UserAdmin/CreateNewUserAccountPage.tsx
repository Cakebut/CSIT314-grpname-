import './CreateNewUserAccountPage.css';
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function CreateNewUserAccountPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roleid, setRoleid] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState('Active'); // I set active as default
  const [result, setResult] = useState('');

  const roleOptions = [
    { id: 1, label: 'User Admin' },
    { id: 2, label: 'PIN' },
    { id: 3, label: 'CSR Rep' },
    { id: 4, label: 'Platform Manager' }
  ];

    
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
        setResult('Account created!');
      } else {
        setResult('Account creation failed.');
      }
    } catch (err) {
      setResult('Error creating account.');
      console.error('Error:', err);
      navigate('/useradmin');
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
          {roleOptions.map(option => (
            <option key={option.id} value={option.id}>{option.label}</option>
          ))}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} required>
          <option value="">Select Status</option>
          {statusOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button type="submit">Submit</button>
        {result && <div className="result-message">{result}</div>}
      </form>
    </div>
  );
}

export default CreateNewUserAccountPage;
