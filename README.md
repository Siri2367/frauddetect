# 🕵️ FraudDetect AI — Online Recruitment Fraud Detection System

An AI-powered full-stack platform that helps job seekers detect and avoid fraudulent job postings, fake recruiters, and recruitment scams — built with **React + Node.js/Express** and **Google Gemini AI**.

## 📌 Overview

Online recruitment fraud — fake job postings, phishing emails, advance-fee scams, and fake offer letters — is a growing threat to job seekers. **FraudDetect AI** is a web platform that analyzes job listings, recruiter emails, company details, and offer letters to flag suspicious activity, giving users a fraud-confidence assessment before they engage with a "recruiter."

The system combines rule-based checks, AI-driven text analysis (via Google's Gemini API), and a real-time admin dashboard to reduce the manual effort of verifying job postings while improving trust and safety in online hiring.

## ✨ Features

### 🔍 Core Fraud Detection Tools
- **Job Posting Checker** — Submit a job posting for AI analysis and fraud-risk scoring
- **Company Verification** — Check a company's legitimacy before applying
- **LinkedIn Analyzer** — AI-based analysis of LinkedIn job listings
- **Gmail Analyzer** — Detect phishing/fraud patterns in recruiter emails
- **Offer Letter Analyzer** — Identify fake or manipulated offer letters (PDF/DOCX parsing)

### 💼 Career Tools
- **ATS Resume Checker** — Score resume compatibility with Applicant Tracking Systems
- **Resume Builder** — Build a professional resume from templates
- **Resume Score History** — Track ATS score improvements over time
- **Live Job Search** — Search real-time job listings
- **Interview Reminder** — Schedule and manage interview alerts

### 🛡️ Community & Safety
- **Report Fraud** — Let users report suspicious job postings
- **Scam Alerts** — Browse a live database of reported scams
- **Blacklisted Companies** — Check companies flagged by the community
- **User Profile** — View personal activity and history
- **Admin Panel** — Review, monitor, and manage flagged reports
- **Fraud Analytics Dashboard** — Real-time system-wide insights for administrators

### 🔐 Platform
- Secure authentication (signup/login, forgot/reset password) with hashed passwords
- Role-based protected routes (user vs. admin)
- Global AI chatbot assistant
- Email notifications via Nodemailer

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- React Router DOM
- Axios
- Framer Motion (animations)
- pdfjs-dist / mammoth (resume & document parsing)
- html2pdf.js (report/resume export)

**Backend**
- Node.js + Express 5
- MySQL — user data & relational storage
- Google Generative AI (Gemini) — fraud analysis & text classification
- bcrypt — password hashing & authentication
- Nodemailer — email alerts & notifications
- dotenv, cors

## 📦 Getting Started

### Prerequisites
- Node.js v18+
- npm
- MySQL Server (running locally or remotely)
- A Google Generative AI (Gemini) API key

### 1. Database Setup (MySQL)

Log into the MySQL command line and create the database:
```sql
CREATE DATABASE frauddetect;
USE frauddetect;
```

Create the `users` table:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  resetToken VARCHAR(255) DEFAULT NULL,
  resetTokenExpiry BIGINT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Verify the table was created:
```sql
SHOW TABLES;
DESCRIBE users;
```

To make a user an admin (after they've signed up), so `/admin-secure-data` works:
```sql
UPDATE users SET role='admin' WHERE email='your_email_here';
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Backend
```bash
cd backend
npm install
node index.js
```
You should see `✅ MySQL Connected` in the terminal once the DB connection succeeds.

### Environment Variables (Backend `.env`)
```env
GEMINI_API_KEY=your_google_generative_ai_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=frauddetect
PORT=5000
```
> ⚠️ Never commit your real `.env` file or database password to GitHub. Add `.env` to `.gitignore`.

## 📁 Project Structure
```
fraud-detect-ai/
├── frontend/
│   ├── src/
│   │   ├── pages/        # Check, Result, GmailCheck, LinkedInCheck, CompanyCheck,
│   │   │                 # ATSChecker, ResumeBuilder, JobSearch, Report, Alerts,
│   │   │                 # Profile, AdminPanel, FraudAnalytics, OfferLetterAnalyzer,
│   │   │                 # BlacklistedCompanies, ResumeHistory, InterviewReminder
│   │   ├── utils/AuthContext.jsx
│   │   └── App.jsx
│   └── index.html
├── backend/
│   ├── routes/
│   ├── controllers/
│   └── server.js
└── README.md
```

## 🎯 Motivation

With recruitment scams rising alongside remote hiring, this project gives job seekers a practical, AI-assisted tool to verify job offers, recruiters, and companies before sharing sensitive personal information — reducing financial loss and identity theft risk.

## 🚧 Future Enhancements
- Blockchain-based recruiter verification
- Advanced deep learning models (CNN/LSTM) for more nuanced text analysis
- Real-time, cross-platform fraud detection

## 🤝 Contributing

Contributions, issues, and feature requests are welcome — check the [issues page](../../issues).

## 📄 License

MIT License

---

⭐ If you found this project useful, consider giving it a star!
