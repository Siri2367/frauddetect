import { useEffect, useState } from "react";
import "../styles/resumehistory.css";

export default function ResumeHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const scores = JSON.parse(localStorage.getItem("resumeScores")) || [];
    setHistory(scores);
  }, []);

  return (
    <div className="card page">
      <h2>Resume Score History</h2>

      {history.length === 0 && <p>No previous scores.</p>}

      {history.map((item, i) => (
        <div key={i} className="score-card">
          <p><strong>Score:</strong> {item.score}%</p>
          <p><strong>Date:</strong> {item.date}</p>
        </div>
      ))}
    </div>
  );
}