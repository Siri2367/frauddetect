import Navbar from "../pages/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";

export default function Dashboard() {
  const nav = useNavigate();
  const canvasRef = useRef(null);

  const [activeBranch, setActiveBranch] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  /* ================= CURSOR LIGHT TRACKING ================= */
  useEffect(() => {
    const move = (e) => {
      document.documentElement.style.setProperty("--x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* ================= PARTICLES ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5,
      speedX: Math.random() * 0.2 - 0.1,
      speedY: Math.random() * 0.2 - 0.1,
    }));

    let animationId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        ctx.fillStyle = "rgba(99,102,241,0.25)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  /* ================= DATA ================= */

  const sections = [
    {
      title: "Fraud Detection",
      items: [
        { name: "Check Job", path: "/check" },
        { name: "Company Verification", path: "/company-check" },
        { name: "LinkedIn Analyzer", path: "/linkedin-check" },
        { name: "Gmail Analyzer", path: "/gmail-check" },
        { name: "Offer Letter Analyzer", path: "/offer-analyzer" },
      ],
    },
    {
      title: "Career Tools",
      items: [
        { name: "ATS Resume Checker", path: "/ats-checker" },
        { name: "Resume Builder", path: "/resume-templates" },
        { name: "Resume History", path: "/resume-history" },
        { name: "Live Job Search", path: "/job-search" },
        { name: "Interview Reminder", path: "/interview-reminder" },
      ],
    },
    {
      title: "Community",
      items: [
        { name: "Report Fraud", path: "/report" },
        { name: "Scam Alerts", path: "/alerts" },
        { name: "Blacklisted", path: "/blacklisted" },
        { name: "Profile", path: "/profile" },
        { name: "Admin Panel", path: "/admin" },
      ],
    },
  ];

  /* ================= KEYBOARD NAV ================= */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") {
        setActiveBranch((prev) =>
          prev === null ? 0 : (prev + 1) % sections.length
        );
      }

      if (e.key === "ArrowLeft") {
        setActiveBranch((prev) =>
          prev === null
            ? sections.length - 1
            : (prev - 1 + sections.length) % sections.length
        );
      }

      if (e.key === "Enter" && activeBranch !== null) {
        const firstItem = sections[activeBranch].items[0];
        if (firstItem) nav(firstItem.path);
      }

      if (e.key === "Escape") {
        setActiveBranch(null);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeBranch, sections, nav]);

  return (
    <>
      <Navbar />

      <div className="dashboard-page">
        <canvas ref={canvasRef} className="network-bg"></canvas>

        <div className="dashboard-container">

          {/* ROOT */}
          <motion.div
            className="tree-root"
            data-active={activeBranch !== null}
          >
            FraudDetect
          </motion.div>

          {/* TREE */}
          <div className="tree-branches">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`tree-branch 
                  ${activeBranch !== null && activeBranch !== index ? "dim" : ""}
                  ${activeBranch === index ? "active" : ""}`}
                onClick={() =>
                  setActiveBranch((prev) =>
                    prev === index ? null : index
                  )
                }
              >
                <div className="branch-title">{section.title}</div>

                <div className="branch-items">
                  {section.items.map((item, i) => (
                    <motion.div
                      key={i}
                      className="branch-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        nav(item.path);
                      }}
                    >
                      {item.name}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}