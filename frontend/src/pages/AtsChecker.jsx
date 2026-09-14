import { useState } from "react";
import Navbar from "../pages/Navbar";
import * as pdfjsLib from "pdfjs-dist";
import axios from "axios";
import "../styles/ats.css";

// ✅ STEP 3 FIX (LOCAL WORKER - NO ERRORS)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

// ✅ FIXED API URL (IMPORTANT)
const API_URL = "http://localhost:5000";

export default function AtsChecker() {
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= PDF Upload ================= */
  const handlePDFUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setResult(null);

    const reader = new FileReader();

    reader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;

        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          extractedText +=
            textContent.items.map((item) => item.str).join(" ") + "\n";
        }

        const cleanText = extractedText.replace(/\s+/g, " ").trim();
        setResumeText(cleanText);

      } catch (err) {
        console.error(err);
        setError("Failed to extract text from PDF.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  /* ================= ATS ANALYSIS ================= */
  const analyzeATS = async () => {
    if (!resumeText.trim() || !jobDesc.trim()) {
      setError("Please provide both resume and job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/ats-checker`, {
        resumeText,
        jobDescription: jobDesc,
      });

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "ATS analysis failed. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <div className="ats-page">
        <div className="ats-card">
          <h2>Enterprise Resume Optimization Engine</h2>

          <div className="ats-input-grid">
            {/* Resume */}
            <div className="ats-section">
              <h4>Resume</h4>

              <input
                type="file"
                accept="application/pdf"
                onChange={handlePDFUpload}
                className="pdf-upload"
              />

              <textarea
                placeholder="Or paste resume text..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>

            {/* Job Description */}
            <div className="ats-section">
              <h4>Job Description</h4>

              <textarea
                placeholder="Paste job description..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
            </div>
          </div>

          <button onClick={analyzeATS} disabled={loading}>
            {loading ? "Analyzing Resume..." : "Analyze Resume"}
          </button>

          {error && <p className="ats-error">{error}</p>}

          {/* RESULTS */}
          {result && (
            <div className="result-box">

              <h3>Overall ATS Score: {result.overallScore}%</h3>
              <p>Top {result.percentileRank}% Candidates</p>

              <div className="score-bar">
                <div
                  className="score-fill"
                  style={{ width: `${result.overallScore}%` }}
                />
              </div>

              <div className="analysis-section">

                <div className="analysis-block">
                  <h4>Category Breakdown</h4>
                  <ul>
                    <li>Skills Match: {result.categoryScores?.skillsMatch}%</li>
                    <li>Experience: {result.categoryScores?.experienceRelevance}%</li>
                    <li>Role Alignment: {result.categoryScores?.roleAlignment}%</li>
                    <li>Formatting: {result.categoryScores?.formattingScore}%</li>
                  </ul>
                </div>

                <div className="analysis-block">
                  <h4>Seniority</h4>
                  <p>{result.seniorityMatch}</p>
                </div>

                <div className="analysis-block">
                  <h4>Missing Skills</h4>
                  <ul>
                    {result.missingCriticalSkills?.length
                      ? result.missingCriticalSkills.map((s, i) => <li key={i}>{s}</li>)
                      : <li>None detected</li>}
                  </ul>
                </div>

                <div className="analysis-block">
                  <h4>Strength Areas</h4>
                  <ul>
                    {result.strengthAreas?.length
                      ? result.strengthAreas.map((s, i) => <li key={i}>{s}</li>)
                      : <li>Not enough keywords</li>}
                  </ul>
                </div>

                <div className="analysis-block">
                  <h4>Suggestions</h4>
                  <ul>
                    {result.improvementActions?.length
                      ? result.improvementActions.map((a, i) => <li key={i}>{a}</li>)
                      : <li>Resume looks strong</li>}
                  </ul>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}