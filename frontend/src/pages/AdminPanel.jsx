import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin.css";

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    blocked: 0,
  });

  const navigate = useNavigate();

  /* 🔥 LOGOUT FUNCTION */
  const handleLogout = () => {
    localStorage.clear(); // clear all stored data
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userData = localStorage.getItem("user");

        if (!userData || userData === "undefined") {
          navigate("/login", { replace: true });
          return;
        }

        const user = JSON.parse(userData);

        const res = await fetch(
          "http://localhost:5000/admin-secure-data",
          {
            headers: {
              "x-user-email": user.email,
            },
          }
        );

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message);
          navigate("/login", { replace: true });
          return;
        }

        const totalUsers = data.totalUsers;

        const storedReports =
          JSON.parse(localStorage.getItem("fraudReports")) || [];

        const blockedCount = storedReports.filter(
          (r) => r.status === "Blocked"
        ).length;

        setReports(storedReports);

        setStats({
          totalUsers: totalUsers,
          totalReports: storedReports.length,
          blocked: blockedCount,
        });

      } catch (err) {
        console.error("Admin fetch error:", err);
        navigate("/login", { replace: true });
      }
    };

    fetchAdminData();
  }, [navigate]);

  const updateStatus = (index, status) => {
    const updated = [...reports];
    updated[index].status = status;

    setReports(updated);
    localStorage.setItem("fraudReports", JSON.stringify(updated));

    const blockedCount = updated.filter(
      (r) => r.status === "Blocked"
    ).length;

    setStats((prev) => ({
      ...prev,
      totalReports: updated.length,
      blocked: blockedCount,
    }));
  };

  return (
    <div className="admin-container">

      {/* 🔥 HEADER WITH LOGOUT */}
      <div className="admin-header">
        <div className="admin-header-row">
          <div>
            <h2>Admin Dashboard</h2>
            <p>Manage Users, Reports & Platform Security</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* 🔥 STATS CARDS SECTION */}
      <div className="admin-cards-grid">

        <div className="dashboard-card users-card">
          <div className="card-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Registered Users</p>
          </div>
        </div>

        <div className="dashboard-card reports-card">
          <div className="card-content">
            <h3>{stats.totalReports}</h3>
            <p>Total Fraud Reports</p>
          </div>
        </div>

        <div className="dashboard-card blocked-card">
          <div className="card-content">
            <h3>{stats.blocked}</h3>
            <p>Blocked Companies</p>
          </div>
        </div>

      </div>

      {/* 🔥 REPORT MANAGEMENT SECTION */}
      <div className="report-section">
        <h3>Fraud Reports Management</h3>

        {reports.length === 0 && (
          <p className="empty-text">
            No fraud reports submitted yet.
          </p>
        )}

        {reports.map((report, index) => (
          <div key={index} className="admin-report-card">
            <div className="report-header">
              <h4>{report.company}</h4>
              <span
                className={`status-badge ${
                  report.status || "Pending"
                }`}
              >
                {report.status || "Pending"}
              </span>
            </div>

            <p><strong>Email:</strong> {report.hrEmail}</p>
            <p><strong>Description:</strong> {report.description}</p>
            <p><strong>Date:</strong> {report.date}</p>

            <div className="admin-actions">
              <button
                className="approve-btn"
                onClick={() => updateStatus(index, "Approved")}
              >
                Approve
              </button>

              <button
                className="block-btn"
                onClick={() => updateStatus(index, "Blocked")}
              >
                Block
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}