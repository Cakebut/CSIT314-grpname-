import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgetPage.css";

function Forget({ 
  onCancel, 
  onSubmit 
}: {
  onCancel? : () => void; 
  onSubmit? : () => void
}) {
    
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // For any validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const allValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch && username.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (allValid && onSubmit) {
      onSubmit();
    }
  };

  return (
    <>
      <section className="forget-main forget-section">

        <form id="loginForm" className="forget-box">
          <div className="forget-header">
            <header>Reset Password</header>
            <div>Create a new secure password</div>
          </div>

          <div className="input-box">
            <header>Username</header>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-box">
            <header>New Password</header>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="input-box">
            <header>Confirm Password</header>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="validation-box">
            <p>Password must contain:</p>
            <ul>
              <li style={{ color: hasMinLength ? "green" : "red" }}>
                • At least 8 characters
              </li>
              <li style={{ color: hasUppercase ? "green" : "red" }}>
                • One uppercase letter
              </li>
              <li style={{ color: hasNumber ? "green" : "red" }}>
                • One number
              </li>
              <li style={{ color: passwordsMatch ? "green" : "red" }}>
                • Passwords match
              </li>
            </ul>
          </div>

          <div className="input-wrapper">
            <div className="input-submit">
              <button
                type="submit"
                className="submit-btn btn"
                id="cancel"
                onClick={onCancel}
              ></button>
              <label htmlFor="cancel">Cancel</label>
            </div>

            <div className="input-submit">
              <button
                type="submit"
                // disabled={!allValid} FIX PLEASE THANKS
                className="submit-btn btn"
                id="submit"
                onClick={handleSubmit}
              ></button>
              <label htmlFor="submit">Confirm</label>
            </div>
          </div>

        </form>
      </section>
    </>
  );
}

export default Forget;
