import { useState } from "react";
import Navbar from "../pages/Navbar";
import "../styles/linkedin.css";

export default function LinkedInCheck() {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzePost = async () => {
    let payload = {};

    if (mode === "text") {
      if (!text.trim()) {
        setResult({ error: "Please paste LinkedIn post content." });
        return;
      }
      payload = { content: text };
    }

    if (mode === "url") {
      const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/.+$/;
      if (!linkedinRegex.test(url)) {
        setResult({ error: "Invalid LinkedIn URL ❌" });
        return;
      }
      payload = { content: url };
    }

    if (mode === "image") {
      if (!image) {
        setResult({ error: "Please upload an image first ⚠️" });
        return;
      }
      setResult({ error: "Screenshot OCR not connected yet." });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("http://localhost:5000/linkedin-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: "Server connection failed ❌" });
    } finally {
      setLoading(false);
    }
  };

  const getColor = (riskLevel) => {
    if (riskLevel === "High Risk") return "#dc2626";
    if (riskLevel === "Medium Risk") return "#f97316";
    return "#16a34a";
  };

  return (
    <>
      <Navbar />

      <div className="linkedin-page">
        <div
          className={`dashboard-container ${
            result ? "has-result" : ""
          }`}
        >
          {/* ================= INPUT PANEL ================= */}
          <div className="input-panel">
            <h2>LinkedIn Enterprise Fraud + Company Intelligence</h2>

            <div className="mode-buttons">
              <button onClick={() => setMode("text")}>Post Text</button>
              <button onClick={() => setMode("url")}>LinkedIn URL</button>
              <button onClick={() => setMode("image")}>Screenshot</button>
            </div>

            {mode === "text" && (
              <textarea
                rows="6"
                placeholder="Paste LinkedIn post content..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            )}

            {mode === "url" && (
              <input
                type="text"
                placeholder="Paste LinkedIn post URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            )}

            {mode === "image" && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
                {image && (
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Preview"
                    style={{ width: "100%", marginTop: "10px" }}
                  />
                )}
              </>
            )}

            <button
              className="analyze-btn"
              onClick={analyzePost}
              disabled={loading}
            >
              {loading ? "Analyzing..." : "Analyze Post"}
            </button>
          </div>

          {/* ================= RESULT PANEL ================= */}
          <div className="result-side">
            {loading && <p>Analyzing...</p>}

            {result && !loading && (
              <div className="result-panel">
                {result.error ? (
                  <p style={{ color: "red" }}>{result.error}</p>
                ) : (
                  <>
                    <h3 style={{ color: getColor(result.riskLevel) }}>
                      {result.riskLevel}
                    </h3>

                    <p>
                      Fraud Probability:{" "}
                      <strong>{result.fraudProbability}%</strong>
                    </p>

                    {result.intelligence && (
                      <>
                        <h4>Company Intelligence</h4>
                        <p>
                          <strong>Name:</strong>{" "}
                          {result.intelligence.companyName}
                        </p>
                        <p>
                          <strong>Website:</strong>{" "}
                          {result.intelligence.website}
                        </p>
                        <p>
                          <strong>Location:</strong>{" "}
                          {result.intelligence.location}
                        </p>
                        <p>
                          <strong>External Risk:</strong>{" "}
                          {result.intelligence.externalRisk}
                        </p>
                      </>
                    )}

                    {result.summary && (
                      <>
                        <h4>Summary</h4>
                        <p>{result.summary}</p>
                      </>
                    )}

                    {result.recommendation && (
                      <>
                        <h4>Recommendation</h4>
                        <p>{result.recommendation}</p>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}