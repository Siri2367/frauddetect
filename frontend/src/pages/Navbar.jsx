import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);

  // 🔐 Safe user parsing
  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    } catch {
      setUser(null);
    }
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("user");
    navigate("/");
  };

  const goHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* LEFT SIDE */}
      <div className="nav-left">
        <h2 className="app-title" onClick={goHome}>
          FraudDetect
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">

        {!isLoggedIn && (
          <>
            <Link
              to="/login"
              className={isActive("/login") ? "active-link" : ""}
            >
              Login
            </Link>

            <Link
              to="/signup"
              className={isActive("/signup") ? "active-link" : ""}
            >
              Signup
            </Link>
          </>
        )}

        {isLoggedIn && user && (
          <>
            <Link
              to="/dashboard"
              className={isActive("/dashboard") ? "active-link" : ""}
            >
              Dashboard
            </Link>

            <Link
              to="/check"
              className={isActive("/check") ? "active-link" : ""}
            >
              Check Job
            </Link>

            <Link
              to="/awareness"
              className={isActive("/awareness") ? "active-link" : ""}
            >
              Awareness
            </Link>

            <Link
              to="/company-check"
              className={isActive("/company-check") ? "active-link" : ""}
            >
              Company Check
            </Link>

            <Link
              to="/ats-checker"
              className={isActive("/ats-checker") ? "active-link" : ""}
            >
              ATS Checker
            </Link>

            {/* 🔐 ADMIN ONLY LINK */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className={`admin-link ${
                  isActive("/admin") ? "active-link" : ""
                }`}
              >
                Admin Panel
              </Link>
            )}

            {/* PROFILE BOX */}
            <div className="profile-box">
              <div className="avatar">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>

              <div className="profile-info">
                <span className="username">
                  {user?.name}
                </span>

                {/* 🔥 Professional Role Badge */}
                <span
                  className={`role-badge ${
                    user?.role === "admin"
                      ? "admin-role"
                      : "user-role"
                  }`}
                >
                  {user?.role === "admin"
                    ? "Administrator"
                    : "User"}
                </span>
              </div>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}