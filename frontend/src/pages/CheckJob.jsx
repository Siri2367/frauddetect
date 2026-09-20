import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";
import { detectFraud } from "../utils/fraudDetector";

export default function CheckJob() {
  const nav = useNavigate();

  const [job, setJob] = useState({
    email: "",
    salary: "",
    description: ""
  });

  function handleChange(e) {
    setJob({ ...job, [e.target.name]: e.target.value });
  }

  function handleSubmit() {
    const result = detectFraud(job);
    localStorage.setItem("result", JSON.stringify(result));
    nav("/result");
  }

  return (
    <>
      <Navbar />

      {/* CENTERING LAYOUT */}
      <div className="page">
        <div className="content">
          <div className="card">
            <h2>Check Job</h2>

            <input
              name="email"
              placeholder="Company Email"
              onChange={handleChange}
            />

            <input
              name="salary"
              type="number"
              placeholder="Salary Offered"
              onChange={handleChange}
            />

            <textarea
              name="description"
              placeholder="Job Description"
              onChange={handleChange}
            />

            <button onClick={handleSubmit}>Analyze Job</button>
          </div>
        </div>
      </div>
    </>
  );
}
