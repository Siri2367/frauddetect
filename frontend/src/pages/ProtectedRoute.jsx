import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch (err) {
    user = null;
  }

  // 🔐 If not logged in OR user missing → redirect to login
  if (!isLoggedIn || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // 🔒 If route requires specific role (admin)
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ Everything valid
  return children;
}