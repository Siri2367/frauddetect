import { useState } from "react";
import Navbar from "../pages/Navbar";
import "../styles/gmail.css";

export default function GmailCheck() {
  const [mode, setMode] = useState("text");
  const [emailText, setEmailText] = useState("");
  const [gmailUrl, setGmailUrl] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeEmail = () => {
    setLoading(true);
    setResult(null);

    setTimeout(() => {
      let content = "";
      let riskScore = 0;
      let legitimacyScore = 0;
      const riskSignals = [];
      const legitimacySignals = [];

      if (mode === "text") {
        if (!emailText.trim()) {
          setLoading(false);
          setResult({ error: "Please paste email content ⚠️" });
          return;
        }
        content = emailText;
      }

      if (mode === "url") {
        if (!gmailUrl.includes("mail.google.com")) {
          setLoading(false);
          setResult({ error: "Invalid Gmail URL ❌" });
          return;
        }
        content = gmailUrl;
      }

      const lower = content.toLowerCase();

      const phishingKeywords = [
        "urgent",
        "verify immediately",
        "account suspended",
        "click here",
        "reset password",
        "payment required",
        "lottery"
      ];

      phishingKeywords.forEach(word => {
        if (lower.includes(word)) {
          riskScore += 15;
          riskSignals.push(word);
        }
      });

      if (lower.includes("bank transfer") || lower.includes("upi")) {
        riskScore += 25;
      }

      if (lower.includes("regards") || lower.includes("sincerely")) {
        legitimacyScore += 10;
      }

      let finalScore = Math.round(
        Math.max(0, Math.min((riskScore * 0.75) - (legitimacyScore * 0.25), 100))
      );

      let riskLevel = "Low Risk";
      if (finalScore >= 75) riskLevel = "High Risk";
      else if (finalScore >= 40) riskLevel = "Medium Risk";

      const confidence = Math.min(95, 50 + riskSignals.length * 5);

      setResult({
        riskLevel,
        fraudProbability: finalScore,
        confidence,
        summary:
          finalScore >= 75
            ? "Strong phishing indicators detected."
            : finalScore >= 40
            ? "Moderate suspicious indicators found."
            : "Low immediate phishing risk detected.",
        recommendation:
          finalScore >= 75
            ? "Do NOT click links or share personal data."
            : finalScore >= 40
            ? "Verify sender before taking action."
            : "Cross-check sender identity."
      });

      setLoading(false);
    }, 1000);
  };

  const circumference = 2 * Math.PI * 52;

  return (
    <>
      <Navbar />

      <div className="gmail-page">
        <div className={`gmail-container ${result ? "has-result" : ""}`}>

          {/* INPUT PANEL */}
          <div className="gmail-input-panel">
            <h2>Enterprise Gmail Fraud Detection</h2>

            <div className="gmail-mode-buttons">
              <button className={mode === "text" ? "active" : ""} onClick={() => setMode("text")}>Text</button>
              <button className={mode === "url" ? "active" : ""} onClick={() => setMode("url")}>URL</button>
            </div>

            {mode === "text" && (
              <textarea
                rows="6"
                placeholder="Paste suspicious email content..."
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
              />
            )}

            {mode === "url" && (
              <input
                type="text"
                placeholder="Paste Gmail URL..."
                value={gmailUrl}
                onChange={(e) => setGmailUrl(e.target.value)}
              />
            )}

            <button className="gmail-analyze-btn" onClick={analyzeEmail}>
              Run Scan
            </button>
          </div>

          {/* RESULT PANEL */}
          <div className="gmail-result-side">
            {loading && <div className="gmail-loader">Scanning...</div>}

            {result && !loading && (
              <div className="gmail-result-panel">

                <div className="gmail-risk-meter">
                  <svg viewBox="0 0 120 120">
                    <circle className="gmail-meter-bg" cx="60" cy="60" r="52" />
                    <circle
                      className={`gmail-meter-progress ${
                        result.riskLevel === "High Risk"
                          ? "high"
                          : result.riskLevel === "Medium Risk"
                          ? "medium"
                          : "low"
                      }`}
                      cx="60"
                      cy="60"
                      r="52"
                      strokeDasharray={circumference}
                      strokeDashoffset={
                        circumference -
                        (circumference * result.fraudProbability) / 100
                      }
                    />
                  </svg>

                  <div className="gmail-risk-center">
                    <span className="gmail-risk-percent">
                      {result.fraudProbability}%
                    </span>
                    <span className="gmail-risk-label">
                      {result.riskLevel}
                    </span>
                  </div>
                </div>

                <p><strong>Confidence:</strong> {result.confidence}%</p>

                <div className="gmail-summary-box">
                  <strong>Summary:</strong> {result.summary}
                </div>

                <div className="gmail-recommendation-box">
                  <strong>Recommendation:</strong> {result.recommendation}
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}