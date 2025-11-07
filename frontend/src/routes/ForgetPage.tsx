import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./ForgetPage.css";

function Forget({ 

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

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1);
  }

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

          <div className="input-wrapper">
            <div className="input-submit">
              <button
                type="button"
                className="submit-btn btn"
                id="cancel"
                onClick={handleCancel}
              ></button>
              <label htmlFor="cancel">Cancel</label>
            </div>

            <div className="input-submit">
              <button
                type="submit"
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
