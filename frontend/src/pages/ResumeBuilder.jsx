import { useParams } from "react-router-dom";
import { useState } from "react";
import html2pdf from "html2pdf.js";
import "../styles/resumebuilder.css";

export default function ResumeBuilder() {
  const { templateId } = useParams();

  const validTemplates = [
    "modernAccentSidebar",
    "sideBlue",
    "boldRedClassic"
  ];

  /* ================= SAFE TEMPLATE HANDLING ================= */

  const getInitialTemplate = () => {
    if (validTemplates.includes(templateId)) {
      localStorage.setItem("activeTemplate", templateId);
      return templateId;
    }

    const saved = localStorage.getItem("activeTemplate");
    return validTemplates.includes(saved)
      ? saved
      : "modernAccentSidebar";
  };

  const [activeTemplate] = useState(getInitialTemplate);
  const [photo, setPhoto] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    education: "",
    experience: "",
    projects: "",
    hobbies: ""
  });

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const downloadPDF = () => {
    const element = document.getElementById("resume-preview");

    html2pdf()
      .from(element)
      .set({
        margin: 0,
        filename: `${form.name || "Resume"}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "px", format: [794, 1123] }
      })
      .save();
  };

  const renderLines = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => (
      <p key={index}>{line}</p>
    ));
  };

  /* ================= TEMPLATE RENDER ================= */

  const renderTemplate = () => {
    switch (activeTemplate) {

      /* ===== TEMPLATE 1 ===== */
      case "modernAccentSidebar":
        return (
          <div className="t1-container">
            <div className="t1-sidebar">
              {photo && <img src={photo} className="t1-photo" alt="" />}
              <h2>{form.name || "YOUR NAME"}</h2>
              <p>{form.address}</p>
              <p>{form.email}</p>
              <p>{form.phone}</p>
            </div>

            <div className="t1-content">
              <h3>SUMMARY</h3>
              {renderLines(form.summary)}

              <h3>EDUCATION</h3>
              {renderLines(form.education)}

              <h3>EXPERIENCE</h3>
              {renderLines(form.experience)}

              <h3>PROJECTS</h3>
              {renderLines(form.projects)}

              <h3>HOBBIES</h3>
              {renderLines(form.hobbies)}
            </div>
          </div>
        );

      /* ===== TEMPLATE 2 (UPDATED AS REQUESTED) ===== */
      case "sideBlue":
        return (
          <div className="t2-container">

            {/* LEFT SIDE */}
            <div className="t2-left">
              <h1>{form.name || "YOUR NAME"}</h1>
              {photo && <img src={photo} className="t2-photo" alt="" />}
              {renderLines(form.summary)}
            </div>

            {/* RIGHT SIDE */}
            <div className="t2-right">

              <h3>CONTACT</h3>
              <p>{form.address}</p>
              <p>{form.email}</p>
              <p>{form.phone}</p>

              <h3>EDUCATION</h3>
              {renderLines(form.education)}

              <h3>PROJECTS</h3>
              {renderLines(form.projects)}

              <h3>EXPERIENCE</h3>
              {renderLines(form.experience)}

              <h3>HOBBIES</h3>
              {renderLines(form.hobbies)}

            </div>

          </div>
        );

      /* ===== TEMPLATE 3 ===== */
      case "boldRedClassic":
        return (
          <div className="t3-container">
            <div className="t3-left">
              <div className="t3-initials">
                {form.name
                  ? form.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "DA"}
              </div>

              <div className="t3-contact">
                <p>{form.address}</p>
                <p>{form.phone}</p>
                <p>{form.email}</p>
              </div>
            </div>

            <div className="t3-right">
              <div className="t3-header">
                {form.name || "YOUR NAME"}
              </div>

              <div className="t3-body">
                <h3>SUMMARY</h3>
                {renderLines(form.summary)}

                <h3>EDUCATION</h3>
                {renderLines(form.education)}

                <h3>EXPERIENCE</h3>
                {renderLines(form.experience)}

                <h3>PROJECTS</h3>
                {renderLines(form.projects)}

                <h3>HOBBIES</h3>
                {renderLines(form.hobbies)}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="builder-page">

      <div className="builder-form">
        <h3>Build Resume</h3>

        <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" />

        <textarea name="summary" value={form.summary} onChange={handleChange} placeholder="Professional Summary" />

        <textarea name="education" value={form.education} onChange={handleChange} placeholder="Education (Enter for new line)" />

        <textarea name="experience" value={form.experience} onChange={handleChange} placeholder="Experience (Enter for new line)" />

        <textarea name="projects" value={form.projects} onChange={handleChange} placeholder="Projects (Enter for new line)" />

        <textarea name="hobbies" value={form.hobbies} onChange={handleChange} placeholder="Hobbies (Enter for new line)" />

        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" />

        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />

        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />

        <input type="file" onChange={handlePhoto} />

        <button onClick={downloadPDF}>Download PDF</button>
      </div>

      <div className="builder-preview">
        <div id="resume-preview" className="resume-container">
          {renderTemplate()}
        </div>
      </div>

    </div>
  );
}