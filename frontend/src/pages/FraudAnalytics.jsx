import { useEffect, useState } from "react";
import "../styles/analytics.css";

export default function FraudAnalytics() {
  const [stats, setStats] = useState({
    totalReports: 0,
    blockedCompanies: 0,
    totalUsers: 0
  });

  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem("fraudReports")) || [];
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const blocked = reports.filter(r => r.status === "Blocked");

    setStats({
      totalReports: reports.length,
      blockedCompanies: blocked.length,
      totalUsers: users.length
    });
  }, []);

  return (
    <div className="analytics-container">
      <h2>Fraud Analytics Dashboard</h2>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>{stats.totalReports}</h3>
          <p>Total Fraud Reports</p>
        </div>

        <div className="analytics-card">
          <h3>{stats.blockedCompanies}</h3>
          <p>Blocked Companies</p>
        </div>

        <div className="analytics-card">
          <h3>{stats.totalUsers}</h3>
          <p>Total Users</p>
        </div>
      </div>
    </div>
  );
}