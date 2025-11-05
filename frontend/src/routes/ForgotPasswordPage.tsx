import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pw: string) => {
    return (
      pw.length >= 8 &&
      /[A-Z]/.test(pw) &&
      /[0-9]/.test(pw)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!validatePassword(newPassword)) {
      toast.error("Password does not meet requirements.");
      return;
    }
    setLoading(true);
    try {
      // Call backend to submit password reset request
      const res = await fetch('/api/userAdmin/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
       
        body: JSON.stringify({ username, newPassword }),
        credentials: 'include',
      });
      if (res.ok) {
        setSubmitted(true);
        toast.success("Password reset request submitted!");
      } else {
        toast.error("Failed to submit request.");
      }
    } catch  {
      toast.error("Error submitting request.");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="forgot-password-container">
        <div className="request-submitted-card">
          <h2>Request Submitted</h2>
          <p>Your password reset request has been received</p>
          <ul className="request-status-list">
            <li>✔ Your password change request has been successfully submitted</li>
            <li>✔ Request is pending approval from the administrator</li>
            <li>✔ You will receive confirmation once approved</li>
          </ul>
          <button className="back-login-btn" onClick={() => navigate("/")}>Back to Login</button>
          <div className="request-note">This usually takes 1-2 business days</div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <form className="reset-password-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p>Enter your username and create a new secure password</p>
        <label>Username
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
          />
        </label>
        <label>New Password
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            autoComplete="new-password"
          />
        </label>
        <label>Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            autoComplete="new-password"
          />
        </label>
        <div className="password-requirements">
          <b>Password must contain:</b>
          <ul>
            <li className={newPassword.length >= 8 ? "valid" : "invalid"}>At least 8 characters</li>
            <li className={/[A-Z]/.test(newPassword) ? "valid" : "invalid"}>One uppercase letter</li>
            <li className={/[0-9]/.test(newPassword) ? "valid" : "invalid"}>One number</li>
          </ul>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate("/")}>Cancel</button>
          <button type="submit" disabled={loading || !username || !newPassword || !confirmPassword || !validatePassword(newPassword)}>
            {loading ? "Submitting..." : "Reset Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
