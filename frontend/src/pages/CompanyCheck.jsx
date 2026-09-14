import { useState } from "react";
import Navbar from "./Navbar";
import "../styles/companycheck.css";

export default function CompanyCheck() {
  const [company, setCompany] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */

  const checkCompany = async () => {
    if (!company.trim()) return;

    setLoading(true);
    setData(null);

    try {
      const res = await fetch("http://localhost:5000/company-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: company.trim() }),
      });

      const result = await res.json();
      console.log("API RESULT:", result);

      setData(result);
    } catch {
      setData({ error: "Unable to connect to server." });
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") checkCompany();
  };

  /* ================= SAFE TEXT ================= */

  const safeText = (value) => {
    if (!value) return "";

    if (typeof value === "string" || typeof value === "number") {
      return value;
    }

    if (typeof value === "object") {
      return (
        value.title ||
        value.subtitle ||
        value.ai_overview ||
        value.link ||
        ""
      );
    }

    return "";
  };

  /* ================= HELPERS ================= */

  const formatUrl = (url) => {
    if (!url || typeof url !== "string") return "";
    return url.startsWith("http") ? url : `https://${url}`;
  };

  const renderLink = (label, url) => {
    if (!url) return null;

    return (
      <p className="link-row">
        <strong>{label}:</strong>{" "}
        <a href={formatUrl(url)} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      </p>
    );
  };

  /* ================= SAFE LIST ================= */

  const renderList = (items) =>
    Array.isArray(items)
      ? items.map((item, i) => {
          if (!item) return null;

          let title = "";
          let link = "";

          if (typeof item === "string") {
            title = item;
            link = item;
          } else {
            title =
              item.title ||
              item.subtitle ||
              item.ai_overview ||
              "View Link";

            link = item.link || item.serpapi_link;
          }

          if (!link) return null;

          return (
            <li key={i}>
              <a href={formatUrl(link)} target="_blank" rel="noopener noreferrer">
                {safeText(title)}
              </a>
            </li>
          );
        })
      : null;

  /* ================= LOGO ================= */

  const getLogo = () => {
    if (!data) return "";

    if (data.logo) return data.logo;

    if (data.website) {
      return `https://www.google.com/s2/favicons?domain=${data.website}&sz=128`;
    }

    return "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
  };

  /* ================= UI HELPERS ================= */

  const getRiskColor = () => {
    if (!data?.confidence) return "#ccc";
    if (data.confidence > 80) return "#28a745";
    if (data.confidence > 50) return "#ffc107";
    return "#dc3545";
  };

  const fraudProbability = data?.confidence
    ? 100 - data.confidence
    : 0;

  /* ================= UI ================= */

  return (
    <>
      <Navbar />

      <div className="company-page">
        <div className="company-card">
          <h2>AI Company Legitimacy Verification</h2>

          <input
            type="text"
            placeholder="Enter company name (e.g. TCS)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            onKeyDown={handleKeyPress}
          />

          <button onClick={checkCompany} disabled={loading}>
            {loading ? "Analyzing..." : "Verify Company"}
          </button>

          {data && (
            <div className="result-box">
              {data.error ? (
                <p className="error-text">{safeText(data.error)}</p>
              ) : (
                <>
                  {/* HEADER */}
                  <div className="company-header">
                    <img
                      src={getLogo()}
                      alt="Company Logo"
                      className="company-logo"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
                      }}
                    />
                    <h3>{safeText(data.company) || company}</h3>
                  </div>

                  {/* TRUST */}
                  <div className="meter-container">
                    <div
                      className="meter-fill"
                      style={{
                        width: `${data.confidence || 0}%`,
                        backgroundColor: getRiskColor(),
                      }}
                    />
                  </div>

                  <p>
                    <strong>Trust Score:</strong>{" "}
                    {safeText(data.confidence)}%
                  </p>

                  <p>
                    <strong>Fraud Probability:</strong>{" "}
                    {fraudProbability}%
                  </p>

                  <p>
                    <strong>Risk Level:</strong>{" "}
                    {safeText(data.risk) || "Unknown"}
                  </p>

                  {/* LINKS */}
                  {renderLink("Website", data.website)}
                  {renderLink("LinkedIn", data.linkedin)}
                  {renderLink("Twitter", data.twitter)}
                  {renderLink("Facebook", data.facebook)}
                  {renderLink("Instagram", data.instagram)}

                  <p>
                    <strong>Location:</strong>{" "}
                    {safeText(data.location) || "Not Available"}
                  </p>

                  {/* ARTICLES */}
                  {data.articles?.length > 0 && (
                    <>
                      <h4>Recent Mentions</h4>
                      <ul>{renderList(data.articles)}</ul>
                    </>
                  )}

                  {/* SEARCH RESULTS */}
                  {data.searchResults?.length > 0 && (
                    <>
                      <h4>Top Search Results</h4>
                      <ul>{renderList(data.searchResults)}</ul>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}