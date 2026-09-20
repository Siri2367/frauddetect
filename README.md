# 🕵️ FraudDetect — Online Recruitment Fraud Detection Platform

A full-stack web application that helps job seekers detect fake job postings, phishing recruiter emails, and recruitment scams before they share personal details or money. Every check returns a **Low / Medium / High risk rating** along with the reasons behind it.

Built with **React, Node.js/Express and MySQL**.

---

## 📌 Overview

Online recruitment fraud — fake job offers, advance-fee ("registration fee") scams, phishing emails and forged offer letters — is a growing threat, especially for freshers. FraudDetect gives job seekers a quick, explainable second opinion by analyzing job listings, recruiter emails, LinkedIn posts and companies, and highlighting the red flags it finds.

## ✨ Features

### 🔍 Fraud Detection Tools
- **Job Posting Checker** – scores a job posting using a weighted rule engine (unrealistic salary, free email domain, very short description, advance-payment keywords)
- **Company Verification** – looks up a company using Google search results (SerpAPI) to judge legitimacy
- **LinkedIn Analyzer** – flags scam patterns in LinkedIn job posts (e.g., "registration fee", "guaranteed job", "DM me", WhatsApp/Telegram contact)
- **Gmail / Recruiter Email Analyzer** – detects phishing phrases, external links and suspicious sender domains
- **Offer Letter Analyzer** – reads PDF and DOCX offer letters directly in the browser to check for red flags

### 🎓 Career Tools
- **ATS Resume Checker** – compares a resume with a job description and shows matched and missing keywords with an overall score
- **Resume Builder** – choose a template, fill in details and download as PDF
- **Job Search** – search jobs by role, type and location
- **Interview Reminder** – schedule interviews and receive a confirmation email

### 🛡️ Community & Awareness
- Fraud reporting, scam alerts and a blacklisted companies list
- Fraud awareness page and analytics dashboard
- Admin panel for viewing registered users

### 🔐 Authentication & Security
- Signup with strong-password validation
- Email OTP verification (Nodemailer)
- Passwords hashed with **bcrypt**
- Forgot / reset password using time-limited reset tokens
- Role-based access (user / admin) with protected routes
- Parameterized SQL queries to prevent SQL injection

---

## 🧠 How the Fraud Scoring Works

The detection engine is **rule-based and explainable**: every suspicious signal adds points, and the total maps to a risk level.

**Job posting example**

| Signal | Points |
|---|---|
| Unrealistic salary | +30 |
| Free email domain (Gmail, Yahoo) | +20 |
| Very short job description | +20 |
| Advance-payment keywords (fee, deposit, registration) | +30 |

`70+ → High Risk` · `40–69 → Medium Risk` · `below 40 → Low Risk`

The Gmail and LinkedIn analyzers also consider legitimacy signals (for example a corporate email domain) and compute a final score of `risk × 0.75 − legitimacy × 0.25`, clamped between 0 and 100, together with a confidence score, summary and recommendation.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Framer Motion, pdf.js (`pdfjs-dist`), Mammoth (DOCX), html2pdf.js |
| Backend | Node.js, Express 5, CORS, dotenv |
| Database | MySQL (`mysql2`) |
| Security | bcrypt, parameterized queries, OTP verification |
| Email | Nodemailer |
| External APIs | SerpAPI (company lookup and job search), Google Gemini SDK (configured), Twilio (configured) |

---

## 📁 Project Structure

```
frauddetect/
├── backend/
│   ├── index.js              # Express server and all API routes
│   ├── testGemini.js         # Gemini API test script
│   └── package.json
├── frontend/
│   ├── public/templates/     # Resume template previews
│   ├── src/
│   │   ├── pages/            # Login, Dashboard, CheckJob, CompanyCheck, AtsChecker, ...
│   │   ├── styles/           # One CSS file per page
│   │   ├── utils/            # AuthContext, fraudDetector.js
│   │   ├── App.jsx           # Routes
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── database/                 # Database setup files
├── .gitignore
└── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/send-email-otp` | Send OTP to email |
| POST | `/verify-otp` | Verify OTP |
| POST | `/signup` | Register a new user |
| POST | `/login` | Log in |
| POST | `/forgot-password` | Send password reset link |
| POST | `/reset-password` | Set a new password |
| POST | `/job-search` | Search jobs by role, type and location |
| POST | `/ats-checker` | Score a resume against a job description |
| POST | `/company-check` | Verify a company |
| POST | `/linkedin-analyze` | Analyze LinkedIn job content |
| POST | `/gmail-analyze` | Analyze a recruiter email |
| POST | `/add-interview` | Schedule an interview and send confirmation email |
| GET | `/admin-secure-data` | Admin-only user list |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) (for sending emails)
- A [SerpAPI](https://serpapi.com/) key

### 1. Clone the repository

```bash
git clone https://github.com/Siri2367/frauddetect.git
cd frauddetect
```

### 2. Set up the database

Create a database and a `users` table:

```sql
CREATE DATABASE frauddetect;
USE frauddetect;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  resetToken VARCHAR(255) NULL,
  resetTokenExpiry BIGINT NULL
);
```

> To create an admin, set `role = 'admin'` for a user in this table.

### 3. Configure the backend

```bash
cd backend
npm install
```

Create a `backend/.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=frauddetect

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

SERP_API_KEY=your_serpapi_key
GEMINI_API_KEY=your_gemini_api_key

TWILIO_SID=your_twilio_sid
TWILIO_AUTH=your_twilio_auth_token
```

### 4. Run the backend

Make sure MySQL is running and your `.env` file is filled in, then start the server from the `backend` folder:

```bash
cd backend
npm start
```

(`npm start` runs `node index.js`.) If everything is set up correctly, you should see these messages in the terminal:

```
✅ MySQL Connected
✅ Email server ready
🚀 Backend running on http://localhost:5000
```

The backend runs on **http://localhost:5000**. Keep this terminal open.

> **Troubleshooting**
> - `MySQL` connection error → check `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `.env` and that the database and `users` table exist.
> - `Email server error` → use a Gmail **App Password** in `EMAIL_PASS`, not your normal password.
> - Frontend can't reach the backend → make sure the backend is running on port 5000 and the frontend on port 5173 (CORS only allows `http://localhost:5173`).

### 5. Run the frontend

Open a **second terminal** and run:

```bash
cd frontend
npm install
npm run dev
```

The app runs on **http://localhost:5173**. Open it in your browser.

---

## 📝 Notes & Current Limitations

- Fraud reports, scan history, resume scores and scheduled interviews are stored in the browser's `localStorage`; only user accounts are stored in MySQL.
- Login state is kept on the client side. Token-based authentication is planned (see below).
- The analyzers are rule-based heuristics, so results are indicators, not guarantees. Always verify a company independently before sharing personal information or paying anyone.

## 🔮 Future Improvements

- JWT-based authentication and server-side role verification
- LLM-powered analysis (Google Gemini) to complement the rule engine
- Train a classifier on a labeled fake-job-postings dataset and report precision/recall
- Move fraud reports, history and interviews from `localStorage` into MySQL
- Split the backend into routes, controllers and services, and add automated tests
- Rate limiting and caching for external API calls

## 👩‍💻 Author

**Siri** — [GitHub](https://github.com/Siri2367)

## ⚠️ Disclaimer

FraudDetect is an educational project. Its risk scores are based on heuristic rules and should not be treated as legal or financial advice.
