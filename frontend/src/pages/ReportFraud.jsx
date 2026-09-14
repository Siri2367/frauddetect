import { useState } from "react";
import "../styles/reportfraud.css";

export default function ReportFraud() {
  const [form, setForm] = useState({
    jobLink: "",
    company: "",
    hrEmail: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newReport = {
      ...form,
      status: "Pending",
      date: new Date().toLocaleDateString()
    };

    const existingReports =
      JSON.parse(localStorage.getItem("fraudReports")) || [];

    const updatedReports = [...existingReports, newReport];

    localStorage.setItem("fraudReports", JSON.stringify(updatedReports));

    alert("Fraud report submitted successfully!");

    setForm({
      jobLink: "",
      company: "",
      hrEmail: "",
      description: "",
    });
  };

  return (
    <div className="report-container">
      <h2>Report Fraud Job</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="jobLink"
          placeholder="Job Link"
          value={form.jobLink}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="company"
          placeholder="Company Name"
          value={form.company}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="hrEmail"
          placeholder="HR Email"
          value={form.hrEmail}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Describe the issue..."
          value={form.description}
          onChange={handleChange}
          required
        />

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}