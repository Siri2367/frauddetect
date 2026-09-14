import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import twilio from "twilio";
import axios from "axios";
import mysql from "mysql2/promise";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";


dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

/* ================= MYSQL CONNECTION ================= */
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
console.log("✅ MySQL Connected");

/* ================= OTP STORE ================= */
const otpStore = {};

/* ================= GEMINI CONFIG ================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ================= EMAIL CONFIG ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls:{
    rejectUnauthorized: false
  }
});

transporter.verify((error) => {
  if (error) console.log("❌ Email server error:", error.message);
  else console.log("✅ Email server ready");
});

/* ================= TWILIO CONFIG ================= */
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

/* ================= PASSWORD REGEX ================= */
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;


/* ===================================================== */
/* 🔐 ADMIN MIDDLEWARE (ADDED ONLY) */
/* ===================================================== */
const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.headers["x-user-email"];

    if (!email) {
      return res.status(401).json({ message: "Unauthorized - No email header" });
    }

    const [rows] = await db.execute(
      "SELECT role FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "User not found" });
    }

    if (rows[0].role !== "admin") {
      return res.status(403).json({ message: "Access denied - Admin only" });
    }

    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ===================================================== */
/* 🔹 SEND EMAIL OTP */
/* ===================================================== */
app.post("/send-email-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false });

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    otpStore[email] = {
      otpHash,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await transporter.sendMail({
      from: `"FraudDetect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification",
      html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes</p>`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


/* ===================================================== */
/* 🔹 VERIFY OTP */
/* ===================================================== */
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const record = otpStore[email];
  if (!record) return res.json({ verified: false });

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.json({ verified: false });
  }

  const valid = await bcrypt.compare(otp, record.otpHash);
  if (!valid) return res.json({ verified: false });

  delete otpStore[email];
  res.json({ verified: true });
});


/* ===================================================== */
/* 🔹 SIGNUP */
/* ===================================================== */
app.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!passwordRegex.test(password)) {
    return res.json({
      success: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
    });
  }

  try {
    const [existing] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, hashedPassword, "user"]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


/* ===================================================== */
/* 🔹 LOGIN */
/* ===================================================== */
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.json({ success: false, message: "Invalid credentials" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


/* ===================================================== */
/* 🔐 FORGOT PASSWORD */
/* ===================================================== */
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.json({ message: "If email exists, reset link sent." });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 3600000;

    await db.execute(
      "UPDATE users SET resetToken=?, resetTokenExpiry=? WHERE email=?",
      [token, expiry, email]
    );

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      from: `"FraudDetect" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset",
      html: `
        <h3>Password Reset Request</h3>
        <p>This link expires in 1 hour.</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ message: "If email exists, reset link sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ===================================================== */
/* 🔐 RESET PASSWORD */
/* ===================================================== */
app.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;

  if (!passwordRegex.test(password)) {
    return res.json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
    });
  }

  try {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE resetToken=? AND resetTokenExpiry > ?",
      [token, Date.now()]
    );

    if (rows.length === 0)
      return res.json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute(
      "UPDATE users SET password=?, resetToken=NULL, resetTokenExpiry=NULL WHERE resetToken=?",
      [hashedPassword, token]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================================================== */
/* 🔥 JOB SEARCH API */
/* ===================================================== */
/* ===================================================== */
/* 🔥 REAL-TIME JOB SEARCH (SERP API) */
/* ===================================================== */
app.post("/job-search", async (req, res) => {
  const { role, experience, location, type } = req.body;

  if (!role || !location) {
    return res.status(400).json({ error: "Role and location required" });
  }

  try {
    const query = `${role} ${type || ""} jobs in ${location}`;

    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_jobs",
        q: query,
        api_key: process.env.SERP_API_KEY,
      },
    });

    const jobsData = response.data.jobs_results || [];

    const jobs = jobsData.map((job) => ({
      title: job.title || "No title",
      company: job.company_name || "Unknown",
      location: job.location || "Not specified",
      type: job.detected_extensions?.schedule_type || type || "Full-Time",
      link: job.related_links?.[0]?.link || "#",
    }));

    res.json({ jobs });

  } catch (err) {
    console.error("🔥 Job API error:", err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch real-time jobs" });
  }
});
/* ===================================================== */
/* 🔹 ATS CHECKER */
/* ===================================================== */
app.post("/ats-checker", async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const resume = resumeText.toLowerCase();
    const job = jobDescription.toLowerCase();

    /* ================= KEYWORD EXTRACTION ================= */
    const words = job
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 3);

    const uniqueKeywords = [...new Set(words)];

    /* ================= MATCHING ================= */
    let matched = [];
    let missing = [];

    uniqueKeywords.forEach(word => {
      if (resume.includes(word)) {
        matched.push(word);
      } else {
        missing.push(word);
      }
    });

    const matchPercent = Math.round(
      (matched.length / uniqueKeywords.length) * 100 || 0
    );

    /* ================= CATEGORY SCORES ================= */
    const skillsMatch = matchPercent;

    const experienceRelevance =
      resume.includes("experience") ? 70 : 40;

    const roleAlignment =
      resume.includes("developer") ||
      resume.includes("engineer")
        ? 75
        : 50;

    const formattingScore =
      resume.length > 1000 ? 80 : 60;

    const overallScore = Math.round(
      (skillsMatch + experienceRelevance + roleAlignment + formattingScore) / 4
    );

    /* ================= RESPONSE ================= */
    res.json({
      overallScore,
      percentileRank: Math.min(95, overallScore + 10),

      categoryScores: {
        skillsMatch,
        experienceRelevance,
        roleAlignment,
        formattingScore,
      },

      seniorityMatch:
        overallScore > 75
          ? "Senior Level"
          : overallScore > 50
          ? "Mid Level"
          : "Entry Level",

      missingCriticalSkills: missing.slice(0, 10),

      strengthAreas: matched.slice(0, 10),

      improvementActions: [
        "Add missing keywords from job description",
        "Improve experience section",
        "Use action verbs (developed, built, designed)",
        "Optimize formatting for ATS systems",
      ],
    });

  } catch (err) {
    console.error("ATS ERROR:", err);
    res.status(500).json({ error: "ATS processing failed" });
  }
});

/* ===================================================== */
/* 🔥 COMPANY CHECK */
/* ===================================================== */
app.post("/company-check", async (req, res) => {
  const { company } = req.body;

  if (!company || !company.trim()) {
    return res.status(400).json({ error: "Company required" });
  }

  const input = company.toLowerCase().trim();

  /* ❌ BLOCK UNIVERSITIES */
  const universityKeywords = [
    "university","college","institute",
    "school","academy","iit","nit","jntu"
  ];

  if (universityKeywords.some(word => input.includes(word))) {
    return res.json({
      company,
      risk: "Invalid Input",
      confidence: 0,
      error: "Enter a company, not an educational institution"
    });
  }

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google",
        q: company,
        api_key: process.env.SERP_API_KEY,
      },
    });

    const data = response.data || {};
    const knowledge = data.knowledge_graph || {};
    const organic = Array.isArray(data.organic_results) ? data.organic_results : [];

    /* ================= SAFE HELPERS ================= */

    const formatUrl = (url) => {
      if (!url || typeof url !== "string") return "";
      return url.startsWith("http") ? url : `https://${url}`;
    };

    const cleanText = (val) => {
      if (!val) return "";
      if (typeof val === "string") return val;
      if (typeof val === "object") {
        return val.title || val.subtitle || val.ai_overview || val.link || "";
      }
      return "";
    };

    const normalize = (str) =>
      str?.toLowerCase().replace(/[^a-z0-9]/g, "");

    /* ================= STRICT MATCH ================= */

    const detectedName = normalize(knowledge.title);
    const inputName = normalize(company);

    if (detectedName && inputName && !detectedName.includes(inputName)) {
      return res.json({
        company,
        risk: "High Risk",
        confidence: 25,
        error: "No exact match → likely fake company"
      });
    }

    /* ================= WEBSITE ================= */

    let website =
      knowledge.website ||
      knowledge.source ||
      organic.find(r => r?.link)?.link ||
      "";

    website = formatUrl(website);

    const domain = website
      ? new URL(website).hostname.replace("www.", "")
      : "";

    const logo = domain
      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
      : "";

    /* ================= LOCATION ================= */

    let location =
      knowledge.headquarters ||
      knowledge.address ||
      knowledge.location ||
      "";

    if (!location && knowledge.description) {
      const match = knowledge.description.match(
        /(India|USA|UK|Hyderabad|Bangalore|Delhi|Mumbai|Chennai|Pune)/i
      );
      if (match) location = match[0];
    }

    if (!location) {
      for (let r of organic) {
        const snippet = cleanText(r?.snippet);
        const match = snippet.match(
          /(India|USA|UK|Hyderabad|Bangalore|Delhi|Mumbai|Chennai|Pune)/i
        );
        if (match) {
          location = match[0];
          break;
        }
      }
    }

    if (!location) location = "Not Available";

    /* ================= FAKE COMPANY ================= */

    if (!knowledge.title && !website) {
      return res.json({
        company,
        risk: "High Risk",
        confidence: 20,
        error: "No reliable data found"
      });
    }

    /* ================= SOCIAL LINKS ================= */

    let linkedin = "", twitter = "", facebook = "", instagram = "";

    const scanLink = (link) => {
      const url = formatUrl(link);
      if (!url) return;

      const lower = url.toLowerCase();

      if (!linkedin && lower.includes("linkedin.com/company")) linkedin = url;
      if (!twitter && (lower.includes("twitter.com") || lower.includes("x.com"))) twitter = url;
      if (!facebook && lower.includes("facebook.com")) facebook = url;
      if (!instagram && lower.includes("instagram.com")) instagram = url;
    };

    knowledge.profiles?.forEach(p => scanLink(p?.link));
    organic.forEach(r => scanLink(r?.link));

    /* ================= CLEAN LISTS ================= */

    const articles = (data.news_results || [])
      .slice(0, 5)
      .map(n => ({
        title: cleanText(n?.title),
        link: formatUrl(n?.link)
      }))
      .filter(a => a.link);

    const searchResults = organic
      .slice(0, 5)
      .map(r => ({
        title: cleanText(r?.title || r?.snippet),
        link: formatUrl(r?.link || r?.serpapi_link)
      }))
      .filter(r => r.link);

    /* ================= FRAUD ENGINE ================= */

    let score = 0;

    if (!website) score += 30;
    if (!linkedin) score += 10;
    if (location === "Not Available") score += 10;

    const scamWords = ["scam","fraud","fake","complaint"];
    const scamDetected = searchResults.some(r =>
      scamWords.some(w => r.title.toLowerCase().includes(w))
    );

    if (scamDetected) score += 30;

    let risk = "Low Risk";
    if (score >= 70) risk = "High Risk";
    else if (score >= 40) risk = "Medium Risk";

    const confidence = Math.max(20, 100 - score);

    /* ================= FINAL RESPONSE ================= */

    const result = {
      company,
      risk,
      confidence,
      website,
      logo,
      location,
      articles,
      searchResults
    };

    if (linkedin) result.linkedin = linkedin;
    if (twitter) result.twitter = twitter;
    if (facebook) result.facebook = facebook;
    if (instagram) result.instagram = instagram;

    res.json(result);

  } catch (err) {
    console.error("🔥 ERROR:", err?.response?.data || err.message);
    res.status(500).json({
      error: "Company lookup failed",
      details: err?.response?.data || err.message
    });
  }
});
/* ===================================================== */
/* 🔐 ADMIN SECURE ROUTE (ADDED ONLY) */
/* ===================================================== */
app.get("/admin-secure-data", verifyAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, name, email, role FROM users"
    );

    res.json({
      message: "Admin access granted",
      totalUsers: users.length,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===================================================== */
/* 🔥 LINKEDIN ANALYZER + ENTERPRISE COMPANY INTEL v4   */
/* ===================================================== */
app.post("/linkedin-analyze", async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length < 5) {
    return res.status(400).json({
      error: "Valid LinkedIn content required",
    });
  }

  try {
    const lower = content.toLowerCase();

    /* ===================================================== */
    /* 1️⃣ FRAUD RULE ENGINE                                 */
    /* ===================================================== */

    let riskScore = 0;
    let legitimacyScore = 0;

    const riskSignals = [];
    const legitimacySignals = [];

    const scamKeywords = [
      "registration fee",
      "processing fee",
      "earn daily",
      "guaranteed job",
      "instant joining",
      "limited slots",
      "dm me",
      "whatsapp",
      "telegram",
      "pay now",
      "hurry up"
    ];

    scamKeywords.forEach(word => {
      if (lower.includes(word)) {
        riskScore += 20;
        riskSignals.push(`Scam keyword detected: "${word}"`);
      }
    });

    const phonePattern = /(\+91|91)?[6-9]\d{9}/g;
    if (phonePattern.test(lower)) {
      riskScore += 20;
      riskSignals.push("Direct phone number detected");
    }

    const paymentPattern = /@upi|gpay|phonepe|paytm|\₹\d+|\$\d+/gi;
    if (paymentPattern.test(lower)) {
      riskScore += 30;
      riskSignals.push("Payment reference detected");
    }

    /* ===================================================== */
    /* 2️⃣ LEGITIMACY CHECK                                  */
    /* ===================================================== */

    if (lower.includes(".com") || lower.includes("www.")) {
      legitimacyScore += 20;
      legitimacySignals.push("Official website mentioned");
    } else {
      riskScore += 10;
      riskSignals.push("No official website mentioned");
    }

    if (
      lower.includes("address") ||
      lower.includes("head office") ||
      lower.includes("headquarters") ||
      lower.includes("located at")
    ) {
      legitimacyScore += 20;
      legitimacySignals.push("Physical office address mentioned");
    } else {
      riskScore += 15;
      riskSignals.push("No physical office address mentioned");
    }

    const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    if (emailPattern.test(content)) {
      legitimacyScore += 15;
      legitimacySignals.push("Professional email detected");
    } else {
      riskScore += 10;
      riskSignals.push("No official email contact provided");
    }

    /* ===================================================== */
    /* 3️⃣ SMART COMPANY EXTRACTION (UPDATED)                */
    /* ===================================================== */

    let companyName = null;

    // 1️⃣ linkedin.com/company/slug
    const companyMatch =
      content.match(/linkedin\.com\/company\/([A-Za-z0-9-]+)/);

    if (companyMatch) {
      companyName = companyMatch[1];
    }

    // 2️⃣ linkedin.com/posts/slug_
    if (!companyName) {
      const postMatch =
        content.match(/linkedin\.com\/posts\/([A-Za-z0-9-]+)_/);

      if (postMatch) {
        companyName = postMatch[1];
      }
    }

    // 3️⃣ linkedin.com/in/slug (individual but might represent company)
    if (!companyName) {
      const profileMatch =
        content.match(/linkedin\.com\/in\/([A-Za-z0-9-]+)/);

      if (profileMatch) {
        companyName = profileMatch[1];
      }
    }

    // 4️⃣ Text-based patterns
    if (!companyName) {
      const patterns = [
        /\bat\s([A-Z][A-Za-z0-9&.\s]{2,})/,
        /\b([A-Z][A-Za-z0-9&.\s]{2,})\s(is hiring|hiring)/,
        /\bjoin\s([A-Z][A-Za-z0-9&.\s]{2,})/i
      ];

      for (let pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          companyName = match[1].trim();
          break;
        }
      }
    }

    // Clean formatting
    if (companyName) {
      companyName = companyName
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
    }

    /* ===================================================== */
    /* 4️⃣ COMPANY INTELLIGENCE LOOKUP                       */
    /* ===================================================== */

    let companyReport = null;

    if (companyName) {
      try {
        const response = await axios.post(
          "http://localhost:5000/company-check",
          { company: companyName }
        );

        companyReport = response.data;

        if (companyReport.risk === "High Risk") {
          riskScore += 30;
          riskSignals.push("Company externally flagged as High Risk");
        }

        if (companyReport.risk === "Low Risk") {
          legitimacyScore += 20;
          legitimacySignals.push("Company externally verified as Low Risk");
        }

      } catch (err) {
        console.log("Company verification failed");
      }
    }

    /* ===================================================== */
    /* 5️⃣ FINAL ENTERPRISE SCORING                          */
    /* ===================================================== */

    let rawScore = (riskScore * 0.75) - (legitimacyScore * 0.25);
    let finalScore = Math.round(Math.max(0, Math.min(rawScore, 100)));

    let riskLevel = "Low Risk";
    if (finalScore >= 75) riskLevel = "High Risk";
    else if (finalScore >= 40) riskLevel = "Medium Risk";

    const confidence = Math.min(95, 50 + riskSignals.length * 5);

    /* ===================================================== */
    /* 6️⃣ RESPONSE                                          */
    /* ===================================================== */

    res.json({
      riskLevel,
      fraudProbability: finalScore,
      confidenceScore: confidence,

      intelligence: {
        companyName: companyName || "Not detected",
        website: companyReport?.website || "Not available",
        location: companyReport?.location || "Not available",
        externalRisk: companyReport?.risk || "Unknown",
        externalConfidence: companyReport?.confidence || 0
      },

      fraudBreakdown: {
        riskScoreRaw: riskScore,
        legitimacyScoreRaw: legitimacyScore,
        riskSignals,
        legitimacySignals
      },

      summary:
        finalScore >= 75
          ? "High probability recruitment scam. Avoid engagement."
          : finalScore >= 40
          ? "Moderate suspicious indicators detected. Verify carefully."
          : "Low immediate fraud indicators detected. Still verify authenticity.",

      recommendation:
        finalScore >= 75
          ? "Do NOT share personal documents or pay any money."
          : finalScore >= 40
          ? "Verify company through official website and LinkedIn page."
          : "Cross-check company domain and HR email before proceeding.",

      engine: "Enterprise Fraud + Company Intelligence Engine v4"
    });

  } catch (error) {
    console.error("LinkedIn Analyzer Error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
});

/* ===================================================== */
/* 🛡 GMAIL ENTERPRISE FRAUD ANALYZER v2                */
/* ===================================================== */
app.post("/gmail-analyze", async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim().length < 5) {
    return res.status(400).json({ error: "Valid email content required" });
  }

  try {
    const lower = content.toLowerCase();

    let riskScore = 0;
    let legitimacyScore = 0;

    const riskSignals = [];
    const legitimacySignals = [];

    /* ================= PHISHING KEYWORDS ================= */

    const phishingKeywords = [
      "urgent",
      "verify immediately",
      "account suspended",
      "click here",
      "reset password",
      "payment required",
      "lottery",
      "limited time"
    ];

    phishingKeywords.forEach(word => {
      if (lower.includes(word)) {
        riskScore += 15;
        riskSignals.push(`Phishing phrase detected: "${word}"`);
      }
    });

    /* ================= LINKS ================= */

    const linkPattern = /(http|https):\/\/[^\s]+/g;
    const links = content.match(linkPattern);

    if (links) {
      riskScore += 15;
      riskSignals.push("External link detected");
    }

    /* ================= SENDER DOMAIN ================= */

    const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
    const senderMatch = content.match(emailPattern);

    if (senderMatch) {
      const sender = senderMatch[0].toLowerCase();

      if (
        sender.includes("@gmail.com") ||
        sender.includes("@yahoo.com") ||
        sender.includes("@outlook.com")
      ) {
        riskScore += 20;
        riskSignals.push("Free email domain detected");
      } else {
        legitimacyScore += 20;
        legitimacySignals.push("Corporate email domain detected");
      }
    }

    /* ================= FINAL SCORING ================= */

    let rawScore = (riskScore * 0.75) - (legitimacyScore * 0.25);
    let finalScore = Math.round(Math.max(0, Math.min(rawScore, 100)));

    let riskLevel = "Low Risk";
    if (finalScore >= 75) riskLevel = "High Risk";
    else if (finalScore >= 40) riskLevel = "Medium Risk";

    const confidenceScore = Math.min(95, 50 + riskSignals.length * 5);

    res.json({
      riskLevel,
      fraudProbability: finalScore,
      confidenceScore,

      fraudBreakdown: {
        riskSignals,
        legitimacySignals
      },

      summary:
        finalScore >= 75
          ? "Strong phishing indicators detected."
          : finalScore >= 40
          ? "Moderate suspicious patterns detected."
          : "Low immediate phishing risk detected.",

      recommendation:
        finalScore >= 75
          ? "Do NOT click links or share personal information."
          : finalScore >= 40
          ? "Verify sender identity before acting."
          : "Cross-check domain authenticity.",

      engine: "Enterprise Gmail Fraud Engine v2"
    });

  } catch (error) {
    console.error("Gmail Analyzer Error:", error);
    res.status(500).json({ error: "Gmail analysis failed" });
  }
});


/* ===================================================== */
/* 📅 ADD INTERVIEW + SEND CONFIRMATION MAIL */
/* ===================================================== */
app.post("/add-interview", async (req, res) => {
  try {
    const { company, role, date, email } = req.body;

    if (!company || !date || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Send Confirmation Email
    await transporter.sendMail({
      from: `"Interview Reminder" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Interview Scheduled Confirmation",
      html: `
        <h3>Interview Confirmation</h3>
        <p>Your interview has been scheduled.</p>
        <p><b>Company:</b> ${company}</p>
        <p><b>Role:</b> ${role || "Not specified"}</p>
        <p><b>Date:</b> ${date}</p>
        <br/>
        <p>Best of luck!</p>
      `
    });

    res.json({
      success: true,
      message: "Interview saved & confirmation email sent"
    });

  } catch (err) {
    console.error("Add Interview Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ================= START SERVER ================= */
app.listen(5000, () => {
  console.log("🚀 Backend running on http://localhost:5000");
});