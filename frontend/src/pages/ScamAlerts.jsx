import { useEffect, useState } from "react";
import "../styles/scamalerts.css";

export default function ScamAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem("fraudReports")) || [];

    const blockedReports = reports.filter(
      (r) => r.status === "Blocked"
    );

    setAlerts(blockedReports);
  }, []);

  return (
    <div className="alerts-container">
      <h2>Latest Scam Alerts</h2>

      {alerts.length === 0 && <p>No active scam alerts.</p>}

      {alerts.map((alert, index) => (
        <div key={index} className="alert-card high">
          <h4>{alert.company}</h4>
          <p>⚠️ High Risk Fraud Reported</p>
          <small>Reported on: {alert.date}</small>
        </div>
      ))}
    </div>
  );
}