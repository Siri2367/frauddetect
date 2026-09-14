import { useState } from "react";
import Navbar from "./Navbar";
import "../styles/jobsearch.css";

export default function JobSearch() {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const jobsPerPage = 4;

  const searchJobs = async () => {
    if (!role.trim() || !location.trim()) {
      setError("Please enter role and location");
      return;
    }

    setLoading(true);
    setJobs([]);
    setPage(1);
    setHasSearched(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/job-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          role,
          experience,
          location,
          type
        })
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      if (Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else {
        setJobs([]);
      }

    } catch (err) {
      console.error("Job search error:", err);
      setError("Failed to fetch jobs. Make sure backend is running.");
      setJobs([]);
    }

    setLoading(false);
  };

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const currentJobs = jobs.slice(
    (page - 1) * jobsPerPage,
    page * jobsPerPage
  );

  return (
    <>
      <Navbar />

      <div className="job-page">
        <div className="job-card">
          <h2>Real-Time Job Search</h2>

          {/* SEARCH GRID */}
          <div className="search-grid">
            <input
              placeholder="Job Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchJobs()}
            />

            <input
              placeholder="Experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            />

            <input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchJobs()}
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">Job Type</option>
              <option value="Remote">Remote</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Fresher">Fresher</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <button onClick={searchJobs} disabled={loading}>
            {loading ? "Searching..." : "Search Jobs"}
          </button>

          {/* ERROR */}
          {error && <p className="error">{error}</p>}

          {/* LOADING */}
          {loading && <div className="spinner"></div>}

          {/* RESULTS */}
          {currentJobs.length > 0 && (
            <div className="job-results">
              {currentJobs.map((job, index) => (
                <div
                  key={`${job.title}-${job.company}-${index}`}  // ✅ FIXED HERE
                  className="job-item"
                >
                  <div className="job-top">
                    <h3>{job.title}</h3>

                    {job.type && (
                      <span className={`badge ${job.type}`}>
                        {job.type}
                      </span>
                    )}
                  </div>

                  <p>
                    <strong>Company:</strong> {job.company || "Unknown"}
                  </p>

                  <p>
                    <strong>Location:</strong> {job.location || "Not specified"}
                  </p>

                  {/* Salary */}
                  {job.salary && (
                    <p>
                      <strong>Salary:</strong> {job.salary}
                    </p>
                  )}

                  <a
                    href={job.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {job.link ? "Apply Now" : "No Link Available"}
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* NO RESULTS */}
          {hasSearched && !loading && jobs.length === 0 && (
            <p style={{ marginTop: "30px", color: "#64748b" }}>
              No jobs found. Try different filters.
            </p>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={page === i + 1 ? "active" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}