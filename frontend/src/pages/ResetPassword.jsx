import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/reset.css";

export default function ResetPassword() {
  const { token } = useParams();
  const nav = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 Strong Password Regex
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  // 🔥 Live validation checks
  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (!passwordRegex.test(password)) {
      setMessage(
        "Password must be 8+ chars, include uppercase, lowercase, number & special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      const data = await res.json();
      setMessage(data.message);

      if (data.message === "Password updated successfully") {
        setTimeout(() => {
          nav("/login");
        }, 2000);
      }

    } catch (err) {
      setMessage("Server error. Please try again.");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleReset();
    }
  };

  return (
    <div className="reset-container">

      <div className="reset-left">
        <div className="reset-card">
          <h2>Create New Password</h2>

          <div className="reset-input">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>

          {/* 🔥 LIVE PASSWORD CHECKLIST */}
          <div className="password-checklist">
            <p className={validations.length ? "valid" : ""}>
              ✔ At least 8 characters
            </p>
            <p className={validations.uppercase ? "valid" : ""}>
              ✔ One uppercase letter
            </p>
            <p className={validations.lowercase ? "valid" : ""}>
              ✔ One lowercase letter
            </p>
            <p className={validations.number ? "valid" : ""}>
              ✔ One number
            </p>
            <p className={validations.special ? "valid" : ""}>
              ✔ One special character (@$!%*?&)
            </p>
          </div>

          <div className="reset-input">
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>

          <button onClick={handleReset} disabled={loading}>
            {loading ? "Updating..." : "Reset Password"}
          </button>

          {message && (
            <p className="reset-message">{message}</p>
          )}
        </div>
      </div>

      <div className="reset-right">
        <div className="reset-feature">
          <h1>Secure Password Reset</h1>
          <p>
            Create a strong password to protect your account
            from unauthorized access.
          </p>
        </div>
      </div>

    </div>
  );
}