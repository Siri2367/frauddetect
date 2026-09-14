import { useNavigate } from "react-router-dom";
import Navbar from "../pages/Navbar";

export default function Awareness() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      {/* CENTERED BODY */}
      <div className="page">
        <div className="content">
          <div className="card">
            <h2>Fraud Awareness</h2>

            <ul>
              <li>Never pay registration or interview fees</li>
              <li>Verify company website and contact details</li>
              <li>Avoid jobs offering unrealistic salaries</li>
              <li>Check email domain carefully</li>
              <li>Do not share OTP or personal documents</li>
            </ul>

            {/* HOME BUTTON */}
            <button
              style={{ marginTop: "20px" }}
              onClick={() => navigate("/dashboard")}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
