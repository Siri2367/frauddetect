import { useEffect, useState } from "react";
import "../styles/blacklist.css";

export default function BlacklistedCompanies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem("fraudReports")) || [];
    const blocked = reports.filter(r => r.status === "Blocked");
    setCompanies(blocked);
  }, []);

  return (
    <div className="blacklist-container">
      <h2>Blacklisted Companies</h2>

      {companies.length === 0 && <p>No blacklisted companies yet.</p>}

      {companies.map((c, i) => (
        <div key={i} className="blacklist-card">
          <h4>{c.company}</h4>
          <p>{c.description}</p>
          <span>Blocked on: {c.date}</span>
        </div>
      ))}
    </div>
  );
}