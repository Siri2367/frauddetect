import Navbar from "../pages/Navbar";

export default function History() {
  const history = JSON.parse(localStorage.getItem("history")) || [];

  return (
    <>
      <Navbar />
      <div className="card page">
        <h2>Checked Job History</h2>
        <ul>
          {history.map((job, i) => (
            <li key={i}>
              {job.email} – ₹{job.salary} ({job.date})
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
