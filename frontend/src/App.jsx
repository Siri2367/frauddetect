import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CheckJob from "./pages/CheckJob";
import Result from "./pages/Result";
import Awareness from "./pages/Awareness";
import LinkedInCheck from "./pages/LinkedInCheck";
import ProtectedRoute from "./pages/ProtectedRoute";
import Chatbot from "./pages/Chatbot";
import GmailCheck from "./pages/GmailCheck";
import CompanyCheck from "./pages/CompanyCheck";
import JobSearch from "./pages/JobSearch";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeTemplates from "./pages/ResumeTemplates";
import AtsChecker from "./pages/AtsChecker";
import ReportFraud from "./pages/ReportFraud";
import ScamAlerts from "./pages/ScamAlerts";
import UserProfile from "./pages/UserProfile";
import AdminPanel from "./pages/AdminPanel";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import OfferLetterAnalyzer from "./pages/OfferLetterAnalyzer";
import FraudAnalytics from "./pages/FraudAnalytics";
import BlacklistedCompanies from "./pages/BlacklistedCompanies";
import ResumeHistory from "./pages/ResumeHistory";
import InterviewReminder from "./pages/InterviewReminder";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ================= USER PROTECTED ROUTES ================= */}

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/check"
            element={
              <ProtectedRoute>
                <CheckJob />
              </ProtectedRoute>
            }
          />

          <Route
            path="/result"
            element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            }
          />

          <Route
            path="/awareness"
            element={
              <ProtectedRoute>
                <Awareness />
              </ProtectedRoute>
            }
          />

          <Route
            path="/gmail-check"
            element={
              <ProtectedRoute>
                <GmailCheck />
              </ProtectedRoute>
            }
          />

          <Route
            path="/linkedin-check"
            element={
              <ProtectedRoute>
                <LinkedInCheck />
              </ProtectedRoute>
            }
          />

          <Route
            path="/company-check"
            element={
              <ProtectedRoute>
                <CompanyCheck />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ats-checker"
            element={
              <ProtectedRoute>
                <AtsChecker />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-templates"
            element={
              <ProtectedRoute>
                <ResumeTemplates />
              </ProtectedRoute>
            }
          />

          {/* 🔥 IMPORTANT: templateId must match ResumeTemplates id EXACTLY */}
          <Route
            path="/resume-builder/:templateId"
            element={
              <ProtectedRoute>
                <ResumeBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/job-search"
            element={
              <ProtectedRoute>
                <JobSearch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportFraud />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts"
            element={
              <ProtectedRoute>
                <ScamAlerts />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />

          {/* 🔐 ADMIN ONLY ROUTES */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute role="admin">
                <FraudAnalytics />
              </ProtectedRoute>
            }
          />

          {/* ================= ADVANCED USER FEATURES ================= */}

          <Route
            path="/offer-analyzer"
            element={
              <ProtectedRoute>
                <OfferLetterAnalyzer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/blacklisted"
            element={
              <ProtectedRoute>
                <BlacklistedCompanies />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume-history"
            element={
              <ProtectedRoute>
                <ResumeHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/interview-reminder"
            element={
              <ProtectedRoute>
                <InterviewReminder />
              </ProtectedRoute>
            }
          />

          {/* 🔥 404 FALLBACK */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>

      {/* Global Chatbot */}
      <Chatbot />
    </>
  );
}