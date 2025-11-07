import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CircleCheck } from "lucide-react";
import "./ForgotPasswordPage.css";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // For any validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const allValid = hasMinLength && hasUppercase && hasNumber && passwordsMatch && username.length > 0;

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
    if (allValid === false) {
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

        <div className="password-requirements">
          <b>Password must contain:</b>
          <div className="validation-box">
            <p>Password must contain:</p>
            <ul>
              <li className={hasMinLength ? "valid" : "invalid"}>
                <CircleCheck
                  className={hasMinLength ? "valid-check" : "invalid-check"}
                />
                At least 8 characters
              </li>
              <li className={hasUppercase ? "valid" : "invalid"}>
                <CircleCheck
                  className={hasUppercase ? "valid-check" : "invalid-check"}
                />
                One uppercase letter
              </li>
              <li className={hasNumber ? "valid" : "invalid"}>
                <CircleCheck
                  className={hasNumber ? "valid-check" : "invalid-check"}
                />
                One number
              </li>
              <li className={passwordsMatch ? "valid" : "invalid"}>
                <CircleCheck
                  className={passwordsMatch ? "valid-check" : "invalid-check"}
                />
                Passwords match
              </li>
            </ul>
          </div>
         </div>
          <div className="input-wrapper">
            <div className="input-submit">
              <button
                type="button"
                className="submit-btn btn"
                id="cancel"
                onClick={() => navigate("/")}
              ></button>
              <label htmlFor="cancel">Cancel</label>
            </div>

            <div className="input-submit">
              <button
                type="submit"
                className="submit-btn btn"
                id="submit"
                onClick={handleSubmit}
                disabled={!username || !newPassword || !confirmPassword || !allValid}>
                {loading ? "" : ""}</button>
              <label htmlFor="submit">Confirm</label>
            </div>
          </div>

      </form>
    </section>
  );
}
