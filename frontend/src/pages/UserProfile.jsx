import { useEffect, useState } from "react";
import "../styles/profile.css";

export default function UserProfile() {
  const [stats, setStats] = useState({
    name: "",
    email: "",
    jobsChecked: 0,
    fraudDetected: 0
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const reports = JSON.parse(localStorage.getItem("fraudReports")) || [];

    const fraudCount = history.filter(
      (job) => job.risk?.toLowerCase().includes("high")
    ).length;

    setStats({
      name: user.name || "User",
      email: user.email || "Not Available",
      jobsChecked: history.length,
      fraudDetected: fraudCount
    });
  }, []);

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      <div className="profile-card">
        <p><strong>Name:</strong> {stats.name}</p>
        <p><strong>Email:</strong> {stats.email}</p>
        <p><strong>Jobs Checked:</strong> {stats.jobsChecked}</p>
        <p><strong>Frauds Detected:</strong> {stats.fraudDetected}</p>
      </div>
    </div>
  );
}