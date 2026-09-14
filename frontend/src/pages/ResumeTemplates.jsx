import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "../styles/resumetemplates.css";

export default function ResumeTemplates() {
  const navigate = useNavigate();

  const templates = [
    {
      id: "modernAccentSidebar",
      image: "/templates/template1.png",
      type: "Modern Accent Sidebar"
    },
    {
      id: "sideBlue",
      image: "/templates/template2.png",
      type: "Professional Side Blue"
    },
    {
      id: "boldRedClassic",
      image: "/templates/template3.png",
      type: "Bold Red Classic"
    }
  ];

  const selectTemplate = (id) => {
    navigate(`/resume-builder/${id}`);
  };

  return (
    <>
      <Navbar />

      <div className="template-page">
        <div className="template-header">
          <h2>Choose Your Resume Template</h2>
        </div>

        <div className="template-grid">
          {templates.map((t) => (
            <div key={t.id} className="template-card">
              <div className="template-badge">{t.type}</div>
              <img src={t.image} alt={t.type} />
              <div className="template-overlay">
                <button onClick={() => selectTemplate(t.id)}>
                  Use This Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}