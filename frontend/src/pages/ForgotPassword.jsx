import { useState, useEffect } from "react";
import "../styles/forgot.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // ⏳ Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      setEmailSent(true);
      setMessage(data.message);
      setCooldown(30); // 30 sec cooldown

    } catch (err) {
      setMessage("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="forgot-container">

      <div className="forgot-left">
        <div className="forgot-card">

          {!emailSent ? (
            <>
              <div className="mail-icon">
                ✉️
              </div>

              <h2>Forgot Password</h2>
              <p>Enter your registered email to receive a reset link.</p>

              <div className="forgot-input">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button onClick={handleSubmit} disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              {message && <p className="forgot-error">{message}</p>}
            </>
          ) : (
            <>
              <div className="success-animation">
                ✓
              </div>

              <h2>Email Sent!</h2>
              <p>
                If the email exists, a reset link has been sent.
                Please check your inbox.
              </p>

              {cooldown > 0 ? (
                <p className="cooldown-text">
                  Resend available in {cooldown}s
                </p>
              ) : (
                <button onClick={handleSubmit}>
                  Resend Email
                </button>
              )}
            </>
          )}

        </div>
      </div>

      <div className="forgot-right">
        <div className="forgot-feature">
          <h1>Password Recovery</h1>
          <p>
            Securely recover access to your account with enterprise-grade
            protection.
          </p>
        </div>
      </div>

    </div>
  );
}