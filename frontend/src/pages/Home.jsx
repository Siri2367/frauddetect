import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../utils/AuthContext";
import "../styles/home.css";

export default function Home() {
  const nav = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  const [showCookies, setShowCookies] = useState(
    !localStorage.getItem("cookieChoice")
  );

  /* 🔥 SAFE AUTO REDIRECT IF USER EXISTS */
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser && storedUser !== "undefined") {
        const user = JSON.parse(storedUser);

        if (user) {
          nav("/dashboard", { replace: true });
        }
      }
    } catch (error) {
      console.log("Invalid user in localStorage. Clearing...");
      localStorage.removeItem("user");
    }
  }, [nav]);

  const handleAccept = () => {
    localStorage.setItem("cookieChoice", "accepted");
    setShowCookies(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieChoice", "declined");
    setShowCookies(false);
  };

  const scrollToFeatures = () => {
    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* HEADER */}
      <header className="landing-header">
        <div className="logo">FraudDetect</div>
        <div className="auth-buttons">
          <button onClick={() => nav("/login")}>Login</button>
          <button onClick={() => nav("/signup")}>Signup</button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <h1>AI-Powered Recruitment Fraud Detection</h1>
        <p>
          Protect yourself from fake job offers, phishing emails,
          and LinkedIn scams using intelligent AI-powered analysis.
        </p>

        <div className="hero-buttons">
          <button onClick={() => nav("/signup")}>
            Get Started
          </button>
          <button className="secondary-btn" onClick={scrollToFeatures}>
            Learn More
          </button>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="why-section">
        <h2>Why Choose FraudShield?</h2>

        <div className="why-grid">
          <div className="why-card">
            <h3>AI-Based Risk Scoring</h3>
            <p>
              Advanced NLP-based algorithms detect fraud indicators
              with real-time risk classification.
            </p>
          </div>

          <div className="why-card">
            <h3>Multi-Platform Protection</h3>
            <p>
              Analyze LinkedIn posts, Gmail messages,
              and direct job listings in one unified platform.
            </p>
          </div>

          <div className="why-card">
            <h3>Instant Detection</h3>
            <p>
              Get immediate feedback and fraud likelihood
              scoring within seconds.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <h2>Our Features</h2>

        <div className="features-grid">
          <div className="feature-box">
            <h3>Job Post Analyzer</h3>
            <p>Detect fraudulent job postings instantly.</p>
          </div>

          <div className="feature-box">
            <h3>LinkedIn Analyzer</h3>
            <p>Verify LinkedIn job posts using AI scoring.</p>
          </div>

          <div className="feature-box">
            <h3>Email Scam Detection</h3>
            <p>Analyze suspicious recruitment emails.</p>
          </div>

          <div className="feature-box">
            <h3>AI Chatbot Assistance</h3>
            <p>Interactive AI assistant for fraud awareness guidance.</p>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>95%</h3>
            <p>Fraud Detection Accuracy</p>
          </div>
          <div className="stat-card">
            <h3>10K+</h3>
            <p>Posts Analyzed</p>
          </div>
          <div className="stat-card">
            <h3>24/7</h3>
            <p>Real-Time Monitoring</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <h3>Contact Us</h3>
        <p>Email: frauddetct@gmail.com</p>
        <p>Phone: +91 8317681282</p>
        <p>© 2026 FraudDetect. All rights reserved.</p>
      </footer>

      {/* COOKIE CONSENT */}
      {showCookies && (
        <div className="cookie-banner">
          <p>This website uses cookies to enhance user experience.</p>
          <div className="cookie-buttons">
            <button className="accept-btn" onClick={handleAccept}>
              Accept
            </button>
            <button className="decline-btn" onClick={handleDecline}>
              Decline
            </button>
          </div>
        </div>
      )}
    </>
  );
}