import Navbar from "../pages/Navbar";

export default function Result() {
  const result = JSON.parse(localStorage.getItem("result"));

  return (
    <>
      <Navbar />
      <div className="card page">
        <h2>Fraud Analysis Result</h2>

        <div className="risk-meter">
          <div
            className="risk-fill"
            style={{ width: `${result.score}%` }}
          ></div>
        </div>

        <p className={`risk-text ${result.risk.split(" ")[0].toLowerCase()}`}>
          {result.risk} ({result.score}%)
        </p>

        <h4>Reasons Detected:</h4>
        <ul>
          {result.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
