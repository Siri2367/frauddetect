import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";
import "../styles/login.css";

export default function Login() {
  const { login, isLoggedIn } = useContext(AuthContext);
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* 🔥 AUTO REDIRECT IF ALREADY LOGGED IN */
  useEffect(() => {
    const stored = localStorage.getItem("user"); const user = stored && stored !== "undefined" ? JSON.parse(stored) : null;

    if (isLoggedIn && user) {
      if (user.role === "admin") {
        nav("/admin");
      } else {
        nav("/dashboard");
      }
    }
  }, [isLoggedIn, nav]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Invalid credentials");
        setLoading(false);
        return;
      }

      // ✅ Save full user including role
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Update auth context
      login(data.user);

      // 🔐 Role-based redirect (extra safety check)
      if (data.user && data.user.role === "admin") {
        nav("/admin");
      } else {
        nav("/dashboard");
      }

    } catch (err) {
      setError("Server error. Please try again.");
    }

    setLoading(false);
  };

  // 🔥 ENTER KEY SUPPORT
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <div className="home-btn" onClick={() => nav("/")}>
        ⬅ Home
      </div>

      <div className="login-left">
        <div className="login-card">
          <h2>Welcome Back</h2>

          {error && <p className="error-text">{error}</p>}

          <div className="input-field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              autoComplete="email"
            />
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
              autoComplete="current-password"
            />
          </div>

          {/* 🔐 FORGOT PASSWORD */}
          <p
            className="forgot-link"
            onClick={() => nav("/forgot-password")}
          >
            Forgot Password?
          </p>

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="login-footer">
            Don't have an account?
            <span onClick={() => nav("/signup")}>
              Signup
            </span>
          </p>
        </div>
      </div>

      <div className="login-right">
        <div className="feature-content">
          <h1>Secure AI Fraud Detection</h1>
          <p>
            Protect yourself from fake job offers,
            phishing emails, and LinkedIn scams.
          </p>
        </div>
      </div>
    </div>
  );
}