import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import "../styles/signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const [success, setSuccess] = useState(false);
  const [strength, setStrength] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    otp: "",
    adminSecret: ""
  });

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  /* ================= PASSWORD STRENGTH ================= */
  useEffect(() => {
    const pwd = form.password;

    if (!pwd) {
      setStrength("");
      return;
    }

    if (pwd.length < 6) setStrength("Weak");
    else if (pwd.length < 8) setStrength("Medium");
    else if (passwordRegex.test(pwd)) setStrength("Strong");
    else setStrength("Medium");
  }, [form.password]);

  /* ================= OTP TIMER ================= */
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  /* ================= SEND OTP ================= */
  const sendOtp = async () => {
    if (!form.name || !form.email || !form.phone) {
      setError("All fields are required.");
      return;
    }

    if (!passwordRegex.test(form.password)) {
      setError("Password must be strong.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep(2);
        setTimer(30);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.log(err);
      setError("Server error while sending OTP.");
    }

    setLoading(false);
  };

  /* ================= VERIFY OTP & SIGNUP ================= */
  const verifyOtpAndSignup = async () => {
    if (!form.otp) {
      setError("Enter OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify OTP
      const verifyRes = await fetch("http://localhost:5000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.verified) {
        setError("Invalid or Expired OTP");
        setLoading(false);
        return;
      }

      // Signup request
      const signupRes = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          adminSecret: form.adminSecret
        }),
      });

      const signupData = await signupRes.json();

if (signupRes.ok) {

        // Safe store
        localStorage.setItem(
          "user",
          JSON.stringify(signupData.user)
        );

        // Update auth context correctly
        login(signupData.user);

        setSuccess(true);
setError("");

setTimeout(() => {
  navigate("/login", { replace: true });
}, 1500);

} else {
  setError(signupData.message || "Signup failed");
}

    } catch (err) {
      console.log(err);
      setError("Server error during signup.");
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="home-btn" onClick={() => navigate("/")}>
        ⬅ Home
      </div>

      <div className="signup-left">
        <div className="signup-card">

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: step === 1 ? "50%" : "100%" }}
            ></div>
          </div>

          {success && (
            <div className="success-animation">
              <div className="checkmark"></div>
              <p><p>✅ Signup successful!</p></p>
            </div>
          )}

          <h2>Create Account</h2>

          {error && <p className="error-text">{error}</p>}

          {step === 1 && (
            <>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="input-field">
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div className="input-field">
                <input
                  type="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              </div>

              <div className="input-field password-field">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                <span
                  className="toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁"}
                </span>
              </div>

              {strength && (
                <p className={`password-strength ${strength.toLowerCase()}`}>
                  {strength} Password
                </p>
              )}

              <div className="input-field">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                />
              </div>

              <div className="input-field">
                <input
                  type="text"
                  placeholder="Admin Secret (Optional)"
                  value={form.adminSecret}
                  onChange={(e) =>
                    setForm({ ...form, adminSecret: e.target.value })
                  }
                />
              </div>

              <button onClick={sendOtp} disabled={loading}>
                {loading ? "Processing..." : "Send OTP"}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={form.otp}
                  onChange={(e) =>
                    setForm({ ...form, otp: e.target.value })
                  }
                />
              </div>

              <button
                onClick={verifyOtpAndSignup}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Signup"}
              </button>

              {timer > 0 ? (
                <p className="timer">Resend OTP in {timer}s</p>
              ) : (
                <p className="resend" onClick={sendOtp}>
                  Resend OTP
                </p>
              )}
            </>
          )}

          <p className="signup-footer">
            Already have account?
            <span onClick={() => navigate("/login")}>
              Login
            </span>
          </p>

        </div>
      </div>

      <div className="signup-right">
        <div className="feature-content">
          <h1>Build Your Future With Us</h1>
          <p>Secure • Modern • Fast • AI Powered</p>
        </div>
      </div>
    </div>
  );
}